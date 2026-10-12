"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ExternalLink, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Skeleton } from "@/components/ui/skeleton"
import { COMPANIES } from "@/lib/gpw/companies"
import type { Announcement, OverviewRow, SearchResult } from "@/lib/gpw/types"
import { Change, displayName, useGpwFormat, useSectorLabel } from "@/components/gpw/format"
import { fill, useJson, useOverview, useWatchlist } from "@/components/gpw/use-gpw-data"

const panel = "rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] md:p-6"
const heading = "text-lg font-semibold text-slate-900 dark:text-slate-50"
const muted = "text-sm text-slate-600 dark:text-slate-400"

type Metric = "change1d" | "changeYtd"
type SortKey = "name" | Metric
type Joined = { company: SearchResult; row: OverviewRow }


export function MarketOverview({ onSelect }: { onSelect: (symbol: string) => void }) {
  const { t } = useLanguage()
  const fmt = useGpwFormat()
  const sectorLabel = useSectorLabel()
  const overview = useOverview()
  const watchlist = useWatchlist()
  const announcements = useJson<Announcement[]>("/api/gpw/announcements", (j) => (j.items as Announcement[]) ?? [])
  const [metric, setMetric] = useState<Metric>("change1d")
  const [sector, setSector] = useState<string | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "change1d", desc: true })

  const joined: Joined[] = useMemo(() => {
    if (overview.status !== "ready") return []
    return COMPANIES.flatMap((company) => {
      const row = overview.data.get(company.symbol)
      return row ? [{ company, row }] : []
    })
  }, [overview])

  const stocks = joined.filter((j) => j.company.type === "EQUITY" && j.row.change1d != null)
  const gainers = [...stocks].sort((a, b) => b.row.change1d! - a.row.change1d!).slice(0, 5)
  const losers = [...stocks].sort((a, b) => a.row.change1d! - b.row.change1d!).slice(0, 5)

  const sectors = useMemo(() => {
    const groups = new Map<string, number[]>()
    for (const j of joined) {
      const v = j.row[metric]
      if (j.company.type !== "EQUITY" || v == null || !j.company.sector) continue
      groups.set(j.company.sector, [...(groups.get(j.company.sector) ?? []), v])
    }
    return [...groups.entries()]
      .map(([name, values]) => ({ name, count: values.length, avg: values.reduce((a, b) => a + b, 0) / values.length }))
      .sort((a, b) => b.avg - a.avg)
  }, [joined, metric])
  const maxAbs = Math.max(0.1, ...sectors.map((s) => Math.abs(s.avg)))

  const tableRows = useMemo(() => {
    const rows = joined.filter((j) => !sector || j.company.sector === sector)
    const dir = sort.desc ? -1 : 1
    return rows.sort((a, b) =>
      sort.key === "name"
        ? dir * a.company.name.localeCompare(b.company.name)
        : dir * ((a.row[sort.key] ?? -Infinity) - (b.row[sort.key] ?? -Infinity)),
    )
  }, [joined, sector, sort])

  if (overview.status === "loading") {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-64 rounded-2xl bg-slate-200 dark:bg-white/10" />
        </div>
        <Skeleton className="h-80 rounded-2xl bg-slate-200 dark:bg-white/10" />
      </div>
    )
  }
  if (overview.status === "error") {
    return (
      <p role="alert" className={`${panel} text-slate-700 dark:text-slate-300`}>
        {overview.code === "rate-limited" ? t("gpw.error.rateLimitedFull") : t("gpw.market.error")}
      </p>
    )
  }

  const moverList = (title: string, items: Joined[]) => (
    <section className={`${panel} min-w-0`} aria-label={title}>
      <h3 className={heading}>{title}</h3>
      <ol className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
        {items.map(({ company, row }) => (
          <li key={company.symbol}>
            <button
              type="button"
              onClick={() => onSelect(company.symbol)}
              className="-mx-3 grid w-[calc(100%+1.5rem)] grid-cols-[1fr_auto_auto] items-baseline gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-900/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-white/[0.04]"
            >
              <span className="truncate text-slate-900 dark:text-slate-100">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{company.symbol.replace(/\.WA$/, "")}</span>{" "}
                {displayName(company.name, company.symbol)}
              </span>
              <span className="text-sm tabular-nums text-slate-600 dark:text-slate-400">{fmt.price.format(row.price)}</span>
              <Change value={row.change1d} className="w-20 justify-end font-medium" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  )

  const sortButton = (key: SortKey, label: string, align = "text-right") => (
    <th scope="col" className={`pb-2 font-medium ${align}`} aria-sort={sort.key === key ? (sort.desc ? "descending" : "ascending") : "none"}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : key !== "name" }))}
        className="inline-flex items-center gap-1 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:hover:text-white"
      >
        {label}
        {sort.key === key && (sort.desc ? <ArrowDown className="h-3 w-3" aria-hidden="true" /> : <ArrowUp className="h-3 w-3" aria-hidden="true" />)}
      </button>
    </th>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {moverList(t("gpw.market.gainers"), gainers)}
        {moverList(t("gpw.market.losers"), losers)}
      </div>

      {/* sector performance: diverging bars around zero (blue up, red down), values printed beside them */}
      <section className={`${panel} viz-root`} aria-labelledby="gpw-sectors-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 id="gpw-sectors-title" className={heading}>
              {t("gpw.market.sectors")}
            </h3>
            <p className={`mt-1 ${muted}`}>{t("gpw.market.sectorsSubtitle")}</p>
          </div>
          <div role="radiogroup" aria-label={t("gpw.market.metric")} className="inline-flex rounded-full border border-slate-300 p-1 dark:border-white/15">
            {(["change1d", "changeYtd"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={metric === m}
                onClick={() => setMetric(m)}
                className={`h-8 rounded-full px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  metric === m ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {m === "change1d" ? t("gpw.table.today") : "YTD"}
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-5 space-y-1">
          {sectors.map((s) => {
            const width = `${(Math.abs(s.avg) / maxAbs) * 50}%`
            const positive = s.avg >= 0
            const active = sector === s.name
            return (
              <li key={s.name}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSector(active ? null : s.name)}
                  title={fill(t("gpw.market.sectorTooltip"), { sector: sectorLabel(s.name), count: String(s.count) })}
                  className={`grid w-full grid-cols-[minmax(0,9rem)_1fr_4.5rem] items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:grid-cols-[minmax(0,13rem)_1fr_5rem] ${
                    active ? "bg-slate-100 dark:bg-white/10" : "hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="truncate text-sm text-slate-800 dark:text-slate-200">
                    {sectorLabel(s.name)} <span className="text-xs text-slate-500">({s.count})</span>
                  </span>
                  <span className="relative h-3.5" aria-hidden="true">
                    <span className="absolute inset-y-[-4px] left-1/2 w-px bg-[var(--viz-axis)]" />
                    <span
                      className={`absolute inset-y-0 ${positive ? "left-1/2 rounded-r" : "right-1/2 rounded-l"}`}
                      style={{ width, background: positive ? "var(--viz-series-1)" : "var(--viz-negative)" }}
                    />
                  </span>
                  <span className="text-right text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {fmt.pct.format(s.avg)}%
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className={`${panel} min-w-0`} aria-labelledby="gpw-all-title">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 id="gpw-all-title" className={heading}>
              {sector ? sectorLabel(sector) : t("gpw.market.all")}
            </h3>
            {sector && (
              <button type="button" onClick={() => setSector(null)} className="text-sm text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                {t("gpw.market.clearSector")}
              </button>
            )}
          </div>
          <div className="mt-4 max-h-[560px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white text-left text-xs text-slate-500 dark:bg-[#0b1020] dark:text-slate-400">
                <tr>
                  <th scope="col" className="w-8 pb-2">
                    <span className="sr-only">{t("gpw.watchlist.title")}</span>
                  </th>
                  {sortButton("name", t("gpw.table.company"), "text-left")}
                  <th scope="col" className="pb-2 text-right font-medium">{t("gpw.table.price")}</th>
                  {sortButton("change1d", t("gpw.table.today"))}
                  {sortButton("changeYtd", "YTD")}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {tableRows.map(({ company, row }) => (
                  <tr key={company.symbol} className="hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.03]">
                    <td className="py-2">
                      <button
                        type="button"
                        aria-pressed={watchlist.has(company.symbol)}
                        aria-label={fill(t(watchlist.has(company.symbol) ? "gpw.watchlist.remove" : "gpw.watchlist.add"), { name: displayName(company.name, company.symbol) })}
                        onClick={() => watchlist.toggle(company.symbol)}
                        className="rounded p-1 text-slate-400 hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <Star className={`h-4 w-4 ${watchlist.has(company.symbol) ? "fill-amber-400 text-amber-500" : ""}`} aria-hidden="true" />
                      </button>
                    </td>
                    <td className="py-2 pr-3">
                      <button type="button" onClick={() => onSelect(company.symbol)} className="text-left hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{company.symbol.replace(/\.WA$/, "")}</span>{" "}
                        <span className="text-slate-900 dark:text-slate-100">{displayName(company.name, company.symbol)}</span>
                      </button>
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">{fmt.price.format(row.price)}</td>
                    <td className="py-2 text-right">
                      <Change value={row.change1d} />
                    </td>
                    <td className="py-2 text-right">
                      <Change value={row.changeYtd} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${panel} min-w-0`} aria-labelledby="gpw-espi-title">
          <h3 id="gpw-espi-title" className={heading}>
            {t("gpw.market.announcements")}
          </h3>
          <p className={`mt-1 ${muted}`}>{t("gpw.market.announcementsSubtitle")}</p>
          {announcements.status === "loading" && <Skeleton className="mt-4 h-48 bg-slate-200 dark:bg-white/10" />}
          {announcements.status === "error" && <p className={`mt-4 ${muted}`}>{t("gpw.news.error")}</p>}
          {announcements.status === "ready" && (
            <ul className="mt-3 divide-y divide-slate-200 dark:divide-white/10">
              {announcements.data.map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group -mx-3 block rounded-xl px-3 py-2.5 hover:bg-slate-900/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-white/[0.04]"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{a.company}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-slate-900 group-hover:text-brand dark:text-slate-100">
                      {a.subject}
                      <ExternalLink className="ml-1 inline h-3 w-3 align-[-1px] opacity-50" aria-hidden="true" />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <time dateTime={a.published}>{fmt.ago(a.published)}</time>
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
