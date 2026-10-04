import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// ─── Score Gauge ─────────────────────────────────────────────────────────────
function ScoreGauge({ score }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const dur = 1100, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setAnimated(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const getV = (s) => {
    if (s <= 20) return { text: 'SEVERE RISK',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   cls: '#ef4444' };
    if (s <= 40) return { text: 'LIKELY FRAUD',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   cls: '#ef4444' };
    if (s <= 70) return { text: 'SUSPICIOUS',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  cls: '#f59e0b' };
    return             { text: 'SECURE AUDIT',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', cls: '#10b981' };
  };
  const v = getV(score);
  const R = 38, circ = 2 * Math.PI * R;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, flexShrink:0 }}>
      <div style={{ position:'relative', width:112, height:112 }}>
        <svg style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5.5"/>
          <circle cx="50" cy="50" r={R} fill="none" stroke={v.color} strokeWidth="5.5"
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={circ - (animated / 100) * circ}
            style={{ transition:'stroke-dashoffset 0.1s ease-out', filter:`drop-shadow(0 0 6px ${v.color}bb)` }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:26, fontWeight:800, color:v.color, lineHeight:1, fontFamily:'Outfit,sans-serif' }}>{animated}</span>
          <span style={{ fontSize:9, color:'#64748b', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.1em', marginTop:3 }}>score</span>
        </div>
      </div>
      <span style={{
        display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px',
        borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:'0.08em',
        textTransform:'uppercase', background:v.bg, border:`1px solid ${v.border}`, color:v.color
      }}>{v.text}</span>
    </div>
  );
}

