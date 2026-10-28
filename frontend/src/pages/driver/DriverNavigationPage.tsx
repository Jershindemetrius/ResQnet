import React, { useState } from 'react';
import {
  Navigation,
  CornerUpRight,
  Shield,
  MapPin,
  Clock,
  Compass,
  TrafficCone,
  AlertTriangle,
  RotateCw
} from 'lucide-react';

export const DriverNavigationPage: React.FC = () => {
  const [greenWaveActive, setGreenWaveActive] = useState(true);
  const [policeEscortActive, setPoliceEscortActive] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4">
      {/* Route Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Navigation className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              Active Turn-by-Turn GPS Guidance
            </div>
            <h2 className="text-lg font-black text-white">
              En Route to 14/B Gandhi Rd, Near Old Bus Stand
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-1.5 text-right font-mono">
            <div className="text-[9px] uppercase text-slate-500 font-bold">Remaining</div>
            <div className="text-sm font-black text-slate-200">1.2 km &bull; 3 min 15 sec</div>
          </div>

          <button
            onClick={() => setGreenWaveActive(!greenWaveActive)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              greenWaveActive
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                : 'border-slate-700 bg-slate-800 text-slate-300'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Green Wave: {greenWaveActive ? 'ACTIVE' : 'STANDBY'}</span>
          </button>
        </div>
      </div>

      {/* Main Maneuver Guidance Card */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40 font-black">
            <CornerUpRight className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-cyan-400">
              In 240 Meters
            </span>
            <h1 className="text-2xl font-black text-white sm:text-3xl mt-0.5">
              Turn Right onto Gandhi Main Road
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Follow emergency corridor bypass. Police traffic barricades pre-empted for Unit ALS-101.
            </p>
          </div>
        </div>
      </div>

      {/* GIS Schematic Map Simulation */}
      <div className="flex-1 min-h-[300px] rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Schematic Grid and Highway Canvas */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-driver" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-driver)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <span className="rounded-full bg-slate-950/80 border border-slate-800 px-3 py-1 font-mono text-xs text-slate-300">
            Current Speed: <strong>52 km/h</strong> (Optimal CAD corridor pacing)
          </span>

          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
            4 Signals Pre-empted Green Wave
          </span>
        </div>

        <div className="relative z-10 text-center py-10 space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <Compass className="h-6 w-6 animate-spin" />
          </div>
          <div className="text-sm font-bold text-slate-200">Real-Time GIS Satellite Tracking Feed</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Live vector telemetry locked on Kovilpatti Sector-4 mesh. All intersection transponders transmitting green priority.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <span>Destination Hospital: <strong>Govt Hospital Kovilpatti (3.4 km)</strong></span>
          <span>Next Maneuver: <strong>Straight on Pasuvanthanai Bypass in 1.1 km</strong></span>
        </div>
      </div>
    </div>
  );
};

export default DriverNavigationPage;
