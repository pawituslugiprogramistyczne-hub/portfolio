"use client"

interface ControlPanelProps {
  onNext: () => void
  onPrevious: () => void
  onEnd: () => void
  isLastQuestion: boolean
  isFirstQuestion: boolean
}

export default function ControlPanel({
  onNext,
  onPrevious,
  onEnd,
  isLastQuestion,
  isFirstQuestion,
}: ControlPanelProps) {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* Navigation Controls */}
        <div className="flex gap-3 justify-center items-center flex-wrap">
          <button
            onClick={onPrevious}
            disabled={isFirstQuestion}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              isFirstQuestion
                ? "bg-muted/20 text-muted-foreground cursor-not-allowed"
                : "bg-card border border-border hover:border-primary text-foreground hover:bg-card/80"
            }`}
          >
            ← Poprzednie
          </button>

          <div className="text-sm text-muted-foreground px-4">Navigacja</div>

          <button
            onClick={onNext}
            className="px-6 py-2 rounded-lg font-semibold transition-all duration-300 bg-card border border-border hover:border-primary text-foreground hover:bg-card/80"
          >
            {isLastQuestion ? "Odpowiedzi →" : "Następne →"}
          </button>
        </div>

        {/* End Quiz Button */}
        <div className="flex justify-center">
          <button
            onClick={onEnd}
            className="px-8 py-2 rounded-lg font-semibold text-destructive-foreground bg-destructive/20 border border-destructive/30 hover:bg-destructive/30 transition-all duration-300"
          >
            End Quiz
          </button>
        </div>
      </div>
    </footer>
  )
}
