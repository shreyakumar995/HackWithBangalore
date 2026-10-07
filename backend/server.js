require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const whois = require('whois-json');
const { saveSubmission, getPriorSubmissions } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure Multer for file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// System prompt for Groq
const SYSTEM_PROMPT = `You are an expert internship fraud detection analyst. Your task is to evaluate internship opportunities and score their legitimacy on a strict 0-100 scale.

You MUST follow this exact scoring rubric:

## SCORING RUBRIC

### 1. Financial Structure (35 Points)
- +35 points: Clear stipend/salary mentioned
- +15 points: Unpaid but completely free to the student (no fees whatsoever)
- 0 points + CRITICAL RED FLAG: If they ask the student for ANY money, registration fees, training fees, course fees, or any payment

### 2. Digital Footprint (25 Points)
- +10 points: Positive or neutral reviews found on platforms like Reddit, Glassdoor, or similar
- +10 points: Verified physical address (Google Maps verifiable)
- +5 points: Real LinkedIn company page with employees

### 3. Recruitment Process (20 Points)
- +10 points: Uses an official corporate email domain (NOT @gmail.com, @yahoo.com, @outlook.com, etc.)
- +10 points: Multi-step, human-involved interview process (technical rounds, HR rounds, etc.)

### 4. Marketing Substance (20 Points)
- +20 points: Ad focuses on actual daily responsibilities, tech stack, learning outcomes
- 0 points: Ad uses FOMO tactics ("Only 5 spots left!", "Limited time offer!") or promises "100% Guaranteed Placement", "Certificate Guaranteed", or similar unrealistic guarantees

## CRITICAL RED FLAG DETECTION
Score each of the four pillars independently and honestly, based only on that pillar's own criteria — do not let a flag in one pillar affect another pillar's score. A company can have a verifiable digital presence or a proper interview process even while charging suspicious fees.

Separately, after scoring, check whether ANY of these Critical Red Flags are present, and report this as a boolean:
- Student is asked to PAY money/fees
- "100% Guaranteed Placement" promises
- No verifiable company identity
- Mass WhatsApp/Telegram recruitment

## DOMAIN EXTRACTION
Extract the company's email domain if a contact email is mentioned anywhere in the text (e.g. "careers@brightwavemedia.in" -> "brightwavemedia.in"). If the contact is a personal domain like gmail.com, yahoo.com, outlook.com, or hotmail.com, OR if no email is mentioned at all, set this field to null — we only want to verify genuine company domains.

## OUTPUT FORMAT
You MUST return ONLY a valid JSON object with NO additional text, NO markdown formatting, NO code blocks. Just the raw JSON:
{"score": <number 0-100>, "verdict": "<one of: LEGITIMATE, SUSPICIOUS, LIKELY SCAM, DEFINITE SCAM>", "critical_flag_detected": <true or false>, "company_domain": "<extracted domain or null>", "pillar_scores": {"financial_structure": {"score": <number>, "max": 35, "details": "<brief explanation>"}, "digital_footprint": {"score": <number>, "max": 25, "details": "<brief explanation>"}, "recruitment_process": {"score": <number>, "max": 20, "details": "<brief explanation>"}, "marketing_substance": {"score": <number>, "max": 20, "details": "<brief explanation>"}}, "green_flags": ["<array of positive indicators found>"], "red_flags": ["<array of negative indicators found>"], "recommendation": "<2-3 sentence actionable advice for the student>"}

VERDICT THRESHOLDS:
- 71-100: LEGITIMATE
- 41-70: SUSPICIOUS  
- 21-40: LIKELY SCAM
- 0-20: DEFINITE SCAM

Be STRICT and SKEPTICAL. Students' financial safety depends on your analysis. When in doubt, score lower.`;

const SPLIT_PROMPT = `You are given a raw block of text that may contain ONE or MULTIPLE separate job/internship postings, often forwarded together via WhatsApp or similar messaging apps with no clean formatting.

Your task: split this text into individual, self-contained postings. Each posting should include everything relevant to evaluating that specific opportunity (company name, role, pay, contact info, etc.) — do not cut relevant details out of a posting while splitting.

If the text only contains ONE posting, return an array with just that one item, with the text otherwise unchanged.

Return ONLY a valid JSON object with NO additional text, NO markdown, NO code blocks:
{"postings": ["<full text of posting 1>", "<full text of posting 2>", ...]}`;

// Helper: clean up uploaded files
function cleanupFiles(files) {
  if (!files) return;
  files.forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.error('Cleanup error:', e.message);
    }
  });
}

// Helper: read image as base64
function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return data.toString('base64');
}

