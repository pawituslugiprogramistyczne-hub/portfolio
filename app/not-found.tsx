"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/wordmark"
import { useLanguage } from "@/contexts/language-context"

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <main className="flex min-h-[100dvh] flex-col bg-slate-50 px-5 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-8">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center">
        <Link href="/" aria-label="PawIT" className="rounded-lg text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <Wordmark />
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center pb-24">
        <p className="font-mono text-sm text-brand">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tighter md:text-6xl">{t("notFound.title")}</h1>
        <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          {t("notFound.description")}
        </p>
        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-brand px-7 text-base text-brand-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand/90 active:translate-y-0 active:scale-[0.98] focus-visible:ring-brand"
          >
            <Link href="/">
              <ArrowLeft />
              {t("notFound.home")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
