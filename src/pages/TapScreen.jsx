import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CustomerTypeRow from '../components/CustomerTypeRow'
import MenuCard from '../components/MenuCard'
import Toast from '../components/Toast'
import TotalBar from '../components/TotalBar'
import { useStore } from '../store/useStore'
import { formatMoney } from '../utils/format'
import { buildLines, gridCols, sumLines } from '../utils/order'
import { tapFeedback } from '../utils/sound'

export default function TapScreen() {
  const menu = useStore((s) => s.menu)
  const counts = useStore((s) => s.counts)
  const customerType = useStore((s) => s.customerType)
  const { currency, soundOn } = useStore((s) => s.settings)
  const { add, remove, clear, restore, setCustomerType, confirmOrder, undoOrder } = useStore()

  const [busy, setBusy] = useState(false)
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth)
  const [toast, setToast] = useState(null) // { message, undo? }
  const timer = useRef(undefined)

  useEffect(() => {
    const updateWidth = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])
  const showToast = useCallback((message, undo) => {
    window.clearTimeout(timer.current)
    setToast({ message, undo })
    timer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const active = useMemo(() => menu.filter((m) => m.active), [menu])
  const mains = active.filter((m) => m.category === 'main')
  const addons = active.filter((m) => m.category === 'addon')
  const maxColumns = screenWidth < 560 ? 2 : screenWidth < 900 ? 3 : 4
  const mainColumns = Math.min(gridCols(mains.length), maxColumns)
  const addonColumns = Math.min(gridCols(addons.length, 4), maxColumns)
  const lines = useMemo(() => buildLines(active, counts), [active, counts])
  const total = sumLines(lines)
  const itemCount = lines.reduce((n, l) => n + l.qty, 0)

  const onAdd = (id) => {
    add(id)
    tapFeedback(soundOn, 'add')
  }
  const onRemove = (id) => {
    if (!counts[id]) return
    remove(id)
    tapFeedback(soundOn, 'remove')
  }

  const onConfirm = async () => {
    if (busy) return
    setBusy(true)
    try {
      const order = await confirmOrder()
      if (order) {
        tapFeedback(soundOn, 'add')
        showToast(`Saved ${formatMoney(order.total, currency)}`, async () => {
          await undoOrder(order)
          showToast('Order restored')
        })
      }
    } catch {
      showToast('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  // No confirm dialog (too slow in a rush): clear instantly, offer Undo instead
  const onClear = () => {
    const snapshot = { ...counts }
    const type = customerType
    clear()
    showToast('Cleared', () => {
      restore(snapshot, type)
      setToast(null)
    })
  }

  const card = (item, compact) => (
    <MenuCard
      key={item.id}
      item={item}
      qty={counts[item.id] ?? 0}
      currency={currency}
      compact={compact}
      onAdd={() => onAdd(item.id)}
      onRemove={() => onRemove(item.id)}
    />
  )

  return (
    <div className="flex h-full flex-col bg-[#f4f3ef]">
      <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a94930]">Point of sale</p>
            <h1 className="text-xl font-bold tracking-tight text-[#202923]">New order</h1>
          </div>
          <span className="rounded-full border border-[#e2e0d9] bg-[#fffefa] px-3 py-1 text-xs font-medium text-[#737a74]">
            {active.length} menu {active.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        {mains.length === 0 && addons.length === 0 ? (
          <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-[#d8d5cc] bg-[#fffefa] p-6 text-center text-base font-medium text-[#737a74]">
            No active items. Add or turn on items in Menu.
          </div>
        ) : (
          <>
            <div
              className="grid min-h-[200px] shrink-0 auto-rows-[minmax(140px,1fr)] gap-3"
              style={{ gridTemplateColumns: `repeat(${mainColumns}, minmax(0, 1fr))` }}
            >
              {mains.map((m) => card(m, false))}
            </div>
            {addons.length > 0 && (
              <div className="shrink-0">
                <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#737a74]">Add-ons</h2>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${addonColumns}, minmax(0, 1fr))` }}>
                  {addons.map((m) => card(m, true))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <CustomerTypeRow value={customerType} onChange={setCustomerType} />
      <TotalBar
        total={total}
        itemCount={itemCount}
        currency={currency}
        canConfirm={lines.length > 0}
        busy={busy}
        onConfirm={onConfirm}
        onClear={onClear}
      />
      {toast && <Toast message={toast.message} onAction={toast.undo} />}
    </div>
  )
}