// Helper: run a real WHOIS lookup on a domain and return age info.
// Returns null if the lookup fails or the domain has no readable creation date,
// so callers can distinguish "checked and it's fine" from "couldn't check."
async function checkDomainAge(domain) {
  try {
    const data = await whois(domain);
    const creationDateRaw = data.creationDate || data.createdDate || data.registrationDate;

    if (!creationDateRaw) {
      return { domain, checked: true, ageInDays: null, error: 'No creation date found in WHOIS record' };
    }

    const createdAt = new Date(creationDateRaw);
    if (isNaN(createdAt.getTime())) {
      return { domain, checked: true, ageInDays: null, error: 'Could not parse creation date' };
    }

    const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return { domain, checked: true, ageInDays, error: null };
  } catch (e) {
    return { domain, checked: false, ageInDays: null, error: e.message };
  }
}

// Main evaluation endpoint
async function analyzeOpportunity(textContent) {
  const userMessage =
    'Analyze the following internship opportunity for legitimacy:\n\n' +
    `## Text Content Provided:\n${textContent}\n\n` +
    'Provide your analysis as a JSON object following the exact format specified in your instructions.';

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    model: 'openai/gpt-oss-120b',
    temperature: 0.3,
    max_tokens: 2048,
    top_p: 0.9,
  });

  const responseText = chatCompletion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('Empty response from Groq API');
  }

  let result;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    result = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('No JSON found in response');
  }

  if (!result.verdict || !result.pillar_scores) {
    throw new Error('Invalid response structure from AI');
  }

    // --- REAL-WORLD VERIFICATION STEP ---
    // If the AI extracted a genuine company domain, actually check it via WHOIS.
    // This is the step that makes the system agentic (taking a real action on
    // real-world data) rather than just reasoning over the text it was given.
    result.domain_verification = null;
    if (result.company_domain) {
      const domainCheck = await checkDomainAge(result.company_domain);
      result.domain_verification = domainCheck;

      // A domain registered very recently is a strong, objective scam signal
      // that the LLM has no way to know from text alone.
      if (domainCheck.checked && domainCheck.ageInDays !== null) {
        if (domainCheck.ageInDays < 30) {
          result.red_flags = result.red_flags || [];
          result.red_flags.push(
            `Company domain "${domainCheck.domain}" was registered only ${domainCheck.ageInDays} day(s) ago — extremely new domains are a strong scam indicator.`
          );
          result.critical_flag_detected = true;
        } else if (domainCheck.ageInDays < 180) {
          result.red_flags = result.red_flags || [];
          result.red_flags.push(
            `Company domain "${domainCheck.domain}" was registered ${domainCheck.ageInDays} days ago — a relatively new domain for a company claiming to be established.`
          );
        } else {
          result.green_flags = result.green_flags || [];
          result.green_flags.push(
            `Company domain "${domainCheck.domain}" has existed for over ${Math.floor(domainCheck.ageInDays / 365)} year(s), consistent with a genuine, established business.`
          );
        }
      }else{
        result.red_flags = result.red_flags || [];
        result.red_flags.push(
          `Company domain "${result.company_domain}" could not be verified via WHOIS (${domainCheck.error || 'no record found'}) — this may indicate the domain doesn't genuinely exist.`
        );
        result.critical_flag_detected = true;
      }
    }
        // --- PATTERN DETECTION ACROSS SUBMISSIONS ---
    // Check if this company domain has been analyzed before, BEFORE saving
    // this submission (so we don't match against ourselves).
    if (result.company_domain) {
      const priorSubmissions = getPriorSubmissions(result.company_domain);
      if (priorSubmissions.length > 0) {
        const avgScore = Math.round(
          priorSubmissions.reduce((sum, s) => sum + s.score, 0) / priorSubmissions.length
        );
        const anyCriticalFlag = priorSubmissions.some((s) => s.critical_flag_detected === 1);

        result.pattern_detection = {
          priorSubmissionCount: priorSubmissions.length,
          averagePriorScore: avgScore,
          anyPriorCriticalFlag: anyCriticalFlag,
        };

        result.red_flags = result.red_flags || [];
        result.red_flags.push(
          `This company domain was previously analyzed ${priorSubmissions.length} time(s), with an average score of ${avgScore}/100${anyCriticalFlag ? ' and at least one prior critical red flag detected' : ''} — recurring submissions of the same domain can indicate a widely-circulated scam.`
        );

        if (avgScore < 40) {
          result.critical_flag_detected = true;
        }
      } else {
        result.pattern_detection = { priorSubmissionCount: 0, averagePriorScore: null, anyPriorCriticalFlag: false };
      }
    }

    // Calculate the real score ourselves from the pillar breakdown,
    // rather than trusting the LLM's self-reported total score.
    // This makes the critical-flag cap deterministic instead of
    // depending on the LLM correctly applying a multi-part instruction.
    const pillarSum =
      (result.pillar_scores?.financial_structure?.score || 0) +
      (result.pillar_scores?.digital_footprint?.score || 0) +
      (result.pillar_scores?.recruitment_process?.score || 0) +
      (result.pillar_scores?.marketing_substance?.score || 0);

    let finalScore = pillarSum;
    if (result.critical_flag_detected) {
      finalScore = Math.min(finalScore, 30);
    }

    result.score = Math.max(0, Math.min(100, Math.round(finalScore)));
    saveSubmission({
      companyDomain: result.company_domain,
      score: result.score,
      verdict: result.verdict,
      criticalFlagDetected: result.critical_flag_detected,
    });
     return result;
}

