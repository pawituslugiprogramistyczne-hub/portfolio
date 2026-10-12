import { NextResponse, type NextRequest } from "next/server"

// First visit to "/" from a Polish-language browser goes to "/pl" before anything renders.
// An explicit choice (cookie set by the language toggle) always wins. Crawlers send no
// Accept-Language, so they get "/" and reach "/pl" through the hreflang links.
export function middleware(request: NextRequest) {
  const saved = request.cookies.get("preferred-language")?.value
  if (saved === "en") return NextResponse.next()

  const primary = request.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase() ?? ""
  if (saved === "pl" || primary.startsWith("pl")) {
    const url = request.nextUrl.clone()
    url.pathname = "/pl"
    return NextResponse.redirect(url, 307)
  }
  return NextResponse.next()
}

export const config = { matcher: "/" }
