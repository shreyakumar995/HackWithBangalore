import { useState } from 'react';
import {
  ScoreGauge,
  Shield,
  Print,
  verdictMap,
  pillarLabels,
} from '../shared';

const pillarCodes = {
  financial_structure: 'AI-FIN-01',
  digital_footprint: 'AI-DIG-02',
  recruitment_process: 'AI-REC-03',
  marketing_substance: 'AI-MKT-04',
};

function pillarTone(score, max) {
  const p = (score / max) * 100;
  return p <= 30 ? 'high' : p <= 70 ? 'medium' : 'low';
}

function toneColor(tone) {
  if (tone === 'low') return '#5E7655';
  if (tone === 'medium') return '#C58A2B';
  return '#C8463F';
}

function DomainBlock({ dv }) {
  const verified = dv.checked && dv.ageInDays !== null;
  const years = verified ? Math.floor(dv.ageInDays / 365) : null;
  const tone = !verified ? 'high' : dv.ageInDays < 30 ? 'high' : dv.ageInDays < 180 ? 'medium' : 'low';
  return (
    <section className="glass panel">
      <div className="panel-label"><span>Domain verification</span><span>WHOIS lookup</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <strong>{dv.domain}</strong>
        <span className={`risk-chip tone-${tone}`}>
          {verified ? `${dv.ageInDays} days old${years > 0 ? ` (~${years} yr)` : ''}` : 'Unverifiable'}
        </span>
      </div>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14, lineHeight: 1.65 }}>
        {verified
          ? dv.ageInDays < 30
            ? 'This domain was registered extremely recently — a strong, independent indicator of a freshly created scam operation.'
            : dv.ageInDays < 180
              ? 'This domain is relatively new. Not conclusive on its own, but worth factoring in alongside other signals.'
              : 'This domain has existed for a significant amount of time, consistent with a genuinely established business.'
          : `We could not confirm this domain genuinely exists via a live WHOIS lookup${dv.error ? ` (${dv.error})` : ''}. Treat this as its own red flag — a legitimate company's domain should be verifiable.`}
      </p>
    </section>
  );
}

function PatternBlock({ pd }) {
  const flagged = pd.averagePriorScore < 40 || pd.anyPriorCriticalFlag;
  return (
    <section className="glass panel">
      <div className="panel-label"><span>Pattern detection</span><span>Cross-submission</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <strong>Analyzed {pd.priorSubmissionCount} time{pd.priorSubmissionCount !== 1 ? 's' : ''} before</strong>
        <span className={`risk-chip tone-${flagged ? 'high' : 'medium'}`}>Avg score: {pd.averagePriorScore}/100</span>
      </div>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14, lineHeight: 1.65 }}>
        {flagged
          ? 'This company domain has a history of low scores across prior submissions — recurring reports of the same domain are a strong signal of a widely-circulated scam.'
          : 'This domain has been checked before by other users, with generally reasonable scores. Still worth your own independent verification.'}
      </p>
    </section>
  );
}

