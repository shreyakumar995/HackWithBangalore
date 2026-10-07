import { useState, useEffect } from 'react';

// ─── Shared style tokens ──────────────────────────────────────────────────────
export const card = {
  background: 'rgba(10,17,28,0.78)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  boxShadow: '0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
};

export const verdictMap = {
  LEGITIMATE: {
    tone: 'low',
    label: 'Verifiable & Legitimate',
    desc: 'This internship aligns with standard corporate safety protocols and shows high transparency. No significant threats detected.',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    color: '#22C98A',
  },
  SUSPICIOUS: {
    tone: 'medium',
    label: 'Suspicious Elements Detected',
    desc: 'Caution advised. One or more parameters deviate from established corporate recruitment standards.',
    bg: 'rgba(244,185,66,0.1)',
    border: 'rgba(244,185,66,0.25)',
    color: '#F4B942',
  },
  'LIKELY SCAM': {
    tone: 'high',
    label: 'High Risk: Likely Fraud',
    desc: 'Critical warning. Multiple indicators of recruitment fraud detected. Engage with extreme skepticism.',
    bg: 'rgba(255,77,94,0.1)',
    border: 'rgba(255,77,94,0.25)',
    color: '#FF4D5E',
  },
  'DEFINITE SCAM': {
    tone: 'critical',
    label: 'Severe Threat: Confirmed Scam',
    desc: 'Immediate action required. Confirmed deceptive recruitment activity detected. Terminate contact immediately.',
    bg: 'rgba(255,77,94,0.1)',
    border: 'rgba(255,77,94,0.25)',
    color: '#FF4D5E',
  },
};

export const pillarLabels = {
  financial_structure: 'Financial Structure',
  digital_footprint: 'Digital Footprint',
  recruitment_process: 'Recruitment Integrity',
  marketing_substance: 'Marketing Claims',
};

// ─── Tiny icon helpers ────────────────────────────────────────────────────────
export const Shield = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const Info = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const Upload = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const Img = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const X = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Print = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export const Spin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
    <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

function riskLevel(score) {
  if (score <= 20) return { text: 'CRITICAL', tone: 'critical', color: '#FF4D5E', bg: 'rgba(255,77,94,0.1)', border: 'rgba(255,77,94,0.25)' };
  if (score <= 40) return { text: 'HIGH RISK', tone: 'high', color: '#FF4D5E', bg: 'rgba(255,77,94,0.1)', border: 'rgba(255,77,94,0.25)' };
  if (score <= 70) return { text: 'MEDIUM', tone: 'medium', color: '#F4B942', bg: 'rgba(244,185,66,0.1)', border: 'rgba(244,185,66,0.25)' };
  return { text: 'LOW RISK', tone: 'low', color: '#22C98A', bg: 'rgba(34,201,138,0.1)', border: 'rgba(34,201,138,0.25)' };
}

function toneColor(tone) {
  if (tone === 'low') return '#22C98A';
  if (tone === 'medium') return '#F4B942';
  return '#FF4D5E';
}

// ─── Score Gauge ─────────────────────────────────────────────────────────────
export function ScoreGauge({ score }) {
  const [animated, setAnimated] = useState(0);
  const level = riskLevel(score);
  const color = toneColor(level.tone);
  const R = 48;
  const circ = 2 * Math.PI * R;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setAnimated(score);
      return undefined;
    }
    const dur = 1100;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setAnimated(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="gauge-wrap" role="img" aria-label={`Legitimacy score ${score} out of 100. ${level.text}`}>
      <div className="gauge">
        <svg width="180" height="180" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (animated / 100) * circ}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="gauge-center">
          <strong>{animated}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <span className={`risk-chip tone-${level.tone}`}>{level.text}</span>
    </div>
  );
}
