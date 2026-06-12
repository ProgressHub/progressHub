import { useLocation, useNavigate } from 'react-router-dom';

/**
 * AuthShell — full-viewport split layout.
 * Left half = brand panel, right half = form. On /register the two halves
 * swap sides with a 780ms spring slide driven by [data-mode] in CSS.
 */
export default function AuthShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  const isRegister = path.startsWith('/register');
  const isForgot = path.startsWith('/forgot-password');
  const mode = isRegister ? 'register' : 'login';

  const goLogin = () => !path.startsWith('/login') && navigate('/login');
  const goRegister = () => !isRegister && navigate('/register');

  return (
    <div className="auth-split" data-mode={mode}>
      {/* Brand panel */}
      <aside className="auth-panel" aria-hidden="false">
        <span className="shape-blob shape-blob-1" />
        <span className="shape-blob shape-blob-2" />
        <span className="shape-blob shape-blob-3" />

        <div className="panel-brand">
          <div className="brand-mark">P</div>
          <div className="brand-name">ProgressHub</div>
        </div>

        <div className="panel-hero">
          <h2>
            Where students &amp;<br />
            teachers <span className="accent">grow together.</span>
          </h2>
          <p>
            Homework, quizzes, attendance and progress — one calm, focused
            workspace built for classrooms that care about real learning.
          </p>

          <div className="feature-pills">
            <span className="feature-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" /><path d="M8 7h8M8 11h6" /></svg>
              Smart homework
            </span>
            <span className="feature-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 2.6 6.3L21 9l-5 4.4L17.2 21 12 17.6 6.8 21 8 13.4 3 9l6.4-.7Z" /></svg>
              Live quizzes
            </span>
            <span className="feature-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></svg>
              Progress insights
            </span>
            <span className="feature-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
              Teacher dashboard
            </span>
          </div>
        </div>

        <div className="panel-footer">© {new Date().getFullYear()} ProgressHub · Calm tools for real classrooms</div>
      </aside>

      {/* Form */}
      <section className="auth-form-wrap">
        <div className="auth-card">
          {!isForgot && (
            <div className="segmented" role="tablist" aria-label="Auth mode">
              <button type="button" role="tab" aria-pressed={mode === 'login'} onClick={goLogin}>Sign in</button>
              <button type="button" role="tab" aria-pressed={mode === 'register'} onClick={goRegister}>Sign up</button>
            </div>
          )}

          <div key={path} className="form-anim">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
