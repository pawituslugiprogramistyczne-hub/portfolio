// Server-side client for Yahoo Finance's public (unofficial, keyless) chart and search endpoints.
// This is the only file that knows about the provider; swap it to change data source.
import type { History, OverviewRow, PricePoint, SearchResult } from "@/lib/gpw/types"

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; pawit-gpw-explorer/1.0; +https://pawit.net/gpw)",
  Accept: "application/json",
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function getJson(url: string, revalidate: number) {
  const response = await fetch(url, { headers: HEADERS, next: { revalidate } })
  if (response.status === 429) throw new UpstreamError("rate-limited", 429)
  if (response.status === 404) throw new UpstreamError("not-found", 404)
  if (!response.ok) throw new UpstreamError(`upstream ${response.status}`, 502)
  return response.json()
}

interface Bar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/** Rows of a chart response, dated in Warsaw time; rows without a close are skipped. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBars(result: any): (Bar & { adjClose?: number })[] {
  const timestamps: number[] = result?.timestamp ?? []
  const quote = result?.indicators?.quote?.[0] ?? {}
  const adjusted: (number | null)[] = result?.indicators?.adjclose?.[0]?.adjclose ?? []
  const offset = Number(result?.meta?.gmtoffset ?? 0)
  const bars: (Bar & { adjClose?: number })[] = []
  timestamps.forEach((ts, i) => {
    const close = quote.close?.[i]
    if (close == null || !Number.isFinite(close)) return
    bars.push({
      date: new Date((ts + offset) * 1000).toISOString().slice(0, 10),
      open: quote.open?.[i] ?? close,
      high: quote.high?.[i] ?? close,
      low: quote.low?.[i] ?? close,
      close,
      volume: quote.volume?.[i] ?? 0,
      adjClose: adjusted[i] ?? undefined,
    })
  })
  return bars
}

/** Hourly bars rolled up into one bar per trading day. */
function dailyFromIntraday(bars: Bar[]): Map<string, Bar> {
  const days = new Map<string, Bar>()
  for (const b of bars) {
    const day = days.get(b.date)
    if (!day) {
      days.set(b.date, { ...b })
    } else {
      day.high = Math.max(day.high, b.high)
      day.low = Math.min(day.low, b.low)
      day.close = b.close
      day.volume += b.volume
    }
  }
  // drop days with no trading at all (only after-hours zero-volume ticks)
  days.forEach((bar, date) => {
    if (bar.volume === 0) days.delete(date)
  })
  return days
}

/** A forward-filled row: no trades, every price equal to the previous close. */
const isPlaceholder = (bar: Bar, previous?: Bar) =>
  bar.volume === 0 && bar.open === bar.close && bar.high === bar.close && bar.low === bar.close && (!previous || previous.close === bar.close)

/**
 * Five years of daily prices, cached for an hour.
 *
 * Yahoo's daily series for Warsaw stocks can lag by days, padding the gap with flat
 * zero-volume rows, while its hourly series is current. Recent days are therefore rebuilt
 * from the last month of hourly bars, and any padding that cannot be rebuilt is dropped.
 */
