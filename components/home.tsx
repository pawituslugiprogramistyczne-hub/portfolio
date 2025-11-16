"use client"
import Image from "next/image"

export default function Home({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-[50vw] h-[20vh]">
              <Image
                src="/logo.png"
                alt="Quiz App Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed">
          Przygotujcie się na sprawdzenie waszej wiedzy!
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-quiz-game-primary to-quiz-game-secondary hover:from-quiz-game-primary/90 hover:to-quiz-game-secondary/90 text-quiz-game-primary-foreground font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg"
        >
          Zaczynamy!
        </button>

        {/* Info */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">Jesteście gotowi na ostrą jazdę bez trzymanki?</p>
        </div>
      </div>
    </div>
  )
}
