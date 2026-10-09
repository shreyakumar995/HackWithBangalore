import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import './story.css';

const DEMO_SEGMENTS = [
  { text: "Congratulations! You've been selected for a remote internship. ", flag: false },
  { text: 'Pay ₹999 registration fee', flag: true, flagId: 'fee' },
  { text: ' to confirm your seat within ', flag: false },
  { text: '24 hours', flag: true, flagId: 'urgency' },
  { text: ' or the offer will be given to the next candidate. Reply YES to receive payment details.', flag: false },
];

const SIGNALS = [
  { label: 'Financial Structure', pts: 35, weight: 0.35, q: 'Does the opportunity ask for money?', tone: 'terra' },
  { label: 'Digital Footprint', pts: 25, weight: 0.25, q: 'Does the company and domain check out?', tone: 'olive' },
  { label: 'Recruitment Integrity', pts: 20, weight: 0.2, q: 'Does the recruitment process look legitimate?', tone: 'mustard' },
  { label: 'Marketing Claims', pts: 20, weight: 0.2, q: 'Are the promises built to create urgency?', tone: 'rose' },
];

const STEPS = [
  { n: '01', title: 'Paste', body: 'Submit the recruitment message or offer.' },
  { n: '02', title: 'Analyze', body: 'The model extracts suspicious claims and signals.' },
  { n: '03', title: 'Verify', body: 'Financial, digital, and recruitment indicators are checked.' },
  { n: '04', title: 'Score', body: 'A security score is generated from the same four pillars.' },
  { n: '05', title: 'Decide', body: 'You get a clear recommendation before you proceed.' },
];

const BULK_RESULTS = [
  { score: 8, tag: 'DEFINITE SCAM', tone: 't-bad', snip: 'Pay ₹999 to unlock internship…' },
  { score: 41, tag: 'LIKELY FAKE', tone: 't-warn', snip: 'Telegram-only interview this week…' },
  { score: 88, tag: 'LIKELY SAFE', tone: 't-ok', snip: 'Official careers page, no fee…' },
];

