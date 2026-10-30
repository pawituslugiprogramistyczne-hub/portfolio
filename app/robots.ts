import type { MetadataRoute } from "next"
import { profile } from "@/lib/portfolio-data"

export default function robots(): MetadataRoute.Robots {
  return {
    // the printable team answer sheet and the private friends' draw have no value in search results
    rules: { userAgent: "*", allow: "/", disallow: ["/quiz-game/groups", "/losowanie"] },
    sitemap: `${profile.siteUrl}/sitemap.xml`,
  }
}
