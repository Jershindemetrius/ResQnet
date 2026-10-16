import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/report', label: 'Report Emergency' },
    { path: '/dispatch', label: 'Dispatch Center' },
    { path: '/resources', label: 'Resources' },
    { path: '/volunteers', label: 'Volunteers' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand">🚨 ResQNet</span>
        <span className="tagline">Emergency Response Network</span>
      </div>
      <nav className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
