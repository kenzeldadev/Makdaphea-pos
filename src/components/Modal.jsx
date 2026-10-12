// Bottom sheet on phones, centered card on tablets. Tap outside to close.
export function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-4 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-3 text-2xl font-extrabold">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-4 text-lg text-stone-700">{message}</p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost flex-1" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={`btn flex-1 ${danger ? 'btn-danger' : 'btn-green'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
