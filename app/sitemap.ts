import type { MetadataRoute } from "next"
import { profile } from "@/lib/portfolio-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${profile.siteUrl}/`, pl: `${profile.siteUrl}/pl` }
  return [
    { url: `${profile.siteUrl}/`, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${profile.siteUrl}/pl`, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${profile.siteUrl}/quiz-game`, changeFrequency: "yearly", priority: 0.4 },
  ]
}
