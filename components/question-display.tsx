"use client"

import { useEffect, useState } from "react"
import type { Question } from "@/lib/questions"
import Image from "next/image"

interface QuestionDisplayProps {
  question: Question
}

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 30)
  const isMultipleChoice = "options" in question

  useEffect(() => {
    setTimeLeft(question.timeLimit || 30)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [question])

  const initialTime = question.timeLimit || 30
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (timeLeft / initialTime) * circumference

  const getTimerColor = () => {
    if (timeLeft <= 10) return "text-red-500"
    if (timeLeft <= 20) return "text-yellow-500"
    return "text-green-500"
  }

  const getStrokeColor = () => {
    if (timeLeft <= 10) return "stroke-red-500"
    if (timeLeft <= 20) return "stroke-yellow-500"
    return "stroke-green-500"
  }
  
  if (question.type === "toast-break") {
    return (
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-foreground">
            Czas na toast! 🥂
          </h2>
          <p className="mt-4 text-2xl text-muted-foreground">
            Wznosimy kieliszki za solenizanta i bawimy się dalej!
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Timer */}
      
      <div className="flex justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="10"
              className="stroke-border/20"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className={`${getStrokeColor()} transition-all duration-500`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold font-mono ${getTimerColor()}`}>
              {String(timeLeft).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="text-center space-y-6">
        <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-foreground">{question.text}</h2>
      </div>
      {"image" in question && question.image && (
        <div className="flex justify-center my-4">
          <div className="relative w-full max-w-xl h-72">
            <Image
              src={`/${question.image}`}
              alt={question.text}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
      {/* Options or Answer Area */}
      {isMultipleChoice ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(question as any).options.map((option: string, index: number) => {
            return (
              <div
                key={index}
                className="p-6 rounded-lg border-2 border-border bg-card hover:border-quiz-game-primary/50 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-3xl flex items-center justify-center font-bold text-2xl bg-quiz-game-primary/20 text-quiz-game-primary">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <p className="text-3xl text-foreground pt-1">{option}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-8 rounded-lg border-2 border-dashed border-muted bg-muted/20">
          <p className="text-xl text-muted-foreground text-center">Odpowiedź będzie na końcu</p>
        </div>
      )}
    </div>
  )
}
