import { useMemo, useState } from 'react'
import { format, isSameDay, parseISO } from 'date-fns'
import { ConfirmDialog } from '../components/Modal'
import Page from '../components/Page'
import { deleteOrder } from '../db/database'
import { useOrders } from '../hooks/useOrders'
import { useStore } from '../store/useStore'
import { CUSTOMER_TYPES } from '../utils/constants'
import { formatMoney, round2 } from '../utils/format'

const PAGE_SIZE = 50
const FILTERS = ['all', ...CUSTOMER_TYPES.map((c) => c.value)]
const typeInfo = (t) => CUSTOMER_TYPES.find((c) => c.value === t)

export default function History() {
  const { orders, loading, reload } = useOrders()
  const currency = useStore((s) => s.settings.currency)
  const [date, setDate] = useState('') // yyyy-MM-dd, empty = all dates
  const [type, setType] = useState('all')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) => (type === 'all' || o.customerType === type) && (!date || isSameDay(o.timestamp, parseISO(date))),
      ),
    [orders, date, type],
  )
  const sum = round2(filtered.reduce((s, o) => s + o.total, 0))

  return (
    <Page title="History">
      <div className="card flex flex-col gap-2">
        <div className="flex gap-2">
          <input className="input flex-1" type="date" value={date} aria-label="Filter by date" onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn btn-ghost" onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))}>Today</button>
          <button type="button" className="btn btn-ghost" disabled={!date} onClick={() => setDate('')}>All dates</button>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setType(v)}
              className={`btn flex-1 px-2 ${type === v ? 'btn-dark' : 'btn-ghost'}`}
            >
              {v === 'all' ? 'All' : typeInfo(v).label}
            </button>
          ))}
        </div>
        <p className="text-lg font-bold">
          {filtered.length} {filtered.length === 1 ? 'order' : 'orders'} · {formatMoney(sum, currency)}
        </p>
      </div>

      {loading ? (
        <p className="text-lg">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="card text-lg text-stone-500">No orders match.</p>
      ) : (
        filtered.slice(0, limit).map((o) => (
          <div key={o.id} className="card flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-semibold text-[#29342e]">{format(o.timestamp, 'd MMM yyyy, HH:mm')}</div>
              <div className="rounded-full bg-[#f1f0ea] px-3 py-1 text-sm font-semibold text-[#555f59]">
                {typeInfo(o.customerType)?.label}
              </div>
            </div>
            <ul className="text-lg">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span>{i.qty} × {i.name}</span>
                  <span className="tabular-nums">{formatMoney(i.qty * i.price, currency)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-stone-200 pt-2">
              <span className="text-2xl font-bold tabular-nums text-[#202923]">{formatMoney(o.total, currency)}</span>
              <button type="button" className="btn btn-ghost text-[#a83e35]" onClick={() => setToDelete(o)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {filtered.length > limit && (
        <button type="button" className="btn btn-ghost" onClick={() => setLimit(limit + PAGE_SIZE)}>
          Show more ({filtered.length - limit} left)
        </button>
      )}

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Delete this order?"
        message={toDelete ? `${formatMoney(toDelete.total, currency)} from ${format(toDelete.timestamp, 'd MMM, HH:mm')} will be removed from your sales totals.` : ''}
        confirmLabel="Delete order"
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) {
            await deleteOrder(toDelete.id)
            await reload()
          }
          setToDelete(null)
        }}
      />
    </Page>
  )
}
