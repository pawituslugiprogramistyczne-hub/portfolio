"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

export interface ChartSeries {
  id: string
  label: string
  /** a CSS color, normally one of the --viz-series-* tokens */
  color: string
  values: (number | null)[]
  /** ~10% wash under the line; use for the single primary series only */
  area?: boolean
  /** value label at the right end of the line (skipped automatically when labels would collide) */
  endLabel?: boolean
}

interface TimeSeriesChartProps {
  dates: string[]
  series: ChartSeries[]
  /** separate volume panel under the plot (never a second y-axis on the price plot) */
  volumes?: number[]
  volumeLabel?: string
  /** draws an emphasized hairline at this value, e.g. 100 for an indexed chart */
  baseline?: number
  height?: number
  ariaLabel: string
  formatValue: (value: number) => string
  formatTick?: (value: number) => string
  formatVolume?: (value: number) => string
  formatDate: (date: string, style: "axis" | "tooltip") => string
}

// room for y-axis ticks on the left and end-value labels on the right; tighter on phones
const MARGIN = { top: 12, right: 72, bottom: 28, left: 56 }
const MARGIN_COMPACT = { top: 12, right: 52, bottom: 28, left: 38 }
const VOLUME_HEIGHT = 56
const VOLUME_GAP = 12
const TOOLTIP_WIDTH = 200
// below this the floating tooltip would cover most of the plot, so values move to a readout above it
const COMPACT_WIDTH = 480

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || Math.abs(max) || 1
  const rough = span / count
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) * magnitude
  const ticks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) ticks.push(Number(v.toPrecision(12)))
  return ticks
}

