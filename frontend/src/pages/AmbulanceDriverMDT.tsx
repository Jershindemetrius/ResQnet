import React, { useState, useEffect, useMemo } from 'react';
import {
  Ambulance,
  AlertTriangle,
  Radio,
  Phone,
  MapPin,
  Copy,
  ExternalLink,
  Clock,
  User,
  Heart,
  Shield,
  Zap,
  Gauge,
  Fuel,
  Wind,
  Activity,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Navigation,
  CornerUpRight,
  Crosshair,
  Bell,
  RotateCcw,
  Volume2,
  VolumeX,
  Stethoscope,
  BedDouble,
  Check,
  Send,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getDriverOrders,
  takeDriverOrder,
  updateDriverOrderStatus,
  transmitDriverVitals,
  clearDriverCorridor
} from '../services/apiClient';

// Types for Driver MDT
export type MDTUnitStatus =
  | 'ONLINE_PATROLLING'
  | 'DISPATCHED_EN_ROUTE'
  | 'ON_SCENE'
  | 'IN_TRANSIT_HOSPITAL'
  | 'PATIENT_HANDOFF'
  | 'OUT_OF_SERVICE';

export interface PatientLocationSummary {
  patient: string;
  reporter: string;
  location: string;
  coordinates: string;
}

export interface EmergencyDispatchOrder {
  cadId: string;
  priority: string;
  code: string;
  title: string;
  reportedTime: string;
  eta: string;
  distance: string;
  patientSummary: PatientLocationSummary;
  clinicalKits: string[];
  audioTranscript: string;
  hospitalTarget: {
    name: string;
    icuBeds: number;
    distance: string;
    travelTime: string;
    traumaLevel: string;
    assignedBay: string;
    attendingDoctor: string;
  };
  contactPhone: string;
}

export const DEFAULT_DISPATCH_ORDER: EmergencyDispatchOrder = {
  cadId: 'CAD #ER-2024-8841',
  priority: 'PRIORITY 1',
  code: 'CODE RED',
  title: 'Severe Cardiac Distress + Head Injury',
  reportedTime: '7m ago',
  eta: '3 min 15 sec',
  distance: '1.2 km',
  patientSummary: {
    patient: '58 yrs • Male (Unconscious, Diaphoretic)',
    reporter: 'Family Member (Son) • Reported 7m ago',
    location: '14/B Gandhi Rd, Near Old Bus Stand, Kovilpatti',
    coordinates: '8.9872° N, 77.8682° E'
  },
  clinicalKits: [
    'High-Flow O₂',
    'Hydraulic Stretcher',
    'Cervical Trauma Kit',
    'ICU Pre-Alert ER'
  ],
  audioTranscript:
    'Father collapsed in front hall, breathing heavily... pulse feels erratic and weak. Bleeding from forehead contusion.',
  hospitalTarget: {
    name: 'Govt Hospital Kovilpatti',
    icuBeds: 6,
    distance: '2.4 km',
    travelTime: '6 min transit',
    traumaLevel: 'Level-1 Comprehensive Trauma & Stroke Unit',
    assignedBay: 'Resuscitation Bay 02',
    attendingDoctor: 'Dr. K. Sundaram (Chief of ER)'
  },
  contactPhone: '+91 94421 88301'
};

