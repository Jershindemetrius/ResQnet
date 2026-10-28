import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navSections = [
    {
      title: 'DISPATCH & OPERATIONS',
      items: [
        { path: '/', label: 'Command Dashboard', icon: 'mdi:view-dashboard' },
        { path: '/report', label: 'Book Ambulance / SOS', icon: 'mdi:phone-alert', badge: 'SOS', badgeType: 'sos' },
        { path: '/driver', label: 'Ambulance Driver MDT', icon: 'mdi:ambulance', badge: 'PILOT', badgeType: 'pilot' },
        { path: '/emergencies', label: 'Emergency Requests', icon: 'mdi:alert-circle', badge: '12', badgeType: 'count' },
        { path: '/matcher', label: 'Automated Matcher', icon: 'mdi:auto-fix' },
      ]
    },
    {
      title: 'FLEET & DIRECTORIES',
      items: [
        { path: '/resources', label: 'Resources Directory', icon: 'mdi:package-variant' },
        { path: '/volunteers', label: 'Volunteers Directory', icon: 'mdi:account-group' },
      ]
    },
    {
      title: 'COMMAND & CONTROL',
      items: [
        { path: '/analytics', label: 'Analytics & Reports', icon: 'mdi:chart-line' },
        { path: '/admin', label: 'Admin Command', icon: 'mdi:shield-crown', badge: 'ROOT', badgeType: 'root' },
        { path: '/settings', label: 'System Settings', icon: 'mdi:cog' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header-bar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <Icon icon={mobileOpen ? 'mdi:close' : 'mdi:menu'} width="26" height="26" />
        </button>
        <div className="mobile-header-brand">
          <Icon icon="mdi:lifebuoy" width="26" height="26" className="brand-pulse-icon" />
          <span>ResQNet</span>
        </div>
        <div className="mobile-header-status">
          <span className="live-pulse-dot"></span>
          <span>5G CAD</span>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <div className="logo-beacon-ring"></div>
            <Icon icon="mdi:lifebuoy" width="38" height="38" className="logo-svg" />
          </div>
          <div className="sidebar-brand">
            <div className="sidebar-title-row">
              <h1 className="sidebar-title">ResQNet</h1>
              <span className="sidebar-node-pill">v2.4</span>
            </div>
            <p className="sidebar-subtitle">
              CAD EMERGENCY NETWORK
              <span className="sector-tag">KOVILPATTI &bull; SEC-4</span>
            </p>
          </div>
        </div>

        {/* Live Network Telemetry Strip */}
        <div className="sidebar-telemetry-strip">
          <div className="telemetry-item">
            <span className="telemetry-dot live"></span>
            <span>Mesh: <strong>ONLINE</strong></span>
          </div>
          <span className="telemetry-latency">24ms &bull; 5G</span>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map(item => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/report' && location.pathname === '/book-ambulance') ||
                  (item.path === '/driver' && location.pathname === '/ambulance-driver') ||
                  (item.path === '/emergencies' && location.pathname === '/dispatch') ||
                  (item.path === '/analytics' && location.pathname === '/admin' && location.search.includes('overview'));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="sidebar-icon-wrap">
                      <Icon icon={item.icon} className="sidebar-icon" width="20" height="20" />
                    </div>
                    <span className="sidebar-label">{item.label}</span>
                    {item.badge && (
                      <span className={`sidebar-badge badge-${item.badgeType || 'default'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/admin"
            className="user-profile-card"
            title="Open Administrator Console"
            onClick={() => setMobileOpen(false)}
          >
            <div className="user-avatar-wrap">
              <div className="user-avatar">
                <Icon icon="mdi:shield-account" width="22" height="22" />
              </div>
              <span className="status-ping-dot"></span>
            </div>
            <div className="user-info">
              <div className="user-name">Admin (Super Root)</div>
              <div className="user-status-text">
                <span className="status-dot"></span>
                Coordinator Console Ready
              </div>
            </div>
            <Icon icon="mdi:chevron-right" width="18" height="18" className="profile-arrow" />
          </Link>
        </div>
      </aside>
    </>
  );
}
