import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

function strengthOf(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'];

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const strength = useMemo(() => strengthOf(password), [password]);
  const match = confirm.length > 0 && confirm === password;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (strength < 3) {
      setError('Please choose a stronger password');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      setShakeKey((k) => k + 1);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(full_name, email, password, role);
      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        setError('Please check your email to confirm your account before logging in.');
        setLoading(false);
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not create account.');
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
      <span className="eyebrow">Join Learnly</span>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-sub">Tell us who you are — we'll tailor the experience.</p>

      <div className="role-row">
        <button type="button" className="role-btn" aria-pressed={role === 'student'} onClick={() => setRole('student')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 10 10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>
          </svg>
          I'm a Student
        </button>
        <button type="button" className="role-btn" aria-pressed={role === 'teacher'} onClick={() => setRole('teacher')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="14" rx="2"/>
            <path d="M3 18v2M21 18v2M8 22h8"/>
          </svg>
          I'm a Teacher
        </button>
      </div>

      <div className="field">
        <input className="input-fancy" id="reg-name" type="text" autoComplete="name"
          placeholder=" " value={full_name} onChange={(e) => setFullName(e.target.value)} required />
        <label htmlFor="reg-name">Full name</label>
      </div>

      <div className="field">
        <input className="input-fancy" id="reg-email" type="email" autoComplete="email"
          placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="reg-email">Email address</label>
      </div>

      <div className="field">
        <input className="input-fancy" id="reg-password" type="password" autoComplete="new-password"
          placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label htmlFor="reg-password">Password</label>
        {password.length > 0 && (
          <>
            <div className="strength" data-level={strength}>
              <span /><span /><span /><span />
            </div>
            <div className="strength-label">{STRENGTH_LABELS[strength]}</div>
          </>
        )}
      </div>

      <div className="field">
        <input className="input-fancy" id="reg-confirm" type="password" autoComplete="new-password"
          placeholder=" " value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <label htmlFor="reg-confirm">Confirm password</label>
        {confirm.length > 0 && (
          <div className={match ? 'match-ok' : 'match-no'}>
            {match ? '✓ Passwords match' : '✗ Passwords do not match yet'}
          </div>
        )}
      </div>

      {error && <div key={shakeKey} className="error-box shake">{error}</div>}

      <button className="btn-primary" type="submit" disabled={loading || googleLoading}>
        {loading && <span className="spinner" />}
        {loading ? 'Creating account…' : 'Create account'}
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
        Already with us? <Link to="/login" className="rose-link">Sign in</Link>
      </p>
    </form>
  );
}