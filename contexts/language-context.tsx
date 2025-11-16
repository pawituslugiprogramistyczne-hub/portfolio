"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "en" | "pl"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Quiz game project
    "projects.quizGame.title": "Quiz Game",
    "projects.quizGame.description": "A fast, responsive quiz game built with React and TypeScript. The game was created primarily for a birthday party fun with friends.",
    "projects.quizGame.tech": "React · TypeScript · Tailwind CSS",

    // Navigation
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.contact": "Contact",

    // Hero Section
    "hero.name": "Pawel Pokorski",
    "hero.tagline": "Web Developer | Python and AI Enthusiast",
    "hero.description":
      "Passionate about creating elegant solutions to complex problems. I build scalable web applications and love exploring new technologies.",
    "hero.getInTouch": "Get In Touch",
    "hero.viewWork": "View My Work",

    // About Section
    "about.title": "About Me",
    "about.paragraph1":
      "I'm a passionate web developer with almost 5 years of experience creating digital solutions that make a difference. My journey started with Python, and I've since expanded into full-stack development with modern frameworks.",
    "about.paragraph2":
      "I believe in writing clean, maintainable code and creating user experiences that are both beautiful and functional. When I'm not coding, you'll find me exploring new technologies or contributing to open-source projects.",
    "about.fullStack": "Full-Stack Development",
    "about.database": "Database Design",
    "about.responsive": "Responsive Design",
    "about.cleanCode": "Clean Code Practices",

    // Skills Section
    "skills.title": "Skills & Technologies",

    // Projects Section
    "projects.title": "Featured Projects",
    "projects.tbd.title": "Project Coming Soon",
    "projects.tbd.description":
      "An exciting new project is on the way! Stay tuned for more details.",
    "projects.tbd.tech":
      "None yet",

    "projects.code": "Code",
    "projects.live": "Live",

    // Contact Section
    "contact.title": "Let's Work Together",
    "contact.description":
      "I'm always interested in new opportunities and exciting projects. Whether you have a question or just want to say hi, feel free to reach out!",
    "contact.email": "pawit.uslugiprogramistyczne@gmail.com",
    "contact.linkedin": "Connect on LinkedIn",

    // Footer
    "footer.copyright": "© 2025 PawIT - Pawel Pokorski. Built with",
    "footer.and": "and",
  },
  pl: {
    // Quiz game project
    "projects.quizGame.title": "Gra Quiz",
    "projects.quizGame.description": "Szybka, responsywna gra quizowa zbudowana w React i TypeScript. Gra stworzona typowo pod urodzinowa zabawe z znajomymi.",
    "projects.quizGame.tech": "React · TypeScript · Tailwind CSS",

    // Navigation
    "nav.about": "O mnie",
    "nav.skills": "Umiejętności",
    "nav.projects": "Projekty",
    "nav.contact": "Kontakt",

    // Hero Section
    "hero.name": "Pawel Pokorski",
    "hero.tagline": "Programista Aplikacji Webowych | Entuzjasta Python oraz AI",
    "hero.description":
      "Pasjonuję się tworzeniem eleganckich rozwiązań złożonych problemów. Buduję skalowalne aplikacje webowe i uwielbiam odkrywać nowe technologie.",
    "hero.getInTouch": "Skontaktuj się",
    "hero.viewWork": "Zobacz moje prace",

    // About Section
    "about.title": "O mnie",
    "about.paragraph1":
      "Jestem pasjonatem programowania z prawie 5-letnim doświadczeniem w tworzeniu rozwiązań cyfrowych, które mają znaczenie. Moja podróż rozpoczęła się od Pythona, a od tego czasu rozszerzyłem się na full-stack development z nowoczesnymi frameworkami.",
    "about.paragraph2":
      "Wierzę w pisanie czystego, łatwego w utrzymaniu kodu i tworzenie doświadczeń użytkownika, które są zarówno piękne, jak i funkcjonalne. Kiedy nie programuję, odkrywam nowe technologie lub przyczyniamy się do projektów open-source.",
    "about.fullStack": "Programowanie Full-Stack",
    "about.database": "Projektowanie Baz Danych",
    "about.responsive": "Responsive Design",
    "about.cleanCode": "Praktyki Czystego Kodu",

    // Skills Section
    "skills.title": "Umiejętności i Technologie",

    // Projects Section
    "projects.title": "Wybrane Projekty",
    "projects.tbd.title": "Projekt wkrótce",
    "projects.tbd.description":
      "Ekscytujący nowy projekt jest w drodze! Bądź na bieżąco z dalszymi szczegółami.",
    "projects.tbd.tech":
      "Jeszcze brak",
    "projects.code": "Kod",
    "projects.live": "Demo",

    // Contact Section
    "contact.title": "Współpracujmy razem",
    "contact.description":
      "Zawsze jestem zainteresowany nowymi możliwościami i ekscytującymi projektami. Czy masz pytanie, czy po prostu chcesz się przywitać, śmiało się odezwij!",
    "contact.email": "pawit.uslugiprogramistyczne@gmail.com",
    "contact.linkedin": "Połącz się na LinkedIn",

    // Footer
    "footer.copyright": "© 2025 PawIT - Paweł Pokorski. Zbudowane z",
    "footer.and": "i",
  },
}

// Function to detect user's country (simplified version)
const detectUserCountry = async (): Promise<string> => {
  try {
    // In a real application, you might use a geolocation API
    // For demo purposes, we'll use a simple IP-based detection
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    return data.country_code || "US"
  } catch (error) {
    // Fallback to browser language detection
    const browserLang = navigator.language || navigator.languages?.[0] || "en"
    return browserLang.startsWith("pl") ? "PL" : "US"
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeLanguage = async () => {
      // Check if language is stored in localStorage
      const storedLanguage = localStorage.getItem("preferred-language") as Language

      if (storedLanguage) {
        setLanguage(storedLanguage)
      } else {
        // Detect user's country and set default language
        try {
          const country = await detectUserCountry()
          const defaultLanguage = country === "PL" ? "pl" : "en"
          setLanguage(defaultLanguage)
          localStorage.setItem("preferred-language", defaultLanguage)
        } catch (error) {
          // Fallback to English
          setLanguage("en")
          localStorage.setItem("preferred-language", "en")
        }
      }
      setIsInitialized(true)
    }

    initializeLanguage()
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("preferred-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950" />
    )
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
