// src/components/RecentActivity.jsx

const subjectColors = {
  Maths:   { bg: '#fff7e6', text: '#f59e0b' },
  Science: { bg: '#e0f2fe', text: '#075985' },
  English: { bg: '#f0fdf4', text: '#16a34a' },
  History: { bg: '#fdf4ff', text: '#9333ea' },
  default: { bg: '#f1f5f9', text: '#475569' },
}

const formatDue = (dateStr) => {
  if (!dateStr) return '—'
  const due = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (due.toDateString() === today.toDateString()) return 'Today'
  if (due.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const RecentActivity = ({ tasks = [], loading = false }) => {
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={styles.skeleton} />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <p style={styles.empty}>No recent tasks.</p>
  }

  return (
    <>
      <style>{`
        .ra-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 14px; background: #f1f8ff;
          border-radius: 10px; border: 1px solid #e0eef9;
          transition: all 0.2s ease;
        }
        .ra-row:hover {
          background: #fff7e6; border-color: #f59e0b;
          transform: translateX(4px);
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      <div style={styles.list}>
        {tasks.map((task) => {
          const color = subjectColors[task.subject] || subjectColors.default
          const dueLabel = formatDue(task.due_date)
          const isToday = dueLabel === 'Today'

          return (
            <div key={task.id} className="ra-row">
              <div style={styles.left}>
                <span style={{
                  ...styles.subjectBadge,
                  backgroundColor: color.bg,
                  color: color.text,
                }}>
                  {task.subject || 'General'}
                </span>
                <span style={styles.title}>{task.title}</span>
              </div>
              <span style={{
                ...styles.dueBadge,
                backgroundColor: isToday ? '#fff7e6' : '#dbeafe',
                color: isToday ? '#f59e0b' : '#075985',
                fontWeight: isToday ? 700 : 500,
              }}>
                {dueLabel}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  left: { display: 'flex', flexDirection: 'column', gap: '3px' },
  subjectBadge: {
    fontSize: '11px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.6px',
    padding: '1px 0', background: 'none',
  },
  title: { fontSize: '13px', color: '#0c2d4a', fontWeight: '500' },
  dueBadge: {
    fontSize: '11px', padding: '4px 11px',
    borderRadius: '20px', flexShrink: 0,
  },
  loadingWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  skeleton: {
    height: '46px', borderRadius: '10px',
    background: 'linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s infinite linear',
  },
  empty: { fontSize: '13px', color: '#5a7a96', margin: 0, fontStyle: 'italic' },
}

export default RecentActivity