"use client"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, GitFork, ExternalLink, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [repos, setRepos] = useState<Repo[]>([])
  const [lastCommit, setLastCommit] = useState<Commit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const GITHUB_USER = "pawituslugiprogramistyczne-hub"
  const CONTRIBUTION_CHART_COLOR = "3b82f6" // Kolor niebieski z palety strony

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

  const renderLoadingState = () => (
    <div className="flex flex-wrap justify-center gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="w-full max-w-sm flex flex-col justify-between">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-5 w-10" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderContent = () => {
    if (error) return <p className="text-center text-red-500 dark:text-red-400">Could not load repositories: {error}</p>
    if (repos.length === 0 && !loading) return <p className="text-center text-slate-500">No public repositories found.</p>

    return (
      <div className="flex flex-wrap justify-center gap-8">
        {repos.map((repo) => (
          <Card key={repo.id} className="w-full max-w-sm flex flex-col justify-between bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg border-purple-200 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">{repo.name}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">{repo.description || "No description."}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex space-x-4">
                  <div className="flex items-center"><Star className="w-4 h-4 mr-1" /> {repo.stargazers_count}</div>
                  <div className="flex items-center"><GitFork className="w-4 h-4 mr-1" /> {repo.forks_count}</div>
                </div>
                {repo.language && <span className="font-medium">{repo.language}</span>}
              </div>
              <Button asChild variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950 bg-transparent">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> View on GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <section id="github-activity">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Recent GitHub Activity
        </h2>
        
        {lastCommit && !loading && !error && (
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 mb-12 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <p><strong>Last commit:</strong> "{lastCommit.message}"</p>
          </div>
        )}

        {loading ? renderLoadingState() : renderContent()}

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-slate-700 dark:text-slate-300 mb-8">
            Contribution Graph
          </h3>
          <div className="flex justify-center p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 dark:border-purple-700">
            <img 
              src={`https://ghchart.rshah.org/${CONTRIBUTION_CHART_COLOR}/${GITHUB_USER}`} 
              alt="GitHub Contribution Chart"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}