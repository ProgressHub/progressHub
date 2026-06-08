import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a1520', fontFamily: "'DM Sans', sans-serif", gap: '16px'
    }}>
      <div style={{ fontSize: '2rem' }}>{role === 'teacher' ? '🏫' : '🎒'}</div>
      <h1 style={{ color: '#e8f4f4', fontSize: '1.5rem', fontWeight: '700' }}>
        Welcome back!
      </h1>
      <p style={{ color: '#4a7a8a', fontSize: '0.9rem' }}>{user?.email}</p>
      <div style={{
        background: 'rgba(126,206,206,0.1)', border: '1px solid rgba(126,206,206,0.3)',
        color: '#7ecece', borderRadius: '20px', padding: '4px 16px', fontSize: '0.85rem'
      }}>
        {role === 'teacher' ? 'Teacher' : 'Student'}
      </div>
      <button onClick={handleLogout} style={{
        marginTop: '12px', background: 'transparent',
        border: '1.5px solid #1e3040', color: '#4a7a8a',
        borderRadius: '8px', padding: '10px 24px',
        fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
      }}>
        Logout
      </button>
    </div>
  )
}

export default Dashboard