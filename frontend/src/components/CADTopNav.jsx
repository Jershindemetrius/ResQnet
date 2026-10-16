import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './CADTopNav.css';

export default function CADTopNav() {
  const location = useLocation();

  const navItems = [
    { path: '/report', label: 'Client Emergency Portal' },
    { path: '/driver', label: 'Driver Dispatch Hub' },
    { path: '/admin', label: 'Coordinator Admin Center' },
    { path: '/resources', label: 'Fleet Telematics' },
    { path: '/settings', label: 'System Hub' }
  ];

  const [sirenActive, setSirenActive] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleTriggerSiren = () => {
    const nextState = !sirenActive;
    setSirenActive(nextState);
    const msg = nextState
      ? '🚨 SIREN CODE 3 ACTIVATED - Emergency Beacon Broadcasting on All Regional Channels'
      : '🔕 Siren Code 3 Standdown - Returning to Standard Telemetry';
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <header className="cad-top-nav">
      {toastMessage && (
        <div className="dash-floating-toast" style={{ bottom: 'auto', top: '70px', right: '20px' }}>
          <Icon icon="mdi:alarm-light" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Brand & Unit Callsign Area */}
      <div className="cad-brand-area">
        <Link to="/" className="cad-logo-wrap">
          <div className="cad-logo-icon">
            <Icon icon="mdi:hospital-box" width="20" height="20" />
          </div>
          <div className="cad-brand-text">
            <span className="cad-brand-title">
              ResQNet <span className="cad-brand-dot"></span>
            </span>
            <span className="cad-brand-sub">TELEMETRY NETWORK</span>
          </div>
        </Link>

        <div className="cad-unit-status-chip">
          <span className="cad-unit-id">ALS-101 &bull; Unit Alpha</span>
          <span className="cad-unit-mode">
            <span className="cad-green-pulse"></span>
            ONLINE &amp; PATROLLING
          </span>
        </div>
      </div>

      {/* Main CAD Navigation Hub Buttons */}
      <nav className="cad-nav-links" aria-label="CAD Navigation Rails">
        {navItems.map(item => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/report' && location.pathname === '/book-ambulance') ||
            (item.path === '/driver' && location.pathname === '/ambulance-driver');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`cad-nav-btn ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons & Responder Profile */}
      <div className="cad-actions-area">
        <button className="cad-siren-btn" onClick={handleTriggerSiren} title="Trigger Siren Code 3">
          <Icon icon="mdi:alarm-light" width="16" height="16" />
          SIREN CODE 3
        </button>

        <a href="tel:108" className="cad-hotline-btn" title="Direct Hotline Phone Call">
          <Icon icon="mdi:phone-in-talk" width="15" height="15" />
          HOTLINE: 911/CAD
        </a>

        <div className="cad-profile-badge">
          <div className="cad-profile-info">
            <span className="cad-profile-name">Paramedic Vance</span>
            <span className="cad-profile-role">LEAD RESPONDER</span>
          </div>
          <div className="cad-profile-avatar">
            <Icon icon="mdi:account" width="18" height="18" />
          </div>
        </div>
      </div>
    </header>
  );
}
