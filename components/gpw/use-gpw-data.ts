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

// one overview request per page view, shared by the company and market views
let overviewRequest: Promise<OverviewRow[]> | null = null

export function useOverview(): Remote<Map<string, OverviewRow>> {
  const [state, setState] = useState<Remote<Map<string, OverviewRow>>>({ status: "loading" })
  useEffect(() => {
    let active = true
    overviewRequest ??= fetch("/api/gpw/overview")
      .then(async (response) => {
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error ?? "upstream-error")
        return json.rows as OverviewRow[]
      })
      .catch((error) => {
        overviewRequest = null // allow a retry on the next mount
        throw error
      })
    overviewRequest
      .then((rows) => active && setState({ status: "ready", data: new Map(rows.map((r) => [r.symbol, r])) }))
      .catch((error: Error) => active && setState({ status: "error", code: error.message }))
    return () => {
      active = false
    }
  }, [])
  return state
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
