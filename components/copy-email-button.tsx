"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

/** One-click copy, for visitors whose browser has no mail client set up. */
export function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      // clipboard needs a secure context and permission; fall back to the mail client
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={copy}
      className={cn(
        "h-9 rounded-full px-3.5 text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 focus-visible:ring-brand dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
        className,
      )}
    >
      {copied ? <Check className="text-brand" /> : <Copy />}
      <span aria-live="polite">{copied ? t("contact.copied") : t("contact.copy")}</span>
    </Button>
  )
}
