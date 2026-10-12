import { NextResponse } from "next/server"
import { getAnnouncements } from "@/lib/gpw/news"
import { UpstreamError } from "@/lib/gpw/yahoo"

// GET /api/gpw/announcements -> the latest ESPI/EBI current reports across the market
// Regenerated in the background at most every 15 minutes (ISR), so visitors never wait on Yahoo/Bankier.
export const revalidate = 900

export async function GET() {
  try {
    const items = await getAnnouncements()
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } })
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502
    return NextResponse.json({ error: status === 429 ? "rate-limited" : "upstream-error" }, { status })
  }
}

