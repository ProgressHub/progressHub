// src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/StatCard'
import RecentActivity from '../../components/RecentActivity'
import { fetchStudentStats, fetchRecentTasks } from '../../services/studentService'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const [statsRes, tasksRes] = await Promise.all([
        fetchStudentStats(user.id),
        fetchRecentTasks(user.id),
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (tasksRes.data) setTasks(tasksRes.data)
      setLoading(false)
    }
    load()
  }, [user])

  const statCards = stats ? [
    {
      title: 'Tasks Pending',
      value: stats.tasksPending,
      accentColor: '#f59e0b',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="15" y2="17"/>
        </svg>
      ),
    },
    {
      title: 'Upcoming Assignments',
      value: stats.upcomingAssignments,
      accentColor: '#e11d48',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      title: 'Attendance',
      value: `${stats.attendancePercent}%`,
      accentColor: '#075985',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ] : []

  return (
    <>
      <style>{`
        .ss-section {
          background: #ffffff; border: 1px solid #dbeafe;
          border-radius: 14px; padding: 22px;
          box-shadow: 0 1px 3px rgba(12,45,74,0.05); transition: all 0.25s ease;
        }
        .ss-section:hover { box-shadow: 0 10px 28px rgba(7,89,133,0.10); transform: translateY(-2px); }
        .ss-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .ss-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .ss-two-col { grid-template-columns: 1fr !important; }
          .ss-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .ss-stats-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .ss-stat-skeleton {
          height: 90px; border-radius: 14px;
          background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%);
          backgroundSize: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>

      <div style={styles.page}>
        <div style={styles.greeting}>
          <h1 style={styles.greetTitle}>Good morning 👋</h1>
          <p style={styles.greetSub}>Here's what's happening today.</p>
        </div>

        {/* Stat cards */}
        <div className="ss-stats-grid">
          {loading
            ? [1, 2, 3].map(i => <div key={i} className="ss-stat-skeleton" />)
            : statCards.length > 0
              ? statCards.map((stat, i) => <StatCard key={i} {...stat} />)
              : <p style={styles.empty}>No stats available.</p>
          }
        </div>

        {/* Bottom two columns */}
        <div className="ss-two-col">
          {/* Recent tasks */}
          <div className="ss-section">
            <h2 style={styles.sectionTitle}>Recent tasks</h2>
            <RecentActivity tasks={tasks} loading={loading} />
          </div>

          {/* Right column */}
          <div style={styles.rightCol}>
            <div className="ss-section">
              <h2 style={styles.sectionTitle}>Subject progress</h2>
              <p style={styles.empty}>No progress data yet.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  greeting: { marginBottom: '4px' },
  greetTitle: { fontSize: '26px', fontWeight: '700', color: '#0c2d4a', margin: '0 0 4px', letterSpacing: '-0.3px' },
  greetSub: { fontSize: '14px', color: '#5a7a96', margin: 0 },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#0c2d4a', margin: '0 0 16px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  empty: { fontSize: '13px', color: '#5a7a96', margin: 0, fontStyle: 'italic' },
}

export default Dashboard