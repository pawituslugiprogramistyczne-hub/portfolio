import type { Metadata } from "next"
import { Portfolio } from "@/components/portfolio"

// English version. The Polish one is app/pl/page.tsx; LanguageProvider picks the language from the path.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", pl: "/pl", "x-default": "/" },
  },
}

export default function Page() {
  return <Portfolio />
}
