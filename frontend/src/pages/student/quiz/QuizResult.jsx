// src/pages/student/quiz/QuizResult.jsx
import { useLocation, useNavigate } from 'react-router-dom'

const QuizResult = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const score = state?.score ?? 0
  const total = state?.total ?? 0
  const quizTitle = state?.quizTitle ?? 'Quiz'
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const incorrect = total - score

  const getGrade = () => {
    if (percentage >= 90) return { label: 'Excellent!', color: '#15803d', bg: '#f0fdf4' }
    if (percentage >= 75) return { label: 'Good Job!', color: '#075985', bg: '#eff6ff' }
    if (percentage >= 50) return { label: 'Keep Practicing!', color: '#a16207', bg: '#fefce8' }
    return { label: 'Need Improvement', color: '#e11d48', bg: '#fff1f2' }
  }

  const grade = getGrade()

  return (
    <>
      <style>{`
        .qr-wrap { max-width: 500px; margin: 0 auto; }
        .qr-card { background: #fff; border: 1px solid #dbeafe; border-radius: 18px; padding: 36px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); text-align: center; margin-bottom: 16px; }
        .qr-emoji { font-size: 48px; margin-bottom: 12px; }
        .qr-grade { font-size: 18px; font-weight: 700; padding: 6px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .qr-quiz-title { font-size: 14px; color: #5a7a96; margin-bottom: 24px; }
        .qr-score-big { font-size: 52px; font-weight: 800; color: #0c2d4a; line-height: 1; margin-bottom: 4px; }
        .qr-score-label { font-size: 14px; color: #5a7a96; margin-bottom: 24px; }
        .qr-percent { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .qr-stats { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
        .qr-stat { flex: 1; min-width: 100px; padding: 14px; border-radius: 12px; }
        .qr-stat-value { font-size: 24px; font-weight: 700; }
        .qr-stat-label { font-size: 12px; margin-top: 4px; }
        .qr-divider { height: 1px; background: #f1f8ff; margin: 0 0 24px; }
        .qr-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; background: #075985; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-family: inherit; }
        .qr-btn:hover { background: #0c2d4a; }
        .qr-btn-outline { width: 100%; padding: 12px; border: 1.5px solid #dbeafe; border-radius: 10px; background: transparent; color: #5a7a96; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-family: inherit; margin-top: 10px; }
        .qr-btn-outline:hover { background: #f1f8ff; color: #0c2d4a; }
      `}</style>

      <div className="qr-wrap">
        <div className="qr-card">
          <div className="qr-emoji">
            {percentage >= 90 ? '🏆' : percentage >= 75 ? '🎉' : percentage >= 50 ? '💪' : '📚'}
          </div>
          <div className="qr-grade" style={{ background: grade.bg, color: grade.color }}>
            {grade.label}
          </div>
          <p className="qr-quiz-title">{quizTitle}</p>

          <div className="qr-score-big">{score}<span style={{ fontSize: '28px', color: '#5a7a96' }}>/{total}</span></div>
          <p className="qr-score-label">Questions Correct</p>

          <div className="qr-percent" style={{ color: grade.color }}>{percentage}%</div>

          <div className="qr-divider" />

          <div className="qr-stats">
            <div className="qr-stat" style={{ background: '#f0fdf4' }}>
              <div className="qr-stat-value" style={{ color: '#15803d' }}>{score}</div>
              <div className="qr-stat-label" style={{ color: '#15803d' }}>Correct</div>
            </div>
            <div className="qr-stat" style={{ background: '#fff1f2' }}>
              <div className="qr-stat-value" style={{ color: '#e11d48' }}>{incorrect}</div>
              <div className="qr-stat-label" style={{ color: '#e11d48' }}>Incorrect</div>
            </div>
            <div className="qr-stat" style={{ background: '#eff6ff' }}>
              <div className="qr-stat-value" style={{ color: '#075985' }}>{percentage}%</div>
              <div className="qr-stat-label" style={{ color: '#075985' }}>Score</div>
            </div>
          </div>
        </div>

        <button className="qr-btn" onClick={() => navigate('/student/quizzes')}>Back to Quizzes</button>
        <button className="qr-btn-outline" onClick={() => navigate('/student/dashboard')}>Go to Dashboard</button>
      </div>
    </>
  )
}

export default QuizResult