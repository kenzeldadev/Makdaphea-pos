export const RATE = { USD: 1, KHR: 4000 }

export function formatPrice(usd, currency = 'USD') {
  if (currency === 'KHR') {
    const khr = Math.round((usd * RATE.KHR) / 100) * 100
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(khr)}R`
  }

  const amount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd * RATE.USD)
  return `$${amount}`
}
