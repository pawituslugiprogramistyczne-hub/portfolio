import { NextResponse, type NextRequest } from "next/server"
import { getCompanyNews } from "@/lib/gpw/news"
import { UpstreamError } from "@/lib/gpw/yahoo"
import { SYMBOL_PATTERN } from "@/lib/gpw/types"

// GET /api/gpw/news?symbol=PKN.WA -> recent headlines naming the company (Polish press)
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase() ?? ""
  if (!SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ error: "invalid-symbol" }, { status: 400 })
  }
  try {
    const items = await getCompanyNews(symbol)
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } })
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502
    return NextResponse.json({ error: status === 429 ? "rate-limited" : "upstream-error" }, { status })
  }
}
