"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDownRight, ArrowUpRight, Minus, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Skeleton } from "@/components/ui/skeleton"
import { GpwSearch } from "@/components/gpw/gpw-search"
import { Segmented } from "@/components/gpw/segmented"
import { TimeSeriesChart, type ChartSeries } from "@/components/gpw/time-series-chart"
import { SignalsPanel } from "@/components/gpw/signals-panel"
import { DividendsPanel, NewsPanel, PeersPanel } from "@/components/gpw/company-side-panels"
import { MarketOverview } from "@/components/gpw/market-overview"
import { displayName, useGpwFormat } from "@/components/gpw/format"
import { fill, useWatchlist } from "@/components/gpw/use-gpw-data"
import { companyBySymbol } from "@/lib/gpw/companies"
import { periodStats, rangeStartIndex, rebasedComparison, sma } from "@/lib/gpw/analytics"
import {
  BENCHMARK,
  DEFAULT_RANGE,
  DEFAULT_SYMBOL,
  POPULAR,
  RANGES,
  SYMBOL_PATTERN,
  type History,
  type Range,
  type SearchResult,
} from "@/lib/gpw/types"

type LoadState = { status: "loading" } | { status: "ready"; data: History } | { status: "error"; code: string }

async function loadHistory(symbol: string, signal?: AbortSignal): Promise<History> {
  const response = await fetch(`/api/gpw/history?symbol=${encodeURIComponent(symbol)}`, { signal })
  const json = await response.json()
  if (!response.ok) throw new Error(json?.error ?? "upstream-error")
  return json as History
}

