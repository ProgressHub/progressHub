// src/components/TaskFormModal.jsx
import { useState } from 'react'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology']

const TaskFormModal = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({ title: '', subject: '', due_date: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.subject) e.subject = 'Subject is required'
    if (!form.due_date) e.due_date = 'Due date is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    onSubmit(form)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(12, 45, 74, 0.35);
          backdrop-filter: blur(3px);
          z-index: 300;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .modal-box {
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 18px;
          padding: 28px;
          width: 100%; max-width: 440px;
          box-shadow: 0 20px 60px rgba(7,89,133,0.15);
          animation: slideUp 0.22s ease;
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .modal-title {
          font-size: 17px; font-weight: 700;
          color: #0c2d4a; margin: 0;
        }
        .modal-close {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid #e2eaf2; background: transparent;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #5a7a96; transition: all 0.15s ease;
        }
        .modal-close:hover { background: #f1f8ff; color: #0c2d4a; }
        .form-group { margin-bottom: 18px; }
        .form-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #5a7a96; margin-bottom: 7px; letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .form-input, .form-select {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid #dbeafe; border-radius: 10px;
          font-size: 14px; color: #0c2d4a;
          background: #f8fbff; outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit; box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus {
          border-color: #075985;
          box-shadow: 0 0 0 3px rgba(7,89,133,0.08);
          background: #ffffff;
        }
        .form-input.error, .form-select.error { border-color: #e11d48; }
        .form-error { font-size: 12px; color: #e11d48; margin-top: 5px; }
        .form-select { cursor: pointer; }
        .modal-actions {
          display: flex; gap: 10px; margin-top: 26px;
        }
        .btn-cancel {
          flex: 1; padding: 11px;
          border: 1.5px solid #dbeafe; border-radius: 10px;
          background: transparent; color: #5a7a96;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-cancel:hover { background: #f1f8ff; color: #0c2d4a; }
        .btn-submit {
          flex: 2; padding: 11px;
          border: none; border-radius: 10px;
          background: #075985; color: #ffffff;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-submit:hover:not(:disabled) { background: #0c2d4a; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">Add New Task</h2>
            <button className="modal-close" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className={`form-input ${errors.title ? 'error' : ''}`}
              type="text"
              placeholder="e.g. Complete chapter 5 notes"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Subject */}
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className={`form-select ${errors.subject ? 'error' : ''}`}
              value={form.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
            >
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p className="form-error">{errors.subject}</p>}
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              className={`form-input ${errors.due_date ? 'error' : ''}`}
              type="date"
              value={form.due_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
            {errors.due_date && <p className="form-error">{errors.due_date}</p>}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default TaskFormModal