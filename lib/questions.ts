export interface MultipleChoiceQuestion {
  type: "multiple-choice"
  text: string
  options: string[]
  correctAnswer: number
  timeLimit?: number
  category: string
  music?: string
}

export interface OpenEndedQuestion {
  type: "open-ended"
  text: string
  answer: string
  timeLimit?: number
  category: string
  music?: string
  image?: string
}

export interface ToastBreak{
  type: "toast-break"
  music?: string
  category: "toast"
}

export type Question = MultipleChoiceQuestion | OpenEndedQuestion | ToastBreak

export const sampleQuestions: Question[] = [
  {
    type: "multiple-choice",
    text: "W jakim miesiącu urodził się solenizant?",
    options: [
      "Luty",
      "Październik",
      "Listopad",
      "Grudzień",
    ],
    correctAnswer: 2,
    timeLimit: 30,
    category: "Solenizant",
  },
  {
    type: "multiple-choice",
    text: "Ile lat miał, gdy zdał prawo jazdy?",
    options: ["18", "20", "22", "19"],
    correctAnswer: 3,
    timeLimit: 45,
    category: "Solenizant",
    },
  {
    type: "multiple-choice",
    text: "Jak ma na drugie imię?",
    options: ["Ryszard", "Krzysztof", "Filip", "Michał"],
    correctAnswer: 1,
    timeLimit: 30,
    category: "Solenizant",
  },
    {
    type: "open-ended",
    text: "W której rece solenizant trzyma myszkę podczas grania?",
    answer: "W lewej",
    timeLimit: 15,
    category: "Solenizant",
  },
  {
    type: "open-ended",
    text: "Jaki jest jego znak zodiaku?",
    answer: "Skorpion",
    timeLimit: 60,
    category: "Solenizant",
  },
  {
    type: "multiple-choice",
    text: "Jaki jest ulubiony język programowania solenizanta?",
    options: ["JavaScript", "Python", "TypeScript", "C#"],
    correctAnswer: 1,
    timeLimit: 60,
    category: "Solenizant",
  },
  {
    type: "multiple-choice",
    text: "Ile krajów odwiedził solenizant?",
    options: ["5", "10", "15", "20"],
    correctAnswer: 1,
    timeLimit: 75,
    category: "Solenizant",
  },
  {
    type: "toast-break",
    category: "toast",
    music: "polsat-reklama.mp3"
  },
  {
    type: "open-ended",
    text: "Ile wynosi liczba Pi (do 2 miejsc po przecinku)?",
    answer: "3.14",
    timeLimit: 60,
    category: "Wiedza ogólna",
  },
  {
    type: "open-ended",
    text: "Kto napisał serie ksiązek pt. Wiedźmin?",
    answer: "Andrzej Sapkowski",
    timeLimit: 60,
    category: "Wiedza ogólna",
  },
  {
    type: "open-ended",
    text: "Ilu mieszkańców liczy Fordon (dane na rok 2014)? * Kto bliżej zdobywa punkt *",
    answer: "72 tysiące",
    timeLimit: 60,
    category: "Wiedza ogólna",
  },
  {
    type: "open-ended",
    text: "W której ręce toruński Kopernik trzyma astrolabium?",
    answer: "W lewej",
    timeLimit: 75,
    category: "Wiedza ogólna",
  },
  {
    type: "open-ended",
    text: "W której rece solenizant trzyma myszkę podczas grania?",
    answer: "W lewej",
    timeLimit: 15,
    category: "Wiedza ogólna",
  },
    {
    type: "toast-break",
    category: "toast",
    music: "polsat-reklama.mp3"
  },
  {
    type: "multiple-choice",
    text: "Jaka jest najlepsza bajka na świecie?",
    options: ["Król Lew", "Toy Story", "Shrek", "Auta"],
    correctAnswer: 2,
    timeLimit: 45,
    category: "Bajki i filmy",
  },
  {
    type: "open-ended",
    text: "Jak nazywa się królestwo, w którym mieszka Fiona i jej rodzice?",
    answer: "Zasiedmiogórogród",
    timeLimit: 45,
    category: "Bajki i filmy",
  },
  {
    type: "multiple-choice",
    text: "Jak nazywa się błękitna rybka z filmu 'Gdzie jest Nemo'?",
    options: ["Dory", "Nemo", "Marlin", "Bubbles"],
    correctAnswer: 0,
    timeLimit: 30,
    category: "Bajki i filmy",
  },
  {
    type: "open-ended",
    text: "Co to za postać i z jakiej bajki?",
    answer: "Król Julian z Madagaskaru",
    timeLimit: 90,
    category: "Bajki i filmy",
    image: "ogon.png"
  },
  {
    type: "multiple-choice",
    text: "Jaki aktor wcielił się w postać Geralta z Rivii w serialu 'Wiedźmin'?",
    options: ["Henry Cavill", "Tom Hanks", "Chris Hemsworth", "Paweł Pokorski"],
    correctAnswer: 0,
    timeLimit: 45,
    category: "Bajki i filmy",
  },
  {
    type: "open-ended",
    text: "Jaką postać z bajki przypomina wam solenizant?",
    answer: "Każda odpowiedź poprawna",
    timeLimit: 90,
    category: "Bajki i filmy",
  },
    {
    type: "toast-break",
    category: "toast",
    music: "polsat-reklama.mp3"
  },
  {
    type: "open-ended",
    text: "Podajcie wykonawce oraz tytuł usłyszanego fragmentu muzycznego.",
    answer: "Krzyztof Krawczyk - Parostatek",
    timeLimit: 90,
    category: "Muzyka",
    music: "Głos 251103_215119.m4a"
  },
  {
    type: "open-ended",
    text: "Dokonczcie tekst usłyszanego fragmentu muzycznego.",
    answer: "Nie zmienie się, to nie mój świat",
    timeLimit: 90,
    category: "Muzyka",
    music: "Głos 251103_221048.m4a"
  },
  {
    type: "open-ended",
    text: "Jakiej dziewczynie Michał Wiśniewski dedykował piosenkę 'Zawsze z Tobą chciałbym być'?",
    answer: "Kaśka",
    timeLimit: 60,
    category: "Muzyka",
  },
  {
    type: "multiple-choice",
    text: "Ile damskich imion występuje w tekście piosenki Baśka zespołu Wilki?",
    options: ["15", "17", "16", "18"],
    correctAnswer: 2,
    timeLimit: 120,
    category: "Muzyka",
  },
    {
    type: "toast-break",
    category: "toast",
    music: "polsat-reklama.mp3"
  },
  {
    type: "open-ended",
    text: "Musicie wymyślić toast na dzisiejszą okazję. Jaka będzie jego treść?",
    answer: "Każda odpowiedź poprawna",
    timeLimit: 300,
    category: "Zadanie specjalne",
  },

]
