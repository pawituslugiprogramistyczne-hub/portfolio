"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Github,
  Linkedin,
  Mail,
  ArrowUpRight,
  Menu,
  X,
  BarChart3,
  Database,
  Globe,
  Workflow,
  Download,
  FlaskConical,
  MapPin,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/contexts/language-context"
import { Logo } from "@/components/logo"
import { Wordmark } from "@/components/wordmark"
import { GitHubRepos } from "@/components/github-repos"
import { Reveal } from "@/components/reveal"
import { CopyEmailButton } from "@/components/copy-email-button"
import { profile, impactStats, skillGroups, projects, experience, education } from "@/lib/portfolio-data"

const hasExperience = experience.length > 0 || education.length > 0

const navItems = [
  { id: "about", key: "nav.about" },
  ...(hasExperience ? [{ id: "experience", key: "nav.experience" }] : []),
  { id: "skills", key: "nav.skills" },
  { id: "projects", key: "nav.projects" },
  { id: "contact", key: "nav.contact" },
]

// every section the nav highlight should react to (github-activity has no nav link of its own)
const sectionIds = [
  "top",
  "about",
  ...(hasExperience ? ["experience"] : []),
  "github-activity",
  "skills",
  "projects",
  "contact",
]

const aboutHighlights = [
  { key: "about.fullStack", icon: Globe },
  { key: "about.data", icon: Database },
  { key: "about.automation", icon: Workflow },
  { key: "about.dashboards", icon: BarChart3 },
]

// Shared class strings. Shape rule: buttons and chips are full pills, panels are rounded-2xl.
const container = "mx-auto w-full max-w-6xl px-5 sm:px-8"
const sectionPad = "py-24 md:py-32"
const h2Class = "text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl"
const bodyClass = "max-w-[65ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400"
const hairline = "border-slate-200 dark:border-white/10"
const btnBase =
  "h-12 rounded-full px-7 text-base transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:ring-brand focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
const btnPrimary = `${btnBase} bg-brand text-brand-foreground shadow-[0_10px_24px_-12px_hsl(var(--brand)/0.7)] hover:bg-brand/90`
const btnSecondary = `${btnBase} border border-slate-400/70 bg-transparent text-slate-900 hover:bg-slate-900/5 dark:border-white/25 dark:text-slate-50 dark:hover:bg-white/10`

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("top")

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return

    // a thin band across the middle of the viewport decides which section is "current"
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

/** "2023-04" -> "Apr 2023" / "kwi 2023" */
function formatMonth(value: string, language: string) {
  const [year, month] = value.split("-").map(Number)
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", { month: "short", year: "numeric" }).format(
    new Date(year, (month || 1) - 1),
  )
}

