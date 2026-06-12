// src/pages/teacher/assignments/CreateAssignment.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { createAssignment } from '../../../services/assignmentService'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology']

const CreateAssignment = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', subject: '', description: '', deadline: '' })
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.deadline) e.deadline = 'Deadline is required'
    return e
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitting(true)
    const { error } = await createAssignment({ ...form, created_by: user.id }, file)
    if (!error) navigate('/teacher/assignments')
    setSubmitting(false)
  }

  return (
    <>
      <style>{`
        .ca-wrap { max-width: 600px; }
        .ca-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .ca-back {
          width: 34px; height: 34px; border-radius: 9px;
          border: 1.5px solid #dbeafe; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #5a7a96; transition: all 0.15s ease;
        }
        .ca-back:hover { background: #f1f8ff; color: #0c2d4a; }
        .ca-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; }
        .ca-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 28px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .ca-group { margin-bottom: 18px; }
        .ca-label { display: block; font-size: 12px; font-weight: 600; color: #5a7a96; margin-bottom: 7px; letter-spacing: 0.3px; text-transform: uppercase; }
        .ca-input, .ca-select, .ca-textarea {
          width: 100%; padding: 10px 14px; border: 1.5px solid #dbeafe;
          border-radius: 10px; font-size: 14px; color: #0c2d4a;
          background: #f8fbff; outline: none; transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit; box-sizing: border-box;
        }
        .ca-input:focus, .ca-select:focus, .ca-textarea:focus { border-color: #075985; box-shadow: 0 0 0 3px rgba(7,89,133,0.08); background: #fff; }
        .ca-input.error, .ca-select.error { border-color: #e11d48; }
        .ca-textarea { resize: vertical; min-height: 100px; }
        .ca-error { font-size: 12px; color: #e11d48; margin-top: 5px; }
        .ca-actions { display: flex; gap: 10px; margin-top: 26px; }
        .ca-btn-cancel {
          flex: 1; padding: 11px; border: 1.5px solid #dbeafe; border-radius: 10px;
          background: transparent; color: #5a7a96; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .ca-btn-cancel:hover { background: #f1f8ff; color: #0c2d4a; }
        .ca-btn-submit {
          flex: 2; padding: 11px; border: none; border-radius: 10px;
          background: #075985; color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .ca-btn-submit:hover:not(:disabled) { background: #0c2d4a; }
        .ca-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="ca-wrap">
        <div className="ca-header">
          <button className="ca-back" onClick={() => navigate('/teacher/assignments')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="ca-title">Create Assignment</h1>
        </div>

        <div className="ca-card">
          <div className="ca-group">
            <label className="ca-label">Title *</label>
            <input className={`ca-input ${errors.title ? 'error' : ''}`} type="text" placeholder="e.g. Chapter 5 Summary" value={form.title} onChange={e => handleChange('title', e.target.value)} />
            {errors.title && <p className="ca-error">{errors.title}</p>}
          </div>

          <div className="ca-group">
            <label className="ca-label">Subject</label>
            <select className="ca-select" value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ca-group">
            <label className="ca-label">Description</label>
            <textarea className="ca-textarea" placeholder="Write assignment details here..." value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>

          <div className="ca-group">
            <label className="ca-label">Deadline *</label>
            <input className={`ca-input ${errors.deadline ? 'error' : ''}`} type="datetime-local" value={form.deadline} onChange={e => handleChange('deadline', e.target.value)} />
            {errors.deadline && <p className="ca-error">{errors.deadline}</p>}
          </div>

          <div className="ca-group">
            <label className="ca-label">Resource File (optional)</label>
            <input type="file" style={{ width: '100%', fontSize: '13px', color: '#5a7a96' }} onChange={e => setFile(e.target.files[0])} />
          </div>

          <div className="ca-actions">
            <button className="ca-btn-cancel" onClick={() => navigate('/teacher/assignments')}>Cancel</button>
            <button className="ca-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateAssignment