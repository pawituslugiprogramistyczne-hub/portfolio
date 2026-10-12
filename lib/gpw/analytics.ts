// Pure functions over price history; no I/O, so they run anywhere.
import type { PricePoint, Range } from "@/lib/gpw/types"

const TRADING_DAYS_PER_YEAR = 252

/** Simple moving average; null until there are `window` values. */
export function sma(values: number[], window: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null)
  let sum = 0
  values.forEach((v, i) => {
    sum += v
    if (i >= window) sum -= values[i - window]
    if (i >= window - 1) out[i] = sum / window
  })
  return out
}

/** Index of the first point inside the range, counted back from the latest trading day. */
export function rangeStartIndex(points: PricePoint[], range: Range): number {
  if (points.length === 0) return 0
  const last = new Date(`${points[points.length - 1].date}T00:00:00Z`)
  const start = new Date(last)
  const months: Partial<Record<Range, number>> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12, "3Y": 36, "5Y": 60 }
  if (range === "YTD") {
    start.setUTCMonth(0, 1)
  } else {
    start.setUTCMonth(start.getUTCMonth() - (months[range] ?? 12))
  }
  const iso = start.toISOString().slice(0, 10)
  const index = points.findIndex((p) => p.date >= iso)
  return index === -1 ? 0 : index
}

export interface PeriodStats {
  lastClose: number
  /** change vs the previous session, in % (null with a single session) */
  dayChange: number | null
  /** total return over the range (dividend-adjusted), in % */
  periodReturn: number
  high: number
  low: number
  /** annualized volatility of daily log returns, in % */
  volatility: number | null
  /** deepest peak-to-trough fall within the range (dividend-adjusted), in %, <= 0 */
  maxDrawdown: number
}

export function periodStats(all: PricePoint[], start: number): PeriodStats {
  const slice = all.slice(start)
  const last = all[all.length - 1]
  const prev = all[all.length - 2]

  const logReturns: number[] = []
  for (let i = 1; i < slice.length; i++) logReturns.push(Math.log(slice[i].adjClose / slice[i - 1].adjClose))
  let volatility: number | null = null
  if (logReturns.length >= 5) {
    const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length
    const variance = logReturns.reduce((a, r) => a + (r - mean) ** 2, 0) / (logReturns.length - 1)
    volatility = Math.sqrt(variance * TRADING_DAYS_PER_YEAR) * 100
  }

  let peak = -Infinity
  let maxDrawdown = 0
  for (const p of slice) {
    peak = Math.max(peak, p.adjClose)
    maxDrawdown = Math.min(maxDrawdown, (p.adjClose / peak - 1) * 100)
  }

  return {
    lastClose: last.close,
    dayChange: prev ? (last.close / prev.close - 1) * 100 : null,
    periodReturn: (slice[slice.length - 1].adjClose / slice[0].adjClose - 1) * 100,
    high: Math.max(...slice.map((p) => p.high)),
    low: Math.min(...slice.map((p) => p.low)),
    volatility,
    maxDrawdown,
  }
}

export interface ComparisonRow {
  date: string
  stock: number
  benchmark: number
}

/**
 * Both series rebased to 100 on the first shared trading day of the range, using
 * dividend-adjusted prices, so the chart has one honest y-axis (no dual scales).
 */
export function rebasedComparison(stock: PricePoint[], benchmark: PricePoint[], fromDate: string): ComparisonRow[] {
  const bench = new Map(benchmark.map((p) => [p.date, p.adjClose]))
  const shared = stock.filter((p) => p.date >= fromDate && bench.has(p.date))
  if (shared.length < 2) return []
  const stockBase = shared[0].adjClose
  const benchBase = bench.get(shared[0].date)!
  return shared.map((p) => ({
    date: p.date,
    stock: (p.adjClose / stockBase) * 100,
    benchmark: (bench.get(p.date)! / benchBase) * 100,
  }))
}

/** Relative Strength Index with Wilder's smoothing; null until there are enough sessions. */
export function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null
  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1]
    if (d > 0) gain += d
    else loss -= d
  }
  gain /= period
  loss /= period
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1]
    gain = (gain * (period - 1) + Math.max(d, 0)) / period
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period
  }
  if (loss === 0) return 100
  return 100 - 100 / (1 + gain / loss)
}

