const AssignmentCard = ({ assignment, role, userId, onDelete }) => {
  const isOverdue = (deadline) => new Date(deadline) < new Date()

  const formatDeadline = (dt) => {
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <>
      <style>{`
        .ac-card {
          background: #fff;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 8px;
          box-shadow: 0 1px 4px rgba(12,45,74,0.07);
          transition: box-shadow 0.2s;
        }
        .ac-card:hover { box-shadow: 0 4px 16px rgba(12,45,74,0.12); }
        .ac-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
        }
        .ac-title { font-size: 16px; font-weight: 700; color: #0c2d4a; margin: 0; }
        .ac-badge {
          font-size: 11px; font-weight: 700;
          background: rgba(245,158,11,0.12);
          color: #d97706; border-radius: 20px;
          padding: 3px 10px; white-space: nowrap;
        }
        .ac-desc { font-size: 13px; color: #4a7190; margin: 0; line-height: 1.5; }
        .ac-deadline {
          font-size: 12px; font-weight: 600;
          display: flex; align-items: center; gap: 6px;
        }
        .ac-deadline.overdue { color: #ef4444; }
        .ac-deadline.upcoming { color: #0284c7; }
        .ac-actions { display: flex; align-items: center; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
        .ac-download {
          padding: 7px 14px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: opacity 0.2s;
        }
        .ac-download:hover { opacity: 0.88; }
        .ac-delete {
          padding: 7px 14px; border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.08);
          color: #ef4444; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .ac-delete:hover { background: rgba(239,68,68,0.15); border-color: #ef4444; }
      `}</style>

      <div className="ac-card">
        <div className="ac-top">
          <p className="ac-title">{assignment.title}</p>
          <span className="ac-badge">{assignment.subject}</span>
        </div>

        <p className="ac-desc">{assignment.description}</p>

        <div className={`ac-deadline ${isOverdue(assignment.deadline) ? 'overdue' : 'upcoming'}`}>
          🕐 {isOverdue(assignment.deadline) ? 'Overdue' : 'Due'}: {formatDeadline(assignment.deadline)}
        </div>

        <div className="ac-actions">
          {assignment.file_url && (
            <a href={assignment.file_url} target="_blank" rel="noreferrer" className="ac-download">
              ⬇ Download Resource
            </a>
          )}
          {role === 'teacher' && assignment.created_by === userId && (
            <button className="ac-delete" onClick={() => onDelete(assignment.id)}>
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default AssignmentCard