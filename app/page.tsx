"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Github, Linkedin, Mail, ExternalLink, Code, Database, Globe, Smartphone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/contexts/language-context"
import { Logo } from "@/components/logo"

export default function Portfolio() {
  const { t } = useLanguage()

  const skills = [
    { name: "JavaScript", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    { name: "TypeScript", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { name: "Python", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    { name: "React", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
    { name: "Next.js", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    { name: "Node.js", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
    { name: "Docker", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { name: "Git", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  ]

  const projects = [
    {
      titleKey: "projects.tbd.title",
      descriptionKey: "projects.tbd.description",
      tech: "projets.tbd.tech",
      github: "#",
      live: "#",
      gradient: "from-blue-500 to-green-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-purple-200 dark:border-purple-700 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a
                href="#about"
                className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t("nav.about")}
              </a>
              <a
                href="#skills"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("nav.skills")}
              </a>
              <a
                href="#projects"
                className="text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                {t("nav.projects")}
              </a>
              <a
                href="#contact"
                className="text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {t("nav.contact")}
              </a>
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl">
              <Code className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              {t("hero.name")}
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8">{t("hero.tagline")}</p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                onClick={() => window.location.href = 'mailto:pawit.uslugiprogramistyczne@gmail.com'}
              >
                <Mail className="w-4 h-4 mr-2" />
                {t("hero.getInTouch")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950 bg-transparent"
                onClick={() => window.open('https://github.com/pawituslugiprogramistyczne-hub', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                {t("hero.viewWork")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-12">
            {t("about.title")}
          </h2>
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700 shadow-xl">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{t("about.paragraph1")}</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{t("about.paragraph2")}</p>
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950 bg-transparent"
                      onClick={() => window.open('https://github.com/pawituslugiprogramistyczne-hub', '_blank')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-300 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-400 dark:hover:bg-cyan-950 bg-transparent"
                      onClick={() => window.open('https://www.linkedin.com/company/pawitsoftwaredevelopment/', '_blank')}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">{t("about.fullStack")}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <Database className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">{t("about.database")}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                    <span className="text-slate-700 dark:text-slate-300">{t("about.responsive")}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                    <Code className="w-5 h-5 text-orange-500" />
                    <span className="text-slate-700 dark:text-slate-300">{t("about.cleanCode")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-100/50 via-blue-100/50 to-cyan-100/50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-12">
            {t("skills.title")}
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                className={`px-4 py-2 text-sm font-medium transition-all hover:scale-105 cursor-default shadow-md ${skill.color}`}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent mb-12">
            {t("projects.title")}
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-8 w-full max-w-[calc(100%-2rem)] md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
              {projects.map((project, index) => (
                <Card
                  key={index}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden w-full max-w-md mx-auto"
                >
                  <div className={`h-2 bg-gradient-to-r ${project.gradient}`}></div>
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">{t(project.titleKey)}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {t(project.descriptionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {
                        <Badge
                          key={0}
                          variant="outline"
                          className="text-xs border-slate-300 dark:border-slate-600"
                        >
                          {t(project.tech)}
                        </Badge>
}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950 bg-transparent"
                        disabled
                      >
                        <Github className="w-4 h-4 mr-2" />
                        {t("projects.code")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950 bg-transparent"
                        disabled
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t("projects.live")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100/50 via-emerald-100/50 to-teal-100/50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-8">
            {t("contact.title")}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            {t("contact.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg"
              onClick={() => window.location.href = 'mailto:pawit.uslugiprogramistyczne@gmail.com'}
            >
              <Mail className="w-4 h-4 mr-2" />
              {t("contact.email")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-teal-300 text-teal-600 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-400 dark:hover:bg-teal-950 bg-transparent"
              onClick={() => window.open('https://www.linkedin.com/company/pawitsoftwaredevelopment/')}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              {t("contact.linkedin")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-purple-200 dark:border-purple-700 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <Separator className="mb-8 bg-gradient-to-r from-purple-300 to-blue-300 dark:from-purple-600 dark:to-blue-600" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4 md:mb-0">
              {t("footer.copyright")} <span className="text-blue-600 dark:text-blue-400">Next.js</span>{" "}
              {t("footer.and")} <span className="text-cyan-600 dark:text-cyan-400">Tailwind CSS</span>.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950"
                onClick={() => window.open('https://github.com/pawituslugiprogramistyczne-hub', '_blank')}
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                  onClick={() => window.open('https://www.linkedin.com/company/pawitsoftwaredevelopment/', '_blank')}
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                onClick={() => window.location.href = 'mailto:pawit.uslugiprogramistyczne@gmail.com'}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
