import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Shield, Upload, X, Spin, ScoreGauge } from '../shared';
import AuditResults from './AuditResults';

export default function SecurityScanner({ defaultMode = 'single', embedded = false }) {
  const [mode, setMode] = useState(defaultMode === 'bulk' ? 'bulk' : 'single');

  // Single
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  // Bulk
  const [batchText, setBatchText] = useState('');
  const [batchResults, setBatchResults] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');

  useEffect(() => {
    setMode(defaultMode === 'bulk' ? 'bulk' : 'single');
  }, [defaultMode]);

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach((item) => URL.revokeObjectURL(item.url));
  }, [files]);

  const onDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const onDragIn = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDrag(true); }, []);
  const onDragOut = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDrag(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (dropped.length) setFiles((p) => [...p, ...dropped].slice(0, 5));
  }, []);

  const onSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (selected.length) setFiles((p) => [...p, ...selected].slice(0, 5));
  };
  const remove = (i) => setFiles((p) => p.filter((_, j) => j !== i));
  const fmt = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);

  const analyze = async () => {
    if (!text.trim() && files.length === 0) {
      setError('Please provide text or attach screenshots.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('textContent', text);
      files.forEach((f) => fd.append('screenshots', f));
      const res = await axios.post('/api/evaluate', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      if (res.data.success) {
        setResult(res.data.data);
        requestAnimationFrame(() => {
          document.getElementById('live-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else setError(res.data.error || 'Audit failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to connect. Make sure the backend is online.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setText('');
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const analyzeBatch = async () => {
    if (!batchText.trim()) {
      setBatchError('Please paste the bulk text to analyze.');
      return;
    }
    setBatchLoading(true);
    setBatchError('');
    setBatchResults(null);
    try {
      const res = await axios.post('/api/evaluate-batch', { textContent: batchText }, { timeout: 180000 });
      if (res.data.success) setBatchResults(res.data);
      else setBatchError(res.data.error || 'Batch audit failed. Please try again.');
    } catch (err) {
      setBatchError(err.response?.data?.error || err.message || 'Failed to connect. Make sure the backend is online.');
    } finally {
      setBatchLoading(false);
    }
  };

  const resetBatch = () => {
    setBatchText('');
    setBatchResults(null);
    setBatchError('');
  };

  return (
    <div className={`scanner-shell${embedded ? ' is-embedded' : ''}`} id="scanner">
      <div className="glass console scanner-console">
        <div className="scanline" aria-hidden="true" />
        <div className="console-top">
          <div className="scanner-status-row">
            <p className="kicker">Security audit</p>
            <div className="scanner-pills">
              <span className="tech-chip">SYSTEM ONLINE</span>
              <span className="tech-chip">AI ENGINE</span>
            </div>
          </div>
          <h2>Paste an offer. Upload evidence. Get a threat assessment.</h2>
          <p>ShieldIntern scores financial pressure, domain age, recruitment process, and marketing claims against the same four pillars every time.</p>
        </div>

        {mode === 'single' ? (
          <>
            <label className="field-label" htmlFor="text-content">Offer / communication</label>
            <textarea
              id="text-content"
              className="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste internship offer, recruiter message, email, job description, or social media recruitment text..."
              rows={8}
            />

            <div style={{ marginTop: 16 }} className="field-label">
              <span>Evidence attachments</span>
              <span>{files.length}/5</span>
            </div>
            <input
              ref={inputRef}
              id="evidence-files"
              type="file"
              accept="image/*"
              multiple
              onChange={onSelect}
              className="sr-only"
              tabIndex={-1}
            />
            <div
              className={`dropzone${drag ? ' is-drag' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="Drop evidence here or browse screenshot files"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragEnter={onDragIn}
              onDragLeave={onDragOut}
              onDragOver={onDrag}
              onDrop={onDrop}
            >
              <Upload s={18} />
              <strong>Drop evidence here</strong>
              <span>PNG, JPG, GIF, WebP — up to 5MB each</span>
            </div>

            {previews.length > 0 && (
              <ul className="file-list">
                {previews.map((item, i) => (
                  <li className="file-chip" key={item.url}>
                    <img src={item.url} alt="" />
                    <div>
                      <p>{item.file.name}</p>
                      <small>{fmt(item.file.size)}</small>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${item.file.name}`}
                      onClick={() => remove(i)}
                    >
                      <X s={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="action-row">
              <button
                id="reset-btn"
                type="button"
                className="btn btn-ghost"
                onClick={reset}
                disabled={loading || (!text && files.length === 0)}
              >
                Clear
              </button>
              <button
                id="analyze-btn"
                type="button"
                className="btn btn-solid"
                onClick={analyze}
                disabled={loading}
              >
                {loading ? <><Spin /> Analyzing...</> : <><Shield s={15} /> Check this offer</>}
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="batch-text">Forwarded job list</label>
            <textarea
              id="batch-text"
              className="text-input"
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="Paste the entire forwarded message containing multiple job or internship postings. They do not need to be separated first."
              rows={12}
            />
            <div className="action-row">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetBatch}
                disabled={batchLoading || !batchText}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={analyzeBatch}
                disabled={batchLoading}
              >
                {batchLoading ? <><Spin /> Analyzing...</> : <><Shield s={15} /> Run Bulk Audit</>}
              </button>
            </div>
          </>
        )}
      </div>

      {mode === 'single' && error && (
        <div className="callout" role="alert">
          <h3>Threat audit failed</h3>
          <p>{error}</p>
        </div>
      )}

      {mode === 'single' && loading && (
        <div className="loading-panel" aria-live="polite" aria-busy="true">
          <h3>Analyzing threat signals...</h3>
          <p>Deciphering compensation, company presence, recruitment patterns, and scam signals.</p>
        </div>
      )}

      {mode === 'single' && !loading && result && (
        <AuditResults result={result} onReset={reset} />
      )}

      {mode === 'bulk' && batchError && (
        <div className="callout" role="alert">
          <h3>Bulk audit failed</h3>
          <p>{batchError}</p>
        </div>
      )}

      {mode === 'bulk' && batchLoading && (
        <div className="loading-panel" aria-live="polite" aria-busy="true">
          <h3>Analyzing threat signals...</h3>
          <p>This may take a minute. Each posting is scored, domain-checked, and compared with earlier submissions.</p>
        </div>
      )}

      {mode === 'bulk' && !batchLoading && batchResults && (
        <div className="report">
          <div className="report-toolbar">
            <p className="kicker">
              {batchResults.postings_analyzed} posting{batchResults.postings_analyzed !== 1 ? 's' : ''} audited
            </p>
            <button type="button" className="linkish" onClick={resetBatch}>Audit a new list</button>
          </div>
          {batchResults.results.map((item, i) => (
            <article className="glass batch-card" key={i}>
              <p className="kicker">Posting {i + 1}</p>
              {item.success ? (
                <div className="batch-body">
                  <ScoreGauge score={item.data.score} />
                  <div>
                    <p>
                      {item.original_text.slice(0, 180)}
                      {item.original_text.length > 180 ? '...' : ''}
                    </p>
                    {item.data.red_flags?.length > 0 && (
                      <p className="bad" style={{ marginTop: 8 }}>{item.data.red_flags[0]}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="bad">Failed to analyze this posting: {item.error}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
