import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './CADSidebar.css';

export default function CADSidebar() {
  const location = useLocation();

  const rails = [
    { path: '/driver', label: 'Active Run Console', icon: 'mdi:car-emergency' },
    { path: '/driver', label: 'Vehicle Diagnostics', icon: 'mdi:wrench-outline' },
    { path: '/report', label: 'Incoming Distress', icon: 'mdi:signal-cellular-3' },
    { path: '/admin', label: 'CAD Command Center', icon: 'mdi:shield-account' },
    { path: '/resources', label: 'Node Integrity', icon: 'mdi:cube-outline' }
  ];

  return (
    <aside className="cad-sidebar">
      <div>
        <div className="cad-sidebar-header">
          MDT NAVIGATION RAILS
        </div>
        <nav className="cad-sidebar-nav">
          {rails.map((item, idx) => {
            const isActive =
              (idx === 0 && (location.pathname === '/driver' || location.pathname === '/ambulance-driver')) ||
              (idx === 3 && location.pathname === '/admin');

            return (
              <Link
                key={idx}
                to={item.path}
                className={`cad-rail-btn ${isActive ? 'active' : ''}`}
              >
                <Icon icon={item.icon} className="cad-rail-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="cad-sidebar-bottom">
        <div className="cad-telemetry-tag">
          <Icon icon="mdi:radio-tower" width="12" height="12" />
          TELEMETRY STREAM: 5G CAD OK
        </div>
        <div className="cad-coords-text">
          [&bull;] Lat: 34.0522&deg; Lon: -118.2437&deg;
        </div>
      </div>
    </aside>
  );
}
