"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type Language = "en" | "pl"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    "meta.location": "Bydgoszcz, Poland",

    // Navigation
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    "nav.menu": "Menu",
    "nav.skip": "Skip to content",

    // Hero Section
    "hero.name": "Pawel Pokorski",
    "hero.tagline": "Software Engineer | Python | Full-stack | Data & Automation",
    "hero.description":
      "Software engineer at Nokia. I turn raw data into tools: parsers, web apps and dashboards that automate work.",
    "hero.getInTouch": "Get in touch",
    "hero.viewWork": "View my work",
    "hero.openToWork": "Open to new roles",

    // Impact numbers
    "stats.years.value": "~6",
    "stats.years.label": "years of experience building software",
    "stats.design.value": "-78%",
    "stats.design.label": "design effort after I automated fiber-network design at Nokia (~36 h to ~8 h)",
    "stats.degree.value": "M.Sc.",
    "stats.degree.label": "in Electronics and Telecommunications, Bydgoszcz University of Technology",

    // About Section
    "about.title": "About Me",
    "about.paragraph1":
      "I'm a software engineer with almost 6 years of experience turning raw data into intelligent engineering tools. I combine data science (Pandas, statistical analysis) with full-stack development (FastAPI, React).",
    "about.paragraph2":
      "At Nokia I build parsers, web applications and dashboards that automate processes and make engineering work faster. Since 2023 I also run PawIT, my own software development brand.",
    "about.fullStack": "Full-stack web apps (FastAPI, React)",
    "about.data": "Data processing and analysis",
    "about.automation": "Process automation",
    "about.dashboards": "Dashboards and data visualization",

    // Experience Section
    "experience.title": "Experience",
    "experience.education": "Education",
    "experience.present": "Present",
    "exp.nokia.role": "Software Engineer / Full-stack Developer",
    "exp.nokia.h1":
      "Automated the fiber-optic network design process with a web application covering rack and shelf configuration, documentation generation and a step-by-step engineer workflow. Design effort went from ~36 hours to ~8 hours (~78% less).",
    "exp.nokia.h2":
      "Built a workforce planning platform that forecasts engineering capacity from current and upcoming projects using historical workload data, with interactive dashboards for demand and trends.",
    "exp.nokia.h3":
      "Developed automation tools for technical calculations and validation, including shelf capacity and power-consumption checks that prevent over-capacity installations.",
    "exp.nokia.h4":
      "Developed an ML-based classification tool that recommends project types for new work orders from historical data and project titles.",
    "exp.nokia.h5":
      "Deliver internal software end to end: data processing, business logic, REST APIs, interactive web interfaces, deployment and maintenance.",
    "exp.pawit.role": "Founder",
    "exp.pawit.h1": "My own software development brand. Web applications, including this site and the quiz game below.",
    "edu.but": "Bydgoszcz University of Technology",
    "edu.hmu": "Hellenic Mediterranean University, Heraklion",
    "edu.msc": "Master's degree, Electronics and Telecommunications",
    "edu.eng": "Engineer's degree, Electronics and Telecommunications",
    "edu.erasmus": "Erasmus+ exchange semester",

    // Skills Section
    "skills.title": "Skills & Technologies",
    "skills.languages": "Languages",
    "skills.backend": "Backend",
    "skills.frontend": "Frontend",
    "skills.data": "Data",
    "skills.databases": "Databases",
    "skills.devops": "DevOps",

    // GitHub activity
    "github.title": "Recent GitHub Activity",
    "github.lastCommit": "Last commit",
    "github.graph": "Contribution Graph",
    "github.graphAlt": "GitHub contribution chart",
    "github.error": "Could not load repositories",
    "github.empty": "No public repositories found.",

    // Projects Section
    "projects.title": "Side Projects",
    "projects.code": "Code",
    "projects.live": "Live demo",
    "projects.quizGame.title": "Quiz Game",
    "projects.quizGame.description":
      "A fast, responsive quiz game in the style of Who Wants to Be a Millionaire, built for a birthday party with friends.",
    "projects.quizGame.h1": "Game flow built as a small state machine: team split, questions, answer summary",
    "projects.quizGame.h2": "Three question types, including open questions with images and toast breaks",
    "projects.quizGame.h3": "Countdown timer on every question, with music cues",
    "projects.quizGame.h4": "Printable answer sheet for each team",

    // Contact Section
    "contact.title": "Let's Work Together",
    "contact.description":
      "I'm always interested in new opportunities and exciting projects. Whether you have a question or just want to say hi, feel free to reach out.",
    "contact.emailLabel": "Send an email",
    "contact.copy": "Copy",
    "contact.copied": "Copied",
    "contact.linkedin": "Connect on LinkedIn",
    "cv.download": "Download CV",

    // Footer (the year is added in code)
    "footer.copyright": "PawIT - Pawel Pokorski. Built with",
    "footer.and": "and",

    // 404
    "notFound.title": "This page doesn't exist",
    "notFound.description": "The link may be outdated or mistyped. Everything about me is on the home page.",
    "notFound.home": "Back to the home page",
  },
  pl: {
    "meta.location": "Bydgoszcz, Polska",

    // Navigation
    "nav.about": "O mnie",
    "nav.experience": "Doświadczenie",
    "nav.skills": "Umiejętności",
    "nav.projects": "Projekty",
    "nav.contact": "Kontakt",
    "nav.menu": "Menu",
    "nav.skip": "Przejdź do treści",

    // Hero Section
    "hero.name": "Paweł Pokorski",
    "hero.tagline": "Inżynier oprogramowania | Python | Full-stack | Dane i automatyzacja",
    "hero.description":
      "Inżynier oprogramowania w Nokii. Zamieniam surowe dane w narzędzia: parsery, aplikacje webowe i dashboardy, które automatyzują pracę.",
    "hero.getInTouch": "Skontaktuj się",
    "hero.viewWork": "Zobacz moje prace",
    "hero.openToWork": "Otwarty na nowe role",

    // Impact numbers
    "stats.years.value": "~6",
    "stats.years.label": "lat doświadczenia w tworzeniu oprogramowania",
    "stats.design.value": "-78%",
    "stats.design.label": "czasu projektowania sieci światłowodowych po automatyzacji w Nokii (z ~36 h do ~8 h)",
    "stats.degree.value": "mgr inż.",
    "stats.degree.label": "Elektronika i telekomunikacja, Politechnika Bydgoska",

    // About Section
    "about.title": "O mnie",
    "about.paragraph1":
      "Jestem inżynierem oprogramowania z prawie 6-letnim doświadczeniem w zamienianiu surowych danych w inteligentne narzędzia inżynierskie. Łączę analizę danych (Pandas, statystyka) z full-stack developmentem (FastAPI, React).",
    "about.paragraph2":
      "W Nokii tworzę parsery, aplikacje webowe i dashboardy, które automatyzują procesy i przyspieszają pracę inżynierów. Od 2023 roku prowadzę też PawIT, własną markę programistyczną.",
    "about.fullStack": "Aplikacje full-stack (FastAPI, React)",
    "about.data": "Przetwarzanie i analiza danych",
    "about.automation": "Automatyzacja procesów",
    "about.dashboards": "Dashboardy i wizualizacja danych",

    // Experience Section
    "experience.title": "Doświadczenie",
    "experience.education": "Wykształcenie",
    "experience.present": "obecnie",
    "exp.nokia.role": "Software Engineer / Full-stack Developer",
    "exp.nokia.h1":
      "Zautomatyzowałem projektowanie sieci światłowodowych aplikacją webową obejmującą konfigurację szaf i półek, generowanie dokumentacji oraz prowadzenie inżyniera krok po kroku. Nakład pracy spadł z ok. 36 do ok. 8 godzin (ok. 78% mniej).",
    "exp.nokia.h2":
      "Zbudowałem platformę planowania zasobów, która prognozuje zapotrzebowanie na inżynierów na podstawie bieżących i nadchodzących projektów oraz historycznych danych o obciążeniu, z interaktywnymi dashboardami do analizy popytu i trendów.",
    "exp.nokia.h3":
      "Stworzyłem narzędzia do automatyzacji obliczeń i walidacji technicznej, m.in. sprawdzania pojemności półek i poboru mocy, które zapobiegają przeciążonym instalacjom.",
    "exp.nokia.h4":
      "Opracowałem narzędzie oparte na ML, które na podstawie danych historycznych i tytułów projektów rekomenduje typ projektu dla nowych zleceń.",
    "exp.nokia.h5":
      "Dostarczam wewnętrzne oprogramowanie od początku do końca: przetwarzanie danych, logikę biznesową, REST API, interaktywne interfejsy webowe, wdrożenie i utrzymanie.",
    "exp.pawit.role": "Założyciel",
    "exp.pawit.h1": "Moja własna marka programistyczna. Aplikacje webowe, w tym ta strona i gra quizowa poniżej.",
    "edu.but": "Politechnika Bydgoska im. Jana i Jędrzeja Śniadeckich",
    "edu.hmu": "Hellenic Mediterranean University, Heraklion",
    "edu.msc": "Studia magisterskie, Elektronika i telekomunikacja",
    "edu.eng": "Studia inżynierskie, Elektronika i telekomunikacja",
    "edu.erasmus": "Semestr na wymianie Erasmus+",

    // Skills Section
    "skills.title": "Umiejętności i Technologie",
    "skills.languages": "Języki",
    "skills.backend": "Backend",
    "skills.frontend": "Frontend",
    "skills.data": "Dane",
    "skills.databases": "Bazy danych",
    "skills.devops": "DevOps",

    // GitHub activity
    "github.title": "Ostatnia aktywność na GitHubie",
    "github.lastCommit": "Ostatni commit",
    "github.graph": "Wykres kontrybucji",
    "github.graphAlt": "Wykres kontrybucji GitHub",
    "github.error": "Nie udało się wczytać repozytoriów",
    "github.empty": "Nie znaleziono publicznych repozytoriów.",

    // Projects Section
    "projects.title": "Projekty poboczne",
    "projects.code": "Kod",
    "projects.live": "Demo na żywo",
    "projects.quizGame.title": "Gra Quiz",
    "projects.quizGame.description":
      "Szybka, responsywna gra quizowa w stylu Milionerów, stworzona na urodzinową zabawę ze znajomymi.",
    "projects.quizGame.h1": "Przebieg gry jako prosta maszyna stanów: podział na drużyny, pytania, podsumowanie odpowiedzi",
    "projects.quizGame.h2": "Trzy typy pytań, w tym pytania otwarte z obrazkami i przerwy na toast",
    "projects.quizGame.h3": "Odliczanie czasu przy każdym pytaniu, z oprawą muzyczną",
    "projects.quizGame.h4": "Karta odpowiedzi do wydruku dla każdej drużyny",

    // Contact Section
    "contact.title": "Współpracujmy razem",
    "contact.description":
      "Zawsze jestem zainteresowany nowymi możliwościami i ciekawymi projektami. Masz pytanie albo po prostu chcesz się przywitać? Śmiało się odezwij.",
    "contact.emailLabel": "Wyślij e-mail",
    "contact.copy": "Kopiuj",
    "contact.copied": "Skopiowano",
    "contact.linkedin": "Połącz się na LinkedIn",
    "cv.download": "Pobierz CV",

    // Footer (rok jest dodawany w kodzie)
    "footer.copyright": "PawIT - Paweł Pokorski. Zbudowane z",
    "footer.and": "i",

    // 404
    "notFound.title": "Ta strona nie istnieje",
    "notFound.description": "Link może być nieaktualny albo zawierać literówkę. Wszystko o mnie znajdziesz na stronie głównej.",
    "notFound.home": "Wróć na stronę główną",
  },
}

