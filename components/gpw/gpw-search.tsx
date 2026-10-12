"use client"

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { COMPANIES } from "@/lib/gpw/companies"
import { displayName } from "@/components/gpw/format"
import { fill } from "@/components/gpw/use-gpw-data"
import type { SearchResult } from "@/lib/gpw/types"

/** lowercase, no Polish diacritics ("Kęty" and "kety" match; NFD leaves ł intact, so map it) */
const normalize = (s: string) =>
  s.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "")

const INDEXED = COMPANIES.map((c) => ({
  result: c,
  code: c.symbol.replace(/\.WA$/, "").toLowerCase(),
  name: normalize(c.name),
}))

/** ticker match first, then a word of the name starting with the query, then anywhere in the name */
function searchLocal(query: string): SearchResult[] {
  const q = normalize(query.trim())
  if (!q) return []
  return INDEXED.map((c) => {
    const score =
      c.code === q ? 0 : c.code.startsWith(q) ? 1 : c.name.split(/[\s.,-]+/).some((w) => w.startsWith(q)) ? 2 : c.name.includes(q) ? 3 : -1
    return { c, score }
  })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.c.code.localeCompare(b.c.code))
    .map((x) => x.c.result)
}

export interface SuggestionGroup {
  label: string
  items: SearchResult[]
}

/**
 * Combobox over /api/gpw/search, with the directory matched locally so typing feels instant.
 * An empty field lists suggestions (watchlist, popular) with full names instead of bare tickers.
 */
export function GpwSearch({ onSelect, suggestions = [] }: { onSelect: (result: SearchResult) => void; suggestions?: SuggestionGroup[] }) {
  const { t } = useLanguage()
  const listId = useId()
  const [query, setQuery] = useState("")
  const [remote, setRemote] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setRemote([])
      setStatus("idle")
      return
    }
    const controller = new AbortController()
    setStatus("loading")
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/gpw/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!response.ok) throw new Error(String(response.status))
        const json = (await response.json()) as { results: SearchResult[] }
        setRemote(json.results ?? [])
        setStatus("idle")
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error")
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const typed = query.trim().length > 0
  const results = useMemo(() => {
    const local = searchLocal(query)
    const seen = new Set(local.map((r) => r.symbol))
    return [...local, ...remote.filter((r) => !seen.has(r.symbol))].slice(0, 8)
  }, [query, remote])

  // one flat list for keyboard movement; groups only exist in the empty-field view
  const groups: SuggestionGroup[] = typed ? [{ label: "", items: results }] : suggestions
  const items = groups.flatMap((g) => g.items)

  useEffect(() => setHighlight(0), [items.length, typed])

  const choose = (result: SearchResult) => {
    // focus is handed to the company heading by the caller, so the reader keeps their place
    onSelect(result)
    setQuery("")
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(items.length - 1, h + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (event.key === "Enter" && open && items[highlight]) {
      event.preventDefault()
      choose(items[highlight])
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  const showList = open && items.length > 0
  const message = !typed ? "" : status === "loading" && results.length === 0 ? t("gpw.search.loading") : status === "error" && results.length === 0 ? t("gpw.search.error") : results.length === 0 ? t("gpw.search.noResults") : ""
  let index = -1

  return (
    <div className="relative w-full sm:max-w-md">
      <label htmlFor={`${listId}-input`} className="sr-only">
        {t("gpw.search.label")}
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-[22px] h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      <input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && items[highlight] ? `${listId}-${highlight}` : undefined}
        autoComplete="off"
        spellCheck={false}
        value={query}
        placeholder={t("gpw.search.placeholder")}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-full border border-slate-300 bg-white pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-50 dark:placeholder:text-slate-400"
      />
      <p className="sr-only" aria-live="polite">
        {typed && status !== "loading" ? fill(t("gpw.search.count"), { count: String(results.length) }) : ""}
      </p>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("gpw.search.label")}
          className="absolute z-30 mt-2 max-h-96 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900"
        >
          {groups.map((g) => (
            <li key={g.label || "results"} role="presentation">
              {g.label && (
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400" aria-hidden="true">
                  {g.label}
                </p>
              )}
              <ul role="group" aria-label={g.label || undefined}>
                {g.items.map((r) => {
                  const i = ++index
                  return (
                    <li
                      key={r.symbol}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === highlight}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(r)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-xl px-3 py-2.5 ${
                        i === highlight ? "bg-slate-100 dark:bg-white/10" : ""
                      }`}
                    >
                      <span className="truncate text-slate-900 dark:text-slate-100">{displayName(r.name, r.symbol)}</span>
                      <span className="shrink-0 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {r.symbol.replace(/\.WA$/, "")}
                        {r.type === "ETF" ? " · ETF" : ""}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {/* status lives outside the listbox, which may only hold options */}
      {open && message && (
        <p className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  )
}
