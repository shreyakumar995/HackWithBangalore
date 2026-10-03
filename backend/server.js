require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');

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

## OUTPUT FORMAT
You MUST return ONLY a valid JSON object with NO additional text, NO markdown formatting, NO code blocks. Just the raw JSON:
{"score": <number 0-100>, "verdict": "<one of: LEGITIMATE, SUSPICIOUS, LIKELY SCAM, DEFINITE SCAM>", "critical_flag_detected": <true or false>, "pillar_scores": {"financial_structure": {"score": <number>, "max": 35, "details": "<brief explanation>"}, "digital_footprint": {"score": <number>, "max": 25, "details": "<brief explanation>"}, "recruitment_process": {"score": <number>, "max": 20, "details": "<brief explanation>"}, "marketing_substance": {"score": <number>, "max": 20, "details": "<brief explanation>"}}, "green_flags": ["<array of positive indicators found>"], "red_flags": ["<array of negative indicators found>"], "recommendation": "<2-3 sentence actionable advice for the student>"}

VERDICT THRESHOLDS:
- 71-100: LEGITIMATE
- 41-70: SUSPICIOUS  
- 21-40: LIKELY SCAM
- 0-20: DEFINITE SCAM

Be STRICT and SKEPTICAL. Students' financial safety depends on your analysis. When in doubt, score lower.`;

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

// Main evaluation endpoint
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

    // Build the user message
    let userMessage = 'Analyze the following internship opportunity for legitimacy:\n\n';

    if (textContent) {
      userMessage += `## Text Content Provided:\n${textContent}\n\n`;
    }

    if (uploadedFiles.length > 0) {
      userMessage += `## Screenshots Provided:\n${uploadedFiles.length} screenshot(s) were uploaded showing the internship advertisement/email.\n`;
      userMessage += 'Note: The screenshots have been provided for context. Analyze any visible text, branding, contact information, and claims made in them.\n\n';

      for (let i = 0; i < uploadedFiles.length; i++) {
        userMessage += `[Screenshot ${i + 1}: ${uploadedFiles[i].originalname}]\n`;
      }
    }

    userMessage += '\nProvide your analysis as a JSON object following the exact format specified in your instructions.';

    // Call Groq API
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

    // Parse the JSON response
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error. Raw response:', responseText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Validate the result structure
    if (!result.verdict || !result.pillar_scores) {
      throw new Error('Invalid response structure from AI');
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

    res.json({
      success: true,
      data: result,
    });
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

app.listen(PORT, () => {
  console.log(`\n🛡️  Internship Legitimacy Scorer API`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});