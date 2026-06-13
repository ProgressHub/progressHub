// src/pages/teacher/quiz/CreateQuiz.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { createFullQuiz } from '../../../services/quizService'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Computer Science']

const emptyQuestion = () => ({
  question_text: '',
  options: ['', '', '', ''],
  correct_option: 0,
  points: 1,
})

const CreateQuiz = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()])

  const removeQuestion = (index) => {
    if (questions.length === 1) return
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const newOptions = [...q.options]
      newOptions[oIndex] = value
      return { ...q, options: newOptions }
    }))
  }

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!subject.trim()) e.subject = 'Subject is required'
    questions.forEach((q, i) => {
      if (!q.question_text.trim()) e[`q${i}`] = 'Question text is required'
      q.options.forEach((o, oi) => {
        if (!o.trim()) e[`q${i}o${oi}`] = 'All options are required'
      })
    })
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    const { error } = await createFullQuiz({ title, subject }, questions, user.id)
    if (!error) {
      setSuccess(true)
      setTimeout(() => navigate('/teacher/quizzes'), 1500)
    }
    setSubmitting(false)
  }

  return (
    <>
      <style>{`
        .cq-wrap { max-width: 700px; }
        .cq-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .cq-back { width: 34px; height: 34px; border-radius: 9px; border: 1.5px solid #dbeafe; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5a7a96; transition: all 0.15s ease; }
        .cq-back:hover { background: #f1f8ff; color: #0c2d4a; }
        .cq-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; }
        .cq-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); margin-bottom: 16px; }
        .cq-group { margin-bottom: 16px; }
        .cq-label { display: block; font-size: 12px; font-weight: 600; color: #5a7a96; margin-bottom: 7px; letter-spacing: 0.3px; text-transform: uppercase; }
        .cq-input, .cq-select { width: 100%; padding: 10px 14px; border: 1.5px solid #dbeafe; border-radius: 10px; font-size: 14px; color: #0c2d4a; background: #f8fbff; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color 0.15s ease; }
        .cq-input:focus, .cq-select:focus { border-color: #075985; background: #fff; }
        .cq-input.error { border-color: #e11d48; }
        .cq-error { font-size: 12px; color: #e11d48; margin-top: 4px; }
        .cq-question-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 20px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .cq-question-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .cq-question-num { font-size: 13px; font-weight: 700; color: #075985; }
        .cq-remove-btn { padding: 5px 10px; border-radius: 7px; border: 1px solid #fee2e2; background: transparent; color: #e11d48; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s ease; }
        .cq-remove-btn:hover { background: #fee2e2; }
        .cq-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .cq-option-wrap { display: flex; flex-direction: column; gap: 4px; }
        .cq-option-label { font-size: 11px; font-weight: 600; color: #5a7a96; text-transform: uppercase; }
        .cq-correct-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cq-correct-label { font-size: 12px; font-weight: 600; color: #5a7a96; text-transform: uppercase; letter-spacing: 0.3px; }
        .cq-radio-opt { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 8px; border: 1.5px solid #dbeafe; cursor: pointer; font-size: 13px; font-weight: 500; color: #5a7a96; transition: all 0.15s ease; }
        .cq-radio-opt.selected { background: #eff6ff; border-color: #075985; color: #075985; font-weight: 600; }
        .cq-radio-opt input { display: none; }
        .cq-add-btn { display: flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 10px; border: 1.5px dashed #dbeafe; background: transparent; color: #5a7a96; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; justify-content: center; transition: all 0.15s ease; font-family: inherit; margin-bottom: 20px; }
        .cq-add-btn:hover { border-color: #075985; color: #075985; background: #f8fbff; }
        .cq-actions { display: flex; gap: 10px; }
        .cq-btn-cancel { flex: 1; padding: 11px; border: 1.5px solid #dbeafe; border-radius: 10px; background: transparent; color: #5a7a96; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s ease; }
        .cq-btn-cancel:hover { background: #f1f8ff; color: #0c2d4a; }
        .cq-btn-submit { flex: 2; padding: 11px; border: none; border-radius: 10px; background: #075985; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s ease; }
        .cq-btn-submit:hover:not(:disabled) { background: #0c2d4a; }
        .cq-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .cq-btn-submit.success { background: #15803d; }
        @media (max-width: 500px) { .cq-options-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="cq-wrap">
        <div className="cq-header">
          <button className="cq-back" onClick={() => navigate('/teacher/quizzes')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="cq-title">Create Quiz</h1>
        </div>

        {/* Quiz Info */}
        <div className="cq-card">
          <div className="cq-group">
            <label className="cq-label">Quiz Title *</label>
            <input className={`cq-input ${errors.title ? 'error' : ''}`} type="text" placeholder="e.g. Unit 1 Mathematics Quiz" value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: null })) }} />
            {errors.title && <p className="cq-error">{errors.title}</p>}
          </div>
          <div className="cq-group" style={{ marginBottom: 0 }}>
            <label className="cq-label">Subject *</label>
            <select className={`cq-select ${errors.subject ? 'error' : ''}`} value={subject} onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: null })) }}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p className="cq-error">{errors.subject}</p>}
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, qi) => (
          <div key={qi} className="cq-question-card">
            <div className="cq-question-header">
              <span className="cq-question-num">Question {qi + 1}</span>
              <button className="cq-remove-btn" onClick={() => removeQuestion(qi)} disabled={questions.length === 1}>Remove</button>
            </div>

            <div className="cq-group">
              <label className="cq-label">Question Text *</label>
              <input className={`cq-input ${errors[`q${qi}`] ? 'error' : ''}`} type="text" placeholder="e.g. What is 2 + 2?" value={q.question_text} onChange={e => { updateQuestion(qi, 'question_text', e.target.value); setErrors(p => ({ ...p, [`q${qi}`]: null })) }} />
              {errors[`q${qi}`] && <p className="cq-error">{errors[`q${qi}`]}</p>}
            </div>

            <div className="cq-options-grid">
              {q.options.map((opt, oi) => (
                <div key={oi} className="cq-option-wrap">
                  <label className="cq-option-label">Option {String.fromCharCode(65 + oi)}</label>
                  <input className={`cq-input ${errors[`q${qi}o${oi}`] ? 'error' : ''}`} type="text" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => { updateOption(qi, oi, e.target.value); setErrors(p => ({ ...p, [`q${qi}o${oi}`]: null })) }} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div className="cq-correct-label" style={{ marginBottom: '8px' }}>Correct Answer</div>
              <div className="cq-correct-row">
                {q.options.map((_, oi) => (
                  <label key={oi} className={`cq-radio-opt ${q.correct_option === oi ? 'selected' : ''}`}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correct_option === oi} onChange={() => updateQuestion(qi, 'correct_option', oi)} />
                    Option {String.fromCharCode(65 + oi)}
                  </label>
                ))}
              </div>
            </div>

            <div className="cq-group" style={{ marginBottom: 0 }}>
              <label className="cq-label">Points</label>
              <input className="cq-input" type="number" min="1" value={q.points} onChange={e => updateQuestion(qi, 'points', parseInt(e.target.value) || 1)} style={{ maxWidth: '100px' }} />
            </div>
          </div>
        ))}

        <button className="cq-add-btn" onClick={addQuestion}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Question
        </button>

        <div className="cq-actions">
          <button className="cq-btn-cancel" onClick={() => navigate('/teacher/quizzes')}>Cancel</button>
          <button className={`cq-btn-submit ${success ? 'success' : ''}`} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : success ? '✓ Quiz Created!' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </>
  )
}

export default CreateQuiz