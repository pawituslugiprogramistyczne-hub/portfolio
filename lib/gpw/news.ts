// Server-side readers for public RSS feeds:
//  - Google News search RSS: recent Polish-language headlines per company
//  - Bankier.pl ESPI/EBI feed: the latest official current reports from listed companies
import type { Announcement, NewsItem } from "@/lib/gpw/types"
import { companyBySymbol } from "@/lib/gpw/companies"
import { UpstreamError } from "@/lib/gpw/yahoo"

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; pawit-gpw-explorer/1.0; +https://pawit.net/gpw)" }

/** How the press names a company; Yahoo's legal names ("Powszechna Kasa Oszczednosci...") find nothing. */
const SHORT_NAMES: Record<string, string> = {
  "PKO.WA": "PKO BP",
  "PKN.WA": "Orlen",
  "PZU.WA": "PZU",
  "KGH.WA": "KGHM",
  "CDR.WA": "CD Projekt",
  "ALE.WA": "Allegro",
  "LPP.WA": "LPP",
  "DNP.WA": "Dino Polska",
  "PEO.WA": "Pekao",
  "MBK.WA": "mBank",
  "SAN.WA": "Banco Santander",
  "OPL.WA": "Orange Polska",
  "PGE.WA": "PGE",
  "KTY.WA": "Grupa Kęty",
  "BDX.WA": "Budimex",
  "ALR.WA": "Alior Bank",
  "PCO.WA": "Pepco",
  "KRU.WA": "Kruk",
  "CPS.WA": "Cyfrowy Polsat",
  "JSW.WA": "JSW",
  "ZAB.WA": "Żabka",
  "ACP.WA": "Asseco Poland",
  "TPE.WA": "Tauron",
  "ENA.WA": "Enea",
  "LWB.WA": "Bogdanka",
  "EAT.WA": "AmRest",
  "11B.WA": "11 bit studios",
  "ASB.WA": "Asbis",
  "APR.WA": "Auto Partner",
  "BHW.WA": "Bank Handlowy",
  "BFT.WA": "Benefit Systems",
  "BNP.WA": "BNP Paribas Bank Polska",
  "ATT.WA": "Grupa Azoty",
  "GPW.WA": "GPW giełda",
  "GPP.WA": "Grupa Pracuj",
  "ING.WA": "ING Bank Śląski",
  "CAR.WA": "Inter Cars",
  "MIL.WA": "Bank Millennium",
  "PXM.WA": "Polimex Mostostal",
  "PKP.WA": "PKP Cargo",
  "WPL.WA": "Wirtualna Polska",
  "ZEP.WA": "ZE PAK",
  // names that are ordinary words get their legal form, or the search drowns in unrelated news
  "TXT.WA": "Text",
  "KER.WA": "Kernel Holding",
  "ABE.WA": "AB S.A.",
  "GRN.WA": "Grodno S.A.",
  "CBF.WA": "cyber Folks",
}

/** Full search queries where name + market words is not enough (without the time filter). */
const QUERIES: Record<string, string> = {
  // the press names VRG together with its brands
  "VRG.WA": `"VRG" (Vistula OR Bytom OR "W.Kruk" OR akcje OR spółka)`,
  // "GPW" alone matches every market report; ask for news about the exchange operator itself
  "GPW.WA": `"GPW" (zysk OR wyniki OR dywidenda OR prezes OR zarząd)`,
}

/**
 * What a headline must contain to count as about the company. Defaults to the short name;
 * shorter here where the press drops part of it (Dino, not Dino Polska) or inflects it
 * (Bogdanki, Żabki). Matched at a word start, so "ING" does not match "marketingu".
 */
const TITLE_MATCH: Record<string, string> = {
  "PKO.WA": "PKO",
  "DNP.WA": "Dino",
  "SAN.WA": "Santander",
  "OPL.WA": "Orange",
  "KTY.WA": "Kęty",
  "ALR.WA": "Alior",
  "CPS.WA": "Polsat",
  "ZAB.WA": "Żabk",
  "ACP.WA": "Asseco",
  "LWB.WA": "Bogdank",
  "11B.WA": "11 bit",
  "BHW.WA": "Handlow",
  "BFT.WA": "Benefit",
  "BNP.WA": "BNP Paribas",
  "ATT.WA": "Azoty",
  "GPW.WA": "GPW",
  "GPP.WA": "Pracuj",
  "ING.WA": "ING",
  "MIL.WA": "Millennium",
  "PXM.WA": "Polimex",
  "WPL.WA": "Wirtualn",
  "KER.WA": "Kernel",
  "ABE.WA": "AB",
  "GRN.WA": "Grodn",
  "CBF.WA": "cyber Folks|cyber_Folks",
  "VRG.WA": "VRG|Vistula|Bytom|W.Kruk",
}

