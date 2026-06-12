// src/components/teacher/DeleteConfirmModal.jsx
const DeleteConfirmModal = ({ onCancel, onConfirm, loading }) => {
  return (
    <>
      <style>{`
        .dcm-overlay {
          position: fixed; inset: 0; background: rgba(12,45,74,0.35);
          backdrop-filter: blur(3px); z-index: 300;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .dcm-box {
          background: #fff; border: 1px solid #dbeafe; border-radius: 18px;
          padding: 28px; width: 100%; max-width: 380px;
          box-shadow: 0 20px 60px rgba(7,89,133,0.15);
          animation: slideUp 0.22s ease; text-align: center;
        }
        .dcm-icon { font-size: 40px; margin-bottom: 12px; }
        .dcm-title { font-size: 17px; font-weight: 700; color: #0c2d4a; margin: 0 0 8px; }
        .dcm-text { font-size: 14px; color: #5a7a96; margin: 0 0 24px; }
        .dcm-actions { display: flex; gap: 10px; }
        .dcm-cancel {
          flex: 1; padding: 11px; border: 1.5px solid #dbeafe;
          border-radius: 10px; background: transparent; color: #5a7a96;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.15s ease; font-family: inherit;
        }
        .dcm-cancel:hover { background: #f1f8ff; color: #0c2d4a; }
        .dcm-confirm {
          flex: 1; padding: 11px; border: none; border-radius: 10px;
          background: #e11d48; color: #fff; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.15s ease;
          font-family: inherit;
        }
        .dcm-confirm:hover:not(:disabled) { background: #be123c; }
        .dcm-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="dcm-overlay">
        <div className="dcm-box">
          <div className="dcm-icon">🗑️</div>
          <h2 className="dcm-title">Delete Assignment?</h2>
          <p className="dcm-text">Are you sure you want to delete this assignment? This action cannot be undone.</p>
          <div className="dcm-actions">
            <button className="dcm-cancel" onClick={onCancel}>Cancel</button>
            <button className="dcm-confirm" onClick={onConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteConfirmModal