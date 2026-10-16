import React, { useState } from 'react';
import {
  Gauge,
  Zap,
  Wind,
  Fuel,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Thermometer,
  BatteryCharging
} from 'lucide-react';

export const DriverTelemetryPage: React.FC = () => {
  const [testingDefib, setTestingDefib] = useState(false);
  const [defibStatus, setDefibStatus] = useState<'READY' | 'SELF_TESTING' | 'PASS'>('READY');

  const handleTestDefib = () => {
    setTestingDefib(true);
    setDefibStatus('SELF_TESTING');
    setTimeout(() => {
      setTestingDefib(false);
      setDefibStatus('PASS');
    }, 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Unit Telematics &amp; Biomedical Diagnostics
            </div>
            <h2 className="text-lg font-black text-white">
              Ambulance ALS-101 • Reg: TN-69-EM-8841
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
            All Systems Nominal &bull; OBD-II Link OK
          </span>
        </div>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fuel & Range */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4 text-slate-300" />
              Diesel Reserve
            </span>
            <span className="text-emerald-400">Normal</span>
          </div>
          <div className="text-3xl font-black text-white">
            84% <span className="text-xs text-slate-500 font-normal">/ 65 Liters</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '84%' }} />
          </div>
          <div className="text-[10px] text-slate-400">Estimated Range: 280 km</div>
        </div>

        {/* Oxygen Main Cylinders */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-cyan-400" />
              Medical O₂ Manifold
            </span>
            <span className="text-cyan-400">140 Bar</span>
          </div>
          <div className="text-3xl font-black text-white">
            98% <span className="text-xs text-slate-500 font-normal">Dual 10L</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '98%' }} />
          </div>
          <div className="text-[10px] text-slate-400">Ventilator runtime: ~6.5 hours at 15 LPM</div>
        </div>

        {/* Defibrillator / Zoll X-Series */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              Defib Unit
            </span>
            <span className="text-emerald-400 font-mono">Biphasic</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {defibStatus === 'SELF_TESTING' ? 'TESTING...' : 'SELF-TEST OK'}
          </div>
          <button
            onClick={handleTestDefib}
            disabled={testingDefib}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {testingDefib ? 'Running Diagnostic Pulse...' : 'Trigger Calibration Self-Test'}
          </button>
        </div>

        {/* Battery & Electrical Alternator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <BatteryCharging className="h-4 w-4 text-emerald-400" />
              Auxiliary Battery
            </span>
            <span className="text-emerald-400">Charging</span>
          </div>
          <div className="text-3xl font-black text-white">
            27.4 V <span className="text-xs text-slate-500 font-normal">Dual Inverter</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }} />
          </div>
          <div className="text-[10px] text-slate-400">Cold-chain medicine fridge: 4.2°C Locked</div>
        </div>
      </div>
    </div>
  );
};

export default DriverTelemetryPage;
