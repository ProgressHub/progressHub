import { Link } from 'react-router-dom'

const NotFound = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#0a1520', fontFamily: "'DM Sans', sans-serif"
  }}>
    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>404</div>
    <div style={{ color: '#7ecece', fontSize: '1.2rem', marginBottom: '8px' }}>Page not found</div>
    <div style={{ color: '#4a7a8a', fontSize: '0.9rem', marginBottom: '28px' }}>
      The page you're looking for doesn't exist.
    </div>
    <Link to="/login" style={{
      background: 'linear-gradient(135deg, #52a0a0 0%, #7ecece 100%)',
      color: '#0a1520', borderRadius: '8px', padding: '10px 24px',
      textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem'
    }}>
      Back to Login
    </Link>
  </div>
)

export default NotFound