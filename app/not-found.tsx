"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Code } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center">
            <Code className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            404 - Page Not Found
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
