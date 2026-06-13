// src/pages/student/quiz/QuizList.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAllQuizzes } from '../../../services/quizService'

const StudentQuizList = () => {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await fetchAllQuizzes()
      if (data) setQuizzes(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <style>{`
        .sql-header { margin-bottom: 24px; }
        .sql-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0 0 4px; letter-spacing: -0.3px; }
        .sql-subtitle { font-size: 13px; color: #5a7a96; margin: 0; }
        .sql-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .sql-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); transition: all 0.2s ease; }
        .sql-card:hover { box-shadow: 0 6px 20px rgba(7,89,133,0.09); transform: translateY(-2px); }
        .sql-card-title { font-size: 15px; font-weight: 700; color: #0c2d4a; margin: 0 0 8px; }
        .sql-card-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .sql-subject-pill { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; }
        .sql-count-pill { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #f0fdf4; color: #15803d; }
        .sql-btn-attempt { width: 100%; padding: 10px; border: none; border-radius: 10px; background: #075985; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-family: inherit; }
        .sql-btn-attempt:hover { background: #0c2d4a; }
        .sql-skeleton { height: 140px; border-radius: 14px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .sql-empty { text-align: center; padding: 48px; background: #fff; border: 1px solid #dbeafe; border-radius: 14px; font-size: 14px; color: #5a7a96; font-style: italic; }
      `}</style>

      <div>
        <div className="sql-header">
          <h1 className="sql-title">Available Quizzes</h1>
          <p className="sql-subtitle">Attempt quizzes assigned by your teachers</p>
        </div>

        {loading ? (
          <div className="sql-grid">{[1,2,3].map(i => <div key={i} className="sql-skeleton" />)}</div>
        ) : quizzes.length > 0 ? (
          <div className="sql-grid">
            {quizzes.map(q => (
              <div key={q.id} className="sql-card">
                <p className="sql-card-title">{q.title}</p>
                <div className="sql-card-meta">
                  <span className="sql-subject-pill">{q.subject}</span>
                  <span className="sql-count-pill">{q.questions?.[0]?.count || 0} Questions</span>
                </div>
                <button className="sql-btn-attempt" onClick={() => navigate(`/student/quizzes/${q.id}`)}>
                  Attempt Quiz
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="sql-empty">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            No quizzes available yet.
          </div>
        )}
      </div>
    </>
  )
}

export default StudentQuizList