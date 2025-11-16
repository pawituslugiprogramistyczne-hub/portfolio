"use client"

import { useState, useEffect, useMemo } from "react"

// Stała lista 10 osób
const initialTeamMembers = [
  "Ola", "Paulina", "Gabi", "Weronika", 
  "Dasia", "Anton", "Rafal", "Kuba", 
  "Mieszko", "Amadeusz"
]

// Funkcja do losowego mieszania tablicy
const shuffleArray = (array: string[]) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function GroupDivisionPage({handleGroupsChoosen}: {handleGroupsChoosen: () => void}) {
  const [remainingMembers, setRemainingMembers] = useState<string[]>([])
  const [groups, setGroups] = useState<string[][]>([[], [], []])
  const [drawnMember, setDrawnMember] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Używamy useMemo do jednorazowego potasowania listy na starcie
  const shuffledMembers = useMemo(() => shuffleArray(initialTeamMembers), [])

  // Inicjalizacja stanu
  useEffect(() => {
    setRemainingMembers(shuffledMembers)
  }, [shuffledMembers])

  const handleDraw = () => {
    if (isDrawing || remainingMembers.length === 0) return

    setIsDrawing(true)
    const memberToDraw = remainingMembers[0]

    // Krok 1: Pokaż wylosowaną osobę i usuń ją z puli do losowania
    setDrawnMember(memberToDraw)
    setRemainingMembers(prev => prev.slice(1))

    // Krok 2: Po chwili dodaj do grupy i zresetuj stan losowania
    setTimeout(() => {
      setGroups(prevGroups => {
        const newGroups = prevGroups.map(g => [...g]); // Tworzymy głęboką kopię dla bezpieczeństwa
        const totalMembersInGroups = newGroups.flat().length;

        // Bardziej odporna logika przypisywania do grup (4, 3, 3)
        let targetGroupIndex;
        if (totalMembersInGroups < 4) {
          targetGroupIndex = 0;
        } else if (totalMembersInGroups < 7) { // 4 + 3
          targetGroupIndex = 1;
        } else {
          targetGroupIndex = 2;
        }

        // Dodaj osobę do docelowej grupy, jeśli taka istnieje
        if (newGroups[targetGroupIndex] && !newGroups[targetGroupIndex].includes(memberToDraw)) {
            newGroups[targetGroupIndex].push(memberToDraw);
        }
        
        return newGroups;
      });

      setDrawnMember(null);
      setIsDrawing(false);
    }, 2000); // 2 sekundy napięcia
  }

  const handleReset = () => {
    const newShuffled = shuffleArray(initialTeamMembers)
    setRemainingMembers(newShuffled)
    setGroups([[], [], []])
    setDrawnMember(null)
    setIsDrawing(false)
  }

  const isFinished = remainingMembers.length === 0 && !isDrawing

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col items-center justify-center p-4 space-y-8">
      
      {/* GŁÓWNY OBSZAR LOSOWANIA */}
      <div className="w-full max-w-4xl text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-foreground">
          Losowanie Grup
        </h1>

        {/* ANIMACJA LOSOWANIA */}
        <div className="relative h-24">
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${drawnMember ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            {drawnMember && (
              <div className="p-6 rounded-lg border-2 border-quiz-game-primary bg-card shadow-2xl">
                <p className="text-4xl font-bold text-quiz-game-primary">{drawnMember}</p>
              </div>
            )}
          </div>
        </div>

        {/* PRZYCISK LOSOWANIA / RESETU */}
        <div className="flex justify-center">
          {isFinished ? (
            <>
            <button onClick={handleReset} className="w-64 bg-gradient-to-r from-yellow-500 to-amber-500 me-2 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 text-lg">
              Zacznij od nowa
            </button>
            <button onClick={handleGroupsChoosen} className="w-64 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 text-lg">
              Zaczynamy grę!
            </button>
            </>
          ) : (
            <button onClick={handleDraw} disabled={isDrawing} className="w-64 bg-gradient-to-r from-quiz-game-primary to-quiz-game-secondary text-quiz-game-primary-foreground font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isDrawing ? 'Losowanie...' : 'Losuj Osobę'}
            </button>
          )}
        </div>
      </div>

      {/* WYŚWIETLANIE GRUP */}
      <div className="w-full max-w-6xl grid md:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <div key={index} className="bg-card/80 border border-border rounded-lg p-6 shadow-lg min-h-[200px]">
            <h2 className="text-3xl font-bold text-quiz-game-primary mb-4 text-center">
              Grupa {index + 1}
            </h2>
            <ul className="space-y-3 text-center">
              {group.map((member) => (
                <li key={member} className="text-2xl text-foreground animate-fade-in">
                  {member}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}