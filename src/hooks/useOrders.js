import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/database'

// Loads all orders (newest first). Call reload() after changing them.
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setOrders(await db.orders.orderBy('timestamp').reverse().toArray())
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { orders, loading, reload }
}
