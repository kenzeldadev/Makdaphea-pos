import Dexie from 'dexie'
import { uid } from '../utils/id'

export const db = new Dexie('noodle-pos')
// Only indexed fields are listed; other fields are stored automatically.
db.version(1).stores({
  menu: 'id, category, order',
  orders: 'id, timestamp, customerType',
  settings: 'key',
})

export const DEFAULT_SETTINGS = { currency: 'USD', shopName: 'Noodle Shop', soundOn: true }

// [name, price, emoji placeholder, category]
const SEED = [
  ['Rice with Chicken', 2.5, '🍗', 'main'],
  ['Rice with Meat', 2.5, '🍛', 'main'],
  ['Rice with Pork', 2.5, '🍖', 'main'],
  ['Noodle Soup with Meat', 3, '🍜', 'main'],
  ['Noodle Soup with Pork', 3, '🍲', 'main'],
  ['Extra Meat', 1, '🥩', 'addon'],
  ['Extra Rice', 0.5, '🍚', 'addon'],
  ['Extra Noodles', 0.5, '🍝', 'addon'],
]

// Seeds the default menu once. A flag stops it coming back after the owner deletes items.
export async function ensureSeed() {
  await db.transaction('rw', [db.menu, db.settings], async () => {
    if (await db.settings.get('seeded')) return
    if ((await db.menu.count()) === 0) {
      const t = Date.now()
      await db.menu.bulkAdd(
        SEED.map(([name, price, image, category], i) => ({
          id: uid(), name, price, image, category, active: true, order: i + 1, createdAt: t, updatedAt: t,
        })),
      )
    }
    await db.settings.put({ key: 'seeded', value: true })
  })
}

export async function loadSettings() {
  const result = { ...DEFAULT_SETTINGS }
  const rows = await db.settings.toArray()
  for (const row of rows) {
    if (row.key in DEFAULT_SETTINGS) result[row.key] = row.value
  }
  return result
}

export async function deleteOrder(id) {
  await db.orders.delete(id)
}

export async function resetAll() {
  await db.transaction('rw', [db.menu, db.orders, db.settings], async () => {
    await db.menu.clear()
    await db.orders.clear()
    await db.settings.clear()
  })
  await ensureSeed()
}
