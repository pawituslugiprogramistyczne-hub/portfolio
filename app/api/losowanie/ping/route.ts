import { NextResponse } from "next/server"
import { getDb } from "@/lib/losowanie/db"

export const dynamic = "force-dynamic"

// GET /api/losowanie/ping, called weekly by the cron in vercel.json. Supabase pauses free
// projects after inactivity, and this data only gets used around the holidays.
export async function GET() {
  const { error } = await getDb().from("losowanie_osoby").select("id", { count: "exact", head: true })
  return NextResponse.json({ ok: !error }, { status: error ? 502 : 200 })
}
