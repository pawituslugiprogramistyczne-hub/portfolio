# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — `next lint`

There is no test suite. Both `package-lock.json` and `pnpm-lock.yaml` are committed; keep them in sync if you change dependencies.

Note: `next.config.mjs` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`, so `npm run build` passing does **not** mean the code type-checks. Run `npx tsc --noEmit` to check types.

## Architecture

Next.js 14 App Router site (React 18, TypeScript, Tailwind 3, shadcn/ui). Deployed on Vercel at https://pawit.net. Three parts share one app:

### 1. Portfolio (`/`)
- The one-page portfolio (nav, hero, impact numbers, about, experience, GitHub activity, skills, projects, contact, footer) is the client component `components/portfolio.tsx`. It is served twice: `app/page.tsx` (English, `/`) and `app/pl/page.tsx` (Polish, `/pl`). Those two server pages only hold per-language metadata (canonical + hreflang).
- `LanguageProvider` takes the language from the path on `/` and `/pl` (prerendered, no client-side swap); the toggle navigates between them and stores the choice in localStorage and a `preferred-language` cookie. `middleware.ts` redirects `/` to `/pl` for Polish browsers unless that cookie says `en`. Other pages (quiz, 404) use the saved choice or browser language.
- All portfolio content (profile links, CV/photo paths, feature flags like `openToWork`, skills, projects, experience, education) lives in `lib/portfolio-data.ts`. Entries reference translation keys; `app/layout.tsx` (metadata + schema.org JSON-LD) and `app/opengraph-image.tsx` also read from it. Content comes from the owner's CV and LinkedIn; never invent figures.
- `app/layout.tsx` wraps everything in `ThemeProvider` (next-themes, class-based dark mode) and `LanguageProvider`, and holds SEO/OpenGraph metadata.
- **i18n**: `contexts/language-context.tsx` contains a hand-rolled EN/PL translation dictionary and the `useLanguage()` hook exposing `t(key)` (and `language`). All user-facing portfolio text goes through `t()` — when adding text, add the key to **both** `en` and `pl` maps. Project cards reference translation keys (`titleKey`, `descriptionKey`, `tech`), not literal strings.
- `components/github-repos.tsx` fetches the latest repos and public events client-side from the unauthenticated GitHub REST API (user `pawituslugiprogramistyczne-hub`), so it is subject to GitHub rate limits.

### 2. GPW Explorer (`/gpw`)
A Warsaw Stock Exchange explorer (search, price chart with SMA 50/200 and volume, comparison with WIG20TR, risk stats), translated via the language context like the portfolio.
- Data comes from Yahoo Finance's **unofficial, keyless** chart and search endpoints, only through `lib/gpw/yahoo.ts` (swap that file to change provider). The browser never calls Yahoo: it calls `app/api/gpw/history` and `app/api/gpw/search`, which validate symbols against `SYMBOL_PATTERN` (Warsaw `.WA` tickers only) and cache upstream responses (1 h history, 1 day search).
- Yahoo quirks this code relies on: there is no history for Warsaw indices, so WIG20 is the Beta ETF WIG20TR (`BENCHMARK` in `lib/gpw/types.ts`); its daily series for Warsaw stocks can lag several days behind, padding with flat zero-volume rows, so `getHistory` rebuilds recent days from hourly bars and drops unrepaired padding; global search returns ~7 hits, so `lib/gpw/companies.ts` (verified directory of large and mid caps + main ETFs) is searched locally first.
- More sources, all server-side and cached: `getOverview` (Yahoo "spark" batch, max 20 symbols per call) feeds `/api/gpw/overview` for the market tab and peers; `lib/gpw/news.ts` reads Google News search RSS per company (`/api/gpw/news`, Polish press, filtered so headlines must name the company; `SHORT_NAMES`/`QUERIES`/`TITLE_MATCH` tune generic names) and Bankier's ESPI RSS (`/api/gpw/announcements`). The overview and announcements routes are ISR (`revalidate = 900`). Yahoo's analyst/profile endpoints need a session crumb and are deliberately not used.
- Technical signals (`technicalSignals` in analytics) are fixed, published rules shown with their results. Keep them descriptive: buy/sell recommendations about Polish stocks fall under MAR, so never phrase them as advice.
- Watchlist lives in `localStorage` (`useWatchlist` in `components/gpw/use-gpw-data.ts`); display names come from `DISPLAY_NAMES` in `lib/gpw/companies.ts` (Yahoo's names lack Polish diacritics).
- `lib/gpw/analytics.ts` holds the pure math (SMA, range slicing, volatility, drawdown, rebasing). `components/gpw/time-series-chart.tsx` is a hand-rolled SVG chart: one y-axis per panel (volume is its own panel), hover/keyboard crosshair, colors from the `.viz-root` tokens in `app/globals.css` (validated palette slots; don't reuse them as text colors).
- The view state lives in the URL (`/gpw?s=PKN.WA&r=1Y`), so `useSearchParams` sits behind a Suspense boundary in `components/gpw/gpw-page.tsx`.

### 3. Quiz game (`/quiz-game`)
A Polish-language "Milionerzy"-style birthday party quiz, not translated via the language context.
- `app/quiz-game/page.tsx` is a state machine driven by local `useState`: `Home` → `GroupDivisionPage` → `QuizScreen` (per question) → `AnswerSummary`.
- Questions are hardcoded in `lib/questions.ts` as a discriminated union on `type`: `"multiple-choice"`, `"open-ended"` (optional `image`), and `"toast-break"` (a pause in the quiz, filtered out of numbering where relevant).
- Audio: `QuizScreen` plays `/open_music.m4a` (or a question's `music` file from `public/`), then switches to looping `/question_music.mp3`. `QuestionDisplay` runs the countdown timer (`timeLimit`, default 30s).
- `app/quiz-game/groups/page.tsx` is a printable answer sheet for teams (one blank line per non-toast question), not a group selector.

### UI components
`components/ui/` is shadcn/ui generated code (config in `components.json`, path alias `@/*`). Many of these files import packages that are **not** in `package.json` (e.g. `cmdk`, `recharts`, `vaul`, `sonner`, most `@radix-ui/*`); only a handful (button, card, badge, separator, skeleton, dropdown-menu) are actually used. Install the missing dependency before using any other ui component. `cn()` lives in `lib/utils.ts`.

Global styles and shadcn CSS variables are in `app/globals.css` (`styles/globals.css` is an unused duplicate). Browser support targets are set via `browserslist` in `package.json` with `postcss-preset-env`/autoprefixer.
