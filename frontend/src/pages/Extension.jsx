import { Link } from 'react-router-dom';
import { Shield } from '../shared';

const STEPS = [
  'Open Chrome and go to chrome://extensions',
  'Turn on Developer Mode (top-right toggle)',
  'Click “Load unpacked”',
  'Select the project’s extension folder',
];

export default function Extension() {
  return (
    <section className="section" style={{ paddingTop: 28, maxWidth: 720, margin: '0 auto' }}>
      <div className="glass" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              color: '#D85C32',
              background: 'rgba(216,92,50,0.12)',
              border: '1px solid rgba(216,92,50,0.28)',
            }}
          >
            <Shield s={18} />
          </span>
          <div>
            <p className="kicker" style={{ margin: 0 }}>Browser extension</p>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}>
              ShieldIntern — Job Scam Detector
            </h2>
          </div>
        </div>

        <p style={{ margin: '0 0 20px', color: 'var(--muted)', lineHeight: 1.7, fontSize: 15 }}>
          Highlight recruiter text on any page, then right-click{' '}
          <strong style={{ color: '#fff', fontWeight: 600 }}>Analyze with ShieldIntern</strong> to send that
          selection into the same legitimacy audit used on this site.
        </p>

        <div
          className="ext-scene"
          style={{ marginBottom: 22, position: 'relative', minHeight: 200, padding: 18, borderRadius: 16, background: '#0A111C', border: '1px solid var(--border)' }}
        >
          <div style={{ maxWidth: '70%', padding: 12, borderRadius: 10, border: '1px dashed rgba(132,145,163,0.35)', color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
            Selected: <mark style={{ background: 'rgba(216,92,50,0.18)', color: '#171717' }}>Pay ₹999 to confirm your internship seat.</mark>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 20,
              top: 48,
              width: 230,
              padding: 6,
              borderRadius: 10,
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
            }}
          >
            {['Copy', 'Search Google for…'].map((l) => (
              <div key={l} style={{ padding: '9px 10px', fontSize: 12, color: '#e5e7eb' }}>{l}</div>
            ))}
            <div style={{ padding: '9px 10px', fontSize: 12, borderRadius: 7, background: 'rgba(216,92,50,0.14)', color: '#D85C32', fontWeight: 600 }}>
              Analyze with ShieldIntern
            </div>
            <div style={{ padding: '9px 10px', fontSize: 12, color: '#e5e7eb' }}>Inspect</div>
          </div>
        </div>

        <p className="kicker" style={{ marginBottom: 12 }}>Install (unpacked)</p>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((step) => (
            <li key={step} style={{ color: 'var(--muted-light)', fontSize: 14, lineHeight: 1.55 }}>
              {step.startsWith('Open Chrome') ? (
                <>
                  Open Chrome and go to{' '}
                  <code style={{ color: '#D85C32', fontFamily: 'var(--mono)' }}>chrome://extensions</code>
                </>
              ) : (
                step
              )}
            </li>
          ))}
        </ol>

        <div
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.35)',
            color: 'var(--muted)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          After loading, pin the extension from the Chrome toolbar. Select text on a career site or chat page,
          open the context menu, and run an analysis without leaving the tab.
        </div>

        <div style={{ marginTop: 20 }}>
          <Link className="btn btn-solid" to="/check">Try the web scanner</Link>
        </div>
      </div>
    </section>
  );
}
