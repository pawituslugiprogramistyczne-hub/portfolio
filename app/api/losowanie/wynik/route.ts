import { NextResponse, type NextRequest } from "next/server"
import { currentYear, ensureDraw, getDb } from "@/lib/losowanie/db"
import { hashPin, PIN_PATTERN, safeEqual, verifyPin } from "@/lib/losowanie/pin"

export const dynamic = "force-dynamic"

const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

async function recordFailure(id: number, attempts: number) {
  const locked = attempts + 1 >= MAX_ATTEMPTS
  await getDb()
    .from("losowanie_osoby")
    .update({
      nieudane_proby: locked ? 0 : attempts + 1,
      blokada_do: locked ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null,
    })
    .eq("id", id)
}

// POST /api/losowanie/wynik { imie, pin, kod? } -> who this person drew this year, drawing the
// group if nobody has yet. A person's first visit also needs the shared group code and saves
// the PIN they chose.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const { imie, pin, kod } = body ?? {}
  if (typeof imie !== "string" || typeof pin !== "string" || !PIN_PATTERN.test(pin)) {
    return reply({ error: "bledne-dane" }, 400)
  }

  try {
    const db = getDb()
    const { data: person, error } = await db
      .from("losowanie_osoby")
      .select("id, pin_hash, nieudane_proby, blokada_do")
      .eq("imie", imie)
      .maybeSingle()
    if (error) throw error
    if (!person) return reply({ error: "bledne-dane" }, 401)

    if (person.blokada_do && new Date(person.blokada_do) > new Date()) {
      return reply({ error: "blokada" }, 429)
    }

    if (person.pin_hash) {
      if (!(await verifyPin(pin, person.pin_hash))) {
        await recordFailure(person.id, person.nieudane_proby)
        return reply({ error: "bledne-dane" }, 401)
      }
    } else {
      if (kod === undefined) return reply({ error: "wymaga-kodu" }, 403)
      if (!safeEqual(kod, process.env.LOSOWANIE_KOD)) {
        await recordFailure(person.id, person.nieudane_proby)
        return reply({ error: "bledny-kod" }, 401)
      }
      // the null filter makes two simultaneous first visits unable to overwrite each other
      const { data: saved, error: saveError } = await db
        .from("losowanie_osoby")
        .update({ pin_hash: await hashPin(pin) })
        .eq("id", person.id)
        .is("pin_hash", null)
        .select("id")
      if (saveError) throw saveError
      if (saved.length === 0) return reply({ error: "bledne-dane" }, 401)
    }

    if (person.nieudane_proby > 0 || person.blokada_do) {
      await db.from("losowanie_osoby").update({ nieudane_proby: 0, blokada_do: null }).eq("id", person.id)
    }

    const rok = currentYear()
    if (!(await ensureDraw(rok))) return reply({ error: "brak-rozwiazania" }, 422)

    const { data: result, error: resultError } = await db
      .from("losowanie_wyniki")
      .select("odkryto_at, obdarowany:losowanie_osoby!obdarowany_id(imie)")
      .eq("rok", rok)
      .eq("dajacy_id", person.id)
      .maybeSingle()
    if (resultError) throw resultError
    if (!result) return reply({ rok, obdarowany: null })

    if (!result.odkryto_at) {
      await db
        .from("losowanie_wyniki")
        .update({ odkryto_at: new Date().toISOString() })
        .eq("rok", rok)
        .eq("dajacy_id", person.id)
    }
    const receiver = result.obdarowany as unknown as { imie: string }
    return reply({ rok, obdarowany: receiver.imie })
  } catch {
    return reply({ error: "serwer" }, 502)
  }
}
