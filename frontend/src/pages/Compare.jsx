import { useState } from 'react';
import axios from 'axios';
import { ScoreGauge, Shield, Spin, verdictMap } from '../shared';

function summaryLine(summary) {
  const { more_flags, left_red_flags, right_red_flags } = summary;
  if (more_flags === 'tie') {
    return `Both offers have the same number of red flags (${left_red_flags}).`;
  }
  if (more_flags === 'left') {
    return `Offer A has more red flags (${left_red_flags} vs ${right_red_flags}).`;
  }
  return `Offer B has more red flags (${right_red_flags} vs ${left_red_flags}).`;
}

function OfferColumn({ label, result, flagged }) {
  const verdict = verdictMap[result.verdict] || verdictMap.SUSPICIOUS;
  const flags = result.red_flags || [];

  return (
    <article className={`glass compare-col${flagged ? ' is-flagged' : ''}`}>
      <p className="kicker">{label}</p>
      <div className="compare-score">
        <ScoreGauge score={result.score} />
        <div>
          <h3 className={`tone-${verdict.tone}`}>{verdict.label}</h3>
          <p className="compare-count">{flags.length} red flag{flags.length === 1 ? '' : 's'}</p>
        </div>
      </div>
      {flags.length > 0 ? (
        <ul className="compare-flags">
          {flags.map((flag, i) => (
            <li key={i}><span className="bad" aria-hidden="true">●</span><span>{flag}</span></li>
          ))}
        </ul>
      ) : (
        <p className="compare-count">No red flags returned for this offer.</p>
      )}
    </article>
  );
}

export default function Compare() {
  const [offerA, setOfferA] = useState('');
  const [offerB, setOfferB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compare = async () => {
    if (!offerA.trim() || !offerB.trim()) {
      setError('Paste both offers before comparing.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post('/api/compare', { offerA, offerB }, { timeout: 180000 });
      if (res.data.success) setResult(res.data);
      else setError(res.data.error || 'Comparison failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to connect. Make sure the backend is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section compare-page" style={{ paddingTop: 28 }}>
      <div className="glass console">
        <div className="console-top">
          <p className="kicker">Compare</p>
          <h2>Which offer has more red flags?</h2>
          <p>Paste two opportunities. Each one is scored with the same check used on a single offer.</p>
        </div>

        <div className="compare-inputs">
          <div>
            <label className="field-label" htmlFor="offer-a">Offer A</label>
            <textarea
              id="offer-a"
              className="text-input"
              value={offerA}
              onChange={(e) => setOfferA(e.target.value)}
              placeholder="Paste the first internship or job offer..."
              rows={8}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="offer-b">Offer B</label>
            <textarea
              id="offer-b"
              className="text-input"
              value={offerB}
              onChange={(e) => setOfferB(e.target.value)}
              placeholder="Paste the second internship or job offer..."
              rows={8}
            />
          </div>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="btn btn-solid"
            onClick={compare}
            disabled={loading}
          >
            {loading ? <><Spin /> Comparing...</> : <><Shield s={15} /> Compare offers</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="callout" role="alert">
          <h3>Comparison failed</h3>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="loading-panel" aria-live="polite" aria-busy="true">
          <h3>Comparing both offers...</h3>
          <p>Each offer is scored, domain-checked, and compared with earlier submissions. This can take a minute.</p>
        </div>
      )}

      {!loading && result && (
        <div className="compare-results">
          <p className={`compare-summary${result.summary.more_flags === 'tie' ? ' is-tie' : ''}`}>
            {summaryLine(result.summary)}
          </p>
          <div className="compare-grid">
            <OfferColumn label="Offer A" result={result.left} flagged={result.summary.more_flags === 'left'} />
            <OfferColumn label="Offer B" result={result.right} flagged={result.summary.more_flags === 'right'} />
          </div>
        </div>
      )}
    </section>
  );
}
