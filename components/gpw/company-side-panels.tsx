"use client"

import { ExternalLink } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Skeleton } from "@/components/ui/skeleton"
import { trailingYield } from "@/lib/gpw/analytics"
import { COMPANIES, companyBySymbol } from "@/lib/gpw/companies"
import type { Dividend, NewsItem, PricePoint } from "@/lib/gpw/types"
import { Change, displayName, useGpwFormat, useSectorLabel } from "@/components/gpw/format"
import { fill, useJson, useOverview } from "@/components/gpw/use-gpw-data"

const heading = "text-lg font-semibold text-slate-900 dark:text-slate-50"
const muted = "text-sm text-slate-600 dark:text-slate-400"

/** Latest Polish-press headlines naming the company. */
export function NewsPanel({ symbol, className = "" }: { symbol: string; className?: string }) {
  const { t } = useLanguage()
  const fmt = useGpwFormat()
  const news = useJson<NewsItem[]>(`/api/gpw/news?symbol=${encodeURIComponent(symbol)}`, (j) => (j.items as NewsItem[]) ?? [])

  return (
    <section aria-labelledby="gpw-news-title" className={className}>
      <h3 id="gpw-news-title" className={heading}>
        {t("gpw.news.title")}
      </h3>
      <p className={`mt-1 ${muted}`}>{t("gpw.news.subtitle")}</p>

      {news.status === "loading" && (
        <div className="mt-5 space-y-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-11/12 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="mt-2 h-3 w-40 bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      )}
      {news.status === "error" && <p className={`mt-5 ${muted}`}>{t("gpw.news.error")}</p>}
      {news.status === "ready" && news.data.length === 0 && <p className={`mt-5 ${muted}`}>{t("gpw.news.empty")}</p>}
      {news.status === "ready" && news.data.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
          {news.data.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-3 block rounded-xl px-3 py-3 transition-colors hover:bg-slate-900/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-white/[0.04]"
              >
                <p className="leading-snug text-slate-900 group-hover:text-brand dark:text-slate-100">
                  {item.title}
                  <ExternalLink className="ml-1.5 inline h-3.5 w-3.5 align-[-2px] opacity-50" aria-hidden="true" />
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.source} <span aria-hidden="true">·</span> <time dateTime={item.published}>{fmt.ago(item.published)}</time>
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Same-sector companies from the directory, best year-to-date first. */
export function PeersPanel({ symbol, onSelect, className = "" }: { symbol: string; onSelect: (symbol: string) => void; className?: string }) {
  const { t } = useLanguage()
  const sectorLabel = useSectorLabel()
  const overview = useOverview()
  const sector = companyBySymbol.get(symbol)?.sector
  if (!sector || sector === "ETF") return null

  const peers = COMPANIES.filter((c) => c.sector === sector && c.symbol !== symbol)
    .map((c) => ({ company: c, row: overview.status === "ready" ? overview.data.rows.get(c.symbol) : undefined }))
    .sort((a, b) => (b.row?.changeYtd ?? -Infinity) - (a.row?.changeYtd ?? -Infinity))
    .slice(0, 6)
  if (peers.length === 0) return null

  return (
    <section aria-labelledby="gpw-peers-title" className={className}>
      <h3 id="gpw-peers-title" className={heading}>
        {t("gpw.peers.title")}
      </h3>
      <p className={`mt-1 ${muted}`}>{fill(t("gpw.peers.subtitle"), { sector: sectorLabel(sector) })}</p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
            <th scope="col" className="pb-2 font-medium">{t("gpw.table.company")}</th>
            <th scope="col" className="pb-2 text-right font-medium">{t("gpw.table.today")}</th>
            <th scope="col" className="pb-2 text-right font-medium">{t("gpw.ytd")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
          {peers.map(({ company, row }) => (
            <tr key={company.symbol}>
              <td className="py-2 pr-3">
                <button
                  type="button"
                  onClick={() => onSelect(company.symbol)}
                  className="text-left text-slate-900 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-100"
                >
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{company.symbol.replace(/\.WA$/, "")}</span>{" "}
                  {displayName(company.name, company.symbol)}
                </button>
              </td>
              <td className="py-2 text-right">{row ? <Change value={row.change1d} /> : "-"}</td>
              <td className="py-2 text-right">{row ? <Change value={row.changeYtd} /> : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/** Payout history and trailing 12-month yield. */
export function DividendsPanel({
  points,
  dividends,
  currency,
  className = "",
}: {
  points: PricePoint[]
  dividends: Dividend[]
  currency: string
  className?: string
}) {
  const { t } = useLanguage()
  const fmt = useGpwFormat()
  const ttm = trailingYield(points, dividends)
  const recent = [...dividends].reverse().slice(0, 6)

  return (
    <section aria-labelledby="gpw-div-title" className={className}>
      <h3 id="gpw-div-title" className={heading}>
        {t("gpw.dividends.title")}
      </h3>
      {dividends.length === 0 ? (
        <p className={`mt-2 ${muted}`}>{t("gpw.dividends.none")}</p>
      ) : (
        <>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {ttm != null ? `${fmt.plainPct.format(ttm)}%` : "-"}
          </p>
          <p className={muted}>{t("gpw.dividends.ttm")}</p>
          <table className="mt-4 w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th scope="col" className="pb-2 font-medium">{t("gpw.dividends.exDate")}</th>
                <th scope="col" className="pb-2 text-right font-medium">{fill(t("gpw.dividends.perShare"), { currency })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 dark:divide-white/10 dark:text-slate-200">
              {recent.map((d) => (
                <tr key={d.date}>
                  <td className="py-1.5">{fmt.isoDate(d.date)}</td>
                  <td className="py-1.5 text-right">{fmt.price.format(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
