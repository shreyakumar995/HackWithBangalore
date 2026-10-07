import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import SecurityScanner from '../components/SecurityScanner';
import './story.css';

const DEMO_SEGMENTS = [
  { text: "Congratulations! You've been selected for a remote internship. ", flag: false },
  { text: 'Pay ₹999 registration fee', flag: true, flagId: 'fee' },
  { text: ' to confirm your seat within ', flag: false },
  { text: '24 hours', flag: true, flagId: 'urgency' },
  { text: ' or the offer will be given to the next candidate. Reply YES to receive payment details.', flag: false },
];

const SIGNALS = [
  { label: 'Financial Structure', pts: 35, weight: 0.35 },
  { label: 'Digital Footprint', pts: 25, weight: 0.25 },
  { label: 'Recruitment Integrity', pts: 20, weight: 0.2 },
  { label: 'Marketing Claims', pts: 20, weight: 0.2 },
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
    <motion.div
      id={id}
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LiveDemo({ reduceMotion }) {
  const [activeFlags, setActiveFlags] = useState(() =>
    reduceMotion ? new Set(['fee', 'urgency']) : new Set()
  );
  const [score, setScore] = useState(reduceMotion ? 8 : 0);
  const [showBadge, setShowBadge] = useState(!!reduceMotion);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timers = [];
    timers.push(setTimeout(() => setActiveFlags(new Set(['fee'])), 700));
    timers.push(setTimeout(() => setActiveFlags(new Set(['fee', 'urgency'])), 1600));
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
        <span className="eyebrow">Sample inbox message</span>
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
      <div className="demo-score-row">
        <div className="demo-score">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Trust score</div>
          <strong>{score}<span> / 100</span></strong>
        </div>
        <motion.div
          className="demo-badge"
          initial={false}
          animate={{ opacity: showBadge ? 1 : 0, y: showBadge ? 0 : 6 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
        >
          DEFINITE SCAM
        </motion.div>
      </div>
      <div className="demo-meter" aria-hidden>
        <i style={{ width: `${Math.max(4, score)}%` }} />
      </div>
    </div>
  );
}

function SignalBars({ reduceMotion }) {
  return (
    <motion.div
      className="signals-panel"
      initial={reduceMotion ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ hidden: {}, show: {} }}
    >
      {SIGNALS.map((s) => (
        <div className="signal-row" key={s.label}>
          <span className="label">{s.label}</span>
          <span className="pts">{s.pts} pts</span>
          <div className="signal-track">
            <motion.i
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
    </motion.div>
  );
}

function PatternDiagram({ reduceMotion }) {
  return (
    <div className="pattern-panel">
      <span className="demo-tag">Illustrative pattern map</span>
      <svg viewBox="0 0 420 220" role="img" aria-label="Suspicious domain linked to multiple past submissions">
        <defs>
          <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF4D5E" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {[
          [210, 96, 78, 36],
          [210, 96, 342, 48],
          [210, 96, 68, 168],
          [210, 96, 338, 178],
          [210, 96, 210, 188],
        ].map(([x1, y1, x2, y2], i) => (
          <motion.line
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
        <circle cx="210" cy="96" r="34" fill="#0D1624" stroke="#FF4D5E" strokeWidth="2" />
        <text x="210" y="92" textAnchor="middle" fill="#F5F7FA" fontSize="11" fontFamily="JetBrains Mono, monospace">scamhire</text>
        <text x="210" y="108" textAnchor="middle" fill="#FF4D5E" fontSize="10" fontFamily="JetBrains Mono, monospace">.online</text>
        {[
          { x: 78, y: 36, label: '#1842' },
          { x: 342, y: 48, label: '#1901' },
          { x: 68, y: 168, label: '#2014' },
          { x: 338, y: 178, label: '#2110' },
          { x: 210, y: 188, label: '#2233' },
        ].map((n) => (
          <g key={n.label}>
            <rect x={n.x - 28} y={n.y - 14} width="56" height="28" rx="8" fill="#0D1624" stroke="rgba(59,130,246,0.45)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#8491A3" fontSize="11" fontFamily="JetBrains Mono, monospace">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="pattern-note">1 domain → 5 related submissions</div>
    </div>
  );
}

export default function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="story">
      <section className="story-hero">
        <div>
          <motion.p
            className="eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
          >
            AI-powered recruitment security
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.08 }}
          >
            Spot fake internship offers{' '}
            <span className="accent">before they cost you.</span>
          </motion.h1>
          <motion.p
            className="story-lead"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.18 }}
          >
            ShieldIntern analyzes recruitment messages, company footprints, payment requests, and repeated
            scam patterns before you trust an offer — so a registration fee never becomes your first paycheck.
          </motion.p>
          <motion.div
            className="story-ctas"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.28 }}
          >
            <Link className="btn btn-solid" to="/check">Check an Offer</Link>
            <a className="btn btn-ghost" href="#how-it-works">See How It Works</a>
          </motion.div>
        </div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.2 }}
        >
          <LiveDemo reduceMotion={!!reduceMotion} />
        </motion.div>
      </section>

      <Reveal className="story-section" id="signals" variant="up" reduceMotion={reduceMotion}>
        <div className="story-split">
          <div className="story-copy">
            <p className="eyebrow">Four signals</p>
            <h2>Four signals. One security verdict.</h2>
            <p>
              Every opportunity is analyzed across the same security pillars, so the score isn&apos;t just an
              AI guess — it&apos;s a weighted investigation of how the offer asks for money, how thin the
              company looks online, how broken the hiring process is, and whether the pitch is all urgency.
            </p>
          </div>
          <div className="story-visual">
            <SignalBars reduceMotion={!!reduceMotion} />
          </div>
        </div>
      </Reveal>

      <Reveal className="story-section" variant="left" reduceMotion={reduceMotion}>
        <div className="story-split reverse" id="how-it-works">
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
            <h2>New domains don&apos;t get a free pass.</h2>
            <p>
              When an offer points to a careers site, ShieldIntern runs a live WHOIS check. Domains born days
              ago — especially behind privacy shields — are treated as high-risk digital footprints, not
              established employers.
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
            <h2>One scam can look like five different offers.</h2>
            <p>
              When the same company domain shows up across prior student submissions, ShieldIntern surfaces
              that history — average prior scores and critical flags — so the next audit isn&apos;t a blank slate.
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
            <h2>Forward the whole WhatsApp dump. We&apos;ll split it.</h2>
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
            <h2>Check an offer without leaving the page.</h2>
            <p>
              Highlight a LinkedIn DM or job-board blurb, right-click, and send it straight into the same
              legitimacy pipeline — no copy-paste dance while you&apos;re mid-scroll.
            </p>
            <div className="story-ctas" style={{ marginTop: 20 }}>
              <Link className="btn btn-ghost" to="/extension">Install extension</Link>
            </div>
          </div>
          <div className="story-visual">
            <div className="ext-scene">
              <div className="ext-fake">
                Selected text: <mark>Transfer ₹1,499 to unlock your onboarding kit before Monday.</mark>
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

      <Reveal className="story-section" variant="up" reduceMotion={reduceMotion}>
        <div className="story-split">
          <div className="story-copy">
            <p className="eyebrow">Explainable analysis</p>
            <h2>See what the model flagged — not just a score.</h2>
            <p>
              Threat assessments call out payment requests, urgency, unverified domains, and recruitment-pattern
              issues in plain language, then map them to the four pillars so you know why the verdict landed
              where it did.
            </p>
          </div>
          <div className="story-visual">
            <div className="annotate-card">
              <p className="eyebrow">Recruiter message</p>
              <p className="annotate-msg">
                Congratulations! You&apos;ve been selected.{' '}
                <span className="a">Pay ₹999</span> to confirm your seat within{' '}
                <span className="a">24 hours</span>. Visit{' '}
                <span className="a">scamhire.online</span> to unlock onboarding.
              </p>
              <div className="annotate-tags">
                <span>⚠ PAYMENT REQUEST</span>
                <span>⚠ URGENCY</span>
                <span>⚠ UNVERIFIED DOMAIN</span>
                <span>⚠ RECRUITMENT PATTERN</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <section className="story-section" id="scanner">
        <div className="scanner-intro">
          <p className="eyebrow">Security scanner</p>
          <h2>Have an offer? Run the audit.</h2>
          <p>Paste the message, attach screenshots if you have them, and get a full threat assessment.</p>
        </div>
        <SecurityScanner embedded />
      </section>

      <Reveal className="story-final" variant="up" reduceMotion={reduceMotion}>
        <h2>Before you trust the offer, check it.</h2>
        <p>One message can cost more than a minute of verification.</p>
        <div className="story-ctas">
          <Link className="btn btn-solid" to="/check">Check an Offer</Link>
          <a className="btn btn-ghost" href="#how-it-works">Learn How It Works</a>
        </div>
      </Reveal>
    </div>
  );
}
