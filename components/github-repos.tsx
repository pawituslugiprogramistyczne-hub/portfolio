"use client"
import { useEffect, useState } from "react"
import { ArrowUpRight, GitFork, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Reveal } from "@/components/reveal"
import { useLanguage } from "@/contexts/language-context"
import { profile } from "@/lib/portfolio-data"

interface Repo {
  id: number
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
}

interface Commit {
  sha: string
  message: string
}

export function GitHubRepos() {
  const { t } = useLanguage()
  const [repos, setRepos] = useState<Repo[]>([])
  const [lastCommit, setLastCommit] = useState<Commit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const GITHUB_USER = profile.githubUser
  const CONTRIBUTION_CHART_COLOR = "0891b2" // cyan-600, matches the site accent

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [reposResponse, eventsResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=3`),
          fetch(`https://api.github.com/users/${GITHUB_USER}/events/public`),
        ])

        // Ulepszona obsługa błędów API
        if (!reposResponse.ok || !eventsResponse.ok) {
          const repoError = !reposResponse.ok ? await reposResponse.json() : null
          const eventError = !eventsResponse.ok ? await eventsResponse.json() : null
          const errorMessage =
            (repoError && repoError.message) ||
            (eventError && eventError.message) ||
            "Failed to fetch GitHub data."
          throw new Error(errorMessage)
        }

        const reposData: Repo[] = await reposResponse.json()
        setRepos(reposData)

        const eventsData = await eventsResponse.json()
        const pushEvent = eventsData.find((event: any) => event.type === "PushEvent")
        if (pushEvent && pushEvent.payload && pushEvent.payload.commits && pushEvent.payload.commits.length > 0) {
          const latestCommit = pushEvent.payload.commits[0]
          setLastCommit({
            sha: latestCommit.sha,
            message: latestCommit.message,
          })
        }
      } catch (error: any) {
        console.error("Error fetching GitHub data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const divider = "divide-y divide-slate-200 border-t border-slate-200 dark:divide-white/10 dark:border-white/10"

  // skeleton rows keep the exact shape of the loaded rows so nothing jumps
  const renderLoadingState = () => (
    <ul className={divider} aria-hidden="true">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
          <div>
            <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full max-w-md bg-slate-200 dark:bg-white/10" />
          </div>
          <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-white/10" />
        </li>
      ))}
    </ul>
  )

  const renderContent = () => {
    if (error) {
      return (
        <p role="alert" className="border-t border-slate-200 pt-6 text-slate-600 dark:border-white/10 dark:text-slate-400">
          {t("github.error")}: {error}
        </p>
      )
    }
    if (repos.length === 0) {
      return (
        <p className="border-t border-slate-200 pt-6 text-slate-600 dark:border-white/10 dark:text-slate-400">
          {t("github.empty")}
        </p>
      )
    }

    return (
      <ul className={divider}>
        {repos.map((repo) => (
          <li key={repo.id}>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group -mx-4 grid gap-3 rounded-xl px-4 py-6 transition-colors hover:bg-slate-900/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-white/[0.04] sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
            >
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-xl font-medium tracking-tight text-slate-900 dark:text-slate-50">
                  <span className="truncate">{repo.name}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-brand opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
                </h3>
                {repo.description && (
                  <p className="mt-1.5 max-w-[65ch] text-slate-600 dark:text-slate-400">{repo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-5 font-mono text-sm tabular-nums text-slate-600 dark:text-slate-400">
                {repo.language && <span className="text-slate-900 dark:text-slate-200">{repo.language}</span>}
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4" aria-hidden="true" />
                  {repo.stargazers_count}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GitFork className="h-4 w-4" aria-hidden="true" />
                  {repo.forks_count}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section id="github-activity" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
            {t("github.title")}
          </h2>
          {lastCommit && !loading && !error && (
            <p className="mt-5 flex max-w-full gap-2 font-mono text-sm text-slate-600 dark:text-slate-400">
              <span className="shrink-0">{t("github.lastCommit")}:</span>
              <span className="truncate text-slate-900 dark:text-slate-200">{lastCommit.message}</span>
            </p>
          )}
        </Reveal>

        <Reveal delay={100} className="mt-12">
          {loading ? renderLoadingState() : renderContent()}
        </Reveal>

        {profile.showContributionGraph && (
          <Reveal className="mt-20">
            <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-slate-50">
              {t("github.graph")}
            </h3>
            {/* ghchart returns a light SVG; invert + hue-rotate keeps the cells readable on dark */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] md:p-6">
              {/* min width keeps the cells legible on phones; the panel scrolls sideways instead */}
              <img
                src={`https://ghchart.rshah.org/${CONTRIBUTION_CHART_COLOR}/${GITHUB_USER}`}
                alt={t("github.graphAlt")}
                loading="lazy"
                className="h-auto w-full min-w-[640px] dark:hue-rotate-180 dark:invert"
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
