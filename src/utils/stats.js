import { eachDayOfInterval, format, getDay, getHours, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { round2 } from './format'

// period: 'today' | 'week' | 'month'
export function periodStart(period, now) {
  if (period === 'today') return startOfDay(now)
  if (period === 'week') return startOfWeek(now, { weekStartsOn: 1 }) // Monday
  return startOfMonth(now)
}

export function summarize(orders) {
  const byCustomer = {
    local: { count: 0, revenue: 0 },
    foreigner: { count: 0, revenue: 0 },
    chinese: { count: 0, revenue: 0 },
  }
  const items = new Map()
  const hours = Array.from({ length: 24 }, () => ({ orders: 0, revenue: 0 }))
  let revenue = 0
  let mainQty = 0
  let addonQty = 0

  for (const o of orders) {
    revenue += o.total
    const c = byCustomer[o.customerType] ?? byCustomer.local
    c.count++
    c.revenue += o.total
    const h = hours[getHours(o.timestamp)]
    h.orders++
    h.revenue += o.total
    for (const it of o.items) {
      const cur = items.get(it.id) ?? { name: it.name, qty: 0, revenue: 0, category: it.category }
      cur.qty += it.qty
      cur.revenue += it.qty * it.price
      items.set(it.id, cur)
      if (it.category === 'addon') addonQty += it.qty
      else mainQty += it.qty
    }
  }

  // Show 6am-8pm by default, widen only if there were sales outside that window
  let lo = 6
  let hi = 20
  hours.forEach((h, i) => {
    if (h.orders > 0) {
      lo = Math.min(lo, i)
      hi = Math.max(hi, i)
    }
  })
  const hourData = []
  for (let i = lo; i <= hi; i++) hourData.push({ hour: `${i}h`, orders: hours[i].orders, revenue: round2(hours[i].revenue) })

  return {
    revenue: round2(revenue),
    count: orders.length,
    avg: orders.length ? round2(revenue / orders.length) : 0,
    byCustomer,
    mainQty,
    addonQty,
    hourData,
    bestSellers: [...items.values()].sort((a, b) => b.qty - a.qty),
  }
}

// Average revenue for each weekday over the last 4 weeks (28 days).
export function dayOfWeekTrend(orders, now) {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const from = startOfDay(subDays(now, 27)).getTime()
  const totals = Array(7).fill(0)
  for (const o of orders) {
    if (o.timestamp >= from) totals[(getDay(o.timestamp) + 6) % 7] += o.total // Mon = 0
  }
  return names.map((day, i) => ({ day, revenue: round2(totals[i] / 4) }))
}

export function dailyRevenue(orders, from, to) {
  const map = new Map()
  for (const o of orders) {
    const k = format(o.timestamp, 'yyyy-MM-dd')
    map.set(k, (map.get(k) ?? 0) + o.total)
  }
  return eachDayOfInterval({ start: from, end: to }).map((d) => ({
    day: format(d, 'd MMM'),
    revenue: round2(map.get(format(d, 'yyyy-MM-dd')) ?? 0),
  }))
}
