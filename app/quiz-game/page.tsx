"use client"

import { useState } from "react"
import Home from "@/components/home"
import QuizScreen from "@/components/quiz-screen"
import AnswerSummary from "@/components/answer-summary"
import GroupDivisionPage from "@/components/group-division"
import { sampleQuestions } from "@/lib/questions"

export default function Page() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [groupsDivisioning, setGroupsDivisioning] = useState(false)

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setQuizCompleted(false)
    setGroupsDivisioning(true)
  }
  const handleGroupsChoosen = () => {
    setGroupsDivisioning(false)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleEndQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setQuizCompleted(false)
  }

  if (quizCompleted) {
    return <AnswerSummary questions={sampleQuestions} onReturnHome={handleEndQuiz} />
  }

  if (!quizStarted) {
    return <Home onStart={handleStartQuiz} />
  }
  if(groupsDivisioning){
    return <GroupDivisionPage handleGroupsChoosen={handleGroupsChoosen} />
  }

  return (
    <QuizScreen
      question={sampleQuestions[currentQuestion]}
      sampleQuestions={sampleQuestions}
      onNext={handleNextQuestion}
      onPrevious={handlePreviousQuestion}
      onEnd={handleEndQuiz}
      isLastQuestion={currentQuestion === sampleQuestions.length - 1}
      isFirstQuestion={currentQuestion === 0}
    />
  )
}
