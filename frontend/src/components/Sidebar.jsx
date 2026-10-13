import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'mdi:view-dashboard' },
    { path: '/emergencies', label: 'Emergency Requests', icon: 'mdi:alert-circle', badge: 12 },
    { path: '/resources', label: 'Resources Directory', icon: 'mdi:package-variant' },
    { path: '/volunteers', label: 'Volunteers Directory', icon: 'mdi:account-group' },
    { path: '/matcher', label: 'Automated Matcher', icon: 'mdi:auto-fix' },
    { path: '/analytics', label: 'Analytics & Reports', icon: 'mdi:chart-line' },
    { path: '/admin', label: 'Admin Command', icon: 'mdi:shield-crown', badge: 'ROOT' },
    { path: '/settings', label: 'System Settings', icon: 'mdi:cog' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Icon icon="mdi:lifebuoy" width="48" height="48" style={{ color: '#e74c3c' }} />
        </div>
        <div className="sidebar-brand">
          <h1 className="sidebar-title">ResQNet</h1>
          <p className="sidebar-subtitle">EMERGENCY RESOURCE<br/>MANAGEMENT</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <Icon icon={item.icon} className="sidebar-icon" width="20" height="20" />
            <span className="sidebar-label">{item.label}</span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/admin" className="user-profile" style={{ textDecoration: 'none', color: 'inherit' }} title="Open Administrator Console">
          <div className="user-avatar" style={{ background: '#e74c3c', color: 'white' }}>
            <Icon icon="mdi:shield-account" width="22" height="22" />
          </div>
          <div className="user-info">
            <div className="user-name">Admin (Super Root)</div>
            <div className="user-status">
              <span className="status-dot"></span>
              Console Ready
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