export default function AuditResults({ result, onReset }) {
  const [eli5, setEli5] = useState(false);
  const vc = verdictMap[result.verdict] || verdictMap.SUSPICIOUS;
  const showAdvisory = result.critical_flag_detected || result.verdict === 'DEFINITE SCAM' || result.verdict === 'LIKELY SCAM';
  const advice = eli5 && result.recommendation_simple ? result.recommendation_simple : result.recommendation;

  return (
    <div className="report" id="live-results">
      <div className="report-toolbar">
        <div>
          <p className="kicker">Threat evaluation center</p>
          <h2 className="report-title">Your security assessment</h2>
        </div>
        <button type="button" className="linkish" onClick={onReset}>Audit a new offer</button>
      </div>

      <section className="glass assessment">
        <div className="eval-grid">
          <ScoreGauge score={result.score} />
          <div className="verdict-copy">
            <p className="kicker">AI security analysis</p>
            <h3 className={`tone-${vc.tone}`}>{vc.label}</h3>
            <p>{vc.desc}</p>
            {advice && (
              <div className="summary">
                <div className="summary-head">
                  <strong>{eli5 ? 'Plain explanation' : 'AI summary'}</strong>
                  {result.recommendation_simple && (
                    <button
                      type="button"
                      className="eli5-toggle"
                      aria-pressed={eli5}
                      onClick={() => setEli5((on) => !on)}
                    >
                      {eli5 ? 'Show full advice' : 'Explain simply'}
                    </button>
                  )}
                </div>
                {advice}
              </div>
            )}
            {(result.red_flags?.length > 0 || result.green_flags?.length > 0) && (
              <div className="detected">
                <h4>Detected signals</h4>
                <ul>
                  {result.red_flags?.slice(0, 4).map((flag, i) => (
                    <li key={`r-${i}`}><span className="bad" aria-hidden="true">⚠</span><span>{flag}</span></li>
                  ))}
                  {result.green_flags?.slice(0, 2).map((flag, i) => (
                    <li key={`g-${i}`}><span className="good" aria-hidden="true">✓</span><span>{flag}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {showAdvisory && advice && (
        <section className="advisory-panel" role="status">
          <div className="advisory-rail" aria-hidden="true" />
          <div className="advisory-body">
            <div className="advisory-top">
              <span className="kicker" style={{ color: 'var(--danger)' }}>Active scam advisory</span>
              <span className="risk-chip tone-high">HIGH</span>
            </div>
            <p>{advice}</p>
          </div>
        </section>
      )}

      {result.pillar_scores && (
        <div className="pillar-grid">
          {Object.entries(result.pillar_scores).map(([key, pillar]) => {
            const tone = pillarTone(pillar.score, pillar.max);
            const pct = Math.round((pillar.score / pillar.max) * 100);
            const color = toneColor(tone);
            return (
              <article className="glass pillar-card glass-hover" key={key}>
                <div className="meta">
                  <div className={`pts tone-${tone}`}>{pillar.score} pts</div>
                  <div className="code">{pillarCodes[key] || 'AI-MOD'}</div>
                </div>
                <h3>{pillarLabels[key] || key.replace(/_/g, ' ')}</h3>
                <p>{pillar.details || 'No additional detail returned for this pillar.'}</p>
                <div className="pillar-bar" aria-hidden="true">
                  <span style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
                </div>
                <span className={`risk-chip tone-${tone}`}>
                  {tone === 'low' ? 'LOW RISK' : tone === 'medium' ? 'MEDIUM' : 'HIGH RISK'}
                </span>
              </article>
            );
          })}
        </div>
      )}

      {result.domain_verification && <DomainBlock dv={result.domain_verification} />}
      {result.pattern_detection && result.pattern_detection.priorSubmissionCount > 0 && (
        <PatternBlock pd={result.pattern_detection} />
      )}

      {(result.red_flags?.length > 0 || result.green_flags?.length > 0) && (
        <section className="glass panel">
          <div className="panel-label"><span>Full indicator list</span></div>
          {result.red_flags?.length > 0 && (
            <div className="flag-col">
              <h3 className="bad">Red flags</h3>
              <ul>
                {result.red_flags.map((flag, i) => (
                  <li key={i}><span className="bad" aria-hidden="true">●</span><span>{flag}</span></li>
                ))}
              </ul>
            </div>
          )}
          {result.green_flags?.length > 0 && (
            <div className="flag-col">
              <h3 className="good">Green flags</h3>
              <ul>
                {result.green_flags.map((flag, i) => (
                  <li key={i}><span className="good" aria-hidden="true">●</span><span>{flag}</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="glass panel">
        <div className="panel-label"><span>Verification guidelines</span><span>Self audit</span></div>
        {[
          ['Verify corporate identity', 'Search the registered business name in official government business records.'],
          ['Cross-check recruiters', "Verify your recruiter's profile on LinkedIn to confirm genuine employment."],
          ['Zero payments rule', 'Never pay for training, laptops, or access. Genuine employers pay you.'],
        ].map(([title, body]) => (
          <div className="guide" key={title}>
            <span aria-hidden="true" style={{ color: 'var(--blue)' }}><Shield s={16} /></span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={() => window.print()}>
          <Print /> Print security advisory
        </button>
      </section>
    </div>
  );
}
