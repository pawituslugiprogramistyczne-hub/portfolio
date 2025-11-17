import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pawel Pokorski PawIT - Web Developer",
  description: "Professional web developer specializing in Python, JavaScript, and modern web technologies",
  keywords: ["web developer", "python", "javascript", "react", "next.js", "portfolio"],
  authors: [{ name: "Pawel Pokorski" }],
  creator: "Pawel Pokorski",
  publisher: "Pawel Pokorski",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://portfolio-red-nine-r65phxfzmr.vercel.app/",
    title: "Pawel Pokorski PawIT - Web Developer",
    description: "Professional web developer specializing in Python, JavaScript, and modern web technologies",
    siteName: "Pawel Pokorski Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pawel Pokorski – Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pawel Pokorski PawIT - Web Developer",
    description: "Professional web developer specializing in Python, JavaScript, and modern web technologies",
    creator: "@pawelpokorski",
  },
  robots: {
    index: true,
    follow: true,
  },
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
