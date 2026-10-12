import { CUSTOMER_TYPES } from '../utils/constants'

// One-tap customer type picker. Skipping it keeps the default ("local").
export default function CustomerTypeRow({ value, onChange }) {
  return (
    <div className="flex shrink-0 gap-2 border-t border-[#e5e3dc] bg-[#f4f3ef] px-3 py-2" role="radiogroup" aria-label="Customer type">
      {CUSTOMER_TYPES.map((c) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          onClick={() => onChange(c.value)}
          className={`flex min-h-[48px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold transition-colors active:scale-[0.98] sm:text-base ${
            value === c.value ? 'bg-[#26332e] text-white shadow-sm' : 'border border-[#dedfd8] bg-[#fffefa] text-[#555f59]'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
