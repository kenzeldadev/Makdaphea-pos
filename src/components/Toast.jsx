export default function Toast({ message, actionLabel = 'Undo', onAction }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-3">
      <div className="pointer-events-auto flex animate-pop items-center gap-2 rounded-2xl bg-stone-900 py-1 pl-4 pr-2 text-lg font-bold text-white shadow-xl">
        <span>{message}</span>
        {onAction && (
          <button type="button" className="h-[60px] min-w-[60px] touch-manipulation px-3 text-amber-300 underline" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
