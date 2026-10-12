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
    "projects.gpw.title": "GPW Explorer",
    "projects.gpw.description":
      "Interactive explorer for Warsaw Stock Exchange stocks: search, five years of prices, technical signals, company news and a market overview.",
    "projects.gpw.h1": "Search across Warsaw-listed stocks and ETFs through a cached server-side API",
    "projects.gpw.h2": "Price chart with SMA 50/200, volume and a keyboard-accessible crosshair",
    "projects.gpw.h3": "Rule-based technical signals, total return vs WIG20TR, dividends and the latest company news",
    "projects.gpw.h4": "Market overview: daily movers, sector performance and official ESPI announcements",

    // GPW Explorer (/gpw)
    "gpw.back": "Portfolio",
    "gpw.eyebrow": "Side project | Warsaw Stock Exchange",
    "gpw.title": "GPW Explorer",
    "gpw.intro":
      "Search Warsaw Stock Exchange companies and ETFs and see price, trend and risk at a glance: five years of daily data, compared with the WIG20.",
    "gpw.search.label": "Search company or ticker",
    "gpw.search.placeholder": "Search: Orlen, KGHM, CDR...",
    "gpw.search.loading": "Searching...",
    "gpw.search.noResults": "No Warsaw-listed stocks or ETFs match.",
    "gpw.search.error": "Search is unavailable right now.",
    "gpw.popular": "Popular:",
    "gpw.range": "Time range",
    "gpw.ytd": "YTD",
    "gpw.stats.lastClose": "Latest price",
    "gpw.dataThrough": "Prices through",
    "gpw.stats.vsPrevious": "vs previous session",
    "gpw.stats.totalReturn": "Total return",
    "gpw.stats.vsBenchmark": "vs WIG20TR",
    "gpw.stats.volatility": "Volatility",
    "gpw.stats.volatilityNote": "annualized, from daily returns",
    "gpw.stats.maxDrawdown": "Max drawdown",
    "gpw.stats.rangeLowHigh": "Range low - high:",
    "gpw.price.title": "Price",
    "gpw.price.subtitle": "Daily close with moving averages, trading volume below",
    "gpw.compare.title": "Compared with WIG20TR",
    "gpw.compare.subtitle":
      "Total return with dividends reinvested, both indexed to 100 at the start of the range. WIG20TR is tracked through the Beta ETF WIG20TR.",
    "gpw.compare.loading": "Loading benchmark...",
    "gpw.compare.unavailable": "Benchmark data is unavailable right now.",
    "gpw.series.close": "Close",
    "gpw.series.volume": "Volume",
    "gpw.series.benchmark": "WIG20TR",
    "gpw.chartHint": "Use the left and right arrow keys to move between sessions.",
    "gpw.table.show": "Show data table",
    "gpw.table.date": "Date",
    "gpw.table.change": "Change",
    "gpw.error.notFound": "no price history for this symbol.",
    "gpw.error.rateLimited": "the data provider is limiting requests. Try again in a minute.",
    "gpw.error.generic": "could not load data. Try again later.",
    "gpw.error.retry": "Try again",
    "gpw.footnote":
      "Data: Yahoo Finance (unofficial public endpoint), may be delayed, cached for up to an hour. Prices in PLN; returns use dividend-adjusted closes. Index history is not available from this source, so WIG20 is represented by the Beta ETF WIG20TR (includes the fund's fees). For information only, not investment advice.",

    // GPW Explorer: tabs, signals, news, peers, dividends, market overview
    "gpw.tabs.label": "GPW Explorer views",
    "gpw.tabs.company": "Company",
    "gpw.tabs.market": "Market overview",
    "gpw.watchlist.title": "Watchlist",
    "gpw.watchlist.save": "Watch",
    "gpw.watchlist.saved": "Watching",
    "gpw.watchlist.add": "Add {name} to watchlist",
    "gpw.watchlist.remove": "Remove {name} from watchlist",
    "gpw.signals.title": "Technical signals",
    "gpw.signals.subtitle": "Five rule-based readings of the price history. Each rule is shown under its result.",
    "gpw.signals.summary": "{bullish} bullish, {neutral} neutral, {bearish} bearish",
    "gpw.signals.disclaimer": "These signals describe past prices with fixed rules. They are not investment recommendations within the meaning of MAR and do not account for fundamentals, news or your situation.",
    "gpw.tone.bullish": "Bullish",
    "gpw.tone.neutral": "Neutral",
    "gpw.tone.bearish": "Bearish",
    "gpw.signal.trend.name": "Long-term trend",
    "gpw.signal.trend.above": "price is {pct}% above its 200-session average.",
    "gpw.signal.trend.below": "price is {pct}% below its 200-session average.",
    "gpw.signal.trend.at": "price is at its 200-session average (within 1%).",
    "gpw.signal.trend.rule": "Rule: above the 200-session moving average by more than 1% is bullish, below by more than 1% is bearish.",
    "gpw.signal.cross.name": "50/200 crossover",
    "gpw.signal.cross.golden": "the 50-session average has been above the 200-session one since {date} (golden cross).",
    "gpw.signal.cross.death": "the 50-session average has been below the 200-session one since {date} (death cross).",
    "gpw.signal.cross.rule": "Rule: 50-session average above the 200-session average is bullish, below is bearish.",
    "gpw.signal.rsi.name": "Momentum (RSI 14)",
    "gpw.signal.rsi.overbought": "RSI is {value}, above 70: the recent rise looks stretched.",
    "gpw.signal.rsi.oversold": "RSI is {value}, below 30: the recent fall looks stretched.",
    "gpw.signal.rsi.normal": "RSI is {value}, between 30 and 70: no extreme.",
    "gpw.signal.rsi.rule": "Rule: 14-session RSI (Wilder). Below 30 reads as oversold (bullish), above 70 as overbought (bearish).",
    "gpw.signal.relative.name": "Relative strength",
    "gpw.signal.relative.beat": "beat WIG20TR by {pp} p.p. over the last 3 months.",
    "gpw.signal.relative.lagged": "lagged WIG20TR by {pp} p.p. over the last 3 months.",
    "gpw.signal.relative.inline": "moved in line with WIG20TR over the last 3 months (within 2 p.p.).",
    "gpw.signal.relative.rule": "Rule: 3-month total return vs WIG20TR. More than 2 p.p. ahead is bullish, more than 2 p.p. behind is bearish.",
    "gpw.signal.high52.name": "52-week high",
    "gpw.signal.high52.near": "{pct}% below the 52-week high of {high}.",
    "gpw.signal.high52.mid": "{pct}% below the 52-week high of {high}.",
    "gpw.signal.high52.far": "{pct}% below the 52-week high of {high}.",
    "gpw.signal.high52.rule": "Rule: within 5% of the 52-week high is bullish, 20% or more below it is bearish.",
    "gpw.news.title": "Latest news",
    "gpw.news.subtitle": "Recent headlines from the Polish press naming the company, via Google News.",
    "gpw.news.error": "News is unavailable right now.",
    "gpw.news.empty": "No headlines about this company in the last 30 days.",
    "gpw.peers.title": "Similar companies",
    "gpw.peers.subtitle": "Same sector ({sector}), best year-to-date first.",
    "gpw.table.company": "Company",
    "gpw.table.today": "Today",
    "gpw.table.price": "Price",
    "gpw.dividends.title": "Dividends",
    "gpw.dividends.none": "No dividends paid in the last five years.",
    "gpw.dividends.ttm": "trailing 12-month dividend yield",
    "gpw.dividends.exDate": "Ex-dividend date",
    "gpw.dividends.perShare": "Per share ({currency})",
    "gpw.market.gainers": "Top gainers today",
    "gpw.market.losers": "Top losers today",
    "gpw.market.sectors": "Sectors",
    "gpw.market.sectorsSubtitle": "Average change of the companies in each sector. Select a sector to filter the table.",
    "gpw.market.metric": "Period",
    "gpw.market.sectorTooltip": "{sector}: average of {count} companies",
    "gpw.market.all": "All companies",
    "gpw.market.clearSector": "Show all sectors",
    "gpw.market.announcements": "Company announcements",
    "gpw.market.announcementsSubtitle": "Latest official current reports (ESPI/EBI) across the market, via Bankier.pl.",
    "gpw.market.error": "Could not load market data. Try again later.",
    "gpw.error.rateLimitedFull": "The data provider is limiting requests. Try again in a minute.",
    "gpw.sector.Financial Services": "Financial Services",
    "gpw.sector.Energy": "Energy",
    "gpw.sector.Basic Materials": "Basic Materials",
    "gpw.sector.Communication Services": "Communication Services",
    "gpw.sector.Consumer Cyclical": "Consumer Cyclical",
    "gpw.sector.Consumer Defensive": "Consumer Defensive",
    "gpw.sector.Utilities": "Utilities",
    "gpw.sector.Industrials": "Industrials",
    "gpw.sector.Technology": "Technology",
    "gpw.sector.Real Estate": "Real Estate",
    "gpw.sector.Healthcare": "Healthcare",
    "gpw.sector.ETF": "ETFs",

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
    "projects.gpw.title": "GPW Explorer",
    "projects.gpw.description":
      "Interaktywna przeglądarka spółek z Giełdy Papierów Wartościowych: wyszukiwarka, pięć lat notowań, sygnały techniczne, wiadomości o spółkach i przegląd rynku.",
    "projects.gpw.h1": "Wyszukiwanie spółek i ETF-ów z GPW przez serwerowe API z cache",
    "projects.gpw.h2": "Wykres ceny ze średnimi SMA 50/200, wolumenem i obsługą z klawiatury",
    "projects.gpw.h3": "Sygnały techniczne według jawnych reguł, stopa zwrotu na tle WIG20TR, dywidendy i najnowsze wiadomości",
    "projects.gpw.h4": "Przegląd rynku: liderzy wzrostów i spadków, wyniki sektorów i komunikaty ESPI",

    // GPW Explorer (/gpw)
    "gpw.back": "Portfolio",
    "gpw.eyebrow": "Projekt poboczny | Giełda Papierów Wartościowych",
    "gpw.title": "GPW Explorer",
    "gpw.intro":
      "Wyszukaj spółkę lub ETF z warszawskiej giełdy i zobacz cenę, trend i ryzyko w jednym miejscu: pięć lat danych dziennych na tle WIG20.",
    "gpw.search.label": "Szukaj spółki lub tickera",
    "gpw.search.placeholder": "Szukaj: Orlen, KGHM, CDR...",
    "gpw.search.loading": "Szukam...",
    "gpw.search.noResults": "Brak pasujących spółek lub ETF-ów z GPW.",
    "gpw.search.error": "Wyszukiwarka jest teraz niedostępna.",
    "gpw.popular": "Popularne:",
    "gpw.range": "Zakres czasu",
    "gpw.ytd": "Od pocz. roku",
    "gpw.stats.lastClose": "Ostatni kurs",
    "gpw.dataThrough": "Notowania do",
    "gpw.stats.vsPrevious": "względem poprzedniej sesji",
    "gpw.stats.totalReturn": "Stopa zwrotu",
    "gpw.stats.vsBenchmark": "względem WIG20TR",
    "gpw.stats.volatility": "Zmienność",
    "gpw.stats.volatilityNote": "w skali roku, z dziennych stóp zwrotu",
    "gpw.stats.maxDrawdown": "Maks. obsunięcie",
    "gpw.stats.rangeLowHigh": "Min. - maks. w zakresie:",
    "gpw.price.title": "Cena",
    "gpw.price.subtitle": "Dzienne zamknięcie ze średnimi kroczącymi, poniżej wolumen obrotu",
    "gpw.compare.title": "Na tle WIG20TR",
    "gpw.compare.subtitle":
      "Stopa zwrotu z reinwestycją dywidend, oba szeregi sprowadzone do 100 na początku zakresu. WIG20TR odwzorowuje Beta ETF WIG20TR.",
    "gpw.compare.loading": "Wczytuję benchmark...",
    "gpw.compare.unavailable": "Dane benchmarku są teraz niedostępne.",
    "gpw.series.close": "Zamknięcie",
    "gpw.series.volume": "Wolumen",
    "gpw.series.benchmark": "WIG20TR",
    "gpw.chartHint": "Strzałki w lewo i w prawo przesuwają między sesjami.",
    "gpw.table.show": "Pokaż tabelę danych",
    "gpw.table.date": "Data",
    "gpw.table.change": "Zmiana",
    "gpw.error.notFound": "brak historii notowań dla tego symbolu.",
    "gpw.error.rateLimited": "dostawca danych ogranicza zapytania. Spróbuj ponownie za minutę.",
    "gpw.error.generic": "nie udało się wczytać danych. Spróbuj później.",
    "gpw.error.retry": "Spróbuj ponownie",
    "gpw.footnote":
      "Dane: Yahoo Finance (nieoficjalny publiczny endpoint), mogą być opóźnione, cache do godziny. Ceny w PLN; stopy zwrotu liczone z cen skorygowanych o dywidendy. To źródło nie udostępnia historii indeksów, dlatego WIG20 reprezentuje Beta ETF WIG20TR (z uwzględnieniem kosztów funduszu). Wyłącznie w celach informacyjnych, nie stanowi rekomendacji inwestycyjnej.",

    // GPW Explorer: tabs, signals, news, peers, dividends, market overview
    "gpw.tabs.label": "Widoki GPW Explorer",
    "gpw.tabs.company": "Spółka",
    "gpw.tabs.market": "Przegląd rynku",
    "gpw.watchlist.title": "Obserwowane",
    "gpw.watchlist.save": "Obserwuj",
    "gpw.watchlist.saved": "Obserwujesz",
    "gpw.watchlist.add": "Dodaj {name} do obserwowanych",
    "gpw.watchlist.remove": "Usuń {name} z obserwowanych",
    "gpw.signals.title": "Sygnały techniczne",
    "gpw.signals.subtitle": "Pięć odczytów historii notowań według stałych reguł. Każda reguła jest opisana pod wynikiem.",
    "gpw.signals.summary": "{bullish} wzrostowe, {neutral} neutralne, {bearish} spadkowe",
    "gpw.signals.disclaimer": "Sygnały opisują przeszłe notowania według stałych reguł. Nie są rekomendacjami inwestycyjnymi w rozumieniu MAR i nie uwzględniają fundamentów, wiadomości ani Twojej sytuacji.",
    "gpw.tone.bullish": "Wzrostowy",
    "gpw.tone.neutral": "Neutralny",
    "gpw.tone.bearish": "Spadkowy",
    "gpw.signal.trend.name": "Trend długoterminowy",
    "gpw.signal.trend.above": "kurs jest o {pct}% powyżej średniej z 200 sesji.",
    "gpw.signal.trend.below": "kurs jest o {pct}% poniżej średniej z 200 sesji.",
    "gpw.signal.trend.at": "kurs jest przy średniej z 200 sesji (w granicach 1%).",
    "gpw.signal.trend.rule": "Reguła: ponad 1% powyżej średniej kroczącej z 200 sesji to sygnał wzrostowy, ponad 1% poniżej to spadkowy.",
    "gpw.signal.cross.name": "Przecięcie 50/200",
    "gpw.signal.cross.golden": "średnia z 50 sesji jest powyżej średniej z 200 sesji od {date} (złoty krzyż).",
    "gpw.signal.cross.death": "średnia z 50 sesji jest poniżej średniej z 200 sesji od {date} (krzyż śmierci).",
    "gpw.signal.cross.rule": "Reguła: średnia z 50 sesji powyżej średniej z 200 sesji to sygnał wzrostowy, poniżej to spadkowy.",
    "gpw.signal.rsi.name": "Impet (RSI 14)",
    "gpw.signal.rsi.overbought": "RSI wynosi {value}, powyżej 70: ostatni wzrost wygląda na przegrzany.",
    "gpw.signal.rsi.oversold": "RSI wynosi {value}, poniżej 30: ostatni spadek wygląda na przesadzony.",
    "gpw.signal.rsi.normal": "RSI wynosi {value}, między 30 a 70: bez skrajności.",
    "gpw.signal.rsi.rule": "Reguła: RSI z 14 sesji (Wilder). Poniżej 30 to wyprzedanie (wzrostowy), powyżej 70 to wykupienie (spadkowy).",
    "gpw.signal.relative.name": "Siła względna",
    "gpw.signal.relative.beat": "w ciągu 3 miesięcy wyprzedza WIG20TR o {pp} p.p.",
    "gpw.signal.relative.lagged": "w ciągu 3 miesięcy zostaje w tyle za WIG20TR o {pp} p.p.",
    "gpw.signal.relative.inline": "w ciągu 3 miesięcy porusza się w linii z WIG20TR (w granicach 2 p.p.).",
    "gpw.signal.relative.rule": "Reguła: stopa zwrotu z 3 miesięcy na tle WIG20TR. Ponad 2 p.p. przewagi to sygnał wzrostowy, ponad 2 p.p. straty to spadkowy.",
    "gpw.signal.high52.name": "Szczyt 52-tygodniowy",
    "gpw.signal.high52.near": "{pct}% poniżej 52-tygodniowego szczytu {high}.",
    "gpw.signal.high52.mid": "{pct}% poniżej 52-tygodniowego szczytu {high}.",
    "gpw.signal.high52.far": "{pct}% poniżej 52-tygodniowego szczytu {high}.",
    "gpw.signal.high52.rule": "Reguła: do 5% od szczytu z 52 tygodni to sygnał wzrostowy, 20% lub więcej poniżej to spadkowy.",
    "gpw.news.title": "Najnowsze wiadomości",
    "gpw.news.subtitle": "Ostatnie nagłówki polskich mediów o spółce, przez Google News.",
    "gpw.news.error": "Wiadomości są teraz niedostępne.",
    "gpw.news.empty": "Brak nagłówków o tej spółce z ostatnich 30 dni.",
    "gpw.peers.title": "Podobne spółki",
    "gpw.peers.subtitle": "Ten sam sektor ({sector}), od najlepszej stopy zwrotu od początku roku.",
    "gpw.table.company": "Spółka",
    "gpw.table.today": "Dziś",
    "gpw.table.price": "Kurs",
    "gpw.dividends.title": "Dywidendy",
    "gpw.dividends.none": "Brak wypłat dywidendy w ostatnich pięciu latach.",
    "gpw.dividends.ttm": "stopa dywidendy z ostatnich 12 miesięcy",
    "gpw.dividends.exDate": "Dzień odcięcia",
    "gpw.dividends.perShare": "Na akcję ({currency})",
    "gpw.market.gainers": "Najwięksi wygrani dnia",
    "gpw.market.losers": "Najwięksi przegrani dnia",
    "gpw.market.sectors": "Sektory",
    "gpw.market.sectorsSubtitle": "Średnia zmiana spółek w każdym sektorze. Wybierz sektor, aby przefiltrować tabelę.",
    "gpw.market.metric": "Okres",
    "gpw.market.sectorTooltip": "{sector}: średnia z {count} spółek",
    "gpw.market.all": "Wszystkie spółki",
    "gpw.market.clearSector": "Pokaż wszystkie sektory",
    "gpw.market.announcements": "Komunikaty spółek",
    "gpw.market.announcementsSubtitle": "Najnowsze raporty bieżące (ESPI/EBI) z całego rynku, przez Bankier.pl.",
    "gpw.market.error": "Nie udało się wczytać danych rynkowych. Spróbuj później.",
    "gpw.error.rateLimitedFull": "Dostawca danych ogranicza zapytania. Spróbuj ponownie za minutę.",
    "gpw.sector.Financial Services": "Finanse",
    "gpw.sector.Energy": "Paliwa i energia",
    "gpw.sector.Basic Materials": "Surowce i materiały",
    "gpw.sector.Communication Services": "Media i telekomunikacja",
    "gpw.sector.Consumer Cyclical": "Konsumpcja cykliczna",
    "gpw.sector.Consumer Defensive": "Konsumpcja podstawowa",
    "gpw.sector.Utilities": "Energetyka i media",
    "gpw.sector.Industrials": "Przemysł",
    "gpw.sector.Technology": "Technologie",
    "gpw.sector.Real Estate": "Nieruchomości",
    "gpw.sector.Healthcare": "Ochrona zdrowia",
    "gpw.sector.ETF": "ETF-y",

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
