"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const ERRORS: Record<string, string> = {
  "bledne-haslo": "Nieprawidłowe hasło.",
  serwer: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
}

type Status = {
  rok: number
  wylosowano: boolean
  osoby: { id: number; imie: string; maPin: boolean; odkryl: boolean }[]
}

export function AdminPanel() {
  // kept in memory only, so closing the tab signs out
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const send = async (akcja: string, osobaId?: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/losowanie/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haslo: password, akcja, osobaId }),
      })
      const body = await response.json()
      if (body.error) setError(ERRORS[body.error] ?? ERRORS.serwer)
      else setStatus(body)
    } catch {
      setError(ERRORS.serwer)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (event: FormEvent) => {
    event.preventDefault()
    send("status")
  }

  const handleUndo = () => {
    const message = `Cofnąć losowanie ${status?.rok}? Wyniki znikną także u osób, które już je widziały.`
    if (window.confirm(message)) send("cofnij")
  }

  const handleReset = (id: number, name: string) => {
    if (window.confirm(`Wyczyścić PIN osoby ${name}?`)) send("resetPin", id)
  }

  return (
    <main lang="pl" className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Panel losowania</CardTitle>
          <CardDescription>Panel pokazuje tylko status, nigdy pary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === null ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="losowanie-haslo" className="text-sm font-medium">
                  Hasło organizatora
                </label>
                <Input
                  id="losowanie-haslo"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sprawdzam..." : "Wejdź"}
              </Button>
            </form>
          ) : (
            <>
              <ul className="divide-y">
                {status.osoby.map((person) => (
                  <li key={person.id} className="flex flex-wrap items-center gap-2 py-2.5">
                    <span className="mr-auto font-medium">{person.imie}</span>
                    {person.odkryl ? (
                      <Badge>Sprawdził(a) wynik</Badge>
                    ) : (
                      <Badge variant="outline">{person.maPin ? "Ma PIN" : "Nie było"}</Badge>
                    )}
                    {person.maPin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        onClick={() => handleReset(person.id, person.imie)}
                      >
                        Reset PIN
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {status.wylosowano ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Losowanie na {status.rok} już się odbyło.</p>
                  <Button variant="outline" className="w-full" disabled={loading} onClick={handleUndo}>
                    Cofnij losowanie
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Losowanie na {status.rok} uruchomi się samo przy pierwszym wejściu osoby z PIN-em i kodem grupy.
                </p>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
