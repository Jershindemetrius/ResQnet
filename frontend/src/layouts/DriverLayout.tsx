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
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500 animate-pulse'
    },
    DISPATCHED_EN_ROUTE: {
      label: 'Dispatched • En Route (Code 3)',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      dot: 'bg-rose-500 animate-ping'
    },
    ON_SCENE: {
      label: 'On Scene • Patient Contact',
      color: 'text-amber-800',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    },
    IN_TRANSIT: {
      label: 'In Transit • Destination GH',
      color: 'text-cyan-800',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      dot: 'bg-cyan-500 animate-pulse'
    },
    PATIENT_HANDOFF: {
      label: 'Hospital Patient Handoff',
      color: 'text-indigo-800',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500'
    },
    OUT_OF_SERVICE: {
      label: 'Out of Service / Refuel',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      dot: 'bg-slate-400'
    }
  }[driverStatus];

  const driverTabs = [
    { path: '/driver/console', label: 'Active Run Console', icon: Crosshair },
    { path: '/driver/navigation', label: 'Turn-by-Turn Navigation', icon: Navigation },
    { path: '/driver/telemetry', label: 'Vehicle Telematics & O₂', icon: Gauge }
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-800 select-none">
      {/* --------------------------------------------------------------------
          DRIVER MDT TOP STATUS STRIP (Height: 56px) - CLEAN WHITE THEME
          -------------------------------------------------------------------- */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md z-30 shadow-xs">
        {/* Left: Unit Call Sign & MDT Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-md shadow-rose-200">
            <Ambulance className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-slate-900">MDT DISPATCH HUB</span>
            <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-xs font-bold text-cyan-800">
              {user?.assignedUnit || 'ALS-101'}
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
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
              <div className="absolute top-10 left-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95">
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
                    className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left transition hover:bg-slate-100"
                  >
                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Dedicated Task Tabs for Driver */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {driverTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-600">
            <Wifi className="h-3 w-3 text-emerald-600" />
            <span>5G Mesh: 16ms &bull; GPS</span>
          </div>

          {/* Military CAD Synchronized Clock */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
            <Clock className="h-3 w-3 text-rose-600" />
            <span>{currentTime || '10:55:00'}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen MDT'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Secure Driver Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition"
            title="Log out and release MDT terminal"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar for Driver */}
      <div className="md:hidden flex items-center justify-around border-b border-slate-200 bg-white py-1.5 px-2">
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
                    : 'text-slate-600 hover:bg-slate-100'
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
      <main className="flex-1 overflow-hidden relative bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverLayout;
