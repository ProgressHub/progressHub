import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AssignmentCard from '../../components/cards/AssignmentCard'
import AssignmentFormModal from '../../components/AssignmentFormModal'
import { fetchAssignments, createAssignment, deleteAssignment } from '../../services/assignmentService'

const Assignments = () => {
  const { user, role } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const loadAssignments = async () => {
    setLoading(true)
    const { data, error } = await fetchAssignments()
    if (error) setError('Failed to load assignments.')
    else setAssignments(data)
    setLoading(false)
  }

  useEffect(() => { loadAssignments() }, [])

  const handleCreate = async (form, file) => {
    setSubmitting(true)
    const { error } = await createAssignment({ ...form, created_by: user.id }, file)
    if (error) setError('Failed to add assignment.')
    else { setShowModal(false); await loadAssignments() }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    const { error } = await deleteAssignment(id)
    if (error) setError('Failed to delete.')
    else setAssignments(prev => prev.filter(a => a.id !== id))
  }

  return (
    <>
      <style>{`
        .asgn-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
        }
        .asgn-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; }
        .asgn-add-btn {
          padding: 10px 20px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s;
        }
        .asgn-add-btn:hover { opacity: 0.88; }
        .asgn-empty { text-align: center; color: #7a9ab5; padding: 60px 20px; font-size: 15px; }
        .asgn-grid { display: flex; flex-direction: column; gap: 14px; }
        .asgn-error {
          font-size: 13px; color: #f87171;
          background: rgba(248,113,113,0.1);
          border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;
        }
        .asgn-loading { text-align: center; color: #7a9ab5; padding: 60px 20px; font-size: 15px; }
      `}</style>

      <div>
        <div className="asgn-header">
          <h1 className="asgn-title">📚 Assignments</h1>
          {role === 'teacher' && (
            <button className="asgn-add-btn" onClick={() => setShowModal(true)}>
              + Add Assignment
            </button>
          )}
        </div>

        {error && <div className="asgn-error">⚠️ {error}</div>}

        {loading ? (
          <div className="asgn-loading">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="asgn-empty">No assignments yet.</div>
        ) : (
          <div className="asgn-grid">
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                role={role}
                userId={user.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AssignmentFormModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          loading={submitting}
        />
      )}
    </>
  )
}

export default Assignments