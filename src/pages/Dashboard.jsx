import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Page from '../components/Page'
import { useOrders } from '../hooks/useOrders'
import { useStore } from '../store/useStore'
import { CUSTOMER_TYPES } from '../utils/constants'
import { formatPrice } from '../utils/currency'
import { dailyRevenue, dayOfWeekTrend, periodStart, summarize } from '../utils/stats'

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

function Stat({ label, value }) {
  return (
    <div className="card flex-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</div>
      <div className="text-2xl font-bold tabular-nums tracking-tight text-[#202923] sm:text-3xl">{value}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <h2 className="mb-2 text-xl font-extrabold">{title}</h2>
      <div className="h-56">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const { orders, loading } = useOrders()
  const currency = useStore((s) => s.settings.currency)
  const [period, setPeriod] = useState('today')

  const now = useMemo(() => new Date(), [])
  const from = useMemo(() => periodStart(period, now), [period, now])
  const inPeriod = useMemo(() => orders.filter((o) => o.timestamp >= from.getTime()), [orders, from])
  const s = useMemo(() => summarize(inPeriod), [inPeriod])
  const dow = useMemo(() => dayOfWeekTrend(orders, now), [orders, now])
  const daily = useMemo(() => (period === 'today' ? [] : dailyRevenue(inPeriod, from, now)), [inPeriod, period, from, now])
  const money = (v) => formatPrice(Number(v), currency)
  const maxQty = s.bestSellers[0]?.qty ?? 1

  if (loading) return <Page title="Stats"><p className="text-lg">Loading…</p></Page>

  return (
    <Page title="Stats">
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button key={p.value} type="button" onClick={() => setPeriod(p.value)} className={`btn flex-1 ${period === p.value ? 'btn-dark' : 'btn-ghost'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Stat label="Revenue" value={money(s.revenue)} />
        <Stat label="Orders" value={String(s.count)} />
        <Stat label="Average order" value={money(s.avg)} />
        <Stat label="Dishes · add-ons" value={`${s.mainQty} · ${s.addonQty}`} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {CUSTOMER_TYPES.map((c) => {
          const d = s.byCustomer[c.value]
          const pct = s.count ? Math.round((d.count / s.count) * 100) : 0
          return (
            <div key={c.value} className="card">
              <div className="text-sm font-semibold text-stone-500">{c.label}</div>
              <div className="text-xl font-bold tabular-nums text-[#202923]">{d.count} orders · {pct}%</div>
              <div className="text-lg font-semibold text-stone-600">{money(d.revenue)}</div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChartCard title="Peak hours (orders)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s.hourData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" interval="preserveStartEnd" />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip />
              <Bar dataKey="orders" name="Orders" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Day of week (avg revenue, last 4 weeks)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dow}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis width={50} tickFormatter={money} />
              <Tooltip formatter={money} />
              <Bar dataKey="revenue" name="Revenue" fill="#1c1917" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {period !== 'today' && (
          <ChartCard title={period === 'week' ? 'Revenue this week' : 'Revenue this month'}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" interval="preserveStartEnd" />
                <YAxis width={50} tickFormatter={money} />
                <Tooltip formatter={money} />
                <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2 text-xl font-extrabold">Best sellers</h2>
        {s.bestSellers.length === 0 ? (
          <p className="text-lg text-stone-500">No sales in this period.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {s.bestSellers.slice(0, 10).map((b, i) => (
              <li key={b.name + i} className="relative overflow-hidden rounded-xl bg-stone-100 px-3 py-2">
                <div className="absolute inset-y-0 left-0 bg-red-200" style={{ width: `${(b.qty / maxQty) * 100}%` }} />
                <div className="relative flex items-center justify-between gap-2 text-lg">
                  <span className="min-w-0 truncate font-bold">{i + 1}. {b.name}</span>
                  <span className="shrink-0 font-extrabold tabular-nums">{b.qty} sold · {money(b.revenue)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Page>
  )
}
