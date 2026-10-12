"use client"

import { useCallback, useEffect, useState } from "react"
import type { OverviewRow } from "@/lib/gpw/types"

type Remote<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; code: string }

/** GET a JSON endpoint and pick a field; refetches when the URL changes, aborts stale requests. */
export function useJson<T>(url: string | null, pick: (json: Record<string, unknown>) => T): Remote<T> {
  const [state, setState] = useState<Remote<T>>({ status: "loading" })
  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    setState({ status: "loading" })
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error ?? "upstream-error")
        setState({ status: "ready", data: pick(json) })
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setState({ status: "error", code: error.message })
      })
    return () => controller.abort()
    // pick is a stable accessor at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])
  return state
}

export interface Overview {
  rows: Map<string, OverviewRow>
  /** latest trading day across the rows, "YYYY-MM-DD" */
  session: string | null
  /** when the server fetched the data from the source (ISO) */
  fetchedAt: string | null
}

// one overview request per page view, shared by the company and market views
let overviewRequest: Promise<Overview> | null = null

export function useOverview(): Remote<Overview> & { retry: () => void } {
  const [state, setState] = useState<Remote<Overview>>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setState({ status: "loading" })
    overviewRequest ??= fetch("/api/gpw/overview")
      .then(async (response) => {
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error ?? "upstream-error")
        const rows = json.rows as OverviewRow[]
        const session = rows.reduce<string | null>((latest, r) => (r.session && (!latest || r.session > latest) ? r.session : latest), null)
        return { rows: new Map(rows.map((r) => [r.symbol, r])), session, fetchedAt: (json.fetchedAt as string) ?? null }
      })
      .catch((error) => {
        overviewRequest = null // allow a retry
        throw error
      })
    overviewRequest
      .then((data) => active && setState({ status: "ready", data }))
      .catch((error: Error) => active && setState({ status: "error", code: error.message }))
    return () => {
      active = false
    }
  }, [attempt])
  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { ...state, retry }
}

const WATCHLIST_KEY = "gpw-watchlist"
const WATCHLIST_EVENT = "gpw-watchlist-change"

function readWatchlist(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : []
  } catch {
    return []
  }
}

/** Starred symbols, kept in this browser only. Works (unsaved) when storage is blocked. */
export function useWatchlist() {
  const [list, setList] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setList(readWatchlist())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(WATCHLIST_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(WATCHLIST_EVENT, sync)
    }
  }, [])

  const toggle = useCallback((symbol: string) => {
    setList((current) => {
      const next = current.includes(symbol) ? current.filter((s) => s !== symbol) : [...current, symbol]
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next))
        window.dispatchEvent(new Event(WATCHLIST_EVENT))
      } catch {
        // storage unavailable: the star still works for this visit
      }
      return next
    })
  }, [])

  return { list, toggle, has: (symbol: string) => list.includes(symbol) }
}

/** Fills "{name}" placeholders in a translated sentence. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match)
}
