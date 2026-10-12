"use client"

import { useId } from "react"

/**
 * Pill-shaped single choice built on native radio inputs, so arrow keys, one tab stop and
 * screen-reader semantics come from the browser instead of ARIA roles on buttons.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  const name = useId()
  return (
    <fieldset className="inline-flex flex-wrap rounded-full border border-slate-300 p-1 dark:border-white/15">
      <legend className="sr-only">{label}</legend>
      {options.map((o) => (
        <label key={o.value} className="relative">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={o.value === value}
            onChange={() => onChange(o.value)}
            className="peer absolute inset-0 cursor-pointer appearance-none rounded-full"
          />
          <span className="pointer-events-none flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium text-slate-600 transition-colors peer-checked:bg-slate-900 peer-checked:text-white peer-hover:text-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-checked:peer-hover:text-white dark:text-slate-400 dark:peer-checked:bg-white dark:peer-checked:text-slate-900 dark:peer-hover:text-white dark:peer-checked:peer-hover:text-slate-900">
            {o.label}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
