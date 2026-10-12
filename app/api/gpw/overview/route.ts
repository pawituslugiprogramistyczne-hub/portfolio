import { NextResponse } from "next/server"
import { COMPANIES } from "@/lib/gpw/companies"
import { getOverview, UpstreamError } from "@/lib/gpw/yahoo"

// GET /api/gpw/overview -> today's and YTD change for every directory company (4 batch calls, cached 15 min)
// Regenerated in the background at most every 15 minutes (ISR), so visitors never wait on Yahoo/Bankier.
export const revalidate = 900

export async function GET() {
  try {
    const rows = await getOverview(COMPANIES.map((c) => c.symbol))
    return NextResponse.json({ rows }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } })
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502
    return NextResponse.json({ error: status === 429 ? "rate-limited" : "upstream-error" }, { status })
  }
}

