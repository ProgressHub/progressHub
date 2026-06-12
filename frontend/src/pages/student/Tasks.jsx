// src/pages/student/Tasks.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import TaskCard from '../../components/cards/TaskCard'
import TaskFormModal from '../../components/TaskFormModal'
import { fetchTasks, createTask, updateTaskStatus, deleteTask } from '../../services/studentService'

const Tasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    loadTasks()
  }, [user])

  const loadTasks = async () => {
    setLoading(true)
    const { data } = await fetchTasks(user.id)
    if (data) setTasks(data)
    setLoading(false)
  }

  const handleComplete = async (taskId) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t)
    )
    const { error } = await updateTaskStatus(taskId, 'completed')
    if (error) {
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: 'pending' } : t)
      )
    }
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    const { data, error } = await createTask(user.id, formData)
    if (!error && data) {
      setTasks(prev => [data, ...prev])
      setModalOpen(false)
    }
    setSubmitting(false)
  }

  const handleDelete = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    const { error } = await deleteTask(taskId)
    if (error) {
      loadTasks()
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending'
    if (filter === 'completed') return t.status === 'completed'
    return true
  })

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <>
      <style>{`
        .tasks-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
        }
        .tasks-title {
          font-size: 22px; font-weight: 700;
          color: #0c2d4a; margin: 0; letter-spacing: -0.3px;
        }
        .tasks-subtitle { font-size: 13px; color: #5a7a96; margin: 4px 0 0; }
        .btn-add-task {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 10px;
          border: none; background: #075985; color: #fff;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
          font-family: inherit; white-space: nowrap;
        }
        .btn-add-task:hover { background: #0c2d4a; transform: translateY(-1px); }
        .tasks-filter-bar {
          display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .filter-btn {
          padding: 7px 16px; border-radius: 20px;
          border: 1.5px solid #dbeafe; background: transparent;
          font-size: 13px; font-weight: 600; color: #5a7a96;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .filter-btn:hover { background: #f1f8ff; color: #0c2d4a; }
        .filter-btn.active { background: #075985; color: #fff; border-color: #075985; }
        .tasks-grid { display: flex; flex-direction: column; gap: 10px; }
        .tasks-skeleton {
          height: 72px; border-radius: 14px;
          background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .tasks-empty {
          text-align: center; padding: 48px 20px;
          background: #fff; border: 1px solid #dbeafe; border-radius: 14px;
        }
        .tasks-empty-icon { font-size: 36px; margin-bottom: 12px; }
        .tasks-empty-text { font-size: 14px; color: #5a7a96; margin: 0; font-style: italic; }
        .tasks-stats { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat-pill {
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
          display: flex; align-items: center; gap: 6px;
        }
        @media (max-width: 480px) {
          .tasks-title { font-size: 18px; }
          .btn-add-task { padding: 9px 14px; font-size: 13px; }
        }
      `}</style>

      <div>
        {/* Header */}
        <div className="tasks-header">
          <div>
            <h1 className="tasks-title">My Tasks</h1>
            <p className="tasks-subtitle">Track and manage your pending work</p>
          </div>
          <button className="btn-add-task" onClick={() => setModalOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Stats pills */}
        {!loading && tasks.length > 0 && (
          <div className="tasks-stats">
            <span className="stat-pill" style={{ background: '#fff7ed', color: '#c2410c' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {pendingCount} Pending
            </span>
            <span className="stat-pill" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {completedCount} Completed
            </span>
          </div>
        )}

        {/* Filter bar */}
        <div className="tasks-filter-bar">
          {['all', 'pending', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="tasks-grid">
          {loading
            ? [1, 2, 3, 4].map(i => <div key={i} className="tasks-skeleton" />)
            : filteredTasks.length > 0
              ? filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))
              : (
                <div className="tasks-empty">
                  <div className="tasks-empty-icon">
                    {filter === 'completed' ? '✅' : '📋'}
                  </div>
                  <p className="tasks-empty-text">
                    {filter === 'completed'
                      ? 'No completed tasks yet.'
                      : filter === 'pending'
                      ? "No pending tasks. You're all caught up!"
                      : 'No tasks yet. Add your first task!'}
                  </p>
                </div>
              )
          }
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskFormModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </>
  )
}

export default Tasks