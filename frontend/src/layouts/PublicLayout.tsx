import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LifeBuoy,
  PhoneCall,
  Lock,
  Menu,
  X,
  ShieldAlert,
  Ambulance,
  Users,
  Package,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const publicNavLinks = [
    { path: '/', label: 'Citizen Overview', icon: Layers },
    { path: '/report', label: 'Book Ambulance / SOS', icon: Ambulance, highlight: true },
    { path: '/emergencies', label: 'Public Incident Feed', icon: ShieldAlert },
    { path: '/resources', label: 'Relief Resources', icon: Package },
    { path: '/volunteers', label: 'Community Volunteers', icon: Users }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 select-none">
      {/* --------------------------------------------------------------------
          MINIMALIST PUBLIC TOP BAR
          Strict Requirement: Logo, "Call Emergency (112)", and subtle "Staff / Portal Login" link.
          Clean, modern white theme with crisp border and high-contrast typography.
          -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur-md shadow-sm">
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-md shadow-rose-200 group-hover:scale-105 transition">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">ResQNet</span>
              <span className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-600">
                PUBLIC
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Kovilpatti Sector CAD
            </p>
          </div>
        </Link>

        {/* Center: Clean Citizen Nav items on desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {publicNavLinks.map(link => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                    : link.highlight
                    ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Emergency Hotline 112 & Subtle Staff Login Link */}
        <div className="flex items-center gap-3">
          {/* Emergency 112 CTA */}
          <a
            href="tel:112"
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-black tracking-wide text-white shadow-lg shadow-rose-200 transition active:scale-95"
            title="Call National Emergency Number"
          >
            <PhoneCall className="h-4 w-4 animate-bounce" />
            <span className="hidden sm:inline">CALL EMERGENCY</span>
            <span>(112)</span>
          </a>

          {/* Subtle Staff / Portal Login link */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'DRIVER' ? '/driver/console' : '/admin/overview'}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-900 transition"
              >
                <Lock className="h-3.5 w-3.5 text-cyan-600" />
                <span>Portal ({user.role})</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-slate-500 hover:text-rose-600 transition"
                title="Log out from session"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Authorized Personnel Sign-In"
            >
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Staff / Portal Login</span>
              <span className="sm:hidden">Staff</span>
            </Link>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 px-4 py-3 shadow-lg">
          <div className="flex flex-col gap-1.5">
            {publicNavLinks.map(link => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Public Content Outlet */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Minimalist Public Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ResQNet Public Emergency Portal • Kovilpatti Sector-4</p>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <Link to="/report" className="hover:text-rose-600 transition">Immediate SOS</Link>
            <span>&bull;</span>
            <a href="tel:112" className="hover:text-rose-600 transition">Dial 112</a>
            <span>&bull;</span>
            <Link to="/login" className="hover:text-cyan-700 transition">Authorized Staff Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
