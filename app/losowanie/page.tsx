import type { Metadata } from "next"
import { LosowaniePage } from "@/components/losowanie/losowanie-page"
import { currentYear, getNames } from "@/lib/losowanie/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Świąteczne losowanie",
  robots: { index: false, follow: false },
}

export default async function Page() {
  const names = await getNames().catch(() => null)
  return <LosowaniePage names={names} year={currentYear()} />
}
