"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, FlaskConical } from "lucide-react"
import { Wordmark } from "@/components/wordmark"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { GpwExplorer } from "@/components/gpw/gpw-explorer"
import { useLanguage } from "@/contexts/language-context"

export function GpwPage() {
  const { t, language } = useLanguage()
  const home = language === "pl" ? "/pl" : "/"

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 dark:border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href={home} className="flex items-center gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <span className="text-xl">
              <Wordmark />
              <span className="sr-only">PawIT</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{t("gpw.back")}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-8 sm:px-8 md:pt-12">
        <p className="font-mono text-sm text-brand">{t("gpw.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">{t("gpw.title")}</h1>
        <p className="mt-3 max-w-[65ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400">{t("gpw.intro")}</p>

        {/* always visible, above any data: this is a skills showcase, not an investment service.
            The headline stays on screen; only the longer explanation folds away. */}
        <div
          role="note"
          aria-labelledby="gpw-demo-title"
          className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
        >
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
          <details className="group min-w-0 flex-1">
            <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
              <span id="gpw-demo-title" className="font-semibold">
                {t("gpw.demo.title")}
              </span>
              <span className="text-sm underline underline-offset-4">
                <span className="group-open:hidden">{t("gpw.demo.more")}</span>
                <span className="hidden group-open:inline">{t("gpw.demo.less")}</span>
              </span>
            </summary>
            <p className="mt-2 max-w-[80ch] text-[15px] leading-relaxed">{t("gpw.demo.body")}</p>
          </details>
        </div>

        <div className="mt-8">
          {/* useSearchParams needs a Suspense boundary so the rest of the page can prerender */}
          <Suspense fallback={<Skeleton className="h-[640px] rounded-2xl bg-slate-200 dark:bg-white/10" />}>
            <GpwExplorer />
          </Suspense>
        </div>

        <p className="mt-12 max-w-[80ch] text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t("gpw.footnote")}</p>
      </main>
    </div>
  )
}