export function TimeSeriesChart({
  dates,
  series,
  volumes,
  volumeLabel,
  baseline,
  height = 300,
  ariaLabel,
  formatValue,
  formatTick = formatValue,
  formatVolume,
  formatDate,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const compact = width > 0 && width < COMPACT_WIDTH
  const margin = compact ? MARGIN_COMPACT : MARGIN
  const n = dates.length
  const hasVolume = !!volumes && volumes.length === n
  const totalHeight = height + (hasVolume ? VOLUME_GAP + VOLUME_HEIGHT : 0) + margin.bottom
  const plotWidth = Math.max(0, width - margin.left - margin.right)
  const plotBottom = margin.top + height
  const volumeTop = plotBottom + VOLUME_GAP

  const geometry = useMemo(() => {
    const all = series.flatMap((s) => s.values.filter((v): v is number => v != null))
    if (baseline != null) all.push(baseline)
    if (all.length === 0 || plotWidth <= 0) return null
    let min = Math.min(...all)
    let max = Math.max(...all)
    const pad = (max - min || Math.abs(max) || 1) * 0.06
    min -= pad
    max += pad
    const x = (i: number) => margin.left + (n <= 1 ? plotWidth / 2 : (i / (n - 1)) * plotWidth)
    const y = (v: number) => margin.top + (1 - (v - min) / (max - min)) * height
    const yTicks = niceTicks(min, max).filter((t) => t >= min && t <= max)

    const paths = series.map((s) => {
      let d = ""
      let area = ""
      let started = false
      let firstX = 0
      let lastX = 0
      s.values.forEach((v, i) => {
        if (v == null) {
          started = false
          return
        }
        const px = x(i)
        const py = y(v)
        d += `${started ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`
        if (!started && area === "") firstX = px
        if (s.area) area += `${area === "" ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`
        lastX = px
        started = true
      })
      const areaPath = s.area && area ? `${area}L${lastX.toFixed(1)},${plotBottom}L${firstX.toFixed(1)},${plotBottom}Z` : ""
      return { id: s.id, d, areaPath }
    })

    // end labels: only when they would not collide (otherwise legend + tooltip carry identity)
    const ends = series
      .map((s) => {
        const lastIndex = s.values.length - 1
        const v = s.values[lastIndex]
        return s.endLabel && v != null ? { id: s.id, color: s.color, y: y(v), x: x(lastIndex), value: v } : null
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
    const collide = ends.some((a, i) => ends.some((b, j) => i < j && Math.abs(a.y - b.y) < 16))

    const tickCount = Math.max(2, Math.min(7, Math.floor(plotWidth / 110)))
    const xTicks = n <= 1 ? [0] : Array.from({ length: tickCount }, (_, k) => Math.round((k / (tickCount - 1)) * (n - 1)))

    const volumeMax = hasVolume ? Math.max(1, ...volumes!) : 1
    const step = n > 1 ? plotWidth / (n - 1) : plotWidth
    const barWidth = Math.max(0.6, Math.min(24, step * 0.65))

    return { x, y, yTicks, paths, ends: collide ? [] : ends, xTicks, volumeMax, barWidth }
  }, [series, baseline, plotWidth, height, n, plotBottom, hasVolume, volumes, margin])

  // touch has no hover, so the crosshair stays after the finger lifts until a tap elsewhere
  useEffect(() => {
    if (active == null) return
    const dismiss = (event: globalThis.PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setActive(null)
    }
    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [active])

  const indexFromPointer = (event: PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    return Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = active ?? n - 1
    const moves: Record<string, number> = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      PageUp: current - 20,
      PageDown: current + 20,
      Home: 0,
      End: n - 1,
    }
    if (event.key in moves) {
      event.preventDefault()
      setActive(Math.max(0, Math.min(n - 1, moves[event.key])))
    } else if (event.key === "Escape") {
      setActive(null)
    }
  }

  // beside the crosshair, flipped near the right edge and always kept inside the chart
  const tooltipLeft = (() => {
    if (!geometry || active == null) return 0
    const x = geometry.x(active)
    const preferred = x + 12 + TOOLTIP_WIDTH > width ? x - 12 - TOOLTIP_WIDTH : x + 12
    return Math.max(0, Math.min(width - TOOLTIP_WIDTH, preferred))
  })()

  // what the readout (compact) and the live region describe: the active session, else the latest
  const shownIndex = active ?? n - 1
  const readout =
    n > 0
      ? {
          date: formatDate(dates[shownIndex], "tooltip"),
          rows: [
            ...series.flatMap((s) => {
              const v = s.values[shownIndex]
              return v == null ? [] : [{ id: s.id, label: s.label, value: formatValue(v), swatch: s.color, bar: false }]
            }),
            ...(hasVolume && formatVolume
              ? [{ id: "volume", label: volumeLabel ?? "", value: formatVolume(volumes![shownIndex]), swatch: "var(--viz-volume)", bar: true }]
              : []),
          ],
        }
      : null
  const legendSeries = series.filter((s) => s.values.some((v) => v != null))

  return (
    <div className="viz-root">
      {legendSeries.length >= 2 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
          {legendSeries.map((s) => (
            <li key={s.id} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      {/* screen readers: the SVG is hidden, so arrow-key moves are announced from here */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {active != null && readout ? `${readout.date}: ${readout.rows.map((r) => `${r.label} ${r.value}`).join(", ")}` : ""}
      </p>
      {compact && readout && (
        <div className="mb-2 min-h-[3.25rem] rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-white/[0.06]" aria-hidden="true">
          <p className="text-xs text-slate-600 dark:text-slate-400">{readout.date}</p>
          <ul className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
            {readout.rows.map((r) => (
              <li key={r.id} className="inline-flex items-center gap-1.5">
                <span className={r.bar ? "h-2 w-3 shrink-0 rounded-sm" : "h-0.5 w-3 shrink-0 rounded-full"} style={{ background: r.swatch }} />
                <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{r.value}</span>
                <span className="text-slate-600 dark:text-slate-400">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        ref={containerRef}
        role="group"
        aria-label={ariaLabel}
        aria-roledescription="chart"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((a) => a ?? n - 1)}
        onBlur={() => setActive(null)}
        className="relative w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={{ height: totalHeight }}
      >
        {geometry && (
          <svg width={width} height={totalHeight} className="block overflow-visible" aria-hidden="true">
            {/* recessive grid and y-axis ticks */}
            {geometry.yTicks.map((t) => (
              <g key={t}>
                <line x1={margin.left} x2={margin.left + plotWidth} y1={geometry.y(t)} y2={geometry.y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
                <text x={margin.left - 8} y={geometry.y(t)} dy="0.32em" textAnchor="end" className="fill-[var(--viz-muted)] text-[12px] tabular-nums">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            {baseline != null && (
              <line
                x1={margin.left}
                x2={margin.left + plotWidth}
                y1={geometry.y(baseline)}
                y2={geometry.y(baseline)}
                stroke="var(--viz-axis)"
                strokeWidth={1}
              />
            )}
            <line x1={margin.left} x2={margin.left + plotWidth} y1={plotBottom} y2={plotBottom} stroke="var(--viz-axis)" strokeWidth={1} />

            {/* series: area washes first, then 2px lines */}
            {geometry.paths.map((p, i) =>
              p.areaPath ? <path key={`${p.id}-area`} d={p.areaPath} fill={series[i].color} fillOpacity={0.1} /> : null,
            )}
            {geometry.paths.map((p, i) => (
              <path key={p.id} d={p.d} fill="none" stroke={series[i].color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}

            {/* end markers and labels (text in ink, identity from the marker) */}
            {geometry.ends.map((e) => (
              <g key={e.id}>
                <circle cx={e.x} cy={e.y} r={4} fill={e.color} stroke="var(--viz-surface)" strokeWidth={2} />
                <text x={margin.left + plotWidth + 8} y={e.y} dy="0.32em" className="fill-slate-900 text-[12px] font-medium dark:fill-slate-100">
                  {formatValue(e.value)}
                </text>
              </g>
            ))}

            {/* volume panel: its own scale, no second axis on the price plot */}
            {hasVolume && (
              <g>
                {volumeLabel && (
                  <text x={margin.left - 8} y={volumeTop + 8} textAnchor="end" className="fill-[var(--viz-muted)] text-[12px]">
                    {volumeLabel}
                  </text>
                )}
                {volumes!.map((v, i) => {
                  const h = (v / geometry.volumeMax) * VOLUME_HEIGHT
                  return (
                    <rect
                      key={i}
                      x={geometry.x(i) - geometry.barWidth / 2}
                      y={volumeTop + VOLUME_HEIGHT - h}
                      width={geometry.barWidth}
                      height={h}
                      fill="var(--viz-volume)"
                      opacity={active === i ? 1 : 0.7}
                    />
                  )
                })}
                <line
                  x1={margin.left}
                  x2={margin.left + plotWidth}
                  y1={volumeTop + VOLUME_HEIGHT}
                  y2={volumeTop + VOLUME_HEIGHT}
                  stroke="var(--viz-axis)"
                  strokeWidth={1}
                />
              </g>
            )}

            {/* x-axis dates */}
            {geometry.xTicks.map((i, k) => (
              <text
                key={`${i}-${k}`}
                x={geometry.x(i)}
                y={totalHeight - 8}
                textAnchor={k === 0 ? "start" : k === geometry.xTicks.length - 1 ? "end" : "middle"}
                className="fill-[var(--viz-muted)] text-[12px] tabular-nums"
              >
                {formatDate(dates[i], "axis")}
              </text>
            ))}

            {/* crosshair snapped to the nearest session */}
            {active != null && (
              <g>
                <line
                  x1={geometry.x(active)}
                  x2={geometry.x(active)}
                  y1={margin.top}
                  y2={hasVolume ? volumeTop + VOLUME_HEIGHT : plotBottom}
                  stroke="var(--viz-axis)"
                  strokeWidth={1}
                />
                {series.map((s) => {
                  const v = s.values[active]
                  return v == null ? null : (
                    <circle key={s.id} cx={geometry.x(active)} cy={geometry.y(v)} r={4} fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
                  )
                })}
              </g>
            )}

            {/* hit area: the whole plot, so the reader aims at a date, not a 2px line */}
            <rect
              x={margin.left}
              y={margin.top}
              width={plotWidth}
              height={(hasVolume ? volumeTop + VOLUME_HEIGHT : plotBottom) - margin.top}
              fill="transparent"
              // vertical swipes still scroll the page; horizontal drags scrub the crosshair
              style={{ touchAction: "pan-y" }}
              onPointerMove={(e) => setActive(indexFromPointer(e))}
              onPointerDown={(e) => setActive(indexFromPointer(e))}
              // touch fires pointerleave right after lifting the finger; only a mouse leaving clears it
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            />
          </svg>
        )}

        {geometry && active != null && !compact && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-[200px] rounded-lg border border-slate-200 bg-white/95 p-3 text-sm shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/95"
            style={{ left: tooltipLeft }}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(dates[active], "tooltip")}</p>
            <ul className="mt-1.5 space-y-1">
              {series.map((s) => {
                const v = s.values[active]
                return v == null ? null : (
                  <li key={s.id} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{formatValue(v)}</span>
                    <span className="truncate text-slate-500 dark:text-slate-400">{s.label}</span>
                  </li>
                )
              })}
              {hasVolume && formatVolume && (
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-3 shrink-0 rounded-sm" style={{ background: "var(--viz-volume)" }} />
                  <span className="font-semibold text-slate-900 dark:text-slate-50">{formatVolume(volumes![active])}</span>
                  <span className="text-slate-500 dark:text-slate-400">{volumeLabel}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