const panel = "rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] md:p-6"
const ticker = (symbol: string) => symbol.replace(/\.WA$/, "")
const nameOf = (symbol: string) => displayName(companyBySymbol.get(symbol)?.name ?? ticker(symbol), symbol)
const asResult = (symbol: string): SearchResult => companyBySymbol.get(symbol) ?? { symbol, name: ticker(symbol), type: "EQUITY" }
const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function GpwExplorer() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useSearchParams()

  const paramSymbol = params.get("s")?.toUpperCase() ?? ""
  const symbol = SYMBOL_PATTERN.test(paramSymbol) ? paramSymbol : DEFAULT_SYMBOL
  const paramRange = params.get("r")?.toUpperCase() as Range | undefined
  const range: Range = paramRange && RANGES.includes(paramRange) ? paramRange : DEFAULT_RANGE
  const mode: "company" | "market" = params.get("v") === "market" ? "market" : "company"
  const watchlist = useWatchlist()

  const [state, setState] = useState<LoadState>({ status: "loading" })
  // the last successful load stays on screen (dimmed) while the next one arrives
  const [shown, setShown] = useState<History | null>(null)
  const [benchmark, setBenchmark] = useState<History | null>(null)
  const [benchmarkFailed, setBenchmarkFailed] = useState(false)
  const [showSma50, setShowSma50] = useState(true)
  const [showSma200, setShowSma200] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const tableRef = useRef<HTMLDetailsElement>(null)
  // set when the reader picked a company, so focus follows them to its heading
  const focusHeading = useRef(false)

  // URL is the source of truth, so every view is shareable (/gpw?s=KGH.WA&r=3Y, /gpw?v=market)
  const href = useCallback(
    (next: { s?: string; r?: Range; v?: "company" | "market" }) => {
      const query = new URLSearchParams({ s: next.s ?? symbol, r: next.r ?? range })
      if ((next.v ?? mode) === "market") query.set("v", "market")
      return `/gpw?${query.toString()}`
    },
    [symbol, range, mode],
  )
  const navigate = useCallback(
    (next: { s?: string; r?: Range; v?: "company" | "market" }) => router.replace(href(next), { scroll: false }),
    [router, href],
  )
  // choosing a company from anywhere (search, movers, peers, watchlist) opens its view at the top
  const openCompany = useCallback(
    (s: string) => {
      focusHeading.current = true
      navigate({ s, v: "company" })
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
    },
    [navigate],
  )

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: "loading" })
    loadHistory(symbol, controller.signal)
      .then((data) => {
        setState({ status: "ready", data })
        setShown(data)
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setState({ status: "error", code: error.message })
      })
    return () => controller.abort()
  }, [symbol, attempt])

  useEffect(() => {
    loadHistory(BENCHMARK.symbol)
      .then(setBenchmark)
      .catch(() => setBenchmarkFailed(true))
  }, [])

  // the heading exists as soon as there is something to show (it names the pending company while loading)
  useEffect(() => {
    if (focusHeading.current && headingRef.current) {
      focusHeading.current = false
      headingRef.current.focus({ preventScroll: true })
    }
  })

  const fmt = useGpwFormat()

  const view = useMemo(() => {
    if (!shown) return null
    const points = shown.points
    const start = rangeStartIndex(points, range)
    const closes = points.map((p) => p.close)
    const sma50 = sma(closes, 50)
    const sma200 = sma(closes, 200)
    const slice = points.slice(start)
    const comparison = benchmark ? rebasedComparison(points, benchmark.points, slice[0].date) : []
    const stats = periodStats(points, start)
    const benchmarkReturn =
      comparison.length > 1 ? comparison[comparison.length - 1].benchmark - 100 : null
    return {
      slice,
      // the session before the range, so the first table row still gets a change
      before: start > 0 ? points[start - 1] : null,
      sma50: sma50.slice(start),
      sma200: sma200.slice(start),
      comparison,
      stats,
      benchmarkReturn,
      shortRange: ["1M", "3M", "6M", "YTD"].includes(range),
    }
  }, [shown, benchmark, range])

  const formatDate = (date: string, style: "axis" | "tooltip") => {
    const d = new Date(`${date}T00:00:00Z`)
    if (style === "tooltip") return fmt.full.format(d)
    return view?.shortRange ? fmt.dayMonth.format(d) : fmt.monthYear.format(d)
  }

  const isRefetching = state.status === "loading" && shown !== null
  const stale = shown && shown.symbol !== symbol && state.status === "error"
  // while the next company loads, the header already names it; the numbers below stay dimmed
  const headerName = shown && shown.symbol === symbol ? displayName(shown.name, shown.symbol) : nameOf(symbol)
  const rangeLabel = range === "YTD" ? t("gpw.ytd") : range

  const priceSeries: ChartSeries[] = view
    ? [
        { id: "close", label: t("gpw.series.close"), color: "var(--viz-series-1)", values: view.slice.map((p) => p.close), area: true, endLabel: true },
        ...(showSma50 ? [{ id: "sma50", label: "SMA 50", color: "var(--viz-series-2)", values: view.sma50 }] : []),
        ...(showSma200 ? [{ id: "sma200", label: "SMA 200", color: "var(--viz-series-3)", values: view.sma200 }] : []),
      ]
    : []

  const compareSeries: ChartSeries[] = view
    ? [
        { id: "stock", label: displayName(shown!.name, shown!.symbol), color: "var(--viz-series-1)", values: view.comparison.map((r) => r.stock), endLabel: true },
        { id: "bench", label: t("gpw.series.benchmark"), color: "var(--viz-benchmark)", values: view.comparison.map((r) => r.benchmark), endLabel: true },
      ]
    : []

  const errorText = (code: string) =>
    code === "not-found" ? t("gpw.error.notFound") : code === "rate-limited" ? t("gpw.error.rateLimited") : t("gpw.error.generic")

  // empty search field: the reader's watchlist first, then the popular large caps
  const suggestions = [
    { label: t("gpw.watchlist.title"), items: watchlist.list.map(asResult) },
    { label: t("gpw.popular"), items: POPULAR.filter((p) => !watchlist.has(p.symbol)) },
  ].filter((g) => g.items.length > 0)

  const openTable = () => {
    const details = tableRef.current
    if (!details) return
    details.open = true
    details.querySelector("summary")?.focus()
    details.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" })
  }

  return (
    <div className="space-y-6">
      <nav aria-label={t("gpw.tabs.label")} className="flex gap-6 border-b border-slate-200 dark:border-white/10">
        {(["company", "market"] as const).map((m) => (
          <Link
            key={m}
            href={href({ v: m })}
            replace
            scroll={false}
            aria-current={mode === m ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              mode === m
                ? "border-brand text-slate-900 dark:text-slate-50"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {m === "company" ? t("gpw.tabs.company") : t("gpw.tabs.market")}
          </Link>
        ))}
      </nav>

      <GpwSearch onSelect={(r) => openCompany(r.symbol)} suggestions={suggestions} />

      {mode === "market" && <MarketOverview onSelect={openCompany} />}

      {/* the reader's own picks are the one chip row; popular picks live in the search dropdown */}
      {mode === "company" && watchlist.list.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
            {t("gpw.watchlist.title")}:
          </span>
          {watchlist.list.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => openCompany(w)}
              aria-current={w === symbol ? "true" : undefined}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                w === symbol
                  ? "border-brand bg-brand/10 text-slate-900 dark:text-slate-50"
                  : "border-slate-300 text-slate-800 hover:border-brand hover:text-brand dark:border-white/15 dark:text-slate-200"
              }`}
            >
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{ticker(w)}</span>
              {nameOf(w)}
            </button>
          ))}
        </div>
      )}

      {mode === "company" && state.status === "error" && (
        <div role="alert" className={`${panel} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="text-slate-700 dark:text-slate-300">
            <span className="font-mono">{ticker(symbol)}</span>: {errorText(state.code)}
          </p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="h-10 shrink-0 rounded-full border border-slate-300 px-5 text-sm font-medium hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-white/20"
          >
            {t("gpw.error.retry")}
          </button>
        </div>
      )}

      {mode === "company" && !view && state.status === "loading" && (
        <div className="space-y-6" aria-busy="true">
          <p role="status" className="sr-only">
            {fill(t("gpw.loading"), { name: nameOf(symbol) })}
          </p>
          <Skeleton className="h-10 w-72 bg-slate-200 dark:bg-white/10" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
          <Skeleton className="h-[420px] rounded-2xl bg-slate-200 dark:bg-white/10" />
        </div>
      )}

      {mode === "company" && view && shown && !stale && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="rounded-lg text-2xl font-semibold tracking-tight text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-50 md:text-3xl"
              >
                {headerName}
              </h2>
              {/* constant label: aria-pressed alone carries the on/off state */}
              <button
                type="button"
                aria-pressed={watchlist.has(symbol)}
                onClick={() => watchlist.toggle(symbol)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  watchlist.has(symbol)
                    ? "border-amber-400 bg-amber-50 text-slate-900 dark:bg-amber-400/10 dark:text-slate-50"
                    : "border-slate-300 text-slate-700 dark:border-white/15 dark:text-slate-300"
                }`}
              >
                <Star className={`h-4 w-4 ${watchlist.has(symbol) ? "fill-amber-400 text-amber-500" : ""}`} aria-hidden="true" />
                {t("gpw.watchlist.title")}
              </button>
            </div>
            <p className="flex flex-wrap gap-x-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-mono">{ticker(symbol)}</span>
              <span aria-hidden="true">·</span>
              <span>GPW</span>
              <span aria-hidden="true">·</span>
              <span>{shown.currency}</span>
              <span aria-hidden="true">·</span>
              <span>
                {t("gpw.dataThrough")} {fmt.full.format(new Date(`${shown.points[shown.points.length - 1].date}T00:00:00Z`))}
              </span>
            </p>
            <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
              {isRefetching ? fill(t("gpw.loading"), { name: headerName }) : ""}
            </p>
            {/* the range scopes everything below: tiles, both charts, the table */}
            <Segmented
              label={t("gpw.range")}
              value={range}
              onChange={(r) => navigate({ r })}
              options={RANGES.map((r) => ({ value: r, label: r === "YTD" ? t("gpw.ytd") : r }))}
            />
          </div>

          <div className={`space-y-6 transition-opacity duration-200 ${isRefetching ? "opacity-50" : ""}`} aria-busy={isRefetching}>
            {/* stat tiles: the numbers first, the charts explain them */}
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label={t("gpw.stats.lastClose")} value={`${fmt.price.format(view.stats.lastClose)} ${shown.currency}`}>
                {view.stats.dayChange != null && (
                  <Delta value={view.stats.dayChange} text={`${fmt.pct.format(view.stats.dayChange)}% ${t("gpw.stats.vsPrevious")}`} />
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {fill(t("gpw.stats.rangeLowHigh"), { range: rangeLabel, low: fmt.price.format(view.stats.low), high: fmt.price.format(view.stats.high) })}
                </p>
              </StatTile>
              <StatTile label={`${t("gpw.stats.totalReturn")} (${rangeLabel})`} value={`${fmt.pct.format(view.stats.periodReturn)}%`}>
                {view.benchmarkReturn != null && (
                  <Delta
                    value={view.stats.periodReturn - view.benchmarkReturn}
                    text={`${fmt.pct.format(view.stats.periodReturn - view.benchmarkReturn)} ${t("gpw.pp")} ${t("gpw.stats.vsBenchmark")}`}
                  />
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("gpw.stats.totalReturnNote")}</p>
              </StatTile>
              <StatTile label={t("gpw.stats.volatility")} value={view.stats.volatility != null ? `${fmt.plainPct.format(view.stats.volatility)}%` : "-"}>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("gpw.stats.volatilityNote")}</p>
              </StatTile>
              <StatTile label={t("gpw.stats.maxDrawdown")} value={`${fmt.pct.format(view.stats.maxDrawdown)}%`}>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("gpw.stats.drawdownNote")}</p>
              </StatTile>
            </dl>

            <section className={panel} aria-labelledby="gpw-price-title">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 id="gpw-price-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {t("gpw.price.title")}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t("gpw.price.subtitle")} ({shown.currency})
                  </p>
                </div>
                {/* overlays only change this chart, so they sit on it */}
                <div className="viz-root flex flex-wrap gap-2">
                  {[
                    { label: "SMA 50", on: showSma50, toggle: () => setShowSma50((v) => !v), color: "var(--viz-series-2)" },
                    { label: "SMA 200", on: showSma200, toggle: () => setShowSma200((v) => !v), color: "var(--viz-series-3)" },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      aria-pressed={o.on}
                      onClick={o.toggle}
                      className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        o.on
                          ? "border-slate-400 text-slate-900 dark:border-white/30 dark:text-slate-50"
                          : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-400"
                      }`}
                    >
                      <span aria-hidden="true" className="h-0.5 w-4 rounded-full" style={{ background: o.on ? o.color : "currentColor" }} />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <TimeSeriesChart
                dates={view.slice.map((p) => p.date)}
                series={priceSeries}
                volumes={view.slice.map((p) => p.volume)}
                volumeLabel={t("gpw.series.volume")}
                height={300}
                ariaLabel={`${t("gpw.price.title")}: ${displayName(shown.name, shown.symbol)}. ${t("gpw.chartHint")}`}
                formatValue={(v) => fmt.price.format(v)}
                formatTick={(v) => fmt.tick.format(v)}
                formatVolume={(v) => fmt.compact.format(v)}
                formatDate={formatDate}
              />
              <button
                type="button"
                onClick={openTable}
                className="mt-3 text-sm text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {t("gpw.table.link")}
              </button>
            </section>

            <section className={panel} aria-labelledby="gpw-compare-title">
              <h3 id="gpw-compare-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {t("gpw.compare.title")}
              </h3>
              <p className="mb-5 mt-1 max-w-[70ch] text-sm text-slate-600 dark:text-slate-400">{t("gpw.compare.subtitle")}</p>
              {view.comparison.length > 1 ? (
                <TimeSeriesChart
                  dates={view.comparison.map((r) => r.date)}
                  series={compareSeries}
                  baseline={100}
                  height={260}
                  ariaLabel={`${t("gpw.compare.title")}. ${t("gpw.chartHint")}`}
                  formatValue={(v) => fmt.tick.format(Math.round(v * 10) / 10)}
                  formatDate={formatDate}
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400">{benchmarkFailed ? t("gpw.compare.unavailable") : t("gpw.compare.loading")}</p>
              )}
            </section>

            {/* table view: every value in the charts, reachable without hovering */}
            <details ref={tableRef} className={`${panel} group scroll-mt-24`}>
              <summary className="cursor-pointer select-none rounded font-medium text-slate-900 marker:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-50">
                {t("gpw.table.show")} ({view.slice.length})
              </summary>
              <div className="mt-4 max-h-96 overflow-auto">
                <table className="w-full text-left text-sm tabular-nums">
                  {/* solid equivalent of the panel (white/3% over slate-950), so the sticky header matches it */}
                  <thead className="sticky top-0 bg-white text-slate-600 dark:bg-[#0a0e1e] dark:text-slate-400">
                    <tr>
                      <th scope="col" className="py-2 pr-4 font-medium">{t("gpw.table.date")}</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">{t("gpw.series.close")}</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">{t("gpw.table.change")}</th>
                      <th scope="col" className="py-2 text-right font-medium">{t("gpw.series.volume")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-white/5 dark:text-slate-200">
                    {[...view.slice].reverse().map((p, i, arr) => {
                      const prev = arr[i + 1] ?? view.before
                      return (
                        <tr key={p.date}>
                          <td className="py-1.5 pr-4">{fmt.full.format(new Date(`${p.date}T00:00:00Z`))}</td>
                          <td className="py-1.5 pr-4 text-right">{fmt.price.format(p.close)}</td>
                          <td className="py-1.5 pr-4 text-right">{prev ? `${fmt.pct.format((p.close / prev.close - 1) * 100)}%` : "-"}</td>
                          <td className="py-1.5 text-right">{fmt.integer.format(p.volume)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </details>

            <SignalsPanel points={shown.points} benchmark={benchmark?.points ?? null} className={panel} />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <NewsPanel symbol={shown.symbol} className={`${panel} min-w-0`} />
              <div className="min-w-0 space-y-6">
                <PeersPanel symbol={shown.symbol} onSelect={openCompany} className={panel} />
                <DividendsPanel points={shown.points} dividends={shown.dividends ?? []} currency={shown.currency} className={panel} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className={`${panel} flex flex-col gap-1.5`}>
      <dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</dd>
      {children && <dd className="space-y-1">{children}</dd>}
    </div>
  )
}

/** Signed change with an arrow, so direction never relies on color alone; same flat band as Change. */
function Delta({ value, text }: { value: number; text: string }) {
  const up = value > 0.05
  const down = value < -0.05
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
  return (
    <p
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        up ? "text-emerald-700 dark:text-emerald-400" : down ? "text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-400"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {text}
    </p>
  )
}
