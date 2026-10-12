import type { Metadata } from "next"
import { GpwPage } from "@/components/gpw/gpw-page"

const title = "GPW Explorer (demo project) - Warsaw Stock Exchange charts | Pawel Pokorski"
const description =
  "Portfolio demo project, not an investment service: search Warsaw Stock Exchange (GPW) stocks and ETFs, five years of prices, technical signals, news and a market overview."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gpw" },
  openGraph: {
    type: "website",
    url: "/gpw",
    title,
    description,
    siteName: "Pawel Pokorski Portfolio",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Pawel Pokorski - Software Engineer" }],
  },
}

export default function Page() {
  return <GpwPage />
}
