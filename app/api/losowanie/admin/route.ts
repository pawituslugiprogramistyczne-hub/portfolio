import { NextResponse, type NextRequest } from "next/server"
import { currentYear, getDb } from "@/lib/losowanie/db"
import { safeEqual } from "@/lib/losowanie/pin"

export const dynamic = "force-dynamic"

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

// Deliberately exposes status only, never who drew whom: the organizer takes part too.
async function status() {
  const db = getDb()
  const rok = currentYear()
  const [people, results] = await Promise.all([
    db.from("losowanie_osoby").select("id, imie, pin_hash").order("imie"),
    db.from("losowanie_wyniki").select("dajacy_id, odkryto_at").eq("rok", rok),
  ])
  if (people.error) throw people.error
  if (results.error) throw results.error

  const revealed = new Set(results.data.filter((row) => row.odkryto_at).map((row) => row.dajacy_id))
  return reply({
    rok,
    wylosowano: results.data.length > 0,
    osoby: people.data.map((person) => ({
      id: person.id,
      imie: person.imie,
      maPin: person.pin_hash !== null,
      odkryl: revealed.has(person.id),
    })),
  })
}

// Only this year's draw can be undone: past years are the history the rules depend on
async function undoDraw() {
  const { error } = await getDb().from("losowanie_wyniki").delete().eq("rok", currentYear())
  if (error) throw error
  return status()
}

async function resetPin(id: unknown) {
  if (typeof id !== "number") return reply({ error: "bledne-dane" }, 400)
  const { error } = await getDb()
    .from("losowanie_osoby")
    .update({ pin_hash: null, nieudane_proby: 0, blokada_do: null })
    .eq("id", id)
  if (error) throw error
  return status()
}

// POST /api/losowanie/admin { haslo, akcja: "status" | "cofnij" | "resetPin", osobaId? }
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!safeEqual(body?.haslo, process.env.LOSOWANIE_ADMIN_HASLO)) {
    return reply({ error: "bledne-haslo" }, 401)
  }
  try {
    if (body.akcja === "status") return await status()
    if (body.akcja === "cofnij") return await undoDraw()
    if (body.akcja === "resetPin") return await resetPin(body.osobaId)
    return reply({ error: "bledne-dane" }, 400)
  } catch {
    return reply({ error: "serwer" }, 502)
  }
}
