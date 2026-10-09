import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Shield } from './shared';

const CENTER_NAV = [
  { to: '/#signals', label: 'Product', hash: 'signals' },
  { to: '/#how-it-works', label: 'How It Works', hash: 'how-it-works' },
  { to: '/#security', label: 'Security', hash: 'security' },
  { to: '/check', label: 'Scanner' },
];

const FEATURE_NAV = [
  { to: '/compare', label: 'Compare' },
  { to: '/bulk', label: 'Bulk' },
  { to: '/history', label: 'History' },
  { to: '/extension', label: 'Extension' },
  { to: '/safety-guide', label: 'Guide' },
];

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    }
  }, [location]);

  return (
    <div className="page">
      <div className="bg-stage" aria-hidden="true">
        <div className="bg-media" />
        <div className="bg-scrim" />
      </div>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="header-bar layout-header-bar">
          <Link className="brand" to="/">
            <span className="brand-mark"><Shield s={16} /></span>
            <span>
              <span className="brand-name">ShieldIntern</span>
              <span className="brand-sub">Internship Fraud Detection System</span>
            </span>
          </Link>

          <nav className="nav-pills layout-nav desktop-nav" aria-label="Primary">
            {CENTER_NAV.map((item) => (
              item.hash ? (
                <Link key={item.to} to={item.to} className="pill soft">
                  {item.label}
                </Link>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `pill soft${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              )
            ))}
            {FEATURE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `pill soft${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions layout-status">
            <Link className="btn btn-solid btn-nav" to="/check">Check an Offer</Link>
            <button
              type="button"
              className="menu-btn"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-drawer" aria-label="Mobile">
            {[...CENTER_NAV, ...FEATURE_NAV].map((item) => (
              <Link key={item.to} to={item.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link to="/check" className="btn btn-solid" onClick={() => setMenuOpen(false)}>
              Check an Offer
            </Link>
          </nav>
        )}
      </header>

      <main className="layout-main">
        <div className="wrap">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield s={13} />
            <span>© {new Date().getFullYear()} ShieldIntern Security. All rights reserved.</span>
          </div>
          <nav aria-label="Footer">
            <Link to="/check">Scanner</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/bulk">Bulk</Link>
            <Link to="/history">History</Link>
            <Link to="/extension">Extension</Link>
            <Link to="/safety-guide">Safety guide</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
