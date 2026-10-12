import { NextResponse, type NextRequest } from "next/server"
import { searchSymbols, UpstreamError } from "@/lib/gpw/yahoo"

// GET /api/gpw/search?q=orlen -> Warsaw-listed stocks and ETFs matching the query
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (query.length < 1 || query.length > 40) {
    return NextResponse.json({ results: [] })
  }
  try {
    const results = await searchSymbols(query)
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    )
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502
    return NextResponse.json({ error: status === 429 ? "rate-limited" : "upstream-error" }, { status })
  }
}
