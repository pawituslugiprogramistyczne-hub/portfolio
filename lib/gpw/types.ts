// Shared between the /api/gpw route handlers and the /gpw page.

export interface PricePoint {
  /** trading day in Warsaw time, "YYYY-MM-DD" */
  date: string
  open: number
  high: number
  low: number
  close: number
  /** close adjusted for dividends and splits; used for returns and comparisons */
  adjClose: number
  volume: number
}

export interface Dividend {
  /** ex-dividend date, "YYYY-MM-DD" */
  date: string
  /** per share, in the listing currency */
  amount: number
}

export interface History {
  symbol: string
  name: string
  currency: string
  type: string
  points: PricePoint[]
  dividends: Dividend[]
}

/** One row of the market overview (directory companies only). */
export interface OverviewRow {
  symbol: string
  price: number
  /** today's change in % (live session, or the last session when the market is closed) */
  change1d: number | null
  /** change since the last close of the previous year, in % (price only) */
  changeYtd: number | null
}

export interface NewsItem {
  title: string
  source: string
  url: string
  /** ISO timestamp */
  published: string
}

export interface Announcement {
  company: string
  subject: string
  url: string
  published: string
}

export interface SearchResult {
  symbol: string
  name: string
  type: "EQUITY" | "ETF"
  /** Yahoo's sector name (English), "ETF" for funds */
  sector?: string
}

/** Yahoo has no history for Warsaw indices, so WIG20 is tracked through the Beta ETF WIG20TR. */
export const BENCHMARK = { symbol: "ETFBW20TR.WA", label: "WIG20TR" }

/** Quick picks: large WIG20 companies. Every symbol checked against the data source. */
export const POPULAR: SearchResult[] = [
  { symbol: "PKO.WA", name: "PKO Bank Polski", type: "EQUITY" },
  { symbol: "PKN.WA", name: "Orlen", type: "EQUITY" },
  { symbol: "PZU.WA", name: "PZU", type: "EQUITY" },
  { symbol: "KGH.WA", name: "KGHM Polska Miedź", type: "EQUITY" },
  { symbol: "CDR.WA", name: "CD Projekt", type: "EQUITY" },
  { symbol: "ALE.WA", name: "Allegro.eu", type: "EQUITY" },
  { symbol: "LPP.WA", name: "LPP", type: "EQUITY" },
  { symbol: "DNP.WA", name: "Dino Polska", type: "EQUITY" },
  { symbol: "PEO.WA", name: "Bank Pekao", type: "EQUITY" },
  { symbol: "MBK.WA", name: "mBank", type: "EQUITY" },
]

export const DEFAULT_SYMBOL = "PKN.WA"

export const RANGES = ["1M", "3M", "6M", "YTD", "1Y", "3Y", "5Y"] as const
export type Range = (typeof RANGES)[number]
export const DEFAULT_RANGE: Range = "1Y"

/** Warsaw tickers only, e.g. "PKN.WA", "ETFBW20TR.WA". Also guards the API routes. */
export const SYMBOL_PATTERN = /^[A-Z0-9-]{1,15}\.WA$/