export async function getHistory(symbol: string): Promise<History> {
  const base = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`
  const [dailyJson, hourlyJson] = await Promise.all([
    getJson(`${base}?range=5y&interval=1d&events=div%2Csplit`, 3600),
    getJson(`${base}?range=1mo&interval=1h`, 3600).catch(() => null),
  ])
  const result = dailyJson?.chart?.result?.[0]
  if (!result || dailyJson?.chart?.error) throw new UpstreamError("not-found", 404)
  const meta = result.meta ?? {}

  // one row per date; a duplicated last date keeps the row that actually traded
  const daily: (Bar & { adjClose?: number })[] = []
  for (const bar of parseBars(result)) {
    const prev = daily[daily.length - 1]
    if (prev && prev.date === bar.date) {
      if (bar.volume > prev.volume) daily[daily.length - 1] = bar
    } else {
      daily.push(bar)
    }
  }

  const intraday = dailyFromIntraday(parseBars(hourlyJson?.chart?.result?.[0]))
  const byDate = new Map(daily.map((b) => [b.date, b]))
  intraday.forEach((bar, date) => {
    const existing = byDate.get(date)
    const index = existing ? daily.indexOf(existing) : -1
    if (!existing || isPlaceholder(existing, daily[index - 1])) byDate.set(date, { ...bar, adjClose: undefined })
  })

  const merged = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  // trailing padding the hourly data could not replace carries no information
  while (merged.length > 2 && isPlaceholder(merged[merged.length - 1], merged[merged.length - 2])) merged.pop()

  // rebuilt days have no adjusted close yet; adjustments only reach back in time,
  // so they continue from the latest adjusted ratio
  let ratio = 1
  const points: PricePoint[] = merged.map((b) => {
    if (b.adjClose != null && b.close) ratio = b.adjClose / b.close
    return { date: b.date, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume, adjClose: b.adjClose ?? b.close * ratio }
  })
  if (points.length < 2) throw new UpstreamError("not-found", 404)

  const rawDividends: Record<string, { amount: number; date: number }> = result.events?.dividends ?? {}
  const dividends = Object.values(rawDividends)
    .filter((d) => Number.isFinite(d.amount) && d.amount > 0)
    .map((d) => ({ date: new Date((d.date + Number(meta.gmtoffset ?? 0)) * 1000).toISOString().slice(0, 10), amount: d.amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    symbol: meta.symbol ?? symbol,
    name: meta.longName ?? meta.shortName ?? symbol,
    currency: meta.currency ?? "PLN",
    type: meta.instrumentType ?? "EQUITY",
    points,
    dividends,
  }
}

/**
 * Today's and year-to-date change for many symbols, via the batch "spark" endpoint
 * (max 20 symbols per call). Uses Yahoo's live day price, which stays current even
 * when its daily bars lag.
 */
export async function getOverview(symbols: string[]): Promise<OverviewRow[]> {
  const chunks: string[][] = []
  for (let i = 0; i < symbols.length; i += 20) chunks.push(symbols.slice(i, i + 20))
  const responses = await Promise.all(
    chunks.map((chunk) =>
      getJson(
        `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${chunk.map(encodeURIComponent).join(",")}&range=ytd&interval=1d`,
        900,
      ),
    ),
  )
  const rows: OverviewRow[] = []
  for (const json of responses) {
    for (const [symbol, s] of Object.entries<Record<string, unknown>>(json ?? {})) {
      const closes = ((s.close as (number | null)[]) ?? []).filter((v): v is number => v != null)
      const price = Number(s.fulldayPrice ?? closes[closes.length - 1])
      if (!Number.isFinite(price)) continue
      const base = Number(s.chartPreviousClose)
      rows.push({
        symbol,
        price,
        change1d: Number.isFinite(Number(s.fulldayChangePercent)) ? Number(s.fulldayChangePercent) : null,
        changeYtd: Number.isFinite(base) && base > 0 ? (price / base - 1) * 100 : null,
      })
    }
  }
  return rows
}

/** Name or ticker search, limited to Warsaw-listed stocks and ETFs (indices have no history). */
export async function searchSymbols(query: string): Promise<SearchResult[]> {
  // global search returns only ~7 hits, so broad words ("bank") rarely reach Warsaw listings;
  // the bundled lib/gpw/companies.ts directory covers those, this fills in the rest
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0&listsCount=0&region=PL&lang=pl-PL`
  const json = await getJson(url, 86400)
  const quotes: Record<string, unknown>[] = json?.quotes ?? []
  return quotes
    .filter((q) => q.exchange === "WSE" && (q.quoteType === "EQUITY" || q.quoteType === "ETF"))
    .map((q) => ({
      symbol: String(q.symbol),
      name: String(q.longname ?? q.shortname ?? q.symbol),
      type: q.quoteType as SearchResult["type"],
      sector: typeof q.sectorDisp === "string" ? q.sectorDisp : undefined,
    }))
}
