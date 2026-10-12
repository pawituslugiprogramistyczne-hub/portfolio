import { Wordmark } from "@/components/wordmark"

export function Logo() {
  return (
    <span className="flex h-10 items-center text-xl transition-opacity hover:opacity-80">
      <Wordmark />
      <span className="sr-only">PawIT</span>
    </span>
  )
}
