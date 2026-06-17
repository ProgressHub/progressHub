import { useState } from 'react'

const AssignmentFormModal = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({ title: '', subject: '', deadline: '', description: '' })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    if (!form.title || !form.subject || !form.deadline || !form.description) {
      setError('All fields except file are required.')
      return
    }
    setError('')
    onSubmit(form, file)
  }

  return (
    <>
      <style>{`
        .afm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }
        .afm-modal {
          background: #0c4a6e; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 28px;
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .afm-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
        .afm-field { display: flex; flex-direction: column; gap: 6px; }
        .afm-label { font-size: 13px; font-weight: 600; color: #b8d4ea; }
        .afm-input, .afm-textarea {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px; padding: 10px 12px;
          color: #fff; font-size: 14px; outline: none;
          transition: border 0.2s; font-family: inherit;
        }
        .afm-input:focus, .afm-textarea:focus { border-color: #f59e0b; }
        .afm-textarea { resize: vertical; min-height: 90px; }
        .afm-file {
          background: rgba(255,255,255,0.07);
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: 8px; padding: 10px 12px;
          color: #b8d4ea; font-size: 13px; cursor: pointer;
        }
        .afm-error {
          font-size: 13px; color: #f87171;
          background: rgba(248,113,113,0.1);
          border-radius: 8px; padding: 8px 12px;
        }
        .afm-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .afm-btn-cancel {
          padding: 9px 18px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent; color: #b8d4ea;
          font-size: 14px; font-weight: 500; cursor: pointer;
        }
        .afm-btn-cancel:hover { background: rgba(255,255,255,0.08); }
        .afm-btn-submit {
          padding: 9px 20px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
        }
        .afm-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .afm-btn-submit:hover:not(:disabled) { opacity: 0.9; }
      `}</style>

      <div className="afm-overlay" onClick={onClose}>
        <div className="afm-modal" onClick={(e) => e.stopPropagation()}>
          <p className="afm-title">➕ Add Assignment</p>

          <div className="afm-field">
            <label className="afm-label">Title</label>
            <input className="afm-input" name="title" placeholder="e.g. Chapter 5 Summary" value={form.title} onChange={handleChange} />
          </div>

          <div className="afm-field">
            <label className="afm-label">Subject</label>
            <input className="afm-input" name="subject" placeholder="e.g. Mathematics" value={form.subject} onChange={handleChange} />
          </div>

          <div className="afm-field">
            <label className="afm-label">Deadline</label>
            <input className="afm-input" name="deadline" type="datetime-local" value={form.deadline} onChange={handleChange} />
          </div>

          <div className="afm-field">
            <label className="afm-label">Description</label>
            <textarea className="afm-textarea" name="description" placeholder="Write assignment details here..." value={form.description} onChange={handleChange} />
          </div>

          <div className="afm-field">
            <label className="afm-label">Resource File (optional)</label>
            <input className="afm-file" type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          {error && <div className="afm-error">⚠️ {error}</div>}

          <div className="afm-actions">
            <button className="afm-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="afm-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Add Assignment'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AssignmentFormModal  