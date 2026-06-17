// src/pages/teacher/assignments/EditAssignment.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAssignmentById, updateAssignment } from '../../../services/assignmentService'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology']

const EditAssignment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', subject: '', description: '', deadline: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await fetchAssignmentById(id)
      if (data) {
        setForm({
          title: data.title || '',
          subject: data.subject || '',
          description: data.description || '',
          deadline: data.deadline ? data.deadline.slice(0, 16) : '',
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

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
    const { error } = await updateAssignment(id, form)
    if (!error) navigate('/teacher/assignments')
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ height: '300px', borderRadius: '14px', background: 'linear-gradient(90deg, #e0eef9 25%, #f1f8ff 50%, #e0eef9 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
  )

  return (
    <>
      <style>{`
        .ea-wrap { max-width: 600px; }
        .ea-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .ea-back {
          width: 34px; height: 34px; border-radius: 9px;
          border: 1.5px solid #dbeafe; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #5a7a96; transition: all 0.15s ease;
        }
        .ea-back:hover { background: #f1f8ff; color: #0c2d4a; }
        .ea-title { font-size: 22px; font-weight: 700; color: #0c2d4a; margin: 0; }
        .ea-card { background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 28px; box-shadow: 0 1px 3px rgba(12,45,74,0.05); }
        .ea-group { margin-bottom: 18px; }
        .ea-label { display: block; font-size: 12px; font-weight: 600; color: #5a7a96; margin-bottom: 7px; letter-spacing: 0.3px; text-transform: uppercase; }
        .ea-input, .ea-select, .ea-textarea {
          width: 100%; padding: 10px 14px; border: 1.5px solid #dbeafe;
          border-radius: 10px; font-size: 14px; color: #0c2d4a;
          background: #f8fbff; outline: none; transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit; box-sizing: border-box;
        }
        .ea-input:focus, .ea-select:focus, .ea-textarea:focus { border-color: #075985; box-shadow: 0 0 0 3px rgba(7,89,133,0.08); background: #fff; }
        .ea-input.error { border-color: #e11d48; }
        .ea-textarea { resize: vertical; min-height: 100px; }
        .ea-error { font-size: 12px; color: #e11d48; margin-top: 5px; }
        .ea-actions { display: flex; gap: 10px; margin-top: 26px; }
        .ea-btn-cancel {
          flex: 1; padding: 11px; border: 1.5px solid #dbeafe; border-radius: 10px;
          background: transparent; color: #5a7a96; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .ea-btn-cancel:hover { background: #f1f8ff; color: #0c2d4a; }
        .ea-btn-submit {
          flex: 2; padding: 11px; border: none; border-radius: 10px;
          background: #075985; color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; font-family: inherit;
        }
        .ea-btn-submit:hover:not(:disabled) { background: #0c2d4a; }
        .ea-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="ea-wrap">
        <div className="ea-header">
          <button className="ea-back" onClick={() => navigate('/teacher/assignments')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="ea-title">Edit Assignment</h1>
        </div>

        <div className="ea-card">
          <div className="ea-group">
            <label className="ea-label">Title *</label>
            <input className={`ea-input ${errors.title ? 'error' : ''}`} type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} />
            {errors.title && <p className="ea-error">{errors.title}</p>}
          </div>

          <div className="ea-group">
            <label className="ea-label">Subject</label>
            <select className="ea-select" value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ea-group">
            <label className="ea-label">Description</label>
            <textarea className="ea-textarea" value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>

          <div className="ea-group">
            <label className="ea-label">Deadline *</label>
            <input className={`ea-input ${errors.deadline ? 'error' : ''}`} type="datetime-local" value={form.deadline} onChange={e => handleChange('deadline', e.target.value)} />
            {errors.deadline && <p className="ea-error">{errors.deadline}</p>}
          </div>

          <div className="ea-actions">
            <button className="ea-btn-cancel" onClick={() => navigate('/teacher/assignments')}>Cancel</button>
            <button className="ea-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditAssignment