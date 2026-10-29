import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LifeBuoy,
  PhoneCall,
  Menu,
  X,
  Ambulance,
  Users,
  Package,
  Layers,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [logoutError, setLogoutError] = React.useState('');
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const publicNavLinks = [
    { path: '/', label: 'Citizen Overview', icon: Layers },
    { path: '/book-ambulance', label: 'Request Ambulance', icon: Ambulance, highlight: true },
    { path: '/resources', label: 'Relief Resources', icon: Package },
    { path: '/volunteers', label: 'Community Volunteers', icon: Users },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin operations', icon: Activity }] : [])
  ];

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
    } catch (requestError) {
      setLogoutError(requestError instanceof Error ? requestError.message : 'Unable to end the session.');
    }
  };

  return (
    <div className="public-shell">
      {/* --------------------------------------------------------------------
          MINIMALIST PUBLIC TOP BAR
          Public navigation uses emergency and inventory data served by the backend.
          -------------------------------------------------------------------- */}
      <header className="public-header">
        {/* Left: Brand Identity */}
        <Link to="/" className="public-brand">
          <div className="public-brand-icon">
            <LifeBuoy />
          </div>
          <div>
            <div className="public-brand-title">
              <span className="public-brand-name">ResQNet</span>
              <span className="public-brand-badge">
                PUBLIC
              </span>
            </div>
            <p className="public-brand-tagline">
              Kovilpatti Sector CAD
            </p>
          </div>
        </Link>

        {/* Center: Clean Citizen Nav items on desktop */}
        <nav className="public-nav">
          {publicNavLinks.map(link => {
            const isActive = link.path === '/'
              ? location.pathname === link.path
              : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`public-nav-link ${
                  isActive
                    ? 'active'
                    : link.highlight
                    ? 'highlight'
                    : ''
                }`}
              >
                <Icon />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Emergency Hotline 112 & account actions */}
        <div className="public-header-actions">
          {/* Emergency 112 CTA */}
          <a
            href="tel:112"
            className="public-emergency-link"
            title="Call National Emergency Number"
          >
            <PhoneCall className="public-emergency-icon" />
            <span className="public-emergency-label">CALL EMERGENCY</span>
            <span>(112)</span>
          </a>

          {/* Subtle Staff / Portal Login link */}
          {isAuthenticated && user ? (
            <div className="public-auth-actions">
              <span className="public-account-name">{user.name}</span>
              <button
                onClick={handleLogout}
                className="public-logout-button"
                title="Log out from session"
              >
                Logout
              </button>
              {logoutError && <span role="alert">{logoutError}</span>}
            </div>
          ) : (
            <Link
              to="/login"
              className="public-login-link"
              title="Sign in or create an account"
            >
              <span className="public-login-label">Sign in</span>
            </Link>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="public-menu-button"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="public-mobile-menu">
          <div className="public-mobile-links">
            {publicNavLinks.map(link => {
              const isActive = link.path === '/'
                ? location.pathname === link.path
                : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`public-mobile-link ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Public Content Outlet */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* Minimalist Public Footer */}
      <footer className="public-footer">
        <div className="public-footer-inner">
          <p>© 2026 ResQNet Public Emergency Portal • Kovilpatti Sector-4</p>
          <div className="public-footer-links">
            <Link to="/book-ambulance">Request ambulance</Link>
            <span>&bull;</span>
            <a href="tel:112">Dial 112</a>
            <span>&bull;</span>
            {isAdmin && <><Link to="/admin">Admin operations</Link><span>&bull;</span></>}
            <Link to="/login">Account sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
