"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDownRight, ArrowUpRight, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Skeleton } from "@/components/ui/skeleton"
import { GpwSearch } from "@/components/gpw/gpw-search"
import { TimeSeriesChart, type ChartSeries } from "@/components/gpw/time-series-chart"
import { SignalsPanel } from "@/components/gpw/signals-panel"
import { DividendsPanel, NewsPanel, PeersPanel } from "@/components/gpw/company-side-panels"
import { MarketOverview } from "@/components/gpw/market-overview"
import { displayName, useGpwFormat } from "@/components/gpw/format"
import { useWatchlist } from "@/components/gpw/use-gpw-data"
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
} from "@/lib/gpw/types"

type LoadState = { status: "loading" } | { status: "ready"; data: History } | { status: "error"; code: string }

async function loadHistory(symbol: string, signal?: AbortSignal): Promise<History> {
  const response = await fetch(`/api/gpw/history?symbol=${encodeURIComponent(symbol)}`, { signal })
  const json = await response.json()
  if (!response.ok) throw new Error(json?.error ?? "upstream-error")
  return json as History
}

const panel = "rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] md:p-6"

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

  // URL is the source of truth, so every view is shareable (/gpw?s=KGH.WA&r=3Y, /gpw?v=market)
  const navigate = useCallback(
    (next: { s?: string; r?: Range; v?: "company" | "market" }) => {
      const query = new URLSearchParams({ s: next.s ?? symbol, r: next.r ?? range })
      if ((next.v ?? mode) === "market") query.set("v", "market")
      router.replace(`/gpw?${query.toString()}`, { scroll: false })
    },
    [router, symbol, range, mode],
  )
  // choosing a company from anywhere (search, movers, peers) opens its view at the top
  const openCompany = useCallback(
    (s: string) => {
      navigate({ s, v: "company" })
      window.scrollTo({ top: 0, behavior: "smooth" })
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
        { id: "bench", label: t("gpw.series.benchmark"), color: "var(--viz-series-2)", values: view.comparison.map((r) => r.benchmark), endLabel: true },
      ]
    : []

  const errorText = (code: string) =>
    code === "not-found" ? t("gpw.error.notFound") : code === "rate-limited" ? t("gpw.error.rateLimited") : t("gpw.error.generic")

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label={t("gpw.tabs.label")} className="flex gap-6 border-b border-slate-200 dark:border-white/10">
        {(["company", "market"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => navigate({ v: m })}
            className={`-mb-px border-b-2 pb-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              mode === m
                ? "border-brand text-slate-900 dark:text-slate-50"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {m === "company" ? t("gpw.tabs.company") : t("gpw.tabs.market")}
          </button>
        ))}
      </div>

      {/* filters: one row above everything they scope */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <GpwSearch onSelect={(r) => openCompany(r.symbol)} />
        {mode === "company" && (
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label={t("gpw.range")} className="inline-flex rounded-full border border-slate-300 p-1 dark:border-white/15">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={r === range}
                onClick={() => navigate({ r })}
                className={`h-8 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  r === range
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {r === "YTD" ? t("gpw.ytd") : r}
              </button>
            ))}
          </div>
          {[
            { label: "SMA 50", on: showSma50, toggle: () => setShowSma50((v) => !v), color: "var(--viz-series-2)" },
            { label: "SMA 200", on: showSma200, toggle: () => setShowSma200((v) => !v), color: "var(--viz-series-3)" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={o.on}
              onClick={o.toggle}
              className={`viz-root inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                o.on
                  ? "border-slate-400 text-slate-900 dark:border-white/30 dark:text-slate-50"
                  : "border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-500"
              }`}
            >
              <span aria-hidden="true" className="h-0.5 w-4 rounded-full" style={{ background: o.on ? o.color : "currentColor" }} />
              {o.label}
            </button>
          ))}
        </div>
        )}
      </div>

      {mode === "market" && <MarketOverview onSelect={openCompany} />}

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
              title={companyBySymbol.get(w)?.name}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                w === symbol
                  ? "border-brand bg-brand/10 text-slate-900 dark:text-slate-50"
                  : "border-amber-400/60 text-slate-700 hover:border-brand hover:text-brand dark:text-slate-300"
              }`}
            >
              {w.replace(/\.WA$/, "")}
            </button>
          ))}
        </div>
      )}

      {mode === "company" && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-slate-600 dark:text-slate-400">{t("gpw.popular")}</span>
        {POPULAR.map((p) => (
          <button
            key={p.symbol}
            type="button"
            onClick={() => navigate({ s: p.symbol })}
            aria-current={p.symbol === symbol ? "true" : undefined}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              p.symbol === symbol
                ? "border-brand bg-brand/10 text-slate-900 dark:text-slate-50"
                : "border-slate-300 text-slate-700 hover:border-brand hover:text-brand dark:border-white/15 dark:text-slate-300"
            }`}
            title={p.name}
          >
            {p.symbol.replace(/\.WA$/, "")}
          </button>
        ))}
      </div>
      )}

      {mode === "company" && state.status === "error" && (
        <div role="alert" className={`${panel} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="text-slate-700 dark:text-slate-300">
            <span className="font-mono">{symbol.replace(/\.WA$/, "")}</span>: {errorText(state.code)}
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
        <div className="space-y-6" aria-busy="true" aria-live="polite">
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
        <div className={`space-y-6 transition-opacity duration-200 ${isRefetching ? "opacity-50" : ""}`} aria-busy={isRefetching}>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">{displayName(shown.name, shown.symbol)}</h2>
            <button
              type="button"
              aria-pressed={watchlist.has(shown.symbol)}
              onClick={() => watchlist.toggle(shown.symbol)}
              className="inline-flex h-8 items-center gap-1.5 self-center rounded-full border border-slate-300 px-3 text-sm text-slate-700 transition-colors hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-white/15 dark:text-slate-300"
            >
              <Star className={`h-4 w-4 ${watchlist.has(shown.symbol) ? "fill-amber-400 text-amber-500" : ""}`} aria-hidden="true" />
              {watchlist.has(shown.symbol) ? t("gpw.watchlist.saved") : t("gpw.watchlist.save")}
            </button>
            <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
              {shown.symbol.replace(/\.WA$/, "")} | GPW | {shown.currency}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {t("gpw.dataThrough")} {fmt.full.format(new Date(`${shown.points[shown.points.length - 1].date}T00:00:00Z`))}
            </span>
          </div>

          {/* stat tiles: the numbers first, the charts explain them */}
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label={t("gpw.stats.lastClose")} value={`${fmt.price.format(view.stats.lastClose)} ${shown.currency}`}>
              {view.stats.dayChange != null && (
                <Delta value={view.stats.dayChange} text={`${fmt.pct.format(view.stats.dayChange)}% ${t("gpw.stats.vsPrevious")}`} />
              )}
            </StatTile>
            <StatTile label={`${t("gpw.stats.totalReturn")} (${range === "YTD" ? t("gpw.ytd") : range})`} value={`${fmt.pct.format(view.stats.periodReturn)}%`}>
              {view.benchmarkReturn != null && (
                <Delta
                  value={view.stats.periodReturn - view.benchmarkReturn}
                  text={`${fmt.pct.format(view.stats.periodReturn - view.benchmarkReturn)} p.p. ${t("gpw.stats.vsBenchmark")}`}
                />
              )}
            </StatTile>
            <StatTile label={t("gpw.stats.volatility")} value={view.stats.volatility != null ? `${fmt.plainPct.format(view.stats.volatility)}%` : "-"}>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("gpw.stats.volatilityNote")}</p>
            </StatTile>
            <StatTile label={t("gpw.stats.maxDrawdown")} value={`${fmt.pct.format(view.stats.maxDrawdown)}%`}>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("gpw.stats.rangeLowHigh")} {fmt.price.format(view.stats.low)} - {fmt.price.format(view.stats.high)}
              </p>
            </StatTile>
          </dl>

          <section className={panel} aria-labelledby="gpw-price-title">
            <h3 id="gpw-price-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {t("gpw.price.title")}
            </h3>
            <p className="mb-5 mt-1 text-sm text-slate-600 dark:text-slate-400">
              {t("gpw.price.subtitle")} ({shown.currency})
            </p>
            <TimeSeriesChart
              dates={view.slice.map((p) => p.date)}
              series={priceSeries}
              volumes={view.slice.map((p) => p.volume)}
              volumeLabel={t("gpw.series.volume")}
              height={300}
              ariaLabel={`${t("gpw.price.title")}: ${shown.name}. ${t("gpw.chartHint")}`}
              formatValue={(v) => fmt.price.format(v)}
              formatTick={(v) => fmt.tick.format(v)}
              formatVolume={(v) => fmt.compact.format(v)}
              formatDate={formatDate}
            />
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
          <details className={`${panel} group`}>
            <summary className="cursor-pointer select-none font-medium text-slate-900 marker:text-brand dark:text-slate-50">
              {t("gpw.table.show")} ({view.slice.length})
            </summary>
            <div className="mt-4 max-h-96 overflow-auto">
              <table className="w-full text-left text-sm tabular-nums">
                <thead className="sticky top-0 bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("gpw.table.date")}</th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">{t("gpw.series.close")}</th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">{t("gpw.table.change")}</th>
                    <th scope="col" className="py-2 text-right font-medium">{t("gpw.series.volume")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-white/5 dark:text-slate-200">
                  {[...view.slice].reverse().map((p, i, arr) => {
                    const prev = arr[i + 1]
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
      )}
    </div>
  )
}

function StatTile({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className={`${panel} flex flex-col gap-1.5`}>
      <dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</dd>
      {children && <dd>{children}</dd>}
    </div>
  )
}

/** Signed change with an arrow, so direction never relies on color alone. */
function Delta({ value, text }: { value: number; text: string }) {
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <p className={`inline-flex items-center gap-1 text-sm font-medium ${up ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {text}
    </p>
  )
}
