import { create } from 'zustand'
import { db, ensureSeed, loadSettings, resetAll, DEFAULT_SETTINGS } from '../db/database'
import { uid } from '../utils/id'
import { buildLines, sumLines } from '../utils/order'

export const useStore = create((set, get) => {
  const reloadMenu = async () => set({ menu: await db.menu.orderBy('order').toArray() })
  const dropCount = (id) =>
    set((s) => {
      const counts = { ...s.counts }
      delete counts[id]
      return { counts }
    })

  return {
    ready: false,
    menu: [],
    settings: DEFAULT_SETTINGS,
    counts: {}, // { [menuItemId]: qty }  in memory only: instant, no DB round trip per tap
    customerType: 'local',

    // Load everything from IndexedDB into memory (also used after import/reset)
    init: async () => {
      await ensureSeed()
      const [menu, settings] = await Promise.all([db.menu.orderBy('order').toArray(), loadSettings()])
      set({ menu, settings, counts: {}, customerType: 'local', ready: true })
      // Ask the browser not to evict our data when storage is low
      navigator.storage?.persist?.()
    },

    // ---- Tap screen ----
    add: (id) => set((s) => ({ counts: { ...s.counts, [id]: (s.counts[id] ?? 0) + 1 } })),
    remove: (id) =>
      set((s) => {
        const next = (s.counts[id] ?? 0) - 1
        const counts = { ...s.counts }
        if (next > 0) counts[id] = next
        else delete counts[id]
        return { counts }
      }),
    clear: () => set({ counts: {}, customerType: 'local' }),
    restore: (counts, customerType) => set({ counts, customerType }),
    setCustomerType: (customerType) => set({ customerType }),

    confirmOrder: async () => {
      const { menu, counts, customerType } = get()
      const items = buildLines(menu.filter((m) => m.active), counts)
      if (items.length === 0) return null
      const now = Date.now()
      const order = {
        id: uid(), timestamp: now, items, total: sumLines(items), customerType,
        createdAt: now, updatedAt: now, syncedAt: null,
      }
      await db.orders.add(order)
      set({ counts: {}, customerType: 'local' })
      return order
    },

    // Undo a just-confirmed order: delete it and put its items back on screen
    undoOrder: async (order) => {
      await db.orders.delete(order.id)
      const counts = {}
      order.items.forEach((i) => {
        counts[i.id] = i.qty
      })
      set({ counts, customerType: order.customerType })
    },

    // ---- Menu editor ----
    // draft: { id?, name, price, image, category, active }
    saveItem: async (d) => {
      const now = Date.now()
      const existing = d.id ? get().menu.find((m) => m.id === d.id) : undefined
      if (existing) {
        await db.menu.put({ ...existing, name: d.name, price: d.price, image: d.image, category: d.category, active: d.active, updatedAt: now })
      } else {
        const maxOrder = Math.max(0, ...get().menu.map((m) => m.order))
        await db.menu.add({
          id: uid(), name: d.name, price: d.price, image: d.image, category: d.category,
          active: d.active, order: maxOrder + 1, createdAt: now, updatedAt: now, syncedAt: null,
        })
      }
      await reloadMenu()
    },

    deleteItem: async (id) => {
      await db.menu.delete(id)
      dropCount(id)
      await reloadMenu()
    },

    // Swap sort positions with the neighbour in the same category (dir = -1 up, 1 down)
    moveItem: async (id, dir) => {
      const me = get().menu.find((m) => m.id === id)
      if (!me) return
      const list = get().menu.filter((m) => m.category === me.category)
      const other = list[list.findIndex((m) => m.id === id) + dir]
      if (!other) return
      const now = Date.now()
      await db.menu.bulkPut([
        { ...me, order: other.order, updatedAt: now },
        { ...other, order: me.order, updatedAt: now },
      ])
      await reloadMenu()
    },

    setActive: async (id, active) => {
      const item = get().menu.find((m) => m.id === id)
      if (!item) return
      await db.menu.put({ ...item, active, updatedAt: Date.now() })
      if (!active) dropCount(id)
      await reloadMenu()
    },

    // ---- Settings ----
    setSetting: async (key, value) => {
      await db.settings.put({ key, value })
      set((s) => ({ settings: { ...s.settings, [key]: value } }))
    },

    resetData: async () => {
      await resetAll()
      await get().init()
    },
  }
})
