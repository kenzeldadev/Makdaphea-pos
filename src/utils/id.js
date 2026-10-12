// randomUUID only exists on HTTPS/localhost, so keep a fallback for plain-HTTP LAN testing.
export function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}
