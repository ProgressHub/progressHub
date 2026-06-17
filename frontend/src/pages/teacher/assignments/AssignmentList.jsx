// src/pages/teacher/assignments/AssignmentList.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAssignments, deleteAssignment } from '../../../services/assignmentService'
import DeleteConfirmModal from '../../../components/teacher/DeleteConfirmModal'

const AssignmentList = () => {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await fetchAssignments()
    if (data) setAssignments(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteAssignment(deleteId)
    if (!error) setAssignments(prev => prev.filter(a => a.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <style>{`
        .al-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .al-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; letter-spacing: -0.3px; }
        .al-subtitle { font-size: 13px; color: #5a7a96; margin: 4px 0 0; }
        .btn-create {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 10px;
          border: none; background: #075985; color: #fff;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.15s ease; font-family: inherit; white-space: nowrap;
        }
        .btn-create:hover { background: #0c2d4a; transform: translateY(-1px); }
        .al-section { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 22px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .al-table { width: 100%; border-collapse: collapse; }
        .al-table th {
          text-align: left; font-size: 11px; font-weight: 700;
          color: #5a7a96; text-transform: uppercase; letter-spacing: 0.4px;
          padding: 8px 12px; border-bottom: 1px solid #dbeafe;
        }
        .al-table td { padding: 13px 12px; font-size: 14px; color: #0c2d4a; border-bottom: 1px solid #f1f8ff; }
        .al-table tr:last-child td { border-bottom: none; }
        .al-table tr:hover td { background: #f8fbff; }
        .al-subject-pill { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; }
        .al-actions { display: flex; gap: 8px; }
        .al-btn-view, .al-btn-edit, .al-btn-delete {
          padding: 6px 12px; border-radius: 7px; font-size: 12px;
          font-weight: 600; cursor: pointer; border: none;
          transition: all 0.15s ease; font-family: inherit;
        }
        .al-btn-view { background: #eff6ff; color: #075985; }
        .al-btn-view:hover { background: #dbeafe; }
        .al-btn-edit { background: #fefce8; color: #a16207; }
        .al-btn-edit:hover { background: #fef9c3; }
        .al-btn-delete { background: #fee2e2; color: #e11d48; }
        .al-btn-delete:hover { background: #fecdd3; }
        .al-skeleton { height: 52px; border-radius: 8px; margin-bottom: 8px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .al-empty { text-align: center; padding: 40px; font-size: 14px; color: #5a7a96; font-style: italic; }
        @media (max-width: 600px) {
          .al-table th:nth-child(3), .al-table td:nth-child(3),
          .al-table th:nth-child(4), .al-table td:nth-child(4) { display: none; }
        }
      `}</style>

      <div>
        <div className="al-header">
          <div>
            <h1 className="al-title">Assignments</h1>
            <p className="al-subtitle">Manage all your assignments</p>
          </div>
          <button className="btn-create" onClick={() => navigate('/teacher/assignments/create')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Assignment
          </button>
        </div>

        <div className="al-section">
          {loading ? (
            [1,2,3,4,5].map(i => <div key={i} className="al-skeleton" />)
          ) : assignments.length > 0 ? (
            <table className="al-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Deadline</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '600' }}>{a.title}</td>
                    <td><span className="al-subject-pill">{a.subject}</span></td>
                    <td style={{ color: '#5a7a96' }}>{formatDate(a.deadline)}</td>
                    <td style={{ color: '#5a7a96' }}>{formatDate(a.created_at)}</td>
                    <td>
                      <div className="al-actions">
                        <button className="al-btn-view" onClick={() => navigate(`/teacher/assignments/${a.id}`)}>View</button>
                        <button className="al-btn-edit" onClick={() => navigate(`/teacher/assignments/${a.id}/edit`)}>Edit</button>
                        <button className="al-btn-delete" onClick={() => setDeleteId(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="al-empty">
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              No assignments yet. Create your first one!
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  )
}

export default AssignmentList