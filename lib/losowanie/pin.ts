import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

const derive = promisify(scrypt) as (password: string, salt: string, length: number) => Promise<Buffer>

export const PIN_PATTERN = /^\d{4,6}$/

export async function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = await derive(pin, salt, 32)
  return `${salt}:${hash.toString("hex")}`
}

export async function verifyPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(":")
  const candidate = await derive(pin, salt, 32)
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"))
}

// Hashing first gives equal lengths, which timingSafeEqual requires. An unset secret never matches.
export function safeEqual(value: unknown, secret: string | undefined) {
  if (typeof value !== "string" || !secret) return false
  const digest = (text: string) => createHash("sha256").update(text).digest()
  return timingSafeEqual(digest(value), digest(secret))
}
