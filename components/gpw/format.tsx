"use client"

import { useMemo } from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { DISPLAY_NAMES } from "@/lib/gpw/companies"

/** Number and date formatters for the current language (pl-PL or en-GB). */
export function useGpwFormat() {
  const { language } = useLanguage()
  return useMemo(() => {
    const locale = language === "pl" ? "pl-PL" : "en-GB"
    const price = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const tick = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })
    const pct = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero" })
    const plainPct = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    const whole = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
    const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 })
    const integer = new Intl.NumberFormat(locale)
    const dayMonth = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" })
    const monthYear = new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit", timeZone: "UTC" })
    const full = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const isoDate = (iso: string) => full.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
    /** "3 hours ago" / "2 dni temu" for news timestamps */
    const ago = (iso: string) => {
      // some feeds stamp local time as UTC, which can land "in the future"; read that as now
      const minutes = Math.min(0, Math.round((Date.parse(iso) - Date.now()) / 60000))
      if (Math.abs(minutes) < 60) return relative.format(minutes, "minute")
      const hours = Math.round(minutes / 60)
      if (Math.abs(hours) < 24) return relative.format(hours, "hour")
      const days = Math.round(hours / 24)
      return Math.abs(days) < 14 ? relative.format(days, "day") : full.format(new Date(iso))
    }
    return { locale, price, tick, pct, plainPct, whole, compact, integer, dayMonth, monthYear, full, isoDate, ago }
  }, [language])
}

/** Signed % change with an arrow; direction never relies on color alone. */
export function Change({ value, suffix = "%", className = "" }: { value: number | null; suffix?: string; className?: string }) {
  const fmt = useGpwFormat()
  if (value == null) return <span className={`text-slate-500 ${className}`}>-</span>
  const up = value > 0.05
  const down = value < -0.05
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
  return (
    <span
      className={`inline-flex items-center gap-0.5 tabular-nums ${
        up ? "text-emerald-700 dark:text-emerald-400" : down ? "text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-400"
      } ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {fmt.pct.format(value)}
      {suffix}
    </span>
  )
}

/** Yahoo's sector names, translated through the language context. */
export function useSectorLabel() {
  const { t } = useLanguage()
  return (sector?: string) => {
    if (!sector) return ""
    const key = `gpw.sector.${sector}`
    const label = t(key)
    return label === key ? sector : label
  }
}

// legal forms at the end of Yahoo's names: "Banco Santander, S.A.", "Grodno Spólka Akcyjna", "Huuuge, Inc."
const LEGAL_FORM = /[\s,]+(s\.?\s?a\.?|sp[oó]lka akcyjna|se|n\.v\.|plc|inc\.?)$/i

/** Company name as people say it, for display; the legal name stays in the data. */
export function displayName(name: string, symbol?: string): string {
  if (symbol && DISPLAY_NAMES[symbol]) return DISPLAY_NAMES[symbol]
  let current = name.trim()
  for (let previous = ""; previous !== current; ) {
    previous = current
    current = current.replace(LEGAL_FORM, "").trim()
  }
  return current || name
}
