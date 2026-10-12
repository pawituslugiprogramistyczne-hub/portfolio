import { cn } from "@/lib/utils"

/**
 * Text rendition of the PawIT logo (public/logo.png): cyan "</>", blue "Paw", cyan "IT".
 * The PNG has a baked-in glow that blurs at small sizes; live text stays sharp at any
 * size and switches colors for dark mode. Size it with a text-* class.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex select-none items-baseline font-semibold leading-none tracking-tight", className)}
    >
      <span className="mr-[0.22em] font-mono text-[0.82em] font-medium text-brand">&lt;/&gt;</span>
      <span className="text-blue-700 dark:text-blue-400">Paw</span>
      <span className="ml-[0.1em] text-brand">IT</span>
    </span>
  )
}
