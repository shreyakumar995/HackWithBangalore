import { Link } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import './safety.css';

const PATTERNS = [
  {
    title: 'A fee before any work',
    body: 'Registration fees, training deposits, “seat confirmation,” security money, or an onboarding kit you must buy from a named seller. A real employer pays you. They do not charge you to start.',
  },
  {
    title: 'A clock on the offer',
    body: '“Pay within 24 hours or the seat goes to someone else.” Urgency is there to stop you from checking the company, the domain, or the recruiter.',
  },
  {
    title: 'Selected before an interview',
    body: 'A WhatsApp or email that congratulates you and asks for payment details, with no application, no interview, and no one you can look up on the company’s own site.',
  },
  {
    title: 'Hiring that only lives in a chat app',
    body: 'The entire process stays on Telegram, WhatsApp, or a personal Gmail address. There is no careers page, no company email, and the “HR” profile was created this week.',
  },
  {
    title: 'A domain that appeared this month',
    body: 'The offer links to a site registered days ago, often behind a privacy service, using a name close to a real company. That is a common setup for a page that disappears after the fee is paid.',
  },
  {
    title: 'Documents and OTPs up front',
    body: 'Aadhaar, PAN, bank details, or an OTP requested before you have verified who is hiring. Those are enough to open accounts or move money in your name.',
  },
];

const LEGIT = [
  {
    title: 'You can find the role without the recruiter',
    body: 'The same opening appears on the company’s own careers page or a board that company actually uses. The description matches what the recruiter sent.',
  },
  {
    title: 'The interview happens first',
    body: 'There is a real conversation — campus drive, video call, or office round — before an offer. Nobody is “already selected” from a forwarded message.',
  },
  {
    title: 'The people check out',
    body: 'The recruiter uses a company email, and you can match their name to a profile that has been at that company for more than a few days. A personal Gmail is a reason to pause, not proof by itself.',
  },
  {
    title: 'Money moves toward you',
    body: 'Stipend or salary is paid by the company after you join. Training, if it exists, is paid for by the employer or is clearly optional and not a condition of the offer.',
  },
  {
    title: 'The offer is specific',
    body: 'Role, team, location or remote terms, duration, and stipend are written down. Vague titles (“management trainee,” “brand ambassador”) plus a payment link are not an offer.',
  },
];

const REPORT = [
  {
    n: '01',
    title: 'If money already left your account',
    body: 'Call 1930, the national cybercrime helpline, as soon as you can. Have the UPI ID, account number, amount, and time ready. Early reports are what let banks try to freeze the receiving account.',
  },
  {
    n: '02',
    title: 'File it on the national portal',
    body: 'Report the same incident at cybercrime.gov.in. Keep the acknowledgement number. Upload screenshots of the chat, the offer, the payment, and the domain.',
  },
  {
    n: '03',
    title: 'Tell the local cyber cell',
    body: 'If a large amount is involved, or you handed over identity documents, also file with your city or state cyber police. Take the 1930 complaint number with you.',
  },
  {
    n: '04',
    title: 'Warn the company being copied',
    body: 'If the scam uses a real employer’s name, write to that company’s official careers or security address — the one on their own website, not the one in the scam message.',
  },
];

function Reveal({ children, className = '', variant = 'up', reduceMotion, id }) {
  const variants = {
    up: { hidden: { opacity: 0, y: reduceMotion ? 0 : 36 }, show: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: reduceMotion ? 0 : -28 }, show: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.97 }, show: { opacity: 1, scale: 1 } },
  };

  return (
    <m.section
      id={id}
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.section>
  );
}

export default function SafetyGuide() {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <article className="safety-guide">
        <m.header
          className="guide-hero"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
        >
          <div>
            <p className="kicker">Safety guide</p>
            <h1>What a fake internship looks like, and what to do next.</h1>
            <p>
              This page is a reference, not a scan. Use it to recognise the usual tricks, compare them with how
              real hiring works in India, and report a scam if money or documents have already changed hands.
            </p>
          </div>
          <nav className="guide-jumps" aria-label="On this page">
            <a href="#patterns">Common patterns</a>
            <a href="#legitimate">Real recruitment</a>
            <a href="#report">Report it</a>
          </nav>
        </m.header>

        <Reveal id="patterns" className="guide-section" variant="up" reduceMotion={reduceMotion}>
          <p className="kicker">Common patterns</p>
          <h2>The same scam, written a few different ways.</h2>
          <p className="guide-lede">
            Most internship fraud in student groups is not clever. It repeats a small set of asks. If two of these show
            up in one message, stop and check before you reply.
          </p>
          <div className="pattern-bento">
            {PATTERNS.map((item) => (
              <article className="pattern-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal id="legitimate" className="guide-section" variant="left" reduceMotion={reduceMotion}>
          <p className="kicker">Legitimate recruitment</p>
          <h2>What a real process usually does.</h2>
          <p className="guide-lede">
            Companies differ, but a genuine internship still has a trail you can verify without paying anyone. None of
            these alone prove an offer is safe. Together they are what you should be able to find.
          </p>
          <div className="legit-rail">
            {LEGIT.map((item, index) => (
              <article className="legit-step" key={item.title}>
                <i>{String(index + 1).padStart(2, '0')}</i>
                <div className="legit-body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal id="report" className="guide-section" variant="scale" reduceMotion={reduceMotion}>
          <p className="kicker">Report it in India</p>
          <h2>If you already paid, or sent documents.</h2>
          <p className="guide-lede">
            Reporting does not guarantee the money comes back. It does create a record, and a fast report is the only
            realistic chance of stopping a transfer.
          </p>
          <div className="report-grid">
            {REPORT.map((item) => (
              <article className="report-step" key={item.n}>
                <b>{item.n}</b>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="guide-links" variant="up" reduceMotion={reduceMotion}>
          <div>
            <p className="kicker">Official starting points</p>
            <h2>Keep the record. Then report it.</h2>
            <p className="guide-note" style={{ marginTop: 12 }}>
              Keep the chat, the payment receipt, the phone number, and the website address. Do not delete the
              conversation to “start fresh” — that record is the complaint.
            </p>
            <div style={{ marginTop: 18 }}>
              <Link className="btn btn-solid" to="/check">Check an offer first</Link>
            </div>
          </div>
          <ul>
            <li>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a>
              <span>National Cyber Crime Reporting Portal</span>
            </li>
            <li>
              <a href="tel:1930">1930</a>
              <span>National cybercrime helpline, run by I4C, for financial fraud</span>
            </li>
          </ul>
        </Reveal>
      </article>
    </LazyMotion>
  );
}