export type SignalTone = "bullish" | "neutral" | "bearish"
export type SignalId = "trend" | "cross" | "rsi" | "relative" | "high52"

export interface Signal {
  id: SignalId
  tone: SignalTone
  /** which sentence variant to show, e.g. "above" / "below" */
  variant: string
  /** values for the sentence's {placeholders}; numbers are formatted by the UI */
  vars: Record<string, number | string>
}

/**
 * Five transparent, rule-based technical signals. Each rule is published next to its result
 * on the page. They describe the chart; they are not buy/sell recommendations.
 */
export function technicalSignals(points: PricePoint[], benchmark: PricePoint[] | null): Signal[] {
  const closes = points.map((p) => p.close)
  const last = points[points.length - 1]
  const signals: Signal[] = []
  const sma50 = sma(closes, 50)
  const sma200 = sma(closes, 200)
  const s200 = sma200[sma200.length - 1]
  const s50 = sma50[sma50.length - 1]

  // 1. trend: price vs its 200-session average (within 1% counts as "at")
  if (s200 != null) {
    const pct = (last.close / s200 - 1) * 100
    signals.push({
      id: "trend",
      tone: pct > 1 ? "bullish" : pct < -1 ? "bearish" : "neutral",
      variant: pct > 1 ? "above" : pct < -1 ? "below" : "at",
      vars: { pct: Math.abs(pct) },
    })
  }

  // 2. 50/200 crossover: which average leads, and since when
  if (s200 != null && s50 != null) {
    const golden = s50 > s200
    let since = points[0].date
    for (let i = sma50.length - 1; i > 0; i--) {
      const a = sma50[i - 1]
      const b = sma200[i - 1]
      if (a == null || b == null) break
      if (a > b !== golden) {
        since = points[i].date
        break
      }
    }
    signals.push({ id: "cross", tone: golden ? "bullish" : "bearish", variant: golden ? "golden" : "death", vars: { date: since } })
  }

  // 3. momentum: 14-session RSI, classic 30/70 bands
  const r = rsi(closes)
  if (r != null) {
    signals.push({
      id: "rsi",
      tone: r > 70 ? "bearish" : r < 30 ? "bullish" : "neutral",
      variant: r > 70 ? "overbought" : r < 30 ? "oversold" : "normal",
      vars: { value: r },
    })
  }

  // 4. relative strength: 3-month total return vs WIG20TR (within 2 p.p. counts as in line)
  if (benchmark) {
    const from = points[rangeStartIndex(points, "3M")].date
    const rows = rebasedComparison(points, benchmark, from)
    if (rows.length > 1) {
      const end = rows[rows.length - 1]
      const diff = end.stock - end.benchmark
      signals.push({
        id: "relative",
        tone: diff > 2 ? "bullish" : diff < -2 ? "bearish" : "neutral",
        variant: diff > 2 ? "beat" : diff < -2 ? "lagged" : "inline",
        vars: { pp: Math.abs(diff) },
      })
    }
  }

  // 5. distance from the 52-week high (last ~252 sessions)
  const year = points.slice(-252)
  const high = Math.max(...year.map((p) => p.high))
  const below = (1 - last.close / high) * 100
  signals.push({
    id: "high52",
    tone: below <= 5 ? "bullish" : below >= 20 ? "bearish" : "neutral",
    variant: below <= 5 ? "near" : below >= 20 ? "far" : "mid",
    vars: { pct: below, high },
  })

  return signals
}

/** Dividends paid in the 12 months before the last session, as % of the latest price. */
export function trailingYield(points: PricePoint[], dividends: { date: string; amount: number }[]): number | null {
  if (points.length === 0) return null
  const last = points[points.length - 1]
  const cutoff = new Date(`${last.date}T00:00:00Z`)
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1)
  const from = cutoff.toISOString().slice(0, 10)
  const paid = dividends.filter((d) => d.date > from && d.date <= last.date).reduce((sum, d) => sum + d.amount, 0)
  return paid > 0 ? (paid / last.close) * 100 : null
}
