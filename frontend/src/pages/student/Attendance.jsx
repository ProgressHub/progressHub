// src/pages/student/Attendance.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchStudentAttendance } from '../../services/attendanceService'

const statusColors = {
  present: { bg: '#f0fdf4', color: '#15803d', label: 'Present' },
  absent: { bg: '#fff1f2', color: '#e11d48', label: 'Absent' },
  late: { bg: '#fefce8', color: '#a16207', label: 'Late' },
}

const StudentAttendance = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const { data } = await fetchStudentAttendance(user.id)
      if (data) setRecords(data)
      setLoading(false)
    }
    load()
  }, [user])

  const attendancePercent = records.length > 0
    ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100)
    : 0

  const filteredRecords = records.filter(r => filter === 'all' || r.status === filter)

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <style>{`
        .sa-header { margin-bottom: 24px; }
        .sa-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0 0 4px; letter-spacing: -0.3px; }
        .sa-subtitle { font-size: 13px; color: #5a7a96; margin: 0; }
        .sa-percent-card {
          background: #fff; border: 1px solid #dbeafe; border-radius: 14px;
          padding: 28px; margin-bottom: 20px; text-align: center;
          box-shadow: 0 1px 3px rgba(12,45,74,0.05);
          display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
        }
        .sa-percent-circle {
          width: 90px; height: 90px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sa-percent-value { font-size: 32px; font-weight: 800; }
        .sa-percent-label { font-size: 13px; color: #5a7a96; margin-top: 4px; }
        .sa-stats { display: flex; gap: 16px; flex-wrap: wrap; flex: 1; }
        .sa-stat { text-align: center; flex: 1; min-width: 80px; }
        .sa-stat-value { font-size: 22px; font-weight: 700; color: #0c2d4a; }
        .sa-stat-label { font-size: 12px; color: #5a7a96; margin-top: 2px; }
        .sa-filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .sa-filter-btn {
          padding: 7px 16px; border-radius: 20px; border: 1.5px solid #dbeafe;
          background: transparent; font-size: 13px; font-weight: 600; color: #5a7a96;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .sa-filter-btn:hover { background: #f1f8ff; color: #0c2d4a; }
        .sa-filter-btn.active { background: #075985; color: #fff; border-color: #075985; }
        .sa-section { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 22px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .sa-table { width: 100%; border-collapse: collapse; }
        .sa-table th { text-align: left; font-size: 11px; font-weight: 700; color: #5a7a96; text-transform: uppercase; letter-spacing: 0.4px; padding: 8px 12px; border-bottom: 1px solid #dbeafe; }
        .sa-table td { padding: 13px 12px; font-size: 14px; color: #0c2d4a; border-bottom: 1px solid #f1f8ff; }
        .sa-table tr:last-child td { border-bottom: none; }
        .sa-table tr:hover td { background: #f8fbff; }
        .sa-status-pill { font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 20px; display: inline-block; }
        .sa-skeleton { height: 52px; border-radius: 8px; margin-bottom: 8px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
        .sa-percent-skeleton { height: 120px; border-radius: 14px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; margin-bottom: 20px; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .sa-empty { text-align: center; padding: 40px; font-size: 14px; color: #5a7a96; font-style: italic; }
      `}</style>

      <div>
        <div className="sa-header">
          <h1 className="sa-title">My Attendance</h1>
          <p className="sa-subtitle">View your attendance history and percentage.</p>
        </div>

        {/* Percent card */}
        {loading ? <div className="sa-percent-skeleton" /> : (
          <div className="sa-percent-card">
            <div className="sa-percent-circle" style={{
              background: attendancePercent >= 75 ? '#f0fdf4' : attendancePercent >= 50 ? '#fefce8' : '#fff1f2',
            }}>
              <div>
                <div className="sa-percent-value" style={{
                  color: attendancePercent >= 75 ? '#15803d' : attendancePercent >= 50 ? '#a16207' : '#e11d48'
                }}>
                  {attendancePercent}%
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0c2d4a' }}>Overall Attendance</div>
              <div style={{ fontSize: '13px', color: '#5a7a96', marginTop: '4px' }}>Based on {records.length} records</div>
            </div>
            <div className="sa-stats">
              <div className="sa-stat">
                <div className="sa-stat-value" style={{ color: '#15803d' }}>{records.filter(r => r.status === 'present').length}</div>
                <div className="sa-stat-label">Present</div>
              </div>
              <div className="sa-stat">
                <div className="sa-stat-value" style={{ color: '#e11d48' }}>{records.filter(r => r.status === 'absent').length}</div>
                <div className="sa-stat-label">Absent</div>
              </div>
              <div className="sa-stat">
                <div className="sa-stat-value" style={{ color: '#a16207' }}>{records.filter(r => r.status === 'late').length}</div>
                <div className="sa-stat-label">Late</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="sa-filter-bar">
          {['all', 'present', 'absent', 'late'].map(f => (
            <button
              key={f}
              className={`sa-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* History table */}
        <div className="sa-section">
          {loading ? (
            [1,2,3,4,5].map(i => <div key={i} className="sa-skeleton" />)
          ) : filteredRecords.length > 0 ? (
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.date)}</td>
                    <td>{r.subject}</td>
                    <td>
                      <span
                        className="sa-status-pill"
                        style={{ background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}
                      >
                        {statusColors[r.status]?.label || r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sa-empty">
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
              {filter === 'all' ? 'No attendance records yet.' : `No ${filter} records found.`}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default StudentAttendance