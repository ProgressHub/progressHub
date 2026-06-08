import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function strengthOf(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}
const STRENGTH_LABELS = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'];

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const strength = useMemo(() => strengthOf(password), [password]);
  const match = confirm.length > 0 && confirm === password;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      setShakeKey((k) => k + 1);
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp({ email, password, options: { data: { name, role } } });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not create account.');
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <span className="eyebrow">Join Learnly</span>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-sub">Tell us who you are — we'll tailor the experience.</p>

      <div className="role-row">
        <button type="button" className="role-btn" aria-pressed={role === 'student'} onClick={() => setRole('student')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 10 10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>
          I'm a Student
        </button>
        <button type="button" className="role-btn" aria-pressed={role === 'teacher'} onClick={() => setRole('teacher')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 18v2M21 18v2M8 22h8"/></svg>
          I'm a Teacher
        </button>
      </div>

      <div className="field">
        <input className="input-fancy" id="reg-name" type="text" autoComplete="name"
          placeholder=" " value={name} onChange={(e) => setName(e.target.value)} required />
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

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--ink-400)', fontSize: 13 }}>
        Already with us? <Link to="/login" className="rose-link">Sign in</Link>
      </p>
    </form>
  );
}
