"use client"

import { useState, type FormEvent } from "react"
import { Eye, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const ERRORS: Record<string, string> = {
  "bledne-dane": "Nieprawidłowy PIN.",
  "bledny-kod": "Nieprawidłowy kod grupy.",
  blokada: "Za dużo błędnych prób. Spróbuj ponownie za 15 minut.",
  "brak-rozwiazania": "Przy obecnych zasadach nie da się rozlosować wszystkich osób. Daj znać organizatorowi.",
  serwer: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
}

const fieldClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

type Result = { rok: number; obdarowany: string | null }

export function LosowaniePage({ names, year }: { names: string[] | null; year: number }) {
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [code, setCode] = useState("")
  const [needsCode, setNeedsCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/losowanie/wynik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imie: name, pin, kod: needsCode ? code : undefined }),
      })
      const body = await response.json()
      if (body.error === "wymaga-kodu") setNeedsCode(true)
      else if (body.error) setError(ERRORS[body.error] ?? ERRORS.serwer)
      else setResult(body)
    } catch {
      setError(ERRORS.serwer)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = () => {
    setPin("")
    setCode("")
    setNeedsCode(false)
    setResult(null)
    setRevealed(false)
  }

  return (
    <main lang="pl" className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Gift className="mb-2 h-8 w-8 text-primary" aria-hidden="true" />
          <CardTitle>Świąteczne losowanie {year}</CardTitle>
          <CardDescription>Sprawdź, komu w tym roku robisz prezent.</CardDescription>
        </CardHeader>
        <CardContent>
          {names === null ? (
            <p role="alert" className="text-center text-sm text-muted-foreground">
              Losowanie jest chwilowo niedostępne. Spróbuj ponownie później.
            </p>
          ) : result ? (
            <div className="space-y-4 text-center">
              {result.obdarowany === null ? (
                <p className="text-sm text-muted-foreground">
                  Nie ma Cię w losowaniu na {result.rok}. Daj znać organizatorowi.
                </p>
              ) : revealed ? (
                <div aria-live="polite">
                  <p className="text-sm text-muted-foreground">Robisz prezent dla:</p>
                  <p className="mt-1 text-3xl font-semibold">{result.obdarowany}</p>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setRevealed(true)}>
                  <Eye aria-hidden="true" />
                  Pokaż wynik
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={handleLeave}>
                Wyjdź
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="losowanie-imie" className="text-sm font-medium">
                  Imię
                </label>
                <select
                  id="losowanie-imie"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setNeedsCode(false)
                    setError(null)
                  }}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Wybierz imię
                  </option>
                  {names.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="losowanie-pin" className="text-sm font-medium">
                  {needsCode ? "Wymyśl swój PIN" : "PIN"}
                </label>
                <Input
                  id="losowanie-pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  pattern="[0-9]{4,6}"
                  minLength={4}
                  maxLength={6}
                  title="Od 4 do 6 cyfr"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {needsCode
                    ? "To Twoje pierwsze wejście. Zapamiętaj ten PIN (4–6 cyfr), bo będzie potrzebny przy kolejnych."
                    : "Od 4 do 6 cyfr. Przy pierwszym wejściu po prostu wymyśl swój."}
                </p>
              </div>

              {needsCode && (
                <div className="space-y-1.5">
                  <label htmlFor="losowanie-kod" className="text-sm font-medium">
                    Kod grupy
                  </label>
                  <Input
                    id="losowanie-kod"
                    autoComplete="off"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Dostaniesz go od organizatora.</p>
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sprawdzam..." : needsCode ? "Zapisz PIN i wejdź" : "Dalej"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