// ─── Tiny icon helpers ────────────────────────────────────────────────────────
const Shield = ({ s=16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const Info   = ({ s=13 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const Upload = ({ s=20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const Img    = ({ s=13 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const X      = ({ s=12 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Print  = ({ s=14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const Spin   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle style={{opacity:.2}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.8}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>;

// ─── Shared style tokens ──────────────────────────────────────────────────────
const card = {
  background: 'rgba(255,255,255,0.028)',
  backdropFilter: 'blur(20px) saturate(150%)',
  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 20,
  boxShadow: '0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
};

const verdictMap = {
  'LEGITIMATE':    { bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)', color:'#10b981', label:'Verifiable & Legitimate',      desc:'This internship aligns with standard corporate safety protocols and shows high transparency. No significant threats detected.'          },
  'SUSPICIOUS':    { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.25)', color:'#f59e0b', label:'Suspicious Elements Detected',  desc:'Caution advised. One or more parameters deviate from established corporate recruitment standards.'                                   },
  'LIKELY SCAM':   { bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',  color:'#ef4444', label:'High Risk: Likely Fraud',        desc:'Critical warning. Multiple indicators of recruitment fraud detected. Engage with extreme skepticism.'                              },
  'DEFINITE SCAM': { bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',  color:'#ef4444', label:'Severe Threat: Confirmed Scam', desc:'Immediate action required. Confirmed deceptive recruitment activity detected. Terminate contact immediately.'                    },
};

const pillarLabels = {
  financial_structure: 'Financial Structure & Fees',
  digital_footprint:   'Digital & Legal Footprint',
  recruitment_process: 'Interview & Sourcing Channels',
  marketing_substance: 'Role Duties & Guarantees',
};

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [files, setFiles]           = useState([]);
  const [text, setText]             = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [drag, setDrag]             = useState(false);
  const inputRef = useRef(null);

  // ── Batch mode state ──
  const [mode, setMode]             = useState('single'); // 'single' or 'batch'
  const [batchText, setBatchText]   = useState('');
  const [batchResults, setBatchResults] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');

  const onDrag    = useCallback(e => { e.preventDefault(); e.stopPropagation(); }, []);
  const onDragIn  = useCallback(e => { e.preventDefault(); e.stopPropagation(); setDrag(true);  }, []);
  const onDragOut = useCallback(e => { e.preventDefault(); e.stopPropagation(); setDrag(false); }, []);
  const onDrop    = useCallback(e => {
    e.preventDefault(); e.stopPropagation(); setDrag(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (dropped.length) setFiles(p => [...p, ...dropped].slice(0, 5));
  }, []);

  const onSelect = e => setFiles(p => [...p, ...Array.from(e.target.files)].slice(0, 5));
  const remove   = i => setFiles(p => p.filter((_, j) => j !== i));
  const fmt      = b => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB';

  const analyze = async () => {
    if (!text.trim() && files.length === 0) { setError('Please provide text or attach screenshots.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('textContent', text);
      files.forEach(f => fd.append('screenshots', f));
      const res = await axios.post('/api/evaluate', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
      if (res.data.success) setResult(res.data.data);
      else setError(res.data.error || 'Audit failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to connect. Make sure the backend is online.');
    } finally { setLoading(false); }
  };

  const reset = () => { setFiles([]); setText(''); setResult(null); setError(''); };

  // ── Batch mode functions ──
  const analyzeBatch = async () => {
    if (!batchText.trim()) { setBatchError('Please paste the bulk text to analyze.'); return; }
    setBatchLoading(true); setBatchError(''); setBatchResults(null);
    try {
      const res = await axios.post('/api/evaluate-batch', { textContent: batchText }, { timeout: 180000 });
      if (res.data.success) setBatchResults(res.data);
      else setBatchError(res.data.error || 'Batch audit failed. Please try again.');
    } catch (err) {
      setBatchError(err.response?.data?.error || err.message || 'Failed to connect. Make sure the backend is online.');
    } finally { setBatchLoading(false); }
  };

  const resetBatch = () => { setBatchText(''); setBatchResults(null); setBatchError(''); };

  const pillarColor = (score, max) => {
    const p = (score / max) * 100;
    return p <= 30 ? '#ef4444' : p <= 70 ? '#f59e0b' : '#10b981';
  };

  return (
    <div style={{ width:'100%', minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative' }}>

      {/* ── Gradient background ───────────────────────────────── */}
      <div className="app-bg" />

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        position:'sticky', top:0, zIndex:50, width:'100%',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        background:'rgba(5,14,29,0.85)',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
      }}>
        <div style={{ maxWidth:680, width:'100%', margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Shield s={15} />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14, color:'#fff', lineHeight:1 }}>
                ShieldIntern
                <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#3b82f6', padding:'2px 6px', borderRadius:4 }}>v1.0</span>
              </div>
              <div style={{ fontSize:10, color:'#64748b', fontWeight:500, marginTop:3 }}>Internship Fraud Audit System</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse 2s infinite' }} />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      {/* ── Page body ─────────────────────────────────────────── */}
      <main style={{ position:'relative', zIndex:10, flex:1, width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section style={{ maxWidth:640, width:'100%', margin:'0 auto', padding:'72px 24px 56px', textAlign:'center' }}>

          {/* Shield icon */}
          <div className="glowing-shield" style={{
            width:64, height:64, borderRadius:18, background:'rgba(59,130,246,0.1)',
            border:'1px solid rgba(59,130,246,0.22)', color:'#3b82f6',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 28px',
            boxShadow:'0 0 32px rgba(59,130,246,0.14)',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4" strokeWidth="2.5"/>
            </svg>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(2rem, 5vw, 3rem)', fontWeight:800, color:'#f1f5f9', lineHeight:1.12, letterSpacing:'-0.02em', margin:0 }}>
            Built-in internship security{' '}
            <span style={{ background:'linear-gradient(120deg, #22d3ee, #3b82f6, #818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              where scams are exposed
            </span>
          </h1>

          <p style={{ marginTop:20, fontSize:15, color:'#94a3b8', lineHeight:1.8, fontWeight:500, maxWidth:500, margin:'20px auto 0' }}>
            Use advanced AI to audit recruitment messages, internship offer details, and corporate descriptions — or upload screenshots for dynamic threat vetting.
          </p>

          {/* Stats */}
          <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap', marginTop:36 }}>
            {[{ v:'50K+', l:'Audits Run' }, { v:'98%', l:'Accuracy' }, { v:'< 30s', l:'Response Time' }].map(s => (
              <div key={s.l} style={{ padding:'14px 28px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, textAlign:'center', minWidth:90 }}>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:20, color:'#fff', lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:10, color:'#64748b', fontWeight:600, marginTop:5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Content column ─────────────────────────────────── */}
        <div style={{ maxWidth:620, width:'100%', margin:'0 auto', padding:'0 24px 80px', display:'flex', flexDirection:'column', gap:24 }}>

          {/* ── Input card ─────────────────────────────────── */}
          <div style={card}>
            <div style={{ padding:'32px 36px' }}>

              {/* Card heading */}
              <div style={{ paddingBottom:24, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:28 }}>
                <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:17, color:'#f1f5f9', margin:0, lineHeight:1 }}>
                  Audit Internship Opportunity
                </h2>
                <p style={{ fontSize:13, color:'#94a3b8', marginTop:8, lineHeight:1.7, fontWeight:500 }}>
                  Paste recruitment texts, offer emails, or upload attachments to check for fraud indicators.
                </p>
              </div>

              {/* Mode toggle */}
              <div style={{ display:'flex', gap:8, marginBottom:24, padding:4, background:'rgba(5,14,29,0.6)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12 }}>
                {['single', 'batch'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex:1, padding:'9px 16px', borderRadius:9, cursor:'pointer',
                      fontSize:12, fontWeight:700, textTransform:'capitalize', transition:'all 0.2s',
                      background: mode === m ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: mode === m ? '#3b82f6' : '#64748b',
                      border: mode === m ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    }}
                  >
                    {m === 'single' ? 'Single Check' : 'Bulk / Forwarded List'}
                  </button>
                ))}
              </div>

              {mode === 'single' && (
                <>
                  {/* Text area */}
                  <div style={{ marginBottom:24 }}>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#64748b', fontFamily:'JetBrains Mono,monospace', marginBottom:10 }}>
                      Offer Text / Communication Log
                    </label>
                    <textarea
                      id="text-content"
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Paste the offer details, email transcripts, job postings, or social media recruitment texts here..."
                      rows={8}
                      style={{
                        width:'100%', background:'rgba(5,14,29,0.6)',
                        border:'1px solid rgba(255,255,255,0.08)', borderRadius:12,
                        color:'#f1f5f9', fontSize:13, lineHeight:1.7, fontWeight:500,
                        padding:'14px 16px', resize:'none', outline:'none',
                        fontFamily:'Plus Jakarta Sans,sans-serif',
                        transition:'border-color 0.2s, box-shadow 0.2s',
                        boxSizing:'border-box',
                      }}
                      onFocus={e => { e.target.style.borderColor='rgba(59,130,246,0.45)'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.08)'; }}
                      onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
                    />
                  </div>

                  {/* Upload zone */}
                  <div style={{ marginBottom:28 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <label style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#64748b', fontFamily:'JetBrains Mono,monospace' }}>
                        Evidence Attachments
                      </label>
                      <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:6 }}>
                        {files.length}/5
                      </span>
                    </div>

                    <div
                      onClick={() => inputRef.current?.click()}
                      onDragEnter={onDragIn} onDragLeave={onDragOut} onDragOver={onDrag} onDrop={onDrop}
                      style={{
                        border:`1px dashed ${drag ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center',
                        justifyContent:'center', gap:10, minHeight:110, padding:'20px 16px',
                        textAlign:'center', cursor:'pointer',
                        background: drag ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.01)',
                        transition:'all 0.2s',
                      }}
                    >
                      <input ref={inputRef} type="file" accept="image/*" multiple onChange={onSelect} style={{ display:'none' }} />
                      <div style={{ padding:10, borderRadius:12, background: drag ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color: drag ? '#3b82f6' : '#64748b' }}>
                        <Upload s={18} />
                      </div>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:'#94a3b8', margin:0 }}>
                          Drag screenshots here, or <span style={{ color:'#3b82f6', fontWeight:700 }}>browse files</span>
                        </p>
                        <p style={{ fontSize:11, color:'#475569', marginTop:4 }}>PNG, JPG, WebP — up to 5MB each</p>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <ul style={{ listStyle:'none', margin:'12px 0 0', padding:0, display:'flex', flexDirection:'column', gap:8 }}>
                        {files.map((f, i) => (
                          <li key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(5,14,29,0.5)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                              <div style={{ padding:6, borderRadius:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', color:'#64748b', flexShrink:0 }}>
                                <Img s={13} />
                              </div>
                              <div style={{ minWidth:0 }}>
                                <p style={{ fontSize:12, fontWeight:700, color:'#f1f5f9', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</p>
                                <p style={{ fontSize:10, color:'#64748b', margin:'2px 0 0' }}>{fmt(f.size)}</p>
                              </div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); remove(i); }} style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:8, color:'#64748b', transition:'all 0.2s', display:'flex' }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background='none'}>
                              <X s={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Buttons */}
                  <div style={{ display:'flex', gap:12, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      id="reset-btn"
                      onClick={reset}
                      disabled={loading || (!text && files.length === 0)}
                      style={{
                        flex:'0 0 auto', width:140, padding:'11px 16px',
                        background:'transparent', border:'1px solid rgba(255,255,255,0.09)',
                        borderRadius:12, color:'#94a3b8', fontSize:12, fontWeight:700,
                        cursor:'pointer', transition:'all 0.2s', opacity: loading || (!text && files.length === 0) ? 0.35 : 1,
                      }}
                      onMouseEnter={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#f1f5f9'; }}}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; }}
                    >
                      Clear Details
                    </button>
                    <button
                      id="analyze-btn"
                      onClick={analyze}
                      disabled={loading}
                      style={{
                        flex:1, padding:'11px 20px', borderRadius:12, border:'none',
                        background:'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        boxShadow:'0 4px 16px rgba(59,130,246,0.25)',
                        transition:'all 0.2s', opacity: loading ? 0.55 : 1,
                      }}
                      onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.boxShadow='0 6px 24px rgba(59,130,246,0.4)'; }}
                      onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(59,130,246,0.25)'}
                    >
                      {loading ? <><Spin /> Running Threat Audit...</> : <><Shield s={14} /> Execute Security Audit</>}
                    </button>
                  </div>
                </>
              )}

              {mode === 'batch' && (
                <>
                  <div style={{ marginBottom:24 }}>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#64748b', fontFamily:'JetBrains Mono,monospace', marginBottom:10 }}>
                      Forwarded Job List (WhatsApp / Telegram / Email)
                    </label>
                    <textarea
                      value={batchText}
                      onChange={e => setBatchText(e.target.value)}
                      placeholder="Paste the entire forwarded message containing multiple job/internship postings — no need to separate them, our AI will split and audit each one individually..."
                      rows={10}
                      style={{
                        width:'100%', background:'rgba(5,14,29,0.6)',
                        border:'1px solid rgba(255,255,255,0.08)', borderRadius:12,
                        color:'#f1f5f9', fontSize:13, lineHeight:1.7, fontWeight:500,
                        padding:'14px 16px', resize:'none', outline:'none',
                        fontFamily:'Plus Jakarta Sans,sans-serif', boxSizing:'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display:'flex', gap:12, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={resetBatch}
                      disabled={batchLoading || !batchText}
                      style={{
                        flex:'0 0 auto', width:140, padding:'11px 16px',
                        background:'transparent', border:'1px solid rgba(255,255,255,0.09)',
                        borderRadius:12, color:'#94a3b8', fontSize:12, fontWeight:700,
                        cursor:'pointer', opacity: batchLoading || !batchText ? 0.35 : 1,
                      }}
                    >
                      Clear Details
                    </button>
                    <button
                      onClick={analyzeBatch}
                      disabled={batchLoading}
                      style={{
                        flex:1, padding:'11px 20px', borderRadius:12, border:'none',
                        background:'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        boxShadow:'0 4px 16px rgba(59,130,246,0.25)', opacity: batchLoading ? 0.55 : 1,
                      }}
                    >
                      {batchLoading ? <><Spin /> Splitting & Auditing All Postings...</> : <><Shield s={14} /> Execute Bulk Audit</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Error (single mode) ──────────────────────────── */}
          {error && (
            <div className="animate-slideUp" style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'16px 20px', borderRadius:16, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)' }}>
              <span style={{ color:'#ef4444', flexShrink:0, marginTop:1 }}><Info s={16} /></span>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>Threat Audit Failed</p>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.6 }}>{error}</p>
              </div>
            </div>
          )}

          {/* ── Error (batch mode) ───────────────────────────── */}
          {batchError && (
            <div className="animate-slideUp" style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'16px 20px', borderRadius:16, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)' }}>
              <span style={{ color:'#ef4444', flexShrink:0, marginTop:1 }}><Info s={16} /></span>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>Bulk Audit Failed</p>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.6 }}>{batchError}</p>
              </div>
            </div>
          )}

          {/* ── Loading (single mode) ────────────────────────── */}
          {loading && (
            <div className="animate-slideUp" style={{ ...card, padding:'56px 36px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:20, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, inset:'0 0 auto' }}>
                <div className="snoop-scanner-bar" />
              </div>
              <div style={{ width:64, height:64, borderRadius:'50%', border:'1px solid rgba(59,130,246,0.2)', background:'rgba(59,130,246,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color:'#3b82f6' }}>
                <Spin />
              </div>
              <div>
                <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:15, color:'#f1f5f9', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>Auditing Threat Vectors</h3>
                <p style={{ fontSize:12, color:'#94a3b8', lineHeight:1.7, maxWidth:360, margin:'0 auto' }}>
                  Deciphering compensation, company digital presence, recruitment patterns, and evaluating scam vulnerabilities…
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'0.1em', background:'rgba(59,130,246,0.1)', padding:'6px 14px', borderRadius:999, border:'1px solid rgba(59,130,246,0.2)' }}>
                <span style={{ width:6, height:6, background:'#3b82f6', borderRadius:'50%', animation:'pulse 1.5s infinite' }} />
                Groq LLaMA3 Engine Active
              </div>
            </div>
          )}

          {/* ── Loading (batch mode) ─────────────────────────── */}
          {batchLoading && (
            <div className="animate-slideUp" style={{ ...card, padding:'56px 36px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', border:'1px solid rgba(59,130,246,0.2)', background:'rgba(59,130,246,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color:'#3b82f6' }}>
                <Spin />
              </div>
              <div>
                <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:15, color:'#f1f5f9', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>Splitting & Auditing Postings</h3>
                <p style={{ fontSize:12, color:'#94a3b8', lineHeight:1.7, maxWidth:360, margin:'0 auto' }}>
                  This may take a minute — each posting is individually scored, domain-verified, and cross-checked against history.
                </p>
              </div>
            </div>
          )}

          {/* ── Idle info ───────────────────────────────────── */}
          {!loading && !batchLoading && !result && !batchResults && (
            <div className="animate-fadeIn" style={{ ...card, padding:'32px 36px' }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:16, color:'#f1f5f9', margin:'0 0 8px' }}>Threat Evaluation Center</h3>
              <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7, margin:'0 0 28px' }}>
                Multi-pillar AI audit that detects structural fraud in recruitment pipelines.
              </p>

              <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#475569', margin:'0 0 16px' }}>Security Scoring Pillars</p>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
                {[
                  { name:'Financial Structure', pts:35, desc:'Stipend guarantees. Audits for mandatory training fee scams.' },
                  { name:'Digital Footprint',   pts:25, desc:'Validates corporate websites, public reviews, and LinkedIn records.' },
                  { name:'Recruitment Integrity', pts:20, desc:'Audits for corporate domain emails and multi-round human vetting.' },
                  { name:'Marketing Claims',    pts:20, desc:'Detects artificial FOMO, placement sales, or certificate sells.' },
                ].map(p => (
                  <div key={p.name} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.015)', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(59,130,246,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
                  >
                    <span style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#3b82f6', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', padding:'3px 8px', borderRadius:6, flexShrink:0, marginTop:1 }}>{p.pts} pts</span>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 3px' }}>{p.name}</p>
                      <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.6 }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderLeft:'3px solid #ef4444', background:'rgba(239,68,68,0.06)', borderRadius:'0 12px 12px 0', padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ color:'#ef4444', flexShrink:0, fontSize:8, marginTop:5, animation:'pulse 1.5s infinite' }}>●</span>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.7 }}>
                  <strong style={{ color:'#ef4444' }}>Active Scam Advisory: </strong>
                  Rapid rise in "remote training programs" recruiting via mass Telegram or WhatsApp channels.
                  Legitimate entities never recruit via public messenger groups, nor charge applicants for training.
                </p>
              </div>
            </div>
          )}

          {/* ── Results (single mode) ────────────────────────── */}
          {!loading && result && (() => {
            const vc = verdictMap[result.verdict] || verdictMap['SUSPICIOUS'];
            return (
              <div className="animate-slideUp" style={{ display:'flex', flexDirection:'column', gap:20 }}>

                {/* Report label row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:13, color:'#f1f5f9' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6', display:'inline-block', animation:'pulse 2s infinite' }} />
                    Security Report Generated
                  </div>
                  <button onClick={reset} style={{ fontSize:12, color:'#3b82f6', fontWeight:700, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                    ← Audit New Opportunity
                  </button>
                </div>

                {/* Verdict card */}
                <div style={{ ...card, padding:'32px 36px', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, right:0, width:280, height:280, background:'rgba(59,130,246,0.04)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }} />
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24, position:'relative', zIndex:1 }}>
                    <ScoreGauge score={result.score} />
                    <div style={{ textAlign:'center' }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:'0.06em', background:vc.bg, border:`1px solid ${vc.border}`, color:vc.color, marginBottom:14 }}>
                        {vc.label}
                      </div>
                      <p style={{ fontSize:14, color:'#f1f5f9', fontWeight:600, lineHeight:1.7, maxWidth:460, margin:'0 auto' }}>{vc.desc}</p>
                      {result.recommendation && (
                        <div style={{ marginTop:20, border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'16px 20px', background:'rgba(5,14,29,0.6)', textAlign:'left' }}>
                          <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 8px' }}>AI Auditor Advisory</p>
                          <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.7 }}>{result.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pillar breakdown */}
                {result.pillar_scores && (
                  <div style={{ ...card, padding:'28px 36px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:22 }}>
                      <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Audit Pillar Breakdown</p>
                      <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:6 }}>Vector Analysis</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      {Object.entries(result.pillar_scores).map(([key, pillar]) => {
                        const pct   = Math.round((pillar.score / pillar.max) * 100);
                        const color = pillarColor(pillar.score, pillar.max);
                        return (
                          <div key={key}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                              <span style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>{pillarLabels[key] || key.replace(/_/g,' ')}</span>
                              <span style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color }}>{pillar.score}/{pillar.max}</span>
                            </div>
                            <div style={{ height:6, borderRadius:999, background:'rgba(255,255,255,0.05)', overflow:'hidden', border:'1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ height:'100%', width:`${pct}%`, borderRadius:999, background:color, boxShadow:`0 0 8px ${color}88`, transition:'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                            </div>
                            {pillar.details && <p style={{ fontSize:11, color:'#64748b', margin:'6px 0 0', lineHeight:1.6, fontStyle:'italic' }}>{pillar.details}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Domain Verification */}
                {result.domain_verification && (
                  <div style={{ ...card, padding:'28px 36px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:22 }}>
                      <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Domain Verification</p>
                      <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:6 }}>WHOIS Lookup</span>
                    </div>
                    {(() => {
                      const dv = result.domain_verification;
                      const verified = dv.checked && dv.ageInDays !== null;
                      const years = verified ? Math.floor(dv.ageInDays / 365) : null;
                      const vColor = !verified ? '#ef4444' : dv.ageInDays < 30 ? '#ef4444' : dv.ageInDays < 180 ? '#f59e0b' : '#10b981';
                      const vBg = !verified ? 'rgba(239,68,68,0.08)' : dv.ageInDays < 30 ? 'rgba(239,68,68,0.08)' : dv.ageInDays < 180 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';
                      const vBorder = !verified ? 'rgba(239,68,68,0.2)' : dv.ageInDays < 30 ? 'rgba(239,68,68,0.2)' : dv.ageInDays < 180 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)';
                      return (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                            <span style={{ fontSize:13, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#f1f5f9' }}>{dv.domain}</span>
                            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:'0.06em', background:vBg, border:`1px solid ${vBorder}`, color:vColor }}>
                              {verified ? `${dv.ageInDays} days old${years > 0 ? ` (~${years} yr)` : ''}` : 'Unverifiable'}
                            </span>
                          </div>
                          <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.7 }}>
                            {verified
                              ? dv.ageInDays < 30
                                ? 'This domain was registered extremely recently — a strong, independent indicator of a freshly created scam operation.'
                                : dv.ageInDays < 180
                                ? 'This domain is relatively new. Not conclusive on its own, but worth factoring in alongside other signals.'
                                : 'This domain has existed for a significant amount of time, consistent with a genuinely established business.'
                              : `We could not confirm this domain genuinely exists via a live WHOIS lookup${dv.error ? ` (${dv.error})` : ''}. Treat this as its own red flag — a legitimate company's domain should be verifiable.`}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Pattern Detection */}
                {result.pattern_detection && result.pattern_detection.priorSubmissionCount > 0 && (
                  <div style={{ ...card, padding:'28px 36px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:22 }}>
                      <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Pattern Detection</p>
                      <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:6 }}>Cross-Submission</span>
                    </div>
                    {(() => {
                      const pd = result.pattern_detection;
                      const flagged = pd.averagePriorScore < 40 || pd.anyPriorCriticalFlag;
                      const pColor = flagged ? '#ef4444' : '#f59e0b';
                      const pBg = flagged ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)';
                      const pBorder = flagged ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)';
                      return (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                            <span style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>
                              Analyzed {pd.priorSubmissionCount} time{pd.priorSubmissionCount !== 1 ? 's' : ''} before
                            </span>
                            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:'0.06em', background:pBg, border:`1px solid ${pBorder}`, color:pColor }}>
                              Avg score: {pd.averagePriorScore}/100
                            </span>
                          </div>
                          <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.7 }}>
                            {flagged
                              ? 'This company domain has a history of low scores across prior submissions — recurring reports of the same domain are a strong signal of a widely-circulated scam.'
                              : 'This domain has been checked before by other users, with generally reasonable scores. Still worth your own independent verification.'}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Flags */}
                {(result.red_flags?.length > 0 || result.green_flags?.length > 0) && (
                  <div style={{ ...card, padding:'28px 36px' }}>
                    <div style={{ paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:22 }}>
                      <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Detected Indicators</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      {result.red_flags?.length > 0 && (
                        <div>
                          <p style={{ fontSize:11, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 10px' }}>Red Flags</p>
                          <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                            {result.red_flags.map((flag, i) => (
                              <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:12, color:'#94a3b8', lineHeight:1.6 }}>
                                <span style={{ color:'#ef4444', flexShrink:0, marginTop:5, fontSize:7 }}>●</span>
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.green_flags?.length > 0 && (
                        <div>
                          <p style={{ fontSize:11, fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 10px' }}>Green Flags</p>
                          <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                            {result.green_flags.map((flag, i) => (
                              <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:12, color:'#94a3b8', lineHeight:1.6 }}>
                                <span style={{ color:'#10b981', flexShrink:0, marginTop:5, fontSize:7 }}>●</span>
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Guidelines */}
                <div style={{ ...card, padding:'28px 36px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:22 }}>
                    <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Verification Guidelines</p>
                    <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', padding:'2px 8px', borderRadius:6 }}>Self Audit</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      { t:'Verify Corporate Identity', d:'Search the registered business name in official government business records.' },
                      { t:'Cross-check Recruiters',    d:"Verify your recruiter's profile on LinkedIn to confirm genuine employment." },
                      { t:'Zero Payments Rule',        d:'Never pay for training, laptops, or access. Genuine employers pay you.' },
                    ].map(item => (
                      <div key={item.t} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'14px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.015)' }}>
                        <span style={{ padding:'4px 5px', borderRadius:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#3b82f6', flexShrink:0, marginTop:1 }}><Info s={12} /></span>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 3px' }}>{item.t}</p>
                          <p style={{ fontSize:12, color:'#94a3b8', margin:0, lineHeight:1.6 }}>{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => window.print()} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', marginTop:20, padding:'11px 16px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#94a3b8', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#f1f5f9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; }}>
                    <Print /> Print Security Advisory Report
                  </button>
                </div>

              </div>
            );
          })()}

          {/* ── Results (batch mode) ──────────────────────────── */}
          {!batchLoading && batchResults && (
            <div className="animate-slideUp" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:13, color:'#f1f5f9' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6', display:'inline-block' }} />
                  {batchResults.postings_analyzed} Posting{batchResults.postings_analyzed !== 1 ? 's' : ''} Audited
                </div>
                <button onClick={resetBatch} style={{ fontSize:12, color:'#3b82f6', fontWeight:700, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                  ← Audit New List
                </button>
              </div>

              {batchResults.results.map((item, i) => (
                <div key={i} style={{ ...card, padding:'24px 28px' }}>
                  <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 14px' }}>
                    Posting {i + 1}
                  </p>
                  {item.success ? (
                    <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                      <ScoreGauge score={item.data.score} />
                      <div style={{ flex:1, minWidth:200 }}>
                        <p style={{ fontSize:13, color:'#f1f5f9', fontWeight:600, margin:'0 0 8px', lineHeight:1.6 }}>
                          {item.original_text.slice(0, 140)}{item.original_text.length > 140 ? '...' : ''}
                        </p>
                        {item.data.red_flags?.length > 0 && (
                          <p style={{ fontSize:11, color:'#ef4444', margin:0, lineHeight:1.6 }}>
                            ⚠ {item.data.red_flags[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize:12, color:'#ef4444', margin:0 }}>Failed to analyze this posting: {item.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>{/* /content column */}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ position:'relative', zIndex:10, width:'100%', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(5,14,29,0.85)', padding:'18px 24px' }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#475569', fontWeight:500 }}>
            <Shield s={13} />
            <span>© {new Date().getFullYear()} ShieldIntern Security. All rights reserved.</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#475569' }}>
            <span>SECURE AUDIT PIPELINE</span>
            <span style={{ color:'rgba(255,255,255,0.12)' }}>|</span>
            <span style={{ color:'#3b82f6' }}>API SYSTEM OK</span>
          </div>
        </div>
      </footer>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}