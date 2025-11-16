"use client"

import type { Question } from "@/lib/questions"

interface AnswerSummaryProps {
  questions: Question[]
  onReturnHome: () => void
}

export default function AnswerSummary({ questions, onReturnHome }: AnswerSummaryProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-quiz-game-primary to-quiz-accent bg-clip-text text-transparent">
              PawIT
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Answers Revealed</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Quiz Answers</h2>
            <p className="text-muted-foreground text-lg">All questions and their correct answers</p>
          </div>

          {questions.map((question, index) => {
            const isMultipleChoice = "options" in question
            return (
              <div
                key={index}
                className="p-8 rounded-lg border-2 border-quiz-accent/30 bg-gradient-to-br from-card to-card/50 space-y-4 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-quiz-game-quiz-game-primary to-quiz-accent text-quiz-game-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{question.text}</h3>
                </div>

                {isMultipleChoice ? (
                  <div className="ml-12 space-y-3">
                    <div className="space-y-2">
                      {(question as any).options.map((option: string, optIndex: number) => {
                        const isCorrect = (question as any).correctAnswer === optIndex
                        return (
                          <div
                            key={optIndex}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isCorrect ? "border-quiz-accent bg-quiz-accent/10" : "border-muted/30 bg-muted/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center font-semibold text-sm ${
                                  isCorrect
                                    ? "bg-gradient-to-br from-quiz-game-primary to-quiz-accent text-quiz-game-primary-foreground"
                                    : "bg-muted/20 text-muted-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className={`${isCorrect ? "text-quiz-accent font-semibold" : "text-muted-foreground"}`}>
                                {option}
                              </span>
                              {isCorrect && <span className="ml-auto text-quiz-accent font-semibold">✓ Correct</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="ml-12 p-6 rounded-lg border-2 border-quiz-accent bg-gradient-to-br from-quiz-accent/10 to-quiz-game-secondary/10">
                    <div className="text-sm font-semibold text-quiz-accent mb-2 uppercase tracking-wider">
                      Correct Answer
                    </div>
                    <p className="text-xl font-bold text-foreground">{(question as any).answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-center">
          <button
            onClick={onReturnHome}
            className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-quiz-game-primary to-quiz-accent text-quiz-game-primary-foreground hover:from-quiz-game-primary/90 hover:to-quiz-accent/90 transition-all duration-300"
          >
            Return Home
          </button>
        </div>
      </footer>
    </div>
  )
}
