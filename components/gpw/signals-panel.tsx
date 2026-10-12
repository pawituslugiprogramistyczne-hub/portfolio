"use client"

import { useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { technicalSignals } from "@/lib/gpw/analytics"
import type { PricePoint } from "@/lib/gpw/types"
import { fill } from "@/components/gpw/use-gpw-data"
import { useGpwFormat } from "@/components/gpw/format"

/**
 * Descriptive readings only: no bullish/bearish labels, colors or tally, so the panel never
 * reads as a buy/sell gauge (MAR). The disclaimer sits under the title, not below the fold.
 */
export function SignalsPanel({ points, benchmark, className = "" }: { points: PricePoint[]; benchmark: PricePoint[] | null; className?: string }) {
  const { t } = useLanguage()
  const fmt = useGpwFormat()
  const signals = useMemo(() => technicalSignals(points, benchmark), [points, benchmark])

  const varsFor = (vars: Record<string, number | string>) =>
    Object.fromEntries(
      Object.entries(vars).map(([k, v]) => [
        k,
        k === "date" ? fmt.isoDate(String(v)) : k === "value" ? fmt.whole.format(Number(v)) : k === "high" ? fmt.price.format(Number(v)) : fmt.plainPct.format(Number(v)),
      ]),
    )

  return (
    <section aria-labelledby="gpw-signals-title" className={className}>
      <h3 id="gpw-signals-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        {t("gpw.signals.title")}
      </h3>
      <p className="mt-1 max-w-[70ch] text-sm text-slate-600 dark:text-slate-400">{t("gpw.signals.subtitle")}</p>
      <p className="mt-3 max-w-[70ch] rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
        {t("gpw.signals.disclaimer")}
      </p>

      <dl className="mt-6 divide-y divide-slate-200 border-t border-slate-200 dark:divide-white/10 dark:border-white/10">
        {signals.map((s) => (
          <div key={s.id} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="font-medium text-slate-900 dark:text-slate-100">{t(`gpw.signal.${s.id}.name`)}</dt>
            <dd>
              <p className="text-slate-900 dark:text-slate-100">{fill(t(`gpw.signal.${s.id}.${s.variant}`), varsFor(s.vars))}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t(`gpw.signal.${s.id}.rule`)}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
