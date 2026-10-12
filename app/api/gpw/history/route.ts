import { NextResponse, type NextRequest } from "next/server"
import { getHistory, UpstreamError } from "@/lib/gpw/yahoo"
import { SYMBOL_PATTERN } from "@/lib/gpw/types"

// GET /api/gpw/history?symbol=PKN.WA -> five years of daily prices
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase() ?? ""
  // only Warsaw tickers are forwarded upstream
  if (!SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ error: "invalid-symbol" }, { status: 400 })
  }
  try {
    const history = await getHistory(symbol)
    return NextResponse.json(history, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    })
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502
    const code = status === 404 ? "not-found" : status === 429 ? "rate-limited" : "upstream-error"
    return NextResponse.json({ error: code }, { status })
  }
}
