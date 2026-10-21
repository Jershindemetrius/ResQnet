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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-xl shadow-rose-200 ring-1 ring-rose-300">
            <ShieldAlert className="h-7 w-7" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">ResQNet CAD Gateway</h1>
          <p className="text-xs text-slate-500">
            Secure Role-Based Access Control • Defense &amp; EMS Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
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
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Official Email / Callsign ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@resqnet.gov"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-200 transition active:scale-95"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <span className="block text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              One-Click Instant Demo Credentials
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('DRIVER')}
                className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 p-2.5 text-left transition"
              >
                <Ambulance className="h-4 w-4 text-cyan-700 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-cyan-900">Driver MDT</div>
                  <div className="text-[9px] text-cyan-700">Unit ALS-101</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 p-2.5 text-left transition"
              >
                <Crown className="h-4 w-4 text-amber-700 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-amber-900">Super Admin</div>
                  <div className="text-[9px] text-amber-700">Sector Control</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('COORDINATOR')}
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 p-2.5 text-left transition"
              >
                <Radio className="h-4 w-4 text-emerald-700 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-emerald-900">Dispatcher</div>
                  <div className="text-[9px] text-emerald-700">CAD Central</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('CITIZEN')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-2.5 text-left transition"
              >
                <UserCheck className="h-4 w-4 text-slate-700 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-slate-900">Public Citizen</div>
                  <div className="text-[9px] text-slate-500">Citizen SOS View</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-slate-600 hover:text-slate-900 underline transition">
            ← Return to Public Emergency Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
