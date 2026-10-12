import type React from "react"
import type { Metadata, Viewport } from "next"
import { Outfit, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { profile, skillGroups } from "@/lib/portfolio-data"

// latin-ext is required for Polish diacritics (ą ę ł ś ż ź ć ń ó)
const outfit = Outfit({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono", display: "swap" })

const title = "Pawel Pokorski - Software Engineer | Python, Full-stack, Data & Automation"
const description =
  "Software engineer at Nokia building data-driven engineering tools with Python, FastAPI and React. Experience, projects, CV and contact."

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description,
  keywords: [
    "software engineer",
    "python developer",
    "full-stack developer",
    "fastapi",
    "react",
    "data automation",
    "Bydgoszcz",
    "Pawel Pokorski",
    "PawIT",
  ],
  authors: [{ name: profile.name, url: profile.links.linkedin }],
  creator: profile.name,
  publisher: profile.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  // the share image comes from app/opengraph-image.tsx
  openGraph: {
    type: "profile",
    locale: "en_US",
    alternateLocale: ["pl_PL"],
    url: "/",
    title,
    description,
    siteName: "Pawel Pokorski Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@pawelpokorski",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
}

// schema.org Person: lets search engines tie this site to the GitHub and LinkedIn profiles
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.siteUrl,
  image: profile.photo ? `${profile.siteUrl}${profile.photo}` : undefined,
  jobTitle: profile.jobTitle,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: profile.country },
  sameAs: [profile.links.linkedin, profile.links.github],
  worksFor: [
    { "@type": "Organization", name: "Nokia" },
    { "@type": "Organization", name: "PawIT", sameAs: profile.links.linkedinCompany },
  ],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Bydgoszcz University of Technology" },
  knowsAbout: skillGroups.flatMap((group) => group.items),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* the GitHub activity section fetches from here right after load */}
        <link rel="preconnect" href="https://api.github.com" crossOrigin="anonymous" />
        {/* without JavaScript the scroll reveals never fire, so show everything */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
