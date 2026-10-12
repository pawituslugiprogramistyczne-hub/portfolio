"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
            <span className="hidden items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 sm:inline-flex">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("gpw.back")}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8 md:pt-16">
        <p className="font-mono text-sm text-brand">{t("gpw.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">{t("gpw.title")}</h1>
        <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400">{t("gpw.intro")}</p>

        <div className="mt-10">
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
