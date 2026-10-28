import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Crown,
  LayoutDashboard,
  Radio,
  Sliders,
  Users,
  Ambulance,
  Hospital,
  Activity,
  Server,
  FileText,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSector, setSelectedSector] = useState('Kovilpatti Sector-4');
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastOpen(false);
      setBroadcastMessage('');
    }, 2000);
  };

  // Specialized SaaS navigation sections
  const navGroups = [
    {
      group: 'OPERATIONS & CAD',
      items: [
        { path: '/admin/overview', label: 'Command Overview', icon: LayoutDashboard },
        { path: '/admin/dispatches', label: 'Active Dispatches', icon: Radio, badge: '12 Live' },
        { path: '/admin/matcher', label: 'Automated Matcher', icon: Sliders }
      ]
    },
    {
      group: 'FLEET & DIRECTORY',
      items: [
        { path: '/admin/fleet', label: 'Unit Registry & Rosters', icon: Ambulance },
        { path: '/admin/hospitals', label: 'Hospital ICU Tracking', icon: Hospital, badge: '28 Beds' },
        { path: '/admin/users', label: 'Personnel & Responders', icon: Users }
      ]
    },
    {
      group: 'TELEMATICS & INFRA',
      items: [
        { path: '/admin/telematics', label: 'Node Integrity & Mesh', icon: Server },
        { path: '/admin/audit', label: 'CAD Audit Logs', icon: FileText }
      ]
    },
    {
      group: 'GOVERNANCE & SYSTEM',
      items: [
        { path: '/admin/config', label: 'System Rules & SLA', icon: Settings }
      ]
    }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* --------------------------------------------------------------------
          COLLAPSIBLE SELLER/OPS ADMIN SIDEBAR
          -------------------------------------------------------------------- */}
      <aside
        className={`flex flex-col border-r border-slate-800 bg-slate-900/95 transition-all duration-300 z-30 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link to="/admin/overview" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black shadow-md shadow-amber-900/40">
              <Crown className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <span className="text-sm font-black tracking-tight text-white block">ResQNet CAD</span>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  Coordinator Ops
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.group}
                </div>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/overview' && location.pathname === '/admin');

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Card */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-2 border border-slate-800/80">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold text-xs">
              {user?.name?.[0] || 'A'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-amber-400 font-mono font-semibold truncate">
                  ROLE: {user?.role || 'ADMIN'}
                </div>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 transition"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* --------------------------------------------------------------------
          ADMIN TOP BAR & HEADER
          Requirements:
          - Admin profile
          - Active sector selector
          - Notification center
          - Secure logout
          -------------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur-md z-20">
          {/* Left: Active Sector Dropdown */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsSectorOpen(!isSectorOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sector: <strong>{selectedSector}</strong></span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isSectorOpen && (
                <div className="absolute top-11 left-0 z-50 w-56 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-md">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch CAD Sectors
                  </div>
                  {[
                    'Kovilpatti Sector-4',
                    'Thoothukudi Central Metro',
                    'Tirunelveli South Corridor',
                    'Sankarankovil North Hub'
                  ].map(sec => (
                    <button
                      key={sec}
                      onClick={() => {
                        setSelectedSector(sec);
                        setIsSectorOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span>{sec}</span>
                      {selectedSector === sec && <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden md:inline font-mono text-xs text-slate-400">
              CAD Node: <strong>KOV-S4-PRIMARY</strong> (Mesh SLA 99.98%)
            </span>
          </div>

          {/* Right: Broadcast Alert CTA, Notifications, Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* Civil Defense Broadcast Button */}
            <button
              onClick={() => setBroadcastOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-amber-900/30 transition active:scale-95"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">EMERGENCY BROADCAST</span>
            </button>

            {/* Notification Bell */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition"
              title="CAD Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 font-mono text-[9px] font-black text-white">
                3
              </span>
            </button>

            {/* Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1.5">
              <span className="text-xs font-bold text-slate-200">{user?.name || 'Administrator'}</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-300">
                {user?.role}
              </span>
            </div>

            {/* Logout CTA */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 transition"
              title="Logout from admin session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Admin Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>

      {/* Emergency Broadcast Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Megaphone className="h-6 w-6 animate-pulse" />
              <h3 className="text-lg font-black text-white">Issue Emergency Civil Defense Broadcast</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              This alert will be instantly pushed to all citizen mobile terminals, active ambulance MDTs, and hospital emergency triage bays in <strong>{selectedSector}</strong>.
            </p>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Alert Message Content
                </label>
                <textarea
                  required
                  rows={3}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Severe Flash Flood Alert: Road bridge 4 submerged. Follow diversion corridor via Main Bypass."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastSent}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-black text-slate-950 shadow-lg shadow-amber-900/40"
                >
                  {broadcastSent ? '✓ Broadcast Dispatched!' : 'Transmit Regional Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
