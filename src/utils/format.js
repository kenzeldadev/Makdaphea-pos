export function formatMoney(amount, currency = 'USD') {
  const digits = currency === 'KHR' ? 0 : 2 // riel has no cents in daily use
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

export const round2 = (n) => Math.round(n * 100) / 100
