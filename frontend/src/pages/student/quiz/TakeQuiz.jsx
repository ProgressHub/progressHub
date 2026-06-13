// src/pages/student/quiz/TakeQuiz.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { fetchQuizWithQuestions, submitScore, getStudentQuizScore } from '../../../services/quizService'

const TakeQuiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alreadyTaken, setAlreadyTaken] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      
      // First check if student already took this quiz
      const { data: existingSubmission, error: checkError } = await getStudentQuizScore(id, user.id)
      
      if (existingSubmission) {
        setAlreadyTaken(true)
        setLoading(false)
        return
      }
      
      // If not taken, load the quiz
      const { data } = await fetchQuizWithQuestions(id)
      if (data) setQuiz(data)
      setLoading(false)
    }
    load()
  }, [id, user.id])

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = async () => {
    if (!quiz) return
    
    // Double-check before submitting
    const { data: existingSubmission } = await getStudentQuizScore(id, user.id)
    if (existingSubmission) {
      alert('You have already taken this quiz!')
      navigate('/student/quizzes')
      return
    }
    
    setSubmitting(true)

    let score = 0
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        score += (q.points || 1)
      }
    })

    const total = quiz.questions.length
    const { error } = await submitScore(id, user.id, score, total)
    
    if (error) {
      if (error.code === '23505') {
        alert('You have already taken this quiz!')
        navigate('/student/quizzes')
      } else {
        alert('Error submitting quiz: ' + error.message)
        setSubmitting(false)
      }
    } else {
      navigate(`/student/quizzes/${id}/result`, { state: { score, total, quizTitle: quiz.title } })
    }
    setSubmitting(false)
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = quiz?.questions?.length || 0

  // Show message if quiz already taken
  if (!loading && alreadyTaken) {
    return (
      <>
        <style>{`
          .tq-already-taken { max-width: 680px; text-align: center; padding: 48px 24px; background: #fff; border-radius: 16px; border: 1px solid #dbeafe; }
          .tq-already-icon { font-size: 48px; margin-bottom: 16px; }
          .tq-already-title { font-size: 24px; font-weight: 700; color: #0c2d4a; margin-bottom: 8px; }
          .tq-already-text { color: #5a7a96; margin-bottom: 24px; }
          .tq-already-btn { padding: 10px 24px; background: #075985; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
          .tq-already-btn:hover { background: #0c2d4a; }
        `}</style>
        <div className="tq-already-taken">
          <div className="tq-already-icon">📝</div>
          <div className="tq-already-title">Quiz Already Completed</div>
          <div className="tq-already-text">You have already taken this quiz. You cannot retake it.</div>
          <button className="tq-already-btn" onClick={() => navigate('/student/quizzes')}>
            Back to Quizzes
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        .tq-wrap { max-width: 680px; }
        .tq-header { margin-bottom: 24px; }
        .tq-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0 0 4px; }
        .tq-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .tq-subject-pill { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; }
        .tq-progress { font-size: 12px; color: #5a7a96; background: #f1f8ff; padding: 2px 10px; border-radius: 20px; }
        .tq-question-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 22px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .tq-question-num { font-size: 11px; font-weight: 700; color: #075985; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
        .tq-question-text { font-size: 15px; font-weight: 600; color: #0c2d4a; margin-bottom: 16px; line-height: 1.5; }
        .tq-options { display: flex; flex-direction: column; gap: 8px; }
        .tq-option { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #dbeafe; cursor: pointer; transition: all 0.15s ease; }
        .tq-option:hover { border-color: #075985; background: #f8fbff; }
        .tq-option.selected { border-color: #075985; background: #eff6ff; }
        .tq-option input { display: none; }
        .tq-option-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1; flex-shrink: 0; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; }
        .tq-option.selected .tq-option-dot { border-color: #075985; background: #075985; }
        .tq-option-text { font-size: 14px; color: #0c2d4a; }
        .tq-submit-row { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .tq-answered { font-size: 13px; color: #5a7a96; }
        .tq-btn-submit { padding: 12px 28px; border: none; border-radius: 10px; background: #075985; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-family: inherit; }
        .tq-btn-submit:hover:not(:disabled) { background: #0c2d4a; }
        .tq-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .tq-skeleton { height: 160px; border-radius: 14px; background: linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; margin-bottom: 12px; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      `}</style>

      <div className="tq-wrap">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="tq-skeleton" />)
        ) : quiz ? (
          <>
            <div className="tq-header">
              <h1 className="tq-title">{quiz.title}</h1>
              <div className="tq-meta">
                <span className="tq-subject-pill">{quiz.subject}</span>
                <span className="tq-progress">{answeredCount} / {totalQuestions} answered</span>
              </div>
            </div>

            {quiz.questions.map((q, qi) => (
              <div key={q.id} className="tq-question-card">
                <div className="tq-question-num">Question {qi + 1}</div>
                <div className="tq-question-text">{q.question_text}</div>
                <div className="tq-options">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`tq-option ${answers[q.id] === oi ? 'selected' : ''}`}>
                      <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === oi} onChange={() => handleAnswer(q.id, oi)} />
                      <div className="tq-option-dot">
                        {answers[q.id] === oi && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                        )}
                      </div>
                      <span className="tq-option-text">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="tq-submit-row">
              <span className="tq-answered">{answeredCount} of {totalQuestions} questions answered</span>
              <button className="tq-btn-submit" onClick={handleSubmit} disabled={submitting || answeredCount === 0}>
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: '#5a7a96' }}>Quiz not found.</p>
        )}
      </div>
    </>
  )
}

export default TakeQuiz