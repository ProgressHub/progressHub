// src/components/cards/TaskCard.jsx
const TaskCard = ({ task, onComplete, onDelete }) => {
  const isCompleted = task.status === 'completed'

  const subjectColors = {
    Math: { bg: '#eff6ff', color: '#1d4ed8' },
    Science: { bg: '#f0fdf4', color: '#15803d' },
    English: { bg: '#fdf4ff', color: '#7e22ce' },
    History: { bg: '#fff7ed', color: '#c2410c' },
    Physics: { bg: '#f0f9ff', color: '#0369a1' },
    Chemistry: { bg: '#fefce8', color: '#a16207' },
    Biology: { bg: '#f0fdf4', color: '#166534' },
  }

  const subjectStyle = subjectColors[task.subject] || { bg: '#f1f5f9', color: '#475569' }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date()

  return (
    <>
      <style>{`
        .task-card {
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
          opacity: 1;
        }
        .task-card:hover { box-shadow: 0 6px 20px rgba(7,89,133,0.09); transform: translateY(-1px); }
        .task-card.completed { background: #f8fffe; border-color: #bbf7d0; opacity: 0.85; }
        .task-check-btn {
          width: 26px; height: 26px; border-radius: 50%;
          border: 2px solid #cbd5e1; background: transparent;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s ease; padding: 0;
        }
        .task-check-btn:hover { border-color: #22c55e; background: #f0fdf4; }
        .task-check-btn.done { border-color: #22c55e; background: #22c55e; }
        .task-info { flex: 1; min-width: 0; }
        .task-title {
          font-size: 14px; font-weight: 600;
          color: #0c2d4a; margin: 0 0 6px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .task-title.strikethrough { text-decoration: line-through; color: #94a3b8; }
        .task-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .task-subject-pill {
          font-size: 11px; font-weight: 600;
          padding: 2px 10px; border-radius: 20px; letter-spacing: 0.2px;
        }
        .task-due { font-size: 12px; color: #5a7a96; display: flex; align-items: center; gap: 4px; }
        .task-due.overdue { color: #e11d48; font-weight: 600; }
        .task-delete-btn {
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid #fee2e2; background: transparent;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s ease; padding: 0;
          color: #fca5a5; opacity: 0;
        }
        .task-card:hover .task-delete-btn { opacity: 1; }
        .task-delete-btn:hover { background: #fee2e2; color: #e11d48; border-color: #fca5a5; }
      `}</style>

      <div className={`task-card ${isCompleted ? 'completed' : ''}`}>
        {/* Complete button */}
        <button
          className={`task-check-btn ${isCompleted ? 'done' : ''}`}
          onClick={() => !isCompleted && onComplete(task.id)}
          title={isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {isCompleted && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Task info */}
        <div className="task-info">
          <p className={`task-title ${isCompleted ? 'strikethrough' : ''}`}>
            {task.title}
          </p>
          <div className="task-meta">
            <span
              className="task-subject-pill"
              style={{ background: subjectStyle.bg, color: subjectStyle.color }}
            >
              {task.subject}
            </span>
            <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {isOverdue ? 'Overdue · ' : ''}{formatDate(task.due_date)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          className="task-delete-btn"
          onClick={() => onDelete(task.id)}
          title="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </>
  )
}

export default TaskCard