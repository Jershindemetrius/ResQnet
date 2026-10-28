import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Ambulance,
  Crosshair,
  Navigation,
  Gauge,
  LogOut,
  Radio,
  ChevronDown,
  Clock,
  Wifi,
  Maximize2,
  Minimize2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type DriverStatus =
  | 'AVAILABLE_PATROLLING'
  | 'DISPATCHED_EN_ROUTE'
  | 'ON_SCENE'
  | 'IN_TRANSIT'
  | 'PATIENT_HANDOFF'
  | 'OUT_OF_SERVICE';

export const DriverLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [driverStatus, setDriverStatus] = useState<DriverStatus>('AVAILABLE_PATROLLING');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusConfig = {
    AVAILABLE_PATROLLING: {
      label: 'Available • Patrolling',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500 animate-pulse'
    },
    DISPATCHED_EN_ROUTE: {
      label: 'Dispatched • En Route (Code 3)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500 animate-ping'
    },
    ON_SCENE: {
      label: 'On Scene • Patient Contact',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500'
    },
    IN_TRANSIT: {
      label: 'In Transit • Destination GH',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      dot: 'bg-cyan-500 animate-pulse'
    },
    PATIENT_HANDOFF: {
      label: 'Hospital Patient Handoff',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      dot: 'bg-indigo-500'
    },
    OUT_OF_SERVICE: {
      label: 'Out of Service / Refuel',
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      dot: 'bg-slate-500'
    }
  }[driverStatus];

  const driverTabs = [
    { path: '/driver/console', label: 'Active Run Console', icon: Crosshair },
    { path: '/driver/navigation', label: 'Turn-by-Turn Navigation', icon: Navigation },
    { path: '/driver/telemetry', label: 'Vehicle Telematics & O₂', icon: Gauge }
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* --------------------------------------------------------------------
          DRIVER MDT TOP STATUS STRIP (Height: 56px)
          Requirements:
          - Unit Call Sign (ALS-101)
          - Driver Status toggle (Available / Dispatched / Busy)
          - Simple network ping
          - Secure Logout button
          -------------------------------------------------------------------- */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-md z-30">
        {/* Left: Unit Call Sign & MDT Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/40">
            <Ambulance className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-white">MDT DISPATCH HUB</span>
            <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
              {user?.assignedUnit || 'ALS-101'}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              &bull; {user?.name || 'Officer Raman'}
            </span>
          </div>

          {/* Driver Status Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
              <span className="hidden md:inline">{statusConfig.label}</span>
              <span className="md:hidden">{statusConfig.label.split('•')[0]}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute top-10 left-0 z-50 w-64 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Update MDT Status
                </div>
                {[
                  { id: 'AVAILABLE_PATROLLING', label: 'Available • Patrolling', desc: 'Ready for Priority-1 dispatch' },
                  { id: 'DISPATCHED_EN_ROUTE', label: 'Dispatched • En Route (Code 3)', desc: 'Siren active, signals preempted' },
                  { id: 'ON_SCENE', label: 'On Scene • Patient Contact', desc: 'Paramedics evaluating vitals' },
                  { id: 'IN_TRANSIT', label: 'In Transit • Destination GH', desc: 'Patient telemetry broadcasting' },
                  { id: 'PATIENT_HANDOFF', label: 'Hospital Patient Handoff', desc: 'Emergency bay transfer' },
                  { id: 'OUT_OF_SERVICE', label: 'Out of Service / Refuel', desc: 'Standby offline' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDriverStatus(item.id as DriverStatus);
                      setIsStatusMenuOpen(false);
                    }}
                    className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left transition hover:bg-slate-800"
                  >
                    <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Dedicated Task Tabs for Driver */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
          {driverTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Network Ping, Live Clock, Fullscreen & Secure Logout */}
        <div className="flex items-center gap-2.5">
          {/* 5G Network ping status */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 font-mono text-[11px] text-slate-300">
            <Wifi className="h-3 w-3 text-emerald-400" />
            <span>5G Mesh: 16ms &bull; GPS</span>
          </div>

          {/* Military CAD Synchronized Clock */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 font-mono text-xs font-bold text-slate-200">
            <Clock className="h-3 w-3 text-rose-500" />
            <span>{currentTime || '10:55:00'}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen MDT'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Secure Driver Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-1 text-xs font-bold text-rose-400 hover:bg-rose-900/50 hover:text-rose-200 transition"
            title="Log out and release MDT terminal"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar for Driver */}
      <div className="md:hidden flex items-center justify-around border-b border-slate-800 bg-slate-900/90 py-1.5 px-2">
        {driverTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                  isActive
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-3 w-3" />
              <span>{tab.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Main MDT Content Outlet (Full-Width, 0 Margins, Distraction-Free) */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverLayout;
