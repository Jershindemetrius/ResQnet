import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/emergencies', label: 'Emergency Requests', icon: '🚨', badge: 12 },
    { path: '/resources', label: 'Resources Directory', icon: '📦' },
    { path: '/volunteers', label: 'Volunteers Directory', icon: '👷' },
    { path: '/matcher', label: 'Automated Matcher', icon: '🎯' },
    { path: '/analytics', label: 'Analytics & Reports', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="ResQNet Logo" className="sidebar-logo" onError={(e) => e.target.style.display = 'none'} />
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
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <div className="user-name">Arun (Coordinator)</div>
            <div className="user-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
