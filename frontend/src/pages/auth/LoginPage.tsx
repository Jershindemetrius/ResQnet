import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Ambulance,
  Radio,
  Crown,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth, UserRole, DEMO_PROFILES } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, switchRoleForDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect query parameter if present
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DRIVER');
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide valid authentication credentials.');
      return;
    }

    const mockUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: selectedRole,
      assignedUnit: selectedRole === 'DRIVER' ? 'ALS-101' : undefined
    };

    const mockToken = `jwt-${selectedRole.toLowerCase()}-${Date.now()}`;
    login(mockToken, mockUser);

    redirectUser(selectedRole);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchRoleForDemo(role);
    redirectUser(role);
  };

  const redirectUser = (role: UserRole) => {
    if (redirectPath && !redirectPath.includes('login') && !redirectPath.includes('403')) {
      navigate(redirectPath, { replace: true });
      return;
    }

    // Default route by role
    if (role === 'DRIVER') {
      navigate('/driver/console', { replace: true });
    } else if (role === 'ADMIN' || role === 'COORDINATOR') {
      navigate('/admin/overview', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-xl shadow-rose-900/40 ring-1 ring-rose-500/40">
            <ShieldAlert className="h-7 w-7" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white">ResQNet CAD Gateway</h1>
          <p className="text-xs text-slate-400">
            Demo role-based navigation • Not server-authenticated
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
          <p role="note" className="mb-4 rounded-lg border border-amber-700 bg-amber-950/50 p-3 text-xs leading-relaxed text-amber-100">
            Demo sign-in only. The email and password are not checked by the Java backend; the selected role is stored in this browser and does not secure API access.
          </p>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Role Identity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DRIVER', label: 'Driver (MDT)' },
                  { id: 'COORDINATOR', label: 'Dispatch' },
                  { id: 'ADMIN', label: 'Super Admin' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as UserRole)}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      selectedRole === r.id
                        ? 'border-rose-500 bg-rose-600/20 text-rose-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Official Email / Callsign ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@resqnet.gov"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-900/40 transition active:scale-95"
            >
              <span>Enter Demo Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="block text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
              One-Click Instant Demo Credentials
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('DRIVER')}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 p-2.5 text-left transition"
              >
                <Ambulance className="h-4 w-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-cyan-300">Driver MDT</div>
                  <div className="text-[9px] text-slate-400">Unit ALS-101</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 p-2.5 text-left transition"
              >
                <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-amber-300">Super Admin</div>
                  <div className="text-[9px] text-slate-400">Sector Control</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('COORDINATOR')}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 p-2.5 text-left transition"
              >
                <Radio className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-emerald-300">Dispatcher</div>
                  <div className="text-[9px] text-slate-400">CAD Central</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('CITIZEN')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 p-2.5 text-left transition"
              >
                <UserCheck className="h-4 w-4 text-slate-300 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-slate-200">Public Citizen</div>
                  <div className="text-[9px] text-slate-400">Citizen SOS View</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-slate-400 hover:text-white underline transition">
            ← Return to Public Emergency Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
