import { formatMoney } from '../utils/format'

export default function TotalBar({ total, itemCount, currency, canConfirm, busy, onConfirm, onClear }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-[#e5e3dc] bg-[#fffefa] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:gap-4 sm:px-5">
      <button type="button" className="btn btn-ghost min-h-14 w-20 sm:w-24" disabled={!canConfirm} onClick={onClear}>
        Clear
      </button>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-xs font-medium uppercase tracking-wider text-[#737a74]">
          Total · {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </div>
        <div className="truncate text-3xl font-bold tabular-nums tracking-tight text-[#202923] sm:text-4xl">{formatMoney(total, currency)}</div>
      </div>
      <button
        type="button"
        className="btn btn-green min-h-14 w-36 px-2 text-sm sm:w-48 sm:px-4 sm:text-lg"
        disabled={!canConfirm || busy}
        onClick={onConfirm}
      >
        {busy ? 'Saving…' : 'Confirm order'}
      </button>
    </div>
  )
}
