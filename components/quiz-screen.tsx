"use client"
import { useEffect, useMemo, useState } from "react"
import type { Question } from "@/lib/questions"
import QuestionDisplay from "./question-display"
import ControlPanel from "./control-panel"

interface QuizScreenProps {
  question: Question
  sampleQuestions: Question[]
  onNext: () => void
  onPrevious: () => void
  onEnd: () => void
  isLastQuestion: boolean
  isFirstQuestion: boolean
}

export default function QuizScreen({
  question,
  sampleQuestions,
  onNext,
  onPrevious,
  onEnd,
  isLastQuestion,
  isFirstQuestion,
}: QuizScreenProps) {
  const [currentAudioSrc, setCurrentAudioSrc] = useState("")

  useEffect(() => {
    // Ustawia początkowy utwór przy zmianie pytania
    const initialSrc = question.music ? `/${question.music}` : "/open_music.m4a"
    setCurrentAudioSrc(initialSrc)
  }, [question])

  const handleAudioEnded = () => {
    // Jeśli skończył się dżingiel, przełącz na główną muzykę tła
    if (currentAudioSrc === "/open_music.m4a") {
      setCurrentAudioSrc("/question_music.mp3")
    }
  }

  // Funkcja do liczenia numeru pytania w danej kategorii
  const getCategoryQuestionInfo = useMemo(() => {
    const categoryQuestions = sampleQuestions.filter(
      q => q.category === question.category && q.type !== "toast-break"
    )
    const currentQuestionInCategory = categoryQuestions.findIndex(
      q => q.text === question.text
    ) + 1
    const totalQuestionsInCategory = categoryQuestions.length

    return {
      current: currentQuestionInCategory,
      total: totalQuestionsInCategory
    }
  }, [question])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col">
      {/* Player Embed */}
      <div className="fixed bottom-4 right-4 z-50">
        <audio
          src={currentAudioSrc}
          controls
          autoPlay
          loop={currentAudioSrc === "/question_music.mp3"}
          onEnded={handleAudioEnded}
          // Klucz jest ważny, aby wymusić ponowne załadowanie odtwarzacza i autoPlay
          key={currentAudioSrc}
          className="rounded-lg shadow-lg w-[300px]"
        />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-quiz-game-primary to-accent bg-clip-text text-transparent">
              PawIT
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Pytanie z kategorii: <span className="font-medium text-foreground">{question.category}</span> 
            {question.type !== "toast-break" && (
              <span> ({getCategoryQuestionInfo.current} / {getCategoryQuestionInfo.total})</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <QuestionDisplay question={question} />
      </main>

      {/* Control Panel */}
      <ControlPanel
        onNext={onNext}
        onPrevious={onPrevious}
        onEnd={onEnd}
        isLastQuestion={isLastQuestion}
        isFirstQuestion={isFirstQuestion}
      />
    </div>
  )
}
