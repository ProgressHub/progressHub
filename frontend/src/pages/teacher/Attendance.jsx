// src/pages/teacher/Attendance.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchAllStudents, bulkMarkAttendance } from '../../services/attendanceService'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Computer Science']

const TeacherAttendance = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [subject, setSubject] = useState('')
  const [attendance, setAttendance] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await fetchAllStudents()
      if (data) {
        setStudents(data)
        const initial = {}
        data.forEach(s => { initial[s.id] = 'present' })
        setAttendance(initial)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    if (!subject) { alert('Please select a subject!'); return }
    setSaving(true)
    const records = students.map(s => ({
      student_id: s.id,
      teacher_id: user.id,
      date,
      subject,
      status: attendance[s.id] || 'present',
    }))
    const { error } = await bulkMarkAttendance(records)
    if (!error) setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  return (
    <>
      <style>{`
        .ta-header { margin-bottom: 24px; }
        .ta-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0 0 4px; letter-spacing: -0.3px; }
        .ta-subtitle { font-size: 13px; color: #5a7a96; margin: 0; }
        .ta-controls {
          display: flex; gap: 16px; flex-wrap: wrap;
          background: #fff; border: 1px solid #dbeafe;
          border-radius: 14px; padding: 20px;
          box-shadow: 0 1px 3px rgba(12,45,74,0.05);
          margin-bottom: 20px;
        }
        .ta-control-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 180px; }
        .ta-label { font-size: 12px; font-weight: 600; color: #5a7a96; text-transform: uppercase; letter-spacing: 0.3px; }
        .ta-input, .ta-select {
          padding: 10px 14px; border: 1.5px solid #dbeafe;
          border-radius: 10px; font-size: 14px; color: #0c2d4a;
          background: #f8fbff; outline: none; font-family: inherit;
          transition: border-color 0.15s ease;
        }
        .ta-input:focus, .ta-select:focus { border-color: #075985; background: #fff; }
        .ta-section {
          background: #fff; border: 1px solid #dbeafe;
          border-radius: 14px; padding: 22px;
          box-shadow: 0 1px 3px rgba(12,45,74,0.05);
          margin-bottom: 20px;
        }
        .ta-section-title { font-size: 15px; font-weight: 700; color: #0c2d4a; margin: 0 0 16px; }
        .ta-table { width: 100%; border-collapse: collapse; }
        .ta-table th {
          text-align: left; font-size: 11px; font-weight: 700;
          color: #5a7a96; text-transform: uppercase; letter-spacing: 0.4px;
          padding: 8px 12px; border-bottom: 1px solid #dbeafe;
        }
        .ta-table td { padding: 13px 12px; font-size: 14px; color: #0c2d4a; border-bottom: 1px solid #f1f8ff; }
        .ta-table tr:last-child td { border-bottom: none; }
        .ta-table tr:hover td { background: #f8fbff; }
        .ta-radio-group { display: flex; gap: 16px; flex-wrap: wrap; }
        .ta-radio-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          padding: 6px 12px; border-radius: 8px;
          border: 1.5px solid #dbeafe; transition: all 0.15s ease;
          white-space: nowrap;
        }
        .ta-radio-label.present.selected { background: #f0fdf4; border-color: #22c55e; color: #15803d; }
        .ta-radio-label.absent.selected { background: #fff1f2; border-color: #e11d48; color: #e11d48; }
        .ta-radio-label.late.selected { background: #fefce8; border-color: #f59e0b; color: #a16207; }
        .ta-radio-label input { display: none; }
        .ta-btn-save {
          padding: 12px 28px; border: none; border-radius: 10px;
          background: #075985; color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .ta-btn-save:hover:not(:disabled) { background: #0c2d4a; transform: translateY(-1px); }
        .ta-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .ta-btn-save.saved { background: #15803d; }
        .ta-skeleton { height: 52px; border-radius: 8px; margin-bottom: 8px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @media (max-width: 600px) {
          .ta-radio-group { gap: 8px; }
          .ta-radio-label { padding: 5px 8px; font-size: 12px; }
        }
      `}</style>

      <div>
        <div className="ta-header">
          <h1 className="ta-title">Mark Attendance</h1>
          <p className="ta-subtitle">Select date and subject, then mark each student's status.</p>
        </div>

        {/* Controls */}
        <div className="ta-controls">
          <div className="ta-control-group">
            <label className="ta-label">Date</label>
            <input className="ta-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="ta-control-group">
            <label className="ta-label">Subject</label>
            <select className="ta-select" value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Student table */}
        <div className="ta-section">
          <h2 className="ta-section-title">Students</h2>
          {loading ? (
            [1,2,3,4,5].map(i => <div key={i} className="ta-skeleton" />)
          ) : students.length > 0 ? (
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '600' }}>{s.full_name}</td>
                    <td>
                      <div className="ta-radio-group">
                        {['present', 'absent', 'late'].map(status => (
                          <label
                            key={status}
                            className={`ta-radio-label ${status} ${attendance[s.id] === status ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`status-${s.id}`}
                              value={status}
                              checked={attendance[s.id] === status}
                              onChange={() => handleStatus(s.id, status)}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#5a7a96', fontStyle: 'italic' }}>No students found.</p>
          )}
        </div>

        {/* Save button */}
        <button
          className={`ta-btn-save ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? 'Saving...' : saved ? '✓ Attendance Saved!' : 'Save Attendance'}
        </button>
      </div>
    </>
  )
}

export default TeacherAttendance