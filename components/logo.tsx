"use client"

import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

export function Logo() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during hydration
    return <div className="h-8 w-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded animate-pulse" />
  }

  return (
    <div className="flex items-center">
      {/* Option 1: Single logo that works on both themes */}
      <img src="/logo.png" alt={`${t("hero.name")} Logo`} className="h-20 w-auto transition-opacity hover:opacity-80" />

      {/* Option 2: Different logos for light/dark themes (uncomment if needed) */}
      {/* 
      <img 
        src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} 
        alt={`${t("hero.name")} Logo`}
        className="h-8 w-auto transition-opacity hover:opacity-80"
      />
      */}

      {/* Option 3: Fallback to text if no logo (uncomment if needed) */}
      {/* 
      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">
        {t("hero.name")}
      </span>
      */}
    </div>
  )
}
