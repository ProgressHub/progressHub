import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '12px 4px 4px' }}>
          <div className="check-circle">
            <svg className="check-svg" viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6" /></svg>
          </div>
          <h1 className="auth-title" style={{ fontSize: 26 }}>Check your inbox</h1>
          <p className="auth-sub">
            We sent a reset link to <strong style={{ color: 'var(--ink-900)' }}>{email}</strong>.
          </p>
          <p style={{ marginTop: 18 }}>
            <Link to="/login" className="rose-link">Back to sign in</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <span className="eyebrow">Password reset</span>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-sub">Enter your email and we'll send you a secure link to set a new one.</p>

          <div className="field">
            <input className="input-fancy" id="fp-email" type="email" autoComplete="email"
              placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label htmlFor="fp-email">Email address</label>
          </div>

          {error && <div key={shakeKey} className="error-box shake">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--ink-400)', fontSize: 13 }}>
            Remembered it? <Link to="/login" className="rose-link">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
