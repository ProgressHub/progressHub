import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--ink-400)', fontSize: 13 }}>
        New here? <Link to="/register" className="rose-link">Create an account</Link>
      </p>
    </form>
  );
}