export default function AmbulanceDriverMDT() {
  // Navigation Shell State
  const [isSidebarDockCollapsed, setIsSidebarDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // MDT Operational States
  const [unitStatus, setUnitStatus] = useState<MDTUnitStatus>('ONLINE_PATROLLING');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [radioChannel, setRadioChannel] = useState('VHF-4 • Kovilpatti Dispatch');
  const [isRadioMenuOpen, setIsRadioMenuOpen] = useState(false);

  // Active Dispatch Run State
  const [order, setOrder] = useState<EmergencyDispatchOrder>(DEFAULT_DISPATCH_ORDER);
  const [runStatus, setRunStatus] = useState<'PENDING' | 'ACCEPTED' | 'ON_SCENE' | 'TRANSPORTING' | 'COMPLETED'>('PENDING');
  const [countdown, setCountdown] = useState<number>(34);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [isBottomTrayExpanded, setIsBottomTrayExpanded] = useState<boolean>(true);
  const [corridorCleared, setCorridorCleared] = useState<boolean>(false);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);

  // Telemetry Stream
  const [telemetry, setTelemetry] = useState({
    fuelPercent: 84,
    fuelKm: 280,
    o2Percent: 98,
    o2Pressure: '140 Bar',
    defibReady: true,
    speedKmh: 0,
    heartRate: 114,
    bp: '88/54',
    spo2: 91
  });

  // Toast System
  const [toast, setToast] = useState<{ id: number; message: string; type?: 'info' | 'success' | 'warn' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warn' | 'danger' = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Clock state
  const [currentTime, setCurrentTime] = useState<string>('');

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
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for automatic re-routing fallback
  useEffect(() => {
    if (runStatus !== 'PENDING' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [runStatus, countdown]);

  // Load backend orders from API if available
  useEffect(() => {
    async function fetchOrders() {
      try {
        const liveOrders = await getDriverOrders();
        if (Array.isArray(liveOrders) && liveOrders.length > 0) {
          const first = liveOrders[0];
          setOrder(prev => ({
            ...prev,
            cadId: `CAD #${first.id || 'ER-2024-8841'}`,
            title: first.patientName ? `${first.type || 'Emergency'} - ${first.patientName}` : prev.title,
            patientSummary: {
              ...prev.patientSummary,
              patient: first.patientName ? `${first.patientAge || '58'} yrs • ${first.patientGender || 'Male'} (${first.type || 'Critical'})` : prev.patientSummary.patient,
              location: first.pickupLocation || prev.patientSummary.location
            },
            contactPhone: first.callerPhone || prev.contactPhone
          }));
        }
      } catch (err) {
        console.warn('Driver MDT API load error (cached order used):', err);
      }
    }
    fetchOrders();
  }, []);

  // Speed simulation when en-route
  useEffect(() => {
    if (runStatus === 'ACCEPTED' || runStatus === 'TRANSPORTING') {
      const speedInterval = setInterval(() => {
        setTelemetry(t => ({
          ...t,
          speedKmh: Math.floor(48 + Math.random() * 26)
        }));
      }, 1500);
      return () => clearInterval(speedInterval);
    } else {
      setTelemetry(t => ({ ...t, speedKmh: 0 }));
    }
  }, [runStatus]);

  // Handle Fullscreen Toggle
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

  // Actions
  const handleToggleSiren = () => {
    const nextState = !isSirenActive;
    setIsSirenActive(nextState);
    if (nextState) {
      showToast('🚨 SIREN CODE 3 & HIGH-BEAM STROBES ENGAGED - Preempting Local Signals', 'danger');
    } else {
      showToast('🔕 Siren Code 3 Standdown - Returning to Silent Running', 'info');
    }
  };

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(order.patientSummary.coordinates);
    setCopiedCoords(true);
    showToast(`📍 Coordinates copied: ${order.patientSummary.coordinates}`, 'success');
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handleOpenNavigation = () => {
    const encoded = encodeURIComponent(order.patientSummary.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    showToast('🗺️ External Turn-by-Turn Navigation opened', 'info');
  };

  const handleAcceptOrder = async () => {
    setRunStatus('ACCEPTED');
    setUnitStatus('DISPATCHED_EN_ROUTE');
    setIsSirenActive(true);
    setCorridorCleared(true);
    showToast('🚨 ORDER ACCEPTED! CAD green-wave corridor armed. En route Code-3.', 'success');

    try {
      await takeDriverOrder(order.cadId.replace('CAD #', ''), 'ALS-101 (Officer Raman)');
      await clearDriverCorridor(order.cadId.replace('CAD #', ''));
    } catch {
      // Offline fallback
    }
  };

  const handleProgressRun = async () => {
    if (runStatus === 'ACCEPTED') {
      setRunStatus('ON_SCENE');
      setUnitStatus('ON_SCENE');
      setIsSirenActive(false);
      showToast('📍 ON SCENE: Patient contact initiated. Medical crew assessing vitals.', 'info');
      try {
        await updateDriverOrderStatus(order.cadId.replace('CAD #', ''), 'ARRIVED');
      } catch {}
    } else if (runStatus === 'ON_SCENE') {
      setRunStatus('TRANSPORTING');
      setUnitStatus('IN_TRANSIT_HOSPITAL');
      setIsSirenActive(true);
      showToast('🚑 TRANSPORTING: En route to Kovilpatti GH Cath Lab. Telemetry transmitting.', 'warn');
      try {
        await updateDriverOrderStatus(order.cadId.replace('CAD #', ''), 'IN_TRANSIT');
        await transmitDriverVitals(order.cadId.replace('CAD #', ''), {
          hr: telemetry.heartRate,
          bp: telemetry.bp,
          spo2: telemetry.spo2
        });
      } catch {}
    } else if (runStatus === 'TRANSPORTING') {
      setRunStatus('COMPLETED');
      setUnitStatus('PATIENT_HANDOFF');
      setIsSirenActive(false);
      showToast('🏥 MISSION COMPLETE: Patient safely handed off to Dr. Sundaram in Bay 02.', 'success');
      try {
        await updateDriverOrderStatus(order.cadId.replace('CAD #', ''), 'COMPLETED');
      } catch {}
    } else if (runStatus === 'COMPLETED') {
      setRunStatus('PENDING');
      setUnitStatus('ONLINE_PATROLLING');
      setCountdown(34);
      setCorridorCleared(false);
      showToast('Unit ALS-101 reset to Standby & Patrolling.', 'info');
    }
  };

  const handleDeclineOrder = () => {
    setShowDeclineModal(false);
    setRunStatus('PENDING');
    showToast('⚠️ Run declined. Incident CAD order rerouted to backup unit ALS-104.', 'warn');
  };

  // Status visual configurations
  const statusConfig = useMemo(() => {
    switch (unitStatus) {
      case 'ONLINE_PATROLLING':
        return { label: 'Online & Patrolling', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500 animate-pulse' };
      case 'DISPATCHED_EN_ROUTE':
        return { label: 'Dispatched • En Route Code-3', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-500 animate-ping' };
      case 'ON_SCENE':
        return { label: 'On Scene • Patient Contact', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' };
      case 'IN_TRANSIT_HOSPITAL':
        return { label: 'In Transit • Destination GH', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-500 animate-pulse' };
      case 'PATIENT_HANDOFF':
        return { label: 'Hospital Patient Handoff', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', dot: 'bg-indigo-500' };
      case 'OUT_OF_SERVICE':
        return { label: 'Out of Service / Refuel', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-500' };
    }
  }, [unitStatus]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* ----------------------------------------------------------------------
          FLOATING IN-APP TOAST
          ---------------------------------------------------------------------- */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              toast.type === 'danger'
                ? 'bg-rose-500/20 text-rose-400'
                : toast.type === 'warn'
                ? 'bg-amber-500/20 text-amber-400'
                : toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-cyan-500/20 text-cyan-400'
            }`}
          >
            {toast.type === 'danger' ? <AlertTriangle className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
          </div>
          <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          LEFT SLIM ICON DOCK (Collapsible Global Shell for 95%+ Viewport Width)
          ---------------------------------------------------------------------- */}
      <aside
        className={`flex flex-col items-center justify-between border-r border-slate-800 bg-slate-900/90 py-3 transition-all duration-300 z-30 ${
          isSidebarDockCollapsed ? 'w-14' : 'w-16'
        }`}
      >
        <div className="flex flex-col items-center gap-5">
          {/* ResQNet Beacon Icon */}
          <Link
            to="/"
            title="ResQNet CAD Home Dashboard"
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-900/40 ring-1 ring-rose-500/40 transition hover:scale-105"
          >
            <Ambulance className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </Link>

          <div className="h-px w-8 bg-slate-800" />

          {/* Nav Action Icons with min 44px hit targets */}
          <nav className="flex flex-col items-center gap-2">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-600/20 text-rose-400 ring-1 ring-rose-500/30 transition hover:bg-rose-600/30"
              title="Active MDT Console (Current)"
            >
              <Crosshair className="h-5 w-5" />
            </button>

            <Link
              to="/emergencies"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              title="Dispatch Incidents Queue"
            >
              <Activity className="h-5 w-5" />
            </Link>

            <Link
              to="/resources"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              title="Fleet Diagnostics & Telematics"
            >
              <Gauge className="h-5 w-5" />
            </Link>

            <button
              onClick={() => setCallModalOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
              title="Direct Hotline 911/CAD"
            >
              <Phone className="h-5 w-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Dock Controls */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen MDT'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition"
            title="Return to Public Citizen Overview"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* ----------------------------------------------------------------------
          MAIN DRIVER CONSOLE AREA
          ---------------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* --------------------------------------------------------------------
            TOP UTILITY & STATUS STRIP (Height: 52px)
            -------------------------------------------------------------------- */}
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-md">
          {/* Left: ResQNet Logo, Callsign Badge, Unit Status Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                ResQNet <span className="text-rose-500">MDT</span>
              </span>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-cyan-400">
                ALS-101
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className={`flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                <span>{statusConfig.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>

              {/* Status Picker Menu */}
              {isStatusMenuOpen && (
                <div className="absolute top-10 left-0 z-50 w-64 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Set Unit CAD Status
                  </div>
                  {[
                    { id: 'ONLINE_PATROLLING', label: 'Online & Patrolling', desc: 'Available for P1 dispatches' },
                    { id: 'DISPATCHED_EN_ROUTE', label: 'Dispatched • En Route (Code 3)', desc: 'Preempting route corridors' },
                    { id: 'ON_SCENE', label: 'On Scene • Patient Contact', desc: 'First responder assessment' },
                    { id: 'IN_TRANSIT_HOSPITAL', label: 'In Transit • Destination GH', desc: 'Patient telemetry armed' },
                    { id: 'PATIENT_HANDOFF', label: 'Hospital Patient Handoff', desc: 'Cath lab ER transfer' },
                    { id: 'OUT_OF_SERVICE', label: 'Out of Service / Refuel', desc: 'Standby offline' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setUnitStatus(s.id as MDTUnitStatus);
                        setIsStatusMenuOpen(false);
                        showToast(`Unit state updated to: ${s.label}`, 'info');
                      }}
                      className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left transition hover:bg-slate-800"
                    >
                      <span className="text-xs font-semibold text-slate-200">{s.label}</span>
                      <span className="text-[10px] text-slate-400">{s.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Integrated Telemetry Ribbon in One Unified Pill */}
          <div className="hidden md:flex items-center gap-5 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-1.5 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-1.5" title="Diesel Fuel Reserve">
              <Fuel className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] uppercase text-slate-400 font-sans">Fuel</span>
              <span className="font-bold text-slate-200">{telemetry.fuelPercent}%</span>
              <span className="text-[10px] text-slate-500">({telemetry.fuelKm}km)</span>
            </div>

            <div className="h-3 w-px bg-slate-800" />

            <div className="flex items-center gap-1.5" title="Medical Oxygen Tank Payload">
              <Wind className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase text-slate-400 font-sans">O₂ Tank</span>
              <span className="font-bold text-cyan-300">{telemetry.o2Percent}%</span>
              <span className="text-[10px] text-slate-500">Safe</span>
            </div>

            <div className="h-3 w-px bg-slate-800" />

            <div className="flex items-center gap-1.5" title="Zoll X-Series Biphasic Defibrillator">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase text-slate-400 font-sans">Defib</span>
              <span className="font-bold text-emerald-400">READY</span>
            </div>

            <div className="h-3 w-px bg-slate-800" />

            <div className="flex items-center gap-1.5" title="GPS Telemetry Speed">
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] uppercase text-slate-400 font-sans">Speed</span>
              <span className={`font-bold ${telemetry.speedKmh > 0 ? 'text-amber-400 font-mono' : 'text-slate-300'}`}>
                {telemetry.speedKmh} <span className="text-[10px]">km/h</span>
              </span>
            </div>
          </div>

          {/* Right: Emergency Siren Toggle, Radio Channel, Clock */}
          <div className="flex items-center gap-3">
            {/* Siren Toggle: Subtle border, glowing red ONLY when active */}
            <button
              onClick={handleToggleSiren}
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                isSirenActive
                  ? 'animate-pulse border-rose-500 bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
              title="Toggle Siren Code 3 & High-Beam Strobes"
            >
              <Bell className={`h-3.5 w-3.5 ${isSirenActive ? 'animate-bounce' : ''}`} />
              <span>SIREN CODE 3</span>
            </button>

            {/* Radio Channel Monitor */}
            <div className="relative">
              <button
                onClick={() => setIsRadioMenuOpen(!isRadioMenuOpen)}
                className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                <Radio className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-mono text-[11px]">{radioChannel.split('•')[0]}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {isRadioMenuOpen && (
                <div className="absolute top-10 right-0 z-50 w-56 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-md">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    CAD Voice Channels
                  </div>
                  {[
                    'VHF-4 • Kovilpatti Dispatch',
                    'TAC-1 • Medical Mutual Aid',
                    'HOSP-2 • GH ER Inbound Cath Lab',
                    'TAC-9 • Civil Defense Severe'
                  ].map(ch => (
                    <button
                      key={ch}
                      onClick={() => {
                        setRadioChannel(ch);
                        setIsRadioMenuOpen(false);
                        showToast(`Radio switched to ${ch}`, 'info');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Radio className="h-3 w-3 text-cyan-400" />
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CAD Military Synchronized Clock */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 font-mono text-xs font-bold text-slate-200">
              <Clock className="h-3 w-3 text-rose-500" />
              <span>{currentTime || '10:35:00'}</span>
            </div>
          </div>
        </header>

        {/* --------------------------------------------------------------------
            MAIN OPERATIONAL GRID (Split View: 7:5 Layout)
            -------------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-12 gap-4">
            {/* ----------------------------------------------------------------
                LEFT COLUMN (col-span-12 lg:col-span-7):
                Active Priority-1 Dispatch Hero Card
                ---------------------------------------------------------------- */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
              {/* Primary Dispatch Hero Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
                {/* Subtle top emergency gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500" />

                {/* 1. Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1 text-xs font-black tracking-wider text-white shadow-md shadow-rose-900/40">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {order.priority} • {order.code}
                    </span>

                    {/* Auto-routing fallback timer pill */}
                    <span className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-400">
                      <Clock className="h-3 w-3 animate-spin" />
                      Auto-routing fallback: {countdown}s
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{order.cadId}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <span>Reported {order.reportedTime}</span>
                  </div>
                </div>

                {/* 2. Incident Hero Block */}
                <div className="pt-4 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {order.title}
                    </h1>

                    {/* ETA Badge with dynamic pulse */}
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/60 to-rose-900/30 px-3.5 py-1.5 shadow-inner">
                      <Navigation className="h-4 w-4 text-rose-400 animate-pulse" />
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-rose-300/80 font-bold">Estimated Arrival</div>
                        <div className="font-mono text-sm font-black text-rose-300">
                          {order.eta} <span className="text-xs font-normal text-rose-400/70">({order.distance})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Patient & Location Summary Grid */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Patient info */}
                    <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <User className="h-3 w-3 text-cyan-400" />
                        Patient Details
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-200 leading-snug">
                        {order.patientSummary.patient}
                      </p>
                    </div>

                    {/* Reporter info */}
                    <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <Phone className="h-3 w-3 text-emerald-400" />
                        Caller / Reporter
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-200 leading-snug">
                        {order.patientSummary.reporter}
                      </p>
                    </div>

                    {/* Location with Copy & External Nav Buttons */}
                    <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-rose-400" />
                          Incident Scene
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleCopyCoordinates}
                            className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                            title="Copy GPS coordinates"
                          >
                            {copiedCoords ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <button
                            onClick={handleOpenNavigation}
                            className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
                            title="Open in External Navigation"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-200 leading-snug truncate" title={order.patientSummary.location}>
                        {order.patientSummary.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Mandatory Clinical Kits & Protocols */}
                <div className="pt-2 pb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Mandatory Clinical Kits &amp; Protocols
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.clinicalKits.map(kit => (
                      <span
                        key={kit}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm"
                      >
                        <Stethoscope className="h-3.5 w-3.5 text-rose-400" />
                        {kit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Caller Audio Briefing Player */}
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsAudioPlaying(!isAudioPlaying);
                          showToast(
                            !isAudioPlaying
                              ? '▶️ Playing caller 911 dispatch voice briefing...'
                              : '⏸️ Audio briefing paused',
                            'info'
                          );
                        }}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md transition ${
                          isAudioPlaying
                            ? 'bg-rose-600 shadow-rose-900/40 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                        title={isAudioPlaying ? 'Pause caller audio' : 'Play caller audio'}
                      >
                        {isAudioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">911 Audio Briefing</span>
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-400">
                            0:24 SEC
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs italic text-slate-400 max-w-md line-clamp-1">
                          "{order.audioTranscript}"
                        </p>
                      </div>
                    </div>

                    {/* Animated soundwave visualizer */}
                    <div className="hidden sm:flex items-center gap-1 h-7 px-3 rounded-lg bg-slate-900 border border-slate-800">
                      {[18, 28, 45, 20, 60, 35, 50, 25, 40, 15, 30].map((height, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isAudioPlaying ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'
                          }`}
                          style={{
                            height: isAudioPlaying ? `${height}%` : '20%',
                            animationDelay: `${i * 90}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------------------
                RIGHT COLUMN (col-span-12 lg:col-span-5):
                Hospital Routing & Action Trays
                ---------------------------------------------------------------- */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
              {/* Destination Hospital Target Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Designated Receiving Facility
                    </span>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    {order.hospitalTarget.icuBeds} ICU Beds Free
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold text-white">{order.hospitalTarget.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <span>{order.hospitalTarget.distance}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <span>{order.hospitalTarget.travelTime}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-300 font-medium">
                    {order.hospitalTarget.traumaLevel}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Assigned Bay</div>
                      <div className="font-semibold text-slate-200">{order.hospitalTarget.assignedBay}</div>
                    </div>
                    <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Attending ER</div>
                      <div className="font-semibold text-slate-200 truncate">{order.hospitalTarget.attendingDoctor}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Persistent Primary Action Stack */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3">
                {/* 1. Primary Big Action CTA (h-16, touch friendly min 44px) */}
                {runStatus === 'PENDING' ? (
                  <button
                    onClick={handleAcceptOrder}
                    className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-rose-600 px-6 text-lg font-bold text-white shadow-xl shadow-rose-900/40 ring-1 ring-rose-500/40 transition hover:bg-rose-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <span>ACCEPT ORDER &amp; START ROUTE</span>
                    <span className="text-xl">→</span>
                  </button>
                ) : (
                  <button
                    onClick={handleProgressRun}
                    className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white shadow-xl shadow-emerald-900/40 ring-1 ring-emerald-500/40 transition hover:bg-emerald-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <CheckCircle2 className="h-6 w-6" />
                    <span>
                      {runStatus === 'ACCEPTED' && 'ON SCENE (PATIENT CONTACT)'}
                      {runStatus === 'ON_SCENE' && 'START TRANSPORT TO ER'}
                      {runStatus === 'TRANSPORTING' && 'COMPLETE MISSION & HANDOFF'}
                      {runStatus === 'COMPLETED' && 'RESET TO PATROL'}
                    </span>
                  </button>
                )}

                {/* 2. Secondary Action: Direct Call Citizen / Dispatch */}
                <button
                  onClick={() => setCallModalOpen(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 text-sm font-semibold text-slate-100 shadow hover:bg-slate-700 transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Direct Call Citizen / Dispatch ({order.contactPhone})</span>
                </button>

                {/* 3. Tertiary Flat Decline / Reroute Safeguarded Button */}
                {runStatus === 'PENDING' && (
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="flex h-10 w-full items-center justify-center text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
                  >
                    Decline / Reroute to Backup Unit (ALS-104)
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* --------------------------------------------------------------------
            BOTTOM COLLAPSIBLE PANEL:
            Live Telemetry Corridor & Turn-by-Turn Preview
            -------------------------------------------------------------------- */}
        <footer className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
          {/* Header of panel with collapse toggle */}
          <div
            onClick={() => setIsBottomTrayExpanded(!isBottomTrayExpanded)}
            className="flex h-9 cursor-pointer items-center justify-between px-4 text-xs font-bold text-slate-400 hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="tracking-wider uppercase text-[10px]">Active Route Telemetry &amp; CAD Corridor</span>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200">
              <span>{isBottomTrayExpanded ? 'Minimize Corridor' : 'Expand Corridor'}</span>
              {isBottomTrayExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Expandable Body */}
          {isBottomTrayExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 pt-1 border-t border-slate-800/60 bg-slate-950/60 font-sans text-xs">
              {/* Route Clearance Corridor */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Green Wave Clearance</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {corridorCleared ? 'Clear corridor via Main Bypass active (4 signals pre-empted)' : 'Corridor on standby (armed on accept)'}
                  </div>
                </div>
              </div>

              {/* Next Maneuver */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <CornerUpRight className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Next Nav Maneuver</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    Turn Right in 320m onto Bypass Link Road
                  </div>
                </div>
              </div>

              {/* CAD Verified Handoff */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">CAD Handoff Status</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    Kovilpatti GH ER Bay 02 Locked &bull; Attending armed
                  </div>
                </div>
              </div>
            </div>
          )}
        </footer>
      </div>

      {/* ----------------------------------------------------------------------
          DECLINE ORDER CONFIRMATION MODAL
          ---------------------------------------------------------------------- */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Decline Dispatch Order?</h3>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              Are you sure you want to decline this Priority-1 Code Red dispatch? The order will be immediately rerouted to backup unit <strong>ALS-104 (Sub-Station North)</strong>.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel &amp; Keep Order
              </button>
              <button
                onClick={handleDeclineOrder}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition shadow-lg shadow-rose-900/40"
              >
                Confirm Decline &amp; Reroute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          DIRECT CALL MODAL
          ---------------------------------------------------------------------- */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <Phone className="h-6 w-6 animate-bounce" />
              <h3 className="text-lg font-bold text-white">Direct Line Call</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Calling designated incident reporter at:
            </p>
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-center font-mono text-base font-bold text-emerald-400">
              {order.contactPhone}
            </div>
            <div className="mt-5 flex gap-2">
              <a
                href={`tel:${order.contactPhone.replace(/[^0-9+]/g, '')}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
              >
                <Phone className="h-4 w-4" />
                Launch Native Call
              </a>
              <button
                onClick={() => setCallModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
