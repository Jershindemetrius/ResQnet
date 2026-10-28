import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { loginAccount, registerAccount } from '../../api/resqnetApi.js';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

interface AccountResponse {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

function requireAccount(value: unknown): AccountResponse {
  if (typeof value !== 'object' || value === null
      || !('id' in value) || typeof value.id !== 'string'
      || !('name' in value) || typeof value.name !== 'string'
      || !('email' in value) || typeof value.email !== 'string'
      || !('role' in value) || (value.role !== 'ADMIN' && value.role !== 'USER')) {
    throw new Error('The backend returned an invalid account response.');
  }
  return { id: value.id, name: value.name, email: value.email, role: value.role };
}

const safeRedirect = (candidate: string | null): string => {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')
      || candidate.startsWith('/login')) return '/';
  return candidate;
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') await registerAccount({ name, email, password });
      const account = requireAccount(await loginAccount({ email, password }));
      login(account);
      navigate(safeRedirect(query.get('redirect')), { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to authenticate with the backend.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="account-page">
      <section className="account-card" aria-labelledby="account-title">
        <Link className="account-back-link" to="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to ResQNet
        </Link>

        <div className="account-brand">
          <span className="account-brand-icon"><LifeBuoy size={27} aria-hidden="true" /></span>
        </div>
        <h1 id="account-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>

        {error && <div className="account-error" role="alert">{error}</div>}

        <form className="account-form" onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              <span>Full name</span>
              <span className="account-input-wrap">
                <UserRound size={17} aria-hidden="true" />
                <input
                  autoComplete="name"
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  value={name}
                />
              </span>
            </label>
          )}

          <label>
            <span>Email address</span>
            <span className="account-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                autoComplete="email"
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label>
            <span>Password</span>
            <span className="account-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                maxLength={128}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={password}
              />
            </span>
          </label>

          <button className="account-submit" disabled={busy} type="submit">
            {busy ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="account-switch">
          {mode === 'login' ? 'New to ResQNet?' : 'Already have an account?'}
          {' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            type="button"
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>

      </section>
    </main>
  );
};

export default LoginPage;
