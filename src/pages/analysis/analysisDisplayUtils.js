/** @param {unknown} score */
export function formatPredictionScore(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return '—'
  const pct = score <= 1 ? score * 100 : score
  return `${Number(pct.toFixed(1))}%`
}

/** @param {unknown} obj */
export function heuristicFeatureEntries(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
  return Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))
}

/** @param {string} key */
export function humanizeMetricKey(key) {
  return key.replace(/_/g, ' ')
}

/** @param {unknown} v */
export function formatMetricValue(v) {
  if (v === null || v === undefined) return '—'
  if (typeof v !== 'number' || Number.isNaN(v)) return String(v)
  if (Number.isInteger(v)) return String(v)
  return String(Number(v.toFixed(4)))
}

/**
 * @param {number[]} arr
 * @param {number} [maxShow]
 */
export function summarizeNumberArray(arr, maxShow = 12) {
  if (!Array.isArray(arr) || arr.length === 0) return '—'
  const head = arr.slice(0, maxShow).map((n) =>
    typeof n === 'number' && !Number.isNaN(n) ? Number(n.toFixed(4)) : n,
  )
  const extra = arr.length - maxShow
  return extra > 0 ? `${head.join(', ')} … (+${extra} more)` : head.join(', ')
}
