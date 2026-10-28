import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldX, Home, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { from?: string; requiredRoles?: string[] } | null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 select-none">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Shield Alert Icon */}
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 shadow-2xl shadow-rose-900/30">
          <ShieldX className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 font-mono text-xs font-bold text-rose-400">
            HTTP 403 • ACCESS RESTRICTED
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Role Permission Denied
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your authenticated role <strong>{user?.role || 'CITIZEN'}</strong> is not authorized to access internal dispatch and coordinator infrastructure.
          </p>
        </div>

        {state?.requiredRoles && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Required Security Roles
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {state.requiredRoles.join(' OR ')}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 transition"
          >
            <Home className="h-4 w-4" />
            <span>Return to Public Portal</span>
          </Link>

          <Link
            to="/login"
            onClick={logout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-900/40 transition"
          >
            <LogIn className="h-4 w-4" />
            <span>Switch Role / Re-login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
