// src/pages/teacher/assignments/ViewAssignment.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAssignmentById } from '../../../services/assignmentService'

const ViewAssignment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await fetchAssignmentById(id)
      if (data) setAssignment(data)
      setLoading(false)
    }
    load()
  }, [id])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <style>{`
        .va-wrap { max-width: 600px; }
        .va-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .va-back {
          width: 34px; height: 34px; border-radius: 9px;
          border: 1.5px solid #dbeafe; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #5a7a96; transition: all 0.15s ease;
        }
        .va-back:hover { background: #f1f8ff; color: #0c2d4a; }
        .va-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; }
        .va-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 28px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .va-field { margin-bottom: 20px; }
        .va-label { font-size: 11px; font-weight: 700; color: #5a7a96; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .va-value { font-size: 15px; color: #0c2d4a; font-weight: 500; }
        .va-description { font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap; }
        .va-subject-pill { font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; display: inline-block; }
        .va-divider { height: 1px; background: #f1f8ff; margin: 4px 0 20px; }
        .va-skeleton { height: 300px; border-radius: 14px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .va-actions { display: flex; gap: 10px; margin-top: 24px; }
        .va-btn-edit {
          padding: 10px 20px; border-radius: 10px; border: none;
          background: #075985; color: #fff; font-size: 14px;
          font-weight: 600; cursor: pointer; font-family: inherit;
          transition: all 0.15s ease;
        }
        .va-btn-edit:hover { background: #0c2d4a; }
      `}</style>

      <div className="va-wrap">
        <div className="va-header">
          <button className="va-back" onClick={() => navigate('/teacher/assignments')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="va-title">View Assignment</h1>
        </div>

        {loading ? <div className="va-skeleton" /> : assignment ? (
          <div className="va-card">
            <div className="va-field">
              <div className="va-label">Title</div>
              <div className="va-value" style={{ fontSize: '18px', fontWeight: '700' }}>{assignment.title}</div>
            </div>
            <div className="va-divider" />

            <div className="va-field">
              <div className="va-label">Subject</div>
              <span className="va-subject-pill">{assignment.subject || '—'}</span>
            </div>

            <div className="va-field">
              <div className="va-label">Description</div>
              <div className="va-description">{assignment.description || '—'}</div>
            </div>

            <div className="va-field">
              <div className="va-label">Deadline</div>
              <div className="va-value">{formatDate(assignment.deadline)}</div>
            </div>

            <div className="va-field">
              <div className="va-label">Created At</div>
              <div className="va-value">{formatDate(assignment.created_at)}</div>
            </div>

            <div className="va-actions">
              <button className="va-btn-edit" onClick={() => navigate(`/teacher/assignments/${id}/edit`)}>
                Edit Assignment
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#5a7a96' }}>Assignment not found.</p>
        )}
      </div>
    </>
  )
}

export default ViewAssignment