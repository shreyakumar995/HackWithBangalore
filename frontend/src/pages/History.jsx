import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Spin, verdictMap } from '../shared';

function scoreTone(score) {
  if (score <= 40) return 'high';
  if (score <= 70) return 'medium';
  return 'low';
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function History() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/history', { timeout: 15000 });
        if (!cancelled) {
          if (res.data.success) setSubmissions(res.data.submissions || []);
          else setError(res.data.error || 'Failed to load history.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || err.message || 'Failed to connect. Make sure the backend is online.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const verdicts = useMemo(() => {
    const set = new Set(submissions.map((s) => s.verdict).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      if (verdictFilter !== 'ALL' && s.verdict !== verdictFilter) return false;
      if (!q) return true;
      return String(s.company_domain || '').toLowerCase().includes(q);
    });
  }, [submissions, verdictFilter, search]);

  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <div className="section-head">
        <p className="kicker">Submission history</p>
        <h2 className="section-title">Recent audits</h2>
        <p className="section-copy">Last 50 evaluations stored by the backend — domains, scores, and verdicts.</p>
      </div>

      <div
        className="glass panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <label className="field-label" style={{ margin: 0, flex: '1 1 220px' }} htmlFor="history-search">
          Search domain
        </label>
        <input
          id="history-search"
          className="text-input"
          style={{ minHeight: 44, flex: '2 1 240px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company domain…"
        />
        <label className="field-label" style={{ margin: 0 }} htmlFor="history-verdict">
          Verdict
        </label>
        <select
          id="history-verdict"
          className="text-input"
          style={{ minHeight: 44, flex: '0 1 200px', padding: '10px 12px' }}
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
        >
          {verdicts.map((v) => (
            <option key={v} value={v}>{v === 'ALL' ? 'All verdicts' : v}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="loading-panel">
          <h3><Spin /> Loading history...</h3>
        </div>
      )}

      {error && (
        <div className="callout" role="alert">
          <h3>Could not load history</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="glass panel" style={{ textAlign: 'center', padding: 40 }}>
          <p className="kicker">Empty</p>
          <h3 style={{ margin: '8px 0 0', fontWeight: 500 }}>No submissions yet</h3>
          <p className="section-copy" style={{ margin: '10px auto 0' }}>
            Run a single or bulk audit to populate this list.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11, fontFamily: 'var(--mono)' }}>
                  <th style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Domain</th>
                  <th style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Score</th>
                  <th style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Verdict</th>
                  <th style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Critical</th>
                  <th style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const tone = scoreTone(row.score ?? 0);
                  const meta = verdictMap[row.verdict];
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                        {row.company_domain || <span style={{ color: 'var(--muted)' }}>Unknown</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`tone-${tone}`} style={{ fontWeight: 600 }}>{row.score}/100</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          className={`risk-chip tone-${meta?.tone || tone}`}
                          style={meta ? { color: meta.color, background: meta.bg, borderColor: meta.border } : undefined}
                        >
                          {row.verdict || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {row.critical_flag_detected
                          ? <span className="bad">Yes</span>
                          : <span style={{ color: 'var(--muted)' }}>No</span>}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted-light)' }}>
                        {formatDate(row.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