// sport sponsorships and namesake clubs ("Bogdanka Volley Cup", "Neman Grodno") are not company news
const SPORT = /(siatk|volley|pilk[aie] nozn|mecz|liga\b|ligi\b|turniej|kibic|mistrz|klub)/

// namesakes that survive the rules above (matched on the folded, lowercase title)
const EXCLUDE: Record<string, RegExp> = {
  "VRG.WA": /quang|mdf vrg/, // a Vietnamese wood company shares the name
}

// legal forms at the end of Yahoo's names ("Develia S.A.", "Huuuge, Inc.", "NEUCA S.A.")
const LEGAL_SUFFIX = /[\s,]+(s\.?\s?a\.?|spólka akcyjna|spółka akcyjna|se|n\.v\.|plc|inc\.?)$/i

export function shortName(symbol: string): string | null {
  if (SHORT_NAMES[symbol]) return SHORT_NAMES[symbol]
  const company = companyBySymbol.get(symbol)
  if (!company || company.type === "ETF") return null
  let name = company.name.trim()
  // strip repeatedly: "X Holding S.A." keeps "Holding", which the press does use
  for (let previous = ""; previous !== name; ) {
    previous = name
    name = name.replace(LEGAL_SUFFIX, "").trim()
  }
  return name || null
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

function decode(text: string): string {
  return text
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .trim()
}

/** Minimal RSS <item> reader: these two feeds are flat, so a regex is enough (no XML dependency). */
function readItems(xml: string) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const field = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
      return m ? decode(m[1]) : ""
    }
    return { title: field("title"), link: field("link"), pubDate: field("pubDate"), source: field("source") }
  })
}

async function getFeed(url: string, revalidate: number): Promise<string> {
  const response = await fetch(url, { headers: HEADERS, next: { revalidate } })
  if (response.status === 429) throw new UpstreamError("rate-limited", 429)
  if (!response.ok) throw new UpstreamError(`feed ${response.status}`, 502)
  return response.text()
}

const fold = (s: string) => s.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "")

/** Latest headlines that actually name the company, newest first. Cached for an hour. */
export async function getCompanyNews(symbol: string, limit = 8): Promise<NewsItem[]> {
  const name = shortName(symbol)
  if (!name) return []
  // market words keep generic names ("Text", "Grodno") on the company rather than the word or the city
  const query = `${QUERIES[symbol] ?? `"${name}" (akcje OR spółka OR giełda OR GPW)`} when:30d`
  const xml = await getFeed(
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pl&gl=PL&ceid=PL:pl`,
    3600,
  )
  // Google matches loosely (body text, related stories); keep headlines that name the company.
  // Alternatives are "|"-separated; each must start a word.
  const alternatives = (TITLE_MATCH[symbol] ?? name)
    .split("|")
    .map((alt) => fold(alt).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")
  const namesCompany = new RegExp(`(^|[^a-z0-9])(${alternatives})`)
  const seen = new Set<string>()
  return readItems(xml)
    .map((item) => {
      const source = item.source || item.title.split(" - ").pop() || ""
      const title = source && item.title.endsWith(` - ${source}`) ? item.title.slice(0, -(source.length + 3)) : item.title
      const published = new Date(item.pubDate)
      return { title, source, url: item.link, published: Number.isNaN(published.getTime()) ? "" : published.toISOString() }
    })
    .filter((n) => n.published && n.url.startsWith("https://") && namesCompany.test(fold(n.title)) && !SPORT.test(fold(n.title)) && !EXCLUDE[symbol]?.test(fold(n.title)))
    .filter((n) => (seen.has(fold(n.title)) ? false : (seen.add(fold(n.title)), true)))
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, limit)
}

/** Latest ESPI/EBI current reports across the market, newest first. Cached for 15 minutes. */
export async function getAnnouncements(limit = 10): Promise<Announcement[]> {
  const xml = await getFeed("https://www.bankier.pl/rss/espi.xml", 900)
  return readItems(xml)
    .map((item) => {
      // titles look like "COMPANY S.A.: subject"
      const split = item.title.indexOf(": ")
      const published = new Date(item.pubDate)
      return {
        company: split > 0 ? item.title.slice(0, split) : "",
        subject: split > 0 ? item.title.slice(split + 2) : item.title,
        url: item.link,
        published: Number.isNaN(published.getTime()) ? "" : published.toISOString(),
      }
    })
    .filter((a) => a.url.startsWith("https://") && a.published)
    .slice(0, limit)
}
