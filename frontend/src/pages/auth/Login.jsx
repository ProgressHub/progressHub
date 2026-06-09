import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not sign in.');
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setShakeKey((k) => k + 1);
      setGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <span className="eyebrow">Welcome back</span>
      <h1 className="auth-title">Sign in to your classroom</h1>
      <p className="auth-sub">Pick up exactly where you left off.</p>

      <div className="field">
        <input
          className="input-fancy" id="login-email" type="email" autoComplete="email"
          placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <label htmlFor="login-email">Email address</label>
      </div>

      <div className="field">
        <input
          className="input-fancy" id="login-password" type="password" autoComplete="current-password"
          placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required
        />
        <label htmlFor="login-password">Password</label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <Link to="/forgot-password" className="muted-link">Forgot password?</Link>
      </div>

      {error && <div key={shakeKey} className="error-box shake">{error}</div>}

      <button className="btn-primary" type="submit" disabled={loading || googleLoading}>
        {loading && <span className="spinner" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <span className="spinner" style={{ borderTopColor: '#555' }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.1-6.1C34.36 3.1 29.47 1 24 1 14.82 1 7.02 6.48 3.44 14.26l7.12 5.53C12.3 13.8 17.68 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.65c-.55 2.96-2.2 5.47-4.68 7.16l7.18 5.58C43.44 37.3 46.52 31.4 46.52 24.5z"/>
            <path fill="#FBBC05" d="M10.56 28.79A14.6 14.6 0 0 1 9.5 24c0-1.66.28-3.27.77-4.79l-7.12-5.53A23.93 23.93 0 0 0 0 24c0 3.87.92 7.53 2.56 10.76l8-6.2-.0-.03z" />
            <path fill="#34A853" d="M24 47c6.48 0 11.93-2.15 15.9-5.84l-7.18-5.58C30.6 37.3 27.5 38.5 24 38.5c-6.32 0-11.7-4.3-13.63-10.1l-7.81 6.06C6.96 41.46 14.82 47 24 47z"/>
          </svg>
        )}
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--ink-400)', fontSize: 13 }}>
        New here? <Link to="/register" className="rose-link">Create an account</Link>
      </p>
    </form>
  );
}