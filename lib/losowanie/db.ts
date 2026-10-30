import { createClient } from "@supabase/supabase-js"
import { drawAssignment } from "@/lib/losowanie/draw"

const UNIQUE_VIOLATION = "23505"

// Server-only: the secret key bypasses RLS, so never import this from a client component.
export function getDb() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set")
  return createClient(url, key, { auth: { persistSession: false } })
}

// Each draw belongs to the calendar year it was made in
export function currentYear() {
  return new Date().getFullYear()
}

// Runs on the first person's visit and draws the whole group, so everyone after them just gets
// their saved result. Returns false when the rules leave no valid assignment.
export async function ensureDraw(rok: number): Promise<boolean> {
  const db = getDb()
  const [people, past] = await Promise.all([
    db.from("losowanie_osoby").select("id, partner_id"),
    db.from("losowanie_wyniki").select("rok, dajacy_id, obdarowany_id").in("rok", [rok, rok - 1, rok - 2]),
  ])
  if (people.error) throw people.error
  if (past.error) throw past.error
  if (past.data.some((row) => row.rok === rok)) return true

  const pairs = drawAssignment(
    people.data.map((person) => ({ id: person.id, partnerId: person.partner_id })),
    past.data.map((row) => ({ giverId: row.dajacy_id, receiverId: row.obdarowany_id })),
  )
  if (!pairs) return false

  // one insert, so the draw is saved whole or not at all; on a tie the first visit's draw stands
  const { error } = await db
    .from("losowanie_wyniki")
    .insert(pairs.map((pair) => ({ rok, dajacy_id: pair.giverId, obdarowany_id: pair.receiverId })))
  if (error && error.code !== UNIQUE_VIOLATION) throw error
  return true
}

export async function getNames(): Promise<string[]> {
  const { data, error } = await getDb().from("losowanie_osoby").select("imie").order("imie")
  if (error) throw error
  return data.map((row) => row.imie)
}
