// src/pages/teacher/quiz/QuizList.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { fetchTeacherQuizzes } from '../../../services/quizService'

const TeacherQuizList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const { data } = await fetchTeacherQuizzes(user.id)
      if (data) setQuizzes(data)
      setLoading(false)
    }
    load()
  }, [user])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <style>{`
        .tql-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .tql-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; letter-spacing: -0.3px; }
        .tql-subtitle { font-size: 13px; color: #5a7a96; margin: 4px 0 0; }
        .btn-create { display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 10px; border: none; background: #075985; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-family: inherit; white-space: nowrap; }
        .btn-create:hover { background: #0c2d4a; transform: translateY(-1px); }
        .tql-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .tql-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); transition: all 0.2s ease; }
        .tql-card:hover { box-shadow: 0 6px 20px rgba(7,89,133,0.09); transform: translateY(-2px); }
        .tql-card-title { font-size: 15px; font-weight: 700; color: #0c2d4a; margin: 0 0 8px; }
        .tql-card-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .tql-subject-pill { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; }
        .tql-count-pill { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #f0fdf4; color: #15803d; }
        .tql-date { font-size: 12px; color: #5a7a96; margin-bottom: 16px; }
        .tql-skeleton { height: 140px; border-radius: 14px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .tql-empty { text-align: center; padding: 48px; background: #fff; border: 1px solid #dbeafe; border-radius: 14px; font-size: 14px; color: #5a7a96; font-style: italic; }
      `}</style>

      <div>
        <div className="tql-header">
          <div>
            <h1 className="tql-title">My Quizzes</h1>
            <p className="tql-subtitle">Create and manage your quizzes</p>
          </div>
          <button className="btn-create" onClick={() => navigate('/teacher/quizzes/create')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Quiz
          </button>
        </div>

        {loading ? (
          <div className="tql-grid">{[1,2,3].map(i => <div key={i} className="tql-skeleton" />)}</div>
        ) : quizzes.length > 0 ? (
          <div className="tql-grid">
            {quizzes.map(q => (
              <div key={q.id} className="tql-card">
                <p className="tql-card-title">{q.title}</p>
                <div className="tql-card-meta">
                  <span className="tql-subject-pill">{q.subject}</span>
                  <span className="tql-count-pill">{q.questions?.[0]?.count || 0} Questions</span>
                </div>
                <p className="tql-date">Created {formatDate(q.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="tql-empty">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            No quizzes yet. Create your first quiz!
          </div>
        )}
      </div>
    </>
  )
}

export default TeacherQuizList