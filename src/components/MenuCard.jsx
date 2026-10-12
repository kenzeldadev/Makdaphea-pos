import { useLongPress } from '../hooks/useLongPress'
import { formatPrice } from '../utils/currency'
import ItemImage from './ItemImage'

// The "−" button sits inside the card; stop its pointer events reaching the card's tap logic
const stop = (e) => e.stopPropagation()

export default function MenuCard({ item, qty, currency, compact = false, onAdd, onRemove }) {
  const press = useLongPress(onAdd, onRemove)
  const active = qty > 0

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, ${formatPrice(item.price, currency)}, quantity ${qty}`}
      {...press}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAdd()
        }
      }}
      className={[
        'group relative flex min-h-[60px] touch-manipulation select-none overflow-hidden rounded-2xl border bg-[#fffefa] shadow-[0_2px_8px_rgba(32,39,35,0.05)]',
        'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]',
        compact ? 'items-center gap-3 px-3 py-2.5' : 'min-h-[140px] flex-col items-center justify-center gap-2 p-3 text-center',
        compact && active ? 'pr-14' : '',
        active ? 'border-[#bd5639] ring-1 ring-[#bd5639]/15' : 'border-[#e5e3dc] hover:border-[#c9c7bd]',
      ].join(' ')}
    >
      <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f3f0e8] ${compact ? 'h-12 w-12' : 'h-[clamp(3.5rem,10vh,5rem)] w-[clamp(3.5rem,10vh,5rem)]'}`}>
        <ItemImage image={item.image} size={compact ? '2rem' : 'clamp(2.5rem, 8vh, 3.5rem)'} />
      </div>

      <div className={compact ? 'min-w-0 flex-1 text-left' : 'min-w-0 max-w-full'}>
        <div className={`line-clamp-2 font-semibold leading-tight text-[#29342e] ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
          {item.name}
        </div>
        <div className={`mt-1 font-bold tabular-nums text-[#a94930] ${compact ? 'text-base' : 'text-lg'}`}>
          {formatPrice(item.price, currency)}
        </div>
      </div>

      {active && (
        <>
          {/* key={qty} restarts the pop animation on every change */}
          <span
            key={qty}
            className="pointer-events-none absolute right-2 top-2 flex h-8 min-w-8 animate-pop items-center justify-center rounded-full bg-[#bd5639] px-2 text-sm font-bold text-white"
          >
            {qty}
          </span>
          {/* 60x60 hit area, smaller visible circle */}
          <button
            type="button"
            aria-label={`Remove one ${item.name}`}
            onPointerDown={stop}
            onPointerUp={stop}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute bottom-0 right-0 flex h-[60px] w-[60px] touch-manipulation items-center justify-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#26332e] text-2xl font-medium leading-none text-white shadow">
              −
            </span>
          </button>
        </>
      )}
    </div>
  )
}