function Reveal({ children, className = '', variant = 'up', reduceMotion, id }) {
  const variants = {
    up: {
      hidden: { opacity: 0, y: reduceMotion ? 0 : 40 },
      show: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: reduceMotion ? 0 : -36 },
      show: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: reduceMotion ? 0 : 36 },
      show: { opacity: 1, x: 0 },
    },
    clip: {
      hidden: { opacity: 0, clipPath: reduceMotion ? 'none' : 'inset(10% 0 10% 0)' },
      show: { opacity: 1, clipPath: 'inset(0% 0 0% 0)' },
    },
    scale: {
      hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.96 },
      show: { opacity: 1, scale: 1 },
    },
  };

  return (
    <m.div
      id={id}
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

function LiveDemo({ reduceMotion }) {
  const [activeFlags, setActiveFlags] = useState(() =>
    reduceMotion ? new Set(['fee', 'urgency']) : new Set()
  );
  const [score, setScore] = useState(reduceMotion ? 8 : 0);
  const [showBadge, setShowBadge] = useState(!!reduceMotion);
  const [showSignals, setShowSignals] = useState(!!reduceMotion);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timers = [];
    timers.push(setTimeout(() => setActiveFlags(new Set(['fee'])), 700));
    timers.push(setTimeout(() => setActiveFlags(new Set(['fee', 'urgency'])), 1600));
    timers.push(setTimeout(() => setShowSignals(true), 2100));
    timers.push(
      setTimeout(() => {
        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          setScore(Math.round(eased * 8));
          if (t < 1) requestAnimationFrame(tick);
          else setShowBadge(true);
        };
        requestAnimationFrame(tick);
      }, 2400)
    );
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  return (
    <div className="demo-card" aria-label="Live sample scam analysis">
      <div className="demo-head">
        <span className="eyebrow">Sample recruitment message</span>
        <span className="live-dot"><i /> LIVE ANALYSIS</span>
      </div>
      <p className="demo-msg">
        {DEMO_SEGMENTS.map((seg, i) =>
          seg.flag ? (
            <span key={i} className={activeFlags.has(seg.flagId) ? 'hl' : undefined}>{seg.text}</span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>
      <m.ul
        className="demo-signals"
        initial={false}
        animate={{ opacity: showSignals ? 1 : 0, y: showSignals ? 0 : 8 }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
      >
        <li><span>Financial Pressure</span><b>HIGH</b></li>
        <li><span>Urgency Language</span><b>HIGH</b></li>
        <li><span>Payment Request</span><b>HIGH</b></li>
      </m.ul>
      <div className="demo-score-row">
        <div className="demo-score">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Threat score</div>
          <strong>{String(score).padStart(2, '0')}<span> / 100</span></strong>
        </div>
        <m.div
          className="demo-badge"
          initial={false}
          animate={{ opacity: showBadge ? 1 : 0, y: showBadge ? 0 : 6 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
        >
          DEFINITE SCAM
        </m.div>
      </div>
      <div className="demo-meter" aria-hidden>
        <i style={{ width: `${Math.max(4, score)}%` }} />
      </div>
      <m.div
        className="demo-threat"
        initial={false}
        animate={{ opacity: showBadge ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      >
        ⚠ Threat detected
      </m.div>
    </div>
  );
}

function SignalBars({ reduceMotion }) {
  return (
    <m.div
      className="signals-panel"
      initial={reduceMotion ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ hidden: {}, show: {} }}
    >
      {SIGNALS.map((s) => (
        <div className={`signal-row tone-${s.tone}`} key={s.label}>
          <span className="label">{s.label}<small>{s.q}</small></span>
          <span className="pts">{s.pts} pts</span>
          <div className="signal-track">
            <m.i
              variants={{
                hidden: { scaleX: reduceMotion ? 1 : 0 },
                show: { scaleX: 1 },
              }}
              transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: `${s.weight * 100}%` }}
            />
          </div>
        </div>
      ))}
    </m.div>
  );
}

function PatternDiagram({ reduceMotion }) {
  return (
    <div className="pattern-panel">
      <span className="demo-tag">Illustrative pattern map</span>
      <svg viewBox="0 0 420 220" role="img" aria-label="Suspicious domain linked to multiple past submissions">
        <defs>
          <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#737A45" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#D85C32" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {[
          [210, 96, 78, 36],
          [210, 96, 342, 48],
          [210, 96, 68, 168],
          [210, 96, 338, 178],
          [210, 96, 210, 188],
        ].map(([x1, y1, x2, y2], i) => (
          <m.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#edgeGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.1 }}
          />
        ))}
        <circle cx="210" cy="96" r="34" fill="#FBF8F3" stroke="#D85C32" strokeWidth="2" />
        <text x="210" y="92" textAnchor="middle" fill="#171717" fontSize="11" fontFamily="JetBrains Mono, monospace">scamhire</text>
        <text x="210" y="108" textAnchor="middle" fill="#D85C32" fontSize="10" fontFamily="JetBrains Mono, monospace">.com</text>
        {[
          { x: 78, y: 36, label: '#1842' },
          { x: 342, y: 48, label: '#1901' },
          { x: 68, y: 168, label: '#2014' },
          { x: 338, y: 178, label: '#2110' },
          { x: 210, y: 188, label: '#2233' },
        ].map((n) => (
          <g key={n.label}>
            <rect x={n.x - 28} y={n.y - 14} width="56" height="28" rx="8" fill="#FBF8F3" stroke="rgba(23,23,23,0.18)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#69665F" fontSize="11" fontFamily="JetBrains Mono, monospace">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="pattern-note">1 domain → 5 related submissions</div>
    </div>
  );
}

function Eli5Preview() {
  const [simple, setSimple] = useState(false);
  return (
    <div className="feature-demo">
      <div className="eli5-row">
        <span className="eyebrow" style={{ margin: 0 }}>{simple ? 'Plain explanation' : 'Full advice'}</span>
        <button
          type="button"
          className="eli5-toggle"
          aria-pressed={simple}
          onClick={() => setSimple((on) => !on)}
        >
          {simple ? 'Show full advice' : 'Explain simply'}
        </button>
      </div>
      <p className="eli5-copy">
        {simple
          ? 'They want ₹999 before any interview. Do not pay. A real internship does not charge you for the seat.'
          : 'An upfront registration fee plus a 24-hour deadline is a strong fraud signal. Do not transfer money until the employer and the domain are checked on their own.'}
      </p>
    </div>
  );
}

function HeroScene({ reduceMotion }) {
  const drift = (delay) => (
    reduceMotion
      ? {}
      : { y: [0, -7, 0], transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay } }
  );

  return (
    <m.div
      className="hero-stage"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.15 }}
    >
      <svg className="hero-art" viewBox="0 0 440 480" role="img" aria-label="A student reviewing internship offers on a laptop">
        <ellipse cx="220" cy="430" rx="150" ry="18" fill="rgba(23,23,23,0.06)" />
        <path d="M70 150c40-70 250-80 310 10" fill="none" stroke="#B96B68" strokeWidth="2" opacity="0.55" />
        <circle cx="360" cy="90" r="28" fill="#D4A83F" opacity="0.55" />
        <rect x="118" y="250" width="210" height="16" rx="6" fill="#737A45" />
        <rect x="132" y="188" width="176" height="112" rx="14" fill="#171717" />
        <rect x="144" y="200" width="152" height="82" rx="8" fill="#F4F0E8" />
        <rect x="156" y="214" width="78" height="8" rx="4" fill="#D85C32" />
        <rect x="156" y="230" width="110" height="6" rx="3" fill="rgba(23,23,23,0.18)" />
        <rect x="156" y="244" width="92" height="6" rx="3" fill="rgba(23,23,23,0.12)" />
        <circle cx="220" cy="118" r="34" fill="#E7C7B4" />
        <path d="M186 150c8 28 60 28 68 0" fill="#171717" />
        <path d="M168 214c18 46 86 46 104 0v70H168z" fill="#D85C32" />
        <rect x="196" y="168" width="48" height="10" rx="5" fill="#171717" />
      </svg>
      <m.article className="float-card card-a" animate={drift(0)}>
        <span>Internship offer</span>
        <strong>Company verified</strong>
        <em className="ok">Checked</em>
      </m.article>
      <m.article className="float-card card-b" animate={drift(0.4)}>
        <span>Payment request</span>
        <strong>₹999</strong>
        <em className="bad">High risk</em>
      </m.article>
      <m.article className="float-card card-c" animate={drift(0.8)}>
        <span>Domain check</span>
        <strong>Registered 3 days ago</strong>
        <em className="warn">Review</em>
      </m.article>
      <m.article className="float-card card-d" animate={drift(1.2)}>
        <span>Trust score</span>
        <strong>08 / 100</strong>
        <em className="bad">Definite scam</em>
      </m.article>
    </m.div>
  );
}

export default function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
    <div className="story">
      <section className="story-hero">
        <div>
          <m.p
            className="eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
          >
            Internship trust & safety
          </m.p>
          <m.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.08 }}
          >
            Find the real opportunity{' '}
            <span className="accent">before the scam.</span>
          </m.h1>
          <m.p
            className="story-lead"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.18 }}
          >
            ShieldIntern reads the offer, the payment ask, the domain, and the pattern behind it — so you can
            decide whether an internship is worth trusting.
          </m.p>
          <m.div
            className="story-ctas"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.28 }}
          >
            <Link className="btn btn-solid" to="/check">Check an Offer</Link>
            <a className="btn btn-ghost" href="#how-it-works">See How It Works</a>
          </m.div>
        </div>
        <HeroScene reduceMotion={!!reduceMotion} />
      </section>

      <section className="trust-strip" aria-label="Signals ShieldIntern looks for">
        <p>Built to catch the signals scammers leave behind</p>
        <ul>
          <li>Payment requests</li>
          <li>Suspicious domains</li>
          <li>Fake recruiters</li>
          <li>Urgent offers</li>
          <li>Repeated scam patterns</li>
        </ul>
      </section>

      <Reveal className="story-section" id="signals" variant="up" reduceMotion={reduceMotion}>
        <div className="story-split">
          <div className="story-copy">
            <p className="eyebrow">Four signals</p>
            <h2>Four signals. One security verdict.</h2>
            <p>
              Every opportunity is evaluated across the same core security pillars, so the score is a weighted
              investigation — not a vague AI guess.
            </p>
          </div>
          <div className="story-visual">
            <SignalBars reduceMotion={!!reduceMotion} />
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="left" reduceMotion={reduceMotion}>
        <div className="story-split reverse">
          <div className="story-copy">
            <p className="eyebrow">Financial fraud</p>
            <h2>Real internships don&apos;t charge you to unlock the interview.</h2>
            <p>
              ShieldIntern weighs payment pressure heavily — registration fees, training deposits, &ldquo;seat
              reservation&rdquo; language, and fake stipend bait. If money moves before work starts, the
              financial pillar collapses.
            </p>
            <ul>
              <li>Upfront registration or training fees</li>
              <li>Urgency tied to payment windows</li>
              <li>Seat-reservation and onboarding kit charges</li>
            </ul>
          </div>
          <div className="story-visual">
            <div className="pay-card">
              <p className="eyebrow">Payment signal</p>
              <div className="amount">₹999</div>
              <div className="fee-label">Registration Fee</div>
              <div className="pay-status">HIGH RISK</div>
              <ul className="pay-list">
                <li>• upfront payment detected</li>
                <li>• urgency language present</li>
                <li>• seat reservation claim</li>
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="right" reduceMotion={reduceMotion}>
        <div className="story-split" id="security">
          <div className="story-copy">
            <p className="eyebrow">Digital footprint</p>
            <h2>Look beyond the message.</h2>
            <p>
              An offer can sound convincing. Its digital footprint tells another story. When a careers link
              appears, ShieldIntern runs a live WHOIS check and treats domains registered days ago as high risk.
            </p>
          </div>
          <div className="story-visual">
            <div className="whois-panel">
              <div className="prompt">$ whois scamdomain2026.com</div>
              <div className="domain">scamdomain2026.com</div>
              <div className="whois-meta">
                <div>Created: <strong>3 days ago</strong></div>
                <div>Status: <strong>clientTransferProhibited</strong></div>
                <div>Domain age: <strong>3 days</strong></div>
              </div>
              <div className="whois-alert">
                ⚠ Domain age under 14 days — treat any payment request tied to this site as high risk.
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="clip" reduceMotion={reduceMotion}>
        <div className="story-split reverse">
          <div className="story-copy">
            <p className="eyebrow">Pattern detection</p>
            <h2>One scam. Multiple victims.</h2>
            <p>
              Suspicious offers resurface across different submissions. When the same company domain has been
              checked before, ShieldIntern surfaces prior scores and critical flags. The diagram below is a
              product demonstration, not live student data.
            </p>
          </div>
          <div className="story-visual">
            <PatternDiagram reduceMotion={!!reduceMotion} />
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="right" reduceMotion={reduceMotion}>
        <div className="story-split">
          <div className="story-copy">
            <p className="eyebrow">Bulk analysis</p>
            <h2>Forward the whole conversation. We&apos;ll split the risk.</h2>
            <p>
              Career groups often paste three offers in one message. Bulk mode separates each posting, runs
              the same audit, and returns individual scores so a safe campus listing isn&apos;t drowned by the
              scam sitting two lines above it.
            </p>
          </div>
          <div className="story-visual">
            <div className="bulk-demo">
              <div className="wa-msg">
                <div className="wa-meta">Forwarded many times · Career Group</div>
                {`Pay ₹999 to confirm internship...\nTelegram interview tonight only...\nApply on careers.acme.edu — no fee`}
              </div>
              <div className="bulk-cards">
                {BULK_RESULTS.map((r) => (
                  <div className="bulk-mini" key={r.tag}>
                    <div className={`sc ${r.tone}`}>{r.score}</div>
                    <div className={`tg ${r.tone}`}>{r.tag}</div>
                    <div className="sn">{r.snip}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="scale" reduceMotion={reduceMotion}>
        <div className="story-split reverse">
          <div className="story-copy">
            <p className="eyebrow">Browser extension</p>
            <h2>Suspicious lines get underlined where you read them.</h2>
            <p>
              On any page, fee requests, urgency lines, and guaranteed-placement claims are marked locally.
              No server call for that. When you want a full score, select the text and right-click Analyze
              with ShieldIntern.
            </p>
            <div className="story-ctas" style={{ marginTop: 20 }}>
              <Link className="btn btn-ghost" to="/extension">Install extension</Link>
            </div>
          </div>
          <div className="story-visual">
            <div className="ext-scene">
              <div className="ext-fake">
                You&apos;ve been selected. <span className="page-hl fee">Pay ₹999 registration fee</span> within{' '}
                <span className="page-hl urgency">24 hours</span>. We offer{' '}
                <span className="page-hl guarantee">100% placement</span>.
              </div>
              <div className="ext-menu" role="menu" aria-label="Browser context menu mock">
                <button type="button">Copy</button>
                <button type="button">Search Google for…</button>
                <button type="button" className="active"><strong>Analyze with ShieldIntern</strong></button>
                <button type="button">Inspect</button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="left" reduceMotion={reduceMotion}>
        <div className="story-split">
          <div className="story-copy">
            <p className="eyebrow">Compare</p>
            <h2>Two real offers. See which one carries more red flags.</h2>
            <p>
              When you are choosing between two internships, paste both. Each is scored with the same check.
              The page tells you which one raised more red flags, and lists them side by side.
            </p>
            <div className="story-ctas" style={{ marginTop: 20 }}>
              <Link className="btn btn-ghost" to="/compare">Compare two offers</Link>
            </div>
          </div>
          <div className="story-visual">
            <div className="feature-demo">
              <p className="feature-banner">Offer A has more red flags (4 vs 1).</p>
              <div className="feature-pair">
                <article>
                  <span>Offer A</span>
                  <strong className="t-bad">4 red flags</strong>
                  <p>Pay ₹999 to confirm the seat within 24 hours.</p>
                </article>
                <article>
                  <span>Offer B</span>
                  <strong className="t-ok">1 red flag</strong>
                  <p>Campus drive listed on the company careers page.</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="right" reduceMotion={reduceMotion}>
        <div className="story-split reverse">
          <div className="story-copy">
            <p className="eyebrow">Plain explanation</p>
            <h2>The same advice, in words you can act on.</h2>
            <p>
              After a check, the written recommendation can switch to a plainer version. The score and the
              flags stay the same. Only the wording changes.
            </p>
            <div className="story-ctas" style={{ marginTop: 20 }}>
              <Link className="btn btn-ghost" to="/check">Try it on a check</Link>
            </div>
          </div>
          <div className="story-visual">
            <Eli5Preview />
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="up" reduceMotion={reduceMotion}>
        <div className="story-split">
          <div className="story-copy">
            <p className="eyebrow">Safety guide</p>
            <h2>What to look for, and where to report it in India.</h2>
            <p>
              A short reference for the usual tricks, what a real hiring process looks like, and what to do
              if money or documents have already been sent.
            </p>
            <div className="story-ctas" style={{ marginTop: 20 }}>
              <Link className="btn btn-ghost" to="/safety-guide">Read the safety guide</Link>
            </div>
          </div>
          <div className="story-visual">
            <ul className="guide-preview">
              <li>
                <strong>Common patterns</strong>
                <span>Fees before work, fake urgency, chat-only hiring.</span>
              </li>
              <li>
                <strong>Real recruitment</strong>
                <span>You can find the role yourself. The company pays you.</span>
              </li>
              <li>
                <strong>Report it</strong>
                <span>Call 1930 if money moved, then file at cybercrime.gov.in.</span>
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" id="how-it-works" variant="up" reduceMotion={reduceMotion}>
        <div className="process-head">
          <p className="eyebrow">How it works</p>
          <h2>From a pasted message to a verdict.</h2>
          <p>The scanner lives on its own page. This is the path every offer follows once you open it.</p>
        </div>
        <ol className="process">
          {STEPS.map((step) => (
            <li key={step.n}>
              <span className="process-n">{step.n}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal className="story-final" variant="up" reduceMotion={reduceMotion}>
        <p className="eyebrow">Ready</p>
        <h2>Have an internship offer?</h2>
        <p>Check it before you trust it. Paste the message, upload the evidence, and get a detailed security assessment.</p>
        <div className="story-ctas">
          <Link className="btn btn-solid" to="/check">Check an Offer</Link>
          <a className="btn btn-ghost" href="#how-it-works">See How It Works</a>
        </div>
      </Reveal>
    </div>
    </LazyMotion>
  );
}
