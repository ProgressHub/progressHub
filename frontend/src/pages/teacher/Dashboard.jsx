// src/pages/teacher/Dashboard.jsx
import { useEffect, useState } from 'react'
import { fetchTeacherDashboardStats, fetchAssignments } from '../../services/assignmentService'

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [statsRes, assignmentsRes] = await Promise.all([
        fetchTeacherDashboardStats(),
        fetchAssignments(),
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (assignmentsRes.data) setAssignments(assignmentsRes.data.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const statCards = stats ? [
    {
      title: 'Total Assignments',
      value: stats.total_assignments ?? 0,
      accentColor: '#075985',
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
      title: 'Total Students',
      value: stats.total_students ?? 0,
      accentColor: '#15803d',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      title: 'Pending Tasks',
      value: stats.system_pending_tasks ?? 0,
      accentColor: '#f59e0b',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
  ] : []

  return (
    <>
      <style>{`
        .td-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }
        .td-stat-card {
          background: #fff; border: 1px solid #dbeafe;
          border-radius: 14px; padding: 20px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 1px 3px rgba(12,45,74,0.05);
          transition: all 0.25s ease;
        }
        .td-stat-card:hover { box-shadow: 0 10px 28px rgba(7,89,133,0.10); transform: translateY(-2px); }
        .td-stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .td-stat-value { font-size: 28px; font-weight: 800; color: #0c2d4a; line-height: 1; }
        .td-stat-title { font-size: 13px; color: #5a7a96; margin-top: 4px; }
        .td-section {
          background: #fff; border: 1px solid #dbeafe;
          border-radius: 14px; padding: 22px;
          box-shadow: 0 1px 3px rgba(12,45,74,0.05);
        }
        .td-section-title {
          font-size: 15px; font-weight: 700;
          color: #0c2d4a; margin: 0 0 16px;
        }
        .td-table { width: 100%; border-collapse: collapse; }
        .td-table th {
          text-align: left; font-size: 11px; font-weight: 700;
          color: #5a7a96; text-transform: uppercase;
          letter-spacing: 0.4px; padding: 8px 12px;
          border-bottom: 1px solid #dbeafe;
        }
        .td-table td {
          padding: 12px; font-size: 14px; color: #0c2d4a;
          border-bottom: 1px solid #f1f8ff;
        }
        .td-table tr:last-child td { border-bottom: none; }
        .td-table tr:hover td { background: #f8fbff; }
        .td-subject-pill {
          font-size: 11px; font-weight: 600;
          padding: 2px 10px; border-radius: 20px;
          background: #eff6ff; color: #1d4ed8;
        }
        .td-skeleton {
          height: 90px; border-radius: 14px;
          background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .td-row-skeleton {
          height: 44px; border-radius: 8px; margin-bottom: 8px;
          background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .td-empty { font-size: 13px; color: #5a7a96; font-style: italic; }
        @media (max-width: 600px) {
          .td-table th:nth-child(3), .td-table td:nth-child(3) { display: none; }
        }
      `}</style>

      <div>
        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c2d4a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Welcome back 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#5a7a96', margin: 0 }}>
            Here's your teaching overview for today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="td-stats-grid">
          {loading
            ? [1, 2, 3].map(i => <div key={i} className="td-skeleton" />)
            : statCards.map((card, i) => (
              <div key={i} className="td-stat-card">
                <div className="td-stat-icon" style={{ background: `${card.accentColor}18`, color: card.accentColor }}>
                  {card.icon}
                </div>
                <div>
                  <div className="td-stat-value">{card.value}</div>
                  <div className="td-stat-title">{card.title}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Recent assignments */}
        <div className="td-section">
          <h2 className="td-section-title">Recent Assignments</h2>
          {loading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="td-row-skeleton" />)
          ) : assignments.length > 0 ? (
            <table className="td-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '600' }}>{a.title}</td>
                    <td><span className="td-subject-pill">{a.subject}</span></td>
                    <td style={{ color: '#5a7a96' }}>{formatDate(a.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="td-empty">No assignments yet.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default TeacherDashboard