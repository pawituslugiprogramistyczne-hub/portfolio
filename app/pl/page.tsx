import type { Metadata } from "next"
import { Portfolio } from "@/components/portfolio"

const title = "Paweł Pokorski - Inżynier oprogramowania | Python, Full-stack, Dane i automatyzacja"
const description =
  "Inżynier oprogramowania w Nokii (Bydgoszcz). Tworzę narzędzia oparte na danych w Pythonie, FastAPI i React. Doświadczenie, projekty, CV i kontakt."

// Polish version, prerendered in Polish so search engines index it on its own URL.
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/pl",
    languages: { en: "/", pl: "/pl", "x-default": "/" },
  },
  openGraph: {
    type: "profile",
    locale: "pl_PL",
    alternateLocale: ["en_US"],
    url: "/pl",
    title,
    description,
    siteName: "Paweł Pokorski Portfolio",
    // a page-level openGraph replaces the inherited one, so point at the shared card explicitly
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Paweł Pokorski - Inżynier oprogramowania" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
}

export default function Page() {
  return <Portfolio />
}