app.post('/api/evaluate', upload.array('screenshots', 5), async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const { textContent } = req.body;

    if (!textContent && uploadedFiles.length === 0) {
      return res.status(400).json({
        error: 'Please provide at least some text content or upload screenshots for analysis.',
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is not configured. Please add it to the .env file.',
      });
    }

    let fullText = textContent || '';

    if (uploadedFiles.length > 0) {
      fullText += `\n\n## Screenshots Provided:\n${uploadedFiles.length} screenshot(s) were uploaded showing the internship advertisement/email.\n`;
      fullText += 'Note: The screenshots have been provided for context. Analyze any visible text, branding, contact information, and claims made in them.\n\n';
      for (let i = 0; i < uploadedFiles.length; i++) {
        fullText += `[Screenshot ${i + 1}: ${uploadedFiles[i].originalname}]\n`;
      }
    }

    const result = await analyzeOpportunity(fullText);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Evaluation error:', error);

    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid or missing Groq API key.' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
    }

    res.status(500).json({
      error: error.message || 'An unexpected error occurred during analysis.',
    });
  } finally {
    cleanupFiles(uploadedFiles);
  }
});

// Batch evaluation endpoint — takes a raw block of forwarded/bulk text,
// splits it into individual postings via Groq, then runs each one through
// the same analyzeOpportunity() pipeline as a single check.
app.post('/api/evaluate-batch', async (req, res) => {
  try {
    const { textContent } = req.body;

    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: 'Please provide the bulk text to analyze.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured.' });
    }

    // Step 1: split the raw block into individual postings
    const splitCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SPLIT_PROMPT },
        { role: 'user', content: textContent },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      max_tokens: 4096,
    });

    const splitResponseText = splitCompletion.choices[0]?.message?.content;
    if (!splitResponseText) {
      throw new Error('Empty response from Groq API during splitting');
    }

    const splitJsonMatch = splitResponseText.match(/\{[\s\S]*\}/);
    if (!splitJsonMatch) {
      throw new Error('Could not parse posting split from AI response');
    }

    const { postings } = JSON.parse(splitJsonMatch[0]);
    if (!Array.isArray(postings) || postings.length === 0) {
      throw new Error('No individual postings could be identified in the provided text');
    }

    // Reasonable cap so one request can't trigger dozens of Groq calls at once
    const cappedPostings = postings.slice(0, 10);

    // Step 2: analyze each posting individually, reusing the exact same
    // pipeline (scoring, WHOIS verification, pattern detection) as a
    // single check. Run sequentially rather than in parallel to stay
    // well within Groq's rate limits on a free-tier key.
    const results = [];
    for (const postingText of cappedPostings) {
      try {
        const analysis = await analyzeOpportunity(postingText);
        results.push({ success: true, original_text: postingText, data: analysis });
      } catch (err) {
        results.push({ success: false, original_text: postingText, error: err.message });
      }
    }

    res.json({
      success: true,
      total_postings_found: postings.length,
      postings_analyzed: cappedPostings.length,
      results,
    });
  } catch (error) {
    console.error('Batch evaluation error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred during batch analysis.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 screenshots.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});
// Fetch recent submission history for the dashboard view
app.get('/api/history', (req, res) => {
  try {
    const db = require('better-sqlite3')(require('path').join(__dirname, 'submissions.db'));
    const rows = db.prepare(`
      SELECT id, company_domain, score, verdict, critical_flag_detected, created_at
      FROM submissions
      ORDER BY created_at DESC
      LIMIT 50
    `).all();
    db.close();
    res.json({ success: true, submissions: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🛡️  Internship Legitimacy Scorer API`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});