// Also read by middleware.ts (as a cookie) to decide whether "/" should redirect to "/pl".
const STORAGE_KEY = "preferred-language"

// The portfolio has one URL per language; every other page (quiz, 404) follows the visitor.
function languageFromPath(pathname: string | null): Language | null {
  if (pathname === "/pl" || pathname?.startsWith("/pl/")) return "pl"
  if (pathname === "/") return "en"
  return null
}

function persistLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // storage can be unavailable (private mode, blocked cookies)
  }
  document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`
}

// Saved choice first, then the browser language. No network call, so nothing blocks rendering.
function detectLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "pl") return stored
  } catch {
    // storage can be unavailable (private mode, blocked cookies)
  }
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return browserLanguages.some((lang) => lang?.toLowerCase().startsWith("pl")) ? "pl" : "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const routeLanguage = languageFromPath(pathname)
  // "/" and "/pl" are prerendered in their own language, so there is no swap after load
  const [language, setLanguage] = useState<Language>(routeLanguage ?? "en")

  useEffect(() => {
    setLanguage(routeLanguage ?? detectLanguage())
  }, [routeLanguage])

  // keep <html lang> in sync so screen readers and hyphenation use the right language
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const handleSetLanguage = (lang: Language) => {
    persistLanguage(lang)
    setLanguage(lang)
    if (routeLanguage && routeLanguage !== lang) {
      // move to the other language's URL, keeping the section the visitor is on
      router.push(`${lang === "pl" ? "/pl" : "/"}${window.location.hash}`, { scroll: false })
    }
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
