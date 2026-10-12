"use client"

import { useMemo } from "react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { technicalSignals, type SignalTone } from "@/lib/gpw/analytics"
import type { PricePoint } from "@/lib/gpw/types"
import { fill } from "@/components/gpw/use-gpw-data"
import { useGpwFormat } from "@/components/gpw/format"

const TONE_STYLE: Record<SignalTone, { icon: typeof TrendingUp; text: string; bar: string }> = {
  bullish: { icon: TrendingUp, text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-600 dark:bg-emerald-500" },
  neutral: { icon: Minus, text: "text-slate-600 dark:text-slate-400", bar: "bg-slate-400 dark:bg-slate-500" },
  bearish: { icon: TrendingDown, text: "text-red-700 dark:text-red-400", bar: "bg-red-600 dark:bg-red-500" },
}

export function SignalsPanel({ points, benchmark, className = "" }: { points: PricePoint[]; benchmark: PricePoint[] | null; className?: string }) {
  const { t } = useLanguage()
  const fmt = useGpwFormat()
  const signals = useMemo(() => technicalSignals(points, benchmark), [points, benchmark])
  const count = (tone: SignalTone) => signals.filter((s) => s.tone === tone).length

  const varsFor = (vars: Record<string, number | string>) =>
    Object.fromEntries(
      Object.entries(vars).map(([k, v]) => [
        k,
        k === "date" ? fmt.isoDate(String(v)) : k === "value" ? fmt.whole.format(Number(v)) : k === "high" ? fmt.price.format(Number(v)) : fmt.plainPct.format(Number(v)),
      ]),
    )

  return (
    <section aria-labelledby="gpw-signals-title" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 id="gpw-signals-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {t("gpw.signals.title")}
          </h3>
          <p className="mt-1 max-w-[70ch] text-sm text-slate-600 dark:text-slate-400">{t("gpw.signals.subtitle")}</p>
        </div>
        {/* summary: counts first, the bar only repeats them */}
        <div className="min-w-[220px]">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {fill(t("gpw.signals.summary"), {
              bullish: String(count("bullish")),
              neutral: String(count("neutral")),
              bearish: String(count("bearish")),
            })}
          </p>
          <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {(["bullish", "neutral", "bearish"] as SignalTone[]).map((tone) =>
              count(tone) > 0 ? <span key={tone} className={TONE_STYLE[tone].bar} style={{ flex: count(tone) }} /> : null,
            )}
          </div>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-slate-200 border-t border-slate-200 dark:divide-white/10 dark:border-white/10">
        {signals.map((s) => {
          const style = TONE_STYLE[s.tone]
          const Icon = style.icon
          return (
            <li key={s.id} className="grid gap-2 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
              <p className={`inline-flex items-center gap-2 text-sm font-medium ${style.text}`}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t(`gpw.tone.${s.tone}`)}
              </p>
              <div>
                <p className="text-slate-900 dark:text-slate-100">
                  <span className="font-medium">{t(`gpw.signal.${s.id}.name`)}: </span>
                  {fill(t(`gpw.signal.${s.id}.${s.variant}`), varsFor(s.vars))}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(`gpw.signal.${s.id}.rule`)}</p>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t("gpw.signals.disclaimer")}</p>
    </section>
  )
}
