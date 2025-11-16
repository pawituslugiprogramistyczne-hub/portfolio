"use client"

import { sampleQuestions } from "@/lib/questions"
import type { Question } from "@/lib/questions"
import Image from "next/image"

export default function PrintableAnswersPage() {
  // Filtrujemy pytania, aby pominąć przerwy na toast
  const questionsToPrint = sampleQuestions.filter(
    (q) => q.type !== "toast-break"
  )

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:bg-white">
      {/* --- SEKCJA KONTROLNA (UKRYTA PODCZAS DRUKOWANIA) --- */}
      <div className="max-w-4xl mx-auto text-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Karta Odpowiedzi do Druku
        </h1>
        <p className="text-gray-600 mb-4">
          Użyj poniższego przycisku, aby wydrukować tę stronę dla graczy.
        </p>
        <button
          onClick={() => window.print()}
          className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
        >
          Drukuj Kartę
        </button>
      </div>

      {/* --- OBSZAR DO DRUKU --- */}
      <div
        id="printable-area"
        className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg print:shadow-none print:p-0"
      >
        <header className="text-center border-b-2 border-black pb-4 mb-8">
          <h1 className="text-4xl font-serif font-bold text-black">
            Karta Odpowiedzi - Urodzinowy Quiz
          </h1>
          <p className="text-lg mt-4 text-black">
            Nazwa drużyny:
            <span className="inline-block border-b-2 border-black w-1/2 ml-2"></span>
          </p>
        </header>

        {/* Układ dwukolumnowy dla oszczędności miejsca */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-black">
          {questionsToPrint.map((question, index) => (
            <div key={index} className="flex items-center text-lg pt-2">
              <span className="font-bold w-8">{index + 1}.</span>
              <span className="flex-grow border-b-2 border-black h-1 ml-2"></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}