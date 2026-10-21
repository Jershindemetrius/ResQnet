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
    <div className="h-full w-full flex flex-col bg-slate-50 p-4 overflow-y-auto space-y-4 font-sans text-slate-800">
      {/* Route Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Navigation className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-700">
              Active Turn-by-Turn GPS Guidance
            </div>
            <h2 className="text-lg font-black text-slate-900">
              En Route to 14/B Gandhi Rd, Near Old Bus Stand
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-right font-mono">
            <div className="text-[9px] uppercase text-slate-500 font-bold">Remaining</div>
            <div className="text-sm font-black text-slate-900">1.2 km &bull; 3 min 15 sec</div>
          </div>

          <button
            onClick={() => setGreenWaveActive(!greenWaveActive)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              greenWaveActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Green Wave: {greenWaveActive ? 'ACTIVE' : 'STANDBY'}</span>
          </button>
        </div>
      </div>

      {/* Main Maneuver Guidance Card */}
      <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-200 font-black">
            <CornerUpRight className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-cyan-800">
              In 240 Meters
            </span>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl mt-0.5">
              Turn Right onto Gandhi Main Road
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Follow emergency corridor bypass. Police traffic barricades pre-empted for Unit ALS-101.
            </p>
          </div>
        </div>
      </div>

      {/* GIS Schematic Map Simulation */}
      <div className="flex-1 min-h-[300px] rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
        {/* Schematic Grid and Highway Canvas */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-driver" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0284c7" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-driver)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 font-mono text-xs text-slate-700">
            Current Speed: <strong>52 km/h</strong> (Optimal CAD corridor pacing)
          </span>

          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
            4 Signals Pre-empted Green Wave
          </span>
        </div>

        <div className="relative z-10 text-center py-10 space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600">
            <Compass className="h-6 w-6 animate-spin" />
          </div>
          <div className="text-sm font-bold text-slate-900">Real-Time GIS Satellite Tracking Feed</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Live vector telemetry locked on Kovilpatti Sector-4 mesh. All intersection transponders transmitting green priority.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
          <span>Destination Hospital: <strong>Govt Hospital Kovilpatti (3.4 km)</strong></span>
          <span>Next Maneuver: <strong>Straight on Pasuvanthanai Bypass in 1.1 km</strong></span>
        </div>
      </div>
    </div>
  );
};

export default DriverNavigationPage;
