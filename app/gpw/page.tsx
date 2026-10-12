import type { Metadata } from "next"
import { GpwPage } from "@/components/gpw/gpw-page"

const title = "GPW Explorer - Warsaw Stock Exchange charts and risk metrics | Pawel Pokorski"
const description =
  "Search Warsaw Stock Exchange (GPW) stocks and ETFs: five years of prices, SMA 50/200, volatility, max drawdown and total return against WIG20."

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
