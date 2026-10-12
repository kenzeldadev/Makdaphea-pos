import { format } from 'date-fns'
import { db } from '../db/database'
import { CUSTOMER_TYPES } from './constants'

function download(filename, mime, content) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const stamp = () => format(new Date(), 'yyyy-MM-dd_HHmm')

export async function exportJSON() {
  const backup = {
    app: 'noodle-pos',
    version: 1,
    exportedAt: Date.now(),
    menu: await db.menu.orderBy('order').toArray(),
    orders: await db.orders.orderBy('timestamp').toArray(),
    settings: await db.settings.toArray(),
  }
  download(`noodle-pos-backup-${stamp()}.json`, 'application/json', JSON.stringify(backup))
}

export async function exportCSV() {
  const orders = await db.orders.orderBy('timestamp').toArray()
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  const label = (t) => CUSTOMER_TYPES.find((c) => c.value === t)?.label ?? t
  const rows = [['Order ID', 'Date', 'Time', 'Customer', 'Items', 'Total'].map(esc).join(',')]
  for (const o of orders) {
    rows.push(
      [
        o.id,
        format(o.timestamp, 'yyyy-MM-dd'),
        format(o.timestamp, 'HH:mm'),
        label(o.customerType),
        o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
        o.total.toFixed(2),
      ]
        .map(esc)
        .join(','),
    )
  }
  // BOM makes Excel open the file as UTF-8 (needed for Khmer item names)
  download(`noodle-pos-orders-${stamp()}.csv`, 'text/csv;charset=utf-8', '\ufeff' + rows.join('\r\n'))
}

// Replaces ALL local data with the contents of a backup file.
export async function importJSON(file) {
  const data = JSON.parse(await file.text())
  if (data.app !== 'noodle-pos' || !Array.isArray(data.menu) || !Array.isArray(data.orders)) {
    throw new Error('This is not a Noodle POS backup file.')
  }
  const { menu, orders } = data
  const settings = Array.isArray(data.settings) ? data.settings : []
  await db.transaction('rw', [db.menu, db.orders, db.settings], async () => {
    await db.menu.clear()
    await db.orders.clear()
    await db.settings.clear()
    await db.menu.bulkPut(menu)
    await db.orders.bulkPut(orders)
    await db.settings.bulkPut([...settings, { key: 'seeded', value: true }])
  })
  return { menu: menu.length, orders: orders.length }
}