export function Portfolio() {
  const { t, language } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useActiveSection(sectionIds)

  const dateRange = (start: string, end?: string) =>
    `${formatMonth(start, language)} - ${end ? formatMonth(end, language) : t("experience.present")}`

  const navLinkClass = (id: string) =>
    `relative rounded-sm py-1 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      active === id
        ? "text-slate-900 dark:text-white"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
    }`

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-brand-foreground"
      >
        {t("nav.skip")}
      </a>

      {/* Navigation */}
      <header className={`fixed top-0 z-50 w-full border-b bg-slate-50/80 backdrop-blur-md dark:bg-slate-950/80 ${hairline}`}>
        <nav className={`${container} flex h-16 items-center justify-between`} aria-label="Main">
          {/* accessible name comes from the Logo's sr-only "PawIT", matching the visible wordmark */}
          <a href="#top" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <Logo />
          </a>

          <div className="flex items-center gap-1">
            <ul className="mr-4 hidden items-center gap-7 md:flex">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "true" : undefined}
                    className={navLinkClass(item.id)}
                  >
                    {t(item.key)}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 h-px bg-brand transition-opacity duration-200 ${
                        active === item.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </a>
                </li>
              ))}
            </ul>
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                download
                aria-label={t("cv.download")}
                className="mr-2 hidden h-9 items-center gap-1.5 rounded-full border border-slate-300 px-3.5 text-sm font-medium text-slate-900 transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-white/20 dark:text-slate-100 md:inline-flex"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                CV
              </a>
            )}
            <ThemeToggle />
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full px-0 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-[1.1rem] w-[1.1rem]" /> : <Menu className="h-[1.1rem] w-[1.1rem]" />}
              <span className="sr-only">{t("nav.menu")}</span>
            </Button>
          </div>
        </nav>

        {menuOpen && (
          <div id="mobile-menu" className={`border-t md:hidden ${hairline}`}>
            <ul className={`${container} flex flex-col py-2`}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active === item.id ? "true" : undefined}
                    className={`block py-3 text-lg ${
                      active === item.id ? "text-brand" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t(item.key)}
                  </a>
                </li>
              ))}
              {profile.cvUrl && (
                <li className={`mt-2 border-t pt-2 ${hairline}`}>
                  <a href={profile.cvUrl} download className="flex items-center gap-2 py-3 text-lg text-brand">
                    <Download className="h-5 w-5" aria-hidden="true" />
                    {t("cv.download")}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </header>

      <main id="main">
        {/* Hero Section */}
        <section id="top" className="pb-8 pt-24 md:pb-12">
          <div className={`${container} grid items-center gap-12 lg:grid-cols-12 lg:gap-16`}>
            <div className="lg:col-span-7">
              <div className="flex animate-fade-up flex-wrap items-center gap-x-4 gap-y-3 motion-reduce:animate-none">
                <p className="font-mono text-sm text-brand">{t("hero.tagline")}</p>
                {profile.openToWork && (
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-800 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    {t("hero.openToWork")}
                  </p>
                )}
              </div>
              <h1 className="mt-5 animate-fade-up text-5xl font-semibold leading-[1.02] tracking-tighter text-slate-900 [animation-delay:80ms] motion-reduce:animate-none dark:text-slate-50 sm:text-6xl lg:text-7xl">
                {t("hero.name")}
              </h1>
              <p className="mt-6 max-w-[52ch] animate-fade-up text-lg leading-relaxed text-slate-600 [animation-delay:160ms] motion-reduce:animate-none dark:text-slate-400 md:text-xl">
                {t("hero.description")}
              </p>
              <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] motion-reduce:animate-none sm:flex-row">
                <Button asChild size="lg" className={btnPrimary}>
                  <a href={`mailto:${profile.email}`}>
                    <Mail />
                    {t("hero.getInTouch")}
                  </a>
                </Button>
                {/* recruiters look for the CV first, so it takes the second slot once it exists */}
                {profile.cvUrl ? (
                  <Button asChild variant="outline" size="lg" className={btnSecondary}>
                    <a href={profile.cvUrl} download>
                      <Download />
                      {t("cv.download")}
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="lg" className={btnSecondary}>
                    <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                      <Github />
                      {t("hero.viewWork")}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:200ms] motion-reduce:animate-none lg:col-span-5">
              {profile.photo ? (
                <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-2xl shadow-[0_32px_64px_-32px_hsl(var(--brand)/0.5)] ring-1 ring-slate-900/10 dark:ring-white/10 lg:mr-0">
                  <Image
                    src={profile.photo}
                    alt={profile.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 384px, 80vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                // the brand is named in the nav, so the large wordmark here is decorative
                <div
                  className={`relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-[0_32px_64px_-32px_hsl(var(--brand)/0.45)] dark:bg-white/[0.03] ${hairline}`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(70%_60%_at_78%_18%,hsl(var(--brand)/0.16),transparent_70%)]"
                  />
                  <Wordmark className="relative text-5xl sm:text-6xl xl:text-7xl" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Impact numbers: every figure comes from the CV */}
        <section aria-label={t("about.title")} className="pt-8 md:pt-12">
          <div className={container}>
            <Reveal>
              <dl className={`grid gap-y-8 border-y py-10 md:grid-cols-3 md:gap-x-12 ${hairline}`}>
                {impactStats.map((stat) => (
                  // dt stays first for screen readers; order puts the number on top and keeps numbers aligned
                  <div key={stat.valueKey} className="flex flex-col gap-2">
                    <dt className="order-2 max-w-[34ch] leading-relaxed text-slate-600 dark:text-slate-400">{t(stat.labelKey)}</dt>
                    <dd className="order-1 text-4xl font-semibold tabular-nums tracking-tighter text-slate-900 dark:text-slate-50 md:text-5xl">
                      {t(stat.valueKey)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={sectionPad}>
          <div className={container}>
            <Reveal>
              <h2 className={h2Class}>{t("about.title")}</h2>
            </Reveal>
            <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="space-y-6 lg:col-span-7">
                <p className={bodyClass}>{t("about.paragraph1")}</p>
                <p className={bodyClass}>{t("about.paragraph2")}</p>
              </Reveal>
              <Reveal delay={120} className="lg:col-span-5">
                <ul className={`divide-y border-t ${hairline} divide-slate-200 dark:divide-white/10`}>
                  {aboutHighlights.map(({ key, icon: Icon }) => (
                    <li key={key} className="flex items-center gap-4 py-5 text-lg text-slate-900 dark:text-slate-100">
                      <Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Experience Section (hidden until lib/portfolio-data.ts has entries) */}
        {hasExperience && (
          <section id="experience" className={`${sectionPad} border-t ${hairline}`}>
            <div className={container}>
              <Reveal>
                <h2 className={h2Class}>{t("experience.title")}</h2>
              </Reveal>

              {experience.length > 0 && (
                <ol className={`mt-12 max-w-3xl border-l ${hairline}`}>
                  {experience.map((job, index) => (
                    <li key={`${job.company}-${job.start}`} className="pb-12 pl-8 last:pb-0">
                      <Reveal delay={index * 80}>
                        <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {dateRange(job.start, job.end)}
                          {job.locationKey ? ` | ${t(job.locationKey)}` : ""}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                          {t(job.roleKey)}
                        </h3>
                        <p className="mt-1 text-lg text-brand">{job.company}</p>
                        {job.highlightKeys.length > 0 && (
                          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600 marker:text-brand dark:text-slate-400">
                            {job.highlightKeys.map((key) => (
                              <li key={key} className="max-w-[65ch] leading-relaxed">
                                {t(key)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </Reveal>
                    </li>
                  ))}
                </ol>
              )}

              {education.length > 0 && (
                <Reveal className="mt-20 max-w-3xl">
                  <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-slate-50">
                    {t("experience.education")}
                  </h3>
                  <ul className={`mt-6 divide-y border-t ${hairline} divide-slate-200 dark:divide-white/10`}>
                    {education.map((entry) => (
                      <li
                        key={`${entry.schoolKey}-${entry.start}`}
                        className="grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
                      >
                        <div>
                          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">{t(entry.schoolKey)}</p>
                          <p className="text-slate-600 dark:text-slate-400">{t(entry.degreeKey)}</p>
                        </div>
                        <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {dateRange(entry.start, entry.end)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </section>
        )}

        <GitHubRepos />

        {/* Skills Section */}
        <section id="skills" className={`${sectionPad} bg-slate-100/70 dark:bg-white/[0.03]`}>
          <div className={container}>
            <Reveal>
              <h2 className={h2Class}>{t("skills.title")}</h2>
            </Reveal>
            <dl className={`mt-12 border-t ${hairline}`}>
              {skillGroups.map((group, index) => (
                <Reveal
                  key={group.labelKey}
                  delay={index * 90}
                  className={`grid gap-3 border-b py-6 md:grid-cols-12 md:gap-8 ${hairline}`}
                >
                  <dt className="font-mono text-sm text-slate-600 dark:text-slate-400 md:col-span-3 md:pt-2">
                    {t(group.labelKey)}
                  </dt>
                  <dd className="flex flex-wrap gap-x-8 gap-y-1 text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-50 md:col-span-9 md:text-3xl">
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className={sectionPad}>
          <div className={container}>
            <Reveal>
              <h2 className={h2Class}>{t("projects.title")}</h2>
            </Reveal>
            <div className="mt-12 space-y-6">
              {projects.map((project) => (
                <Reveal
                  key={project.titleKey}
                  className={`grid gap-10 rounded-2xl border bg-white p-8 transition-colors duration-200 hover:border-brand/50 dark:bg-white/[0.03] md:p-10 lg:grid-cols-12 ${hairline}`}
                >
                  <div className={project.image ? "lg:col-span-7" : "lg:col-span-12"}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
                        {t(project.titleKey)}
                      </h3>
                      {project.demo && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("projects.demo")}
                        </span>
                      )}
                    </div>
                    <p className={`mt-4 ${bodyClass}`}>{t(project.descriptionKey)}</p>
                    {project.highlightKeys.length > 0 && (
                      <ul className="mt-6 grid gap-x-10 gap-y-3 text-slate-700 dark:text-slate-300 md:grid-cols-2">
                        {project.highlightKeys.map((key) => (
                          <li key={key} className="flex gap-3 leading-relaxed">
                            <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-brand" />
                            {t(key)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <ul className="mt-8 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-full border border-slate-300 px-3 py-1 font-mono text-xs text-slate-700 dark:border-white/15 dark:text-slate-300"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      {project.live && (
                        <Button asChild size="lg" className={btnPrimary}>
                          <Link href={project.live}>
                            {t("projects.live")}
                            <ArrowUpRight />
                          </Link>
                        </Button>
                      )}
                      {project.github && (
                        <Button asChild variant="outline" size="lg" className={btnSecondary}>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github />
                            {t("projects.code")}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  {project.image && (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-slate-900/10 dark:ring-white/10 lg:col-span-5">
                      <Image
                        src={project.image}
                        alt={t(project.titleKey)}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`${sectionPad} border-t ${hairline}`}>
          <div className={container}>
            <Reveal>
              <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 dark:text-slate-50 md:text-6xl">
                {t("contact.title")}
              </h2>
              <p className={`mt-6 ${bodyClass}`}>{t("contact.description")}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
                {t("meta.location")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="rounded-sm text-[clamp(0.95rem,4.4vw,1.5rem)] font-medium tracking-tight text-brand underline decoration-brand/30 underline-offset-8 transition-colors [overflow-wrap:anywhere] hover:decoration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:text-2xl md:text-3xl lg:text-4xl"
                >
                  {profile.email}
                </a>
                <CopyEmailButton email={profile.email} />
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" size="lg" className={btnSecondary}>
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin />
                    {t("contact.linkedin")}
                  </a>
                </Button>
                {profile.cvUrl && (
                  <Button asChild variant="outline" size="lg" className={btnSecondary}>
                    <a href={profile.cvUrl} download>
                      <Download />
                      {t("cv.download")}
                    </a>
                  </Button>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${hairline}`}>
        <div className={`${container} flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between`}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {/* the static HTML carries the build year; the client corrects it after a new year */}
            <span suppressHydrationWarning>© {new Date().getFullYear()}</span> {t("footer.copyright")}{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">Next.js</span> {t("footer.and")}{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">Tailwind CSS</span>.
          </p>
          <div className="flex items-center gap-1">
            {[
              { href: profile.links.github, label: "GitHub", icon: Github, external: true },
              { href: profile.links.linkedin, label: "LinkedIn", icon: Linkedin, external: true },
              { href: `mailto:${profile.email}`, label: t("contact.emailLabel"), icon: Mail, external: false },
            ].map(({ href, label, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
