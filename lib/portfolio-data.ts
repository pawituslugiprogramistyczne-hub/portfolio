// Single source of truth for the portfolio at "/".
// Visible text lives in contexts/language-context.tsx (EN + PL); entries here
// reference translation keys. Names, dates, URLs and tech names are not translated.
// Content source: LinkedIn profile export + CV (PAWEL POKORSKI.pdf).

export const profile = {
  name: "Pawel Pokorski",
  jobTitle: "Software Engineer",
  city: "Bydgoszcz",
  country: "PL",
  email: "pawit.uslugiprogramistyczne@gmail.com",
  /** Canonical address. Set NEXT_PUBLIC_SITE_URL in Vercel once a custom domain is live. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio-red-nine-r65phxfzmr.vercel.app").replace(/\/$/, ""),
  githubUser: "pawituslugiprogramistyczne-hub",
  links: {
    github: "https://github.com/pawituslugiprogramistyczne-hub",
    linkedin: "https://www.linkedin.com/in/pawe%C5%82-pokorski-208259218/",
    linkedinCompany: "https://www.linkedin.com/company/pawitsoftwaredevelopment/",
  },
  /** Shows an "open to new roles" note in the hero. Only turn on while it is true. */
  openToWork: false,
  /** CV in /public. Download buttons appear when set. */
  cvUrl: "/cv-pawel-pokorski.pdf" as string | undefined,
  /** Portrait in /public (4:5). Replaces the wordmark panel in the hero. */
  photo: "/portrait.webp" as string | undefined,
  /** GitHub contribution chart. Off while there is little public activity to show. */
  showContributionGraph: false,
}

/** Headline numbers under the hero. Every figure must come from the CV or LinkedIn. */
export const impactStats = [
  { valueKey: "stats.years.value", labelKey: "stats.years.label" },
  { valueKey: "stats.design.value", labelKey: "stats.design.label" },
  { valueKey: "stats.degree.value", labelKey: "stats.degree.label" },
]

export interface SkillGroup {
  labelKey: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  { labelKey: "skills.languages", items: ["Python", "SQL", "JavaScript", "TypeScript"] },
  { labelKey: "skills.backend", items: ["FastAPI", "Flask", "REST APIs"] },
  { labelKey: "skills.frontend", items: ["React", "Next.js", "HTML", "CSS", "Tailwind CSS"] },
  { labelKey: "skills.data", items: ["Pandas", "NumPy", "ETL"] },
  { labelKey: "skills.databases", items: ["PostgreSQL", "MySQL", "MariaDB", "Redis"] },
  { labelKey: "skills.devops", items: ["Docker", "Git", "GitLab", "Linux", "CI/CD"] },
]

export interface Project {
  titleKey: string
  descriptionKey: string
  tech: string[]
  /** short "what I built" bullets, shown under the description */
  highlightKeys: string[]
  github?: string
  live?: string
  /** preview image in /public, e.g. "/quiz-game-preview.webp" (16:10 works best) */
  image?: string
}

export const projects: Project[] = [
  {
    titleKey: "projects.quizGame.title",
    descriptionKey: "projects.quizGame.description",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    highlightKeys: [
      "projects.quizGame.h1",
      "projects.quizGame.h2",
      "projects.quizGame.h3",
      "projects.quizGame.h4",
    ],
    github: "https://github.com/pawituslugiprogramistyczne-hub/quiz-game",
    live: "/quiz-game",
    image: "/quiz-game-preview.webp",
  },
]

export interface ExperienceEntry {
  company: string
  roleKey: string
  /** "YYYY-MM" */
  start: string
  /** "YYYY-MM"; leave out for a current role */
  end?: string
  locationKey?: string
  highlightKeys: string[]
}

export const experience: ExperienceEntry[] = [
  {
    company: "Nokia",
    roleKey: "exp.nokia.role",
    start: "2021-01",
    locationKey: "meta.location",
    highlightKeys: ["exp.nokia.h1", "exp.nokia.h2", "exp.nokia.h3", "exp.nokia.h4", "exp.nokia.h5"],
  },
  {
    company: "PawIT",
    roleKey: "exp.pawit.role",
    start: "2023-11",
    locationKey: "meta.location",
    highlightKeys: ["exp.pawit.h1"],
  },
]

export interface EducationEntry {
  schoolKey: string
  degreeKey: string
  start: string
  end?: string
}

// Master's dates follow the CV (LinkedIn says 2022-09 for the start).
export const education: EducationEntry[] = [
  { schoolKey: "edu.but", degreeKey: "edu.msc", start: "2021-10", end: "2024-02" },
  { schoolKey: "edu.but", degreeKey: "edu.eng", start: "2017-10", end: "2021-02" },
  { schoolKey: "edu.hmu", degreeKey: "edu.erasmus", start: "2019-02", end: "2019-08" },
]
