import { round2 } from './format'

// Turn the live tap counts into order lines (only items with qty > 0).
export function buildLines(menu, counts) {
  return menu
    .filter((m) => (counts[m.id] ?? 0) > 0)
    .map((m) => ({ id: m.id, name: m.name, price: m.price, qty: counts[m.id], category: m.category }))
}

export const sumLines = (lines) => round2(lines.reduce((s, l) => s + l.price * l.qty, 0))

// Pick a column count so a handful of cards fill the screen without scrolling.
export function gridCols(n, max = 4) {
  return Math.max(1, Math.min(max, Math.ceil(Math.sqrt(n * 1.6))))
}
