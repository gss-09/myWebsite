# CLAUDE.md

Guidance for working in this repo. Read this instead of re-scanning everything each session.

## What this is

Personal portfolio for **Shriyans Sai** (CS @ University of Houston).
- **Live:** https://www.shriyansai.com
- **Repo:** github.com/gss-09/myWebsite · default branch `main`
- **Stack:** Create React App (`react-scripts` 5), React 19, Tailwind CSS v3 (`darkMode: 'class'`). No TypeScript, no router.

## Deploy

Connected to **Vercel** — **pushing to `main` auto-deploys to production.** There is no deploy script, GitHub Action, or `vercel.json` in the repo; the push is the deploy. Verify builds in the Vercel dashboard.

## Commands

- `npm start` — dev server (localhost:3000)
- `npm run build` — production build → `build/`
- `npm test` — CRA/Jest runner (no meaningful tests exist yet)
- No separate lint script; CRA's eslint runs during build/start.

## Architecture — TWO designs, one site

`src/index.js` adds the `dark` class to `<html>` and renders `src/Root.js`, which picks the design by viewport width via `matchMedia("(max-width: 767px)")` (switches live on resize):

- **Desktop (≥768px) → skeuomorphic CRT terminal.** `src/App.js` + `src/components/*` + all styles in `src/index.css`.
- **Phones (≤767px) → legacy scrolling portfolio.** `src/legacy/` (the pre-skeuomorphism design, revived). **Lazy-loaded** so its bundle + `framer-motion` ship only to phones, never to the desktop bundle.

The breakpoint is the `MOBILE_QUERY` constant in `src/Root.js`.

### Desktop skeuo (`src/App.js`, `src/components/`, `src/index.css`)
- `App.js` renders a fake CRT monitor/desk with power button, tabs, and a status bar. Lands in **STANDBY** — the user clicks power to boot (boot/shutdown are CSS animations).
- Tabs: tab 0 is the portfolio (`Home`, `Experience`, `Projects`, `Resume`, `Contact` — all terminal-styled sections); other tabs run interactive shells (`Cli`).
- `src/components/Cli.js` — an in-browser terminal: command parser, ghost autocomplete, history, a virtual filesystem, and games. Notable commands: `help ls cd cat tree neofetch skills play theme color matrix`. Easter eggs: `matrix`, `sudo make me a sandwich`, hidden `.secret/flag.txt`.
- `src/components/cli/fs.js` — a tiny in-memory unix-ish filesystem; file contents are plain strings that stream char-by-char. **Holds a full copy of the resume/projects/experience content** (see "Content lives in 3 places").
- `src/components/cli/` games — `Snake Tetris Pong Breakout Game2048 TypingTest`, each a canvas/grid component taking an `onExit` prop. `Cli.js` also has an inline number-guess game.
- `src/components/lines.js` — `lines(n)` builds the decorative editor line-number gutter string used by every section (`data-lines`).
- **`src/index.css` (~570 lines) is hand-written, not Tailwind.** CSS variables drive theming. Heavy z-index layering inside `.screen`: `curve`(7) `scan`(8) `glare`(9) overlays, `crtline`(11), `matrix-canvas`(12). The hero photo is lifted to `z-index:10` to sit **above** the CRT scanline/glare overlays so it reads as a clean photo; this works because the `crton` keyframe rests at `transform:none` (so `.tube` doesn't form a stacking context that would trap the photo). Don't reintroduce a resting transform on `.tube.on`.

### Mobile legacy (`src/legacy/`)
- `LegacyApp.js` wraps everything in `.legacy-root` and imports `legacy.css`. Components in `src/legacy/components/` (`Navbar Home Experience Projects Contact Intro Aurora InteractiveBg CustomCursor` etc.). Uses Tailwind utilities + `dark:` variants and `framer-motion` animations.
- `src/legacy/legacy.css` is the old `index.css` with the `@tailwind` directives **removed** (they live in `src/index.css`) and global element rules scoped under `.legacy-root` so they can't leak into the desktop view after a resize. **Don't add `@tailwind` directives here.**

## Theming
- `dark` class is always on `<html>` (set in `index.js`). Tailwind `dark:` (legacy) keys off it.
- Skeuo theme is the **opposite** convention: dark is default; adding `html.light` switches to the light "daylight" theme (persisted in `localStorage` as `crt-theme`). Phosphor accent via `html.acc-green` / `html.acc-blue` (set by the CLI `color` command).
- Fonts: JetBrains Mono (skeuo, loaded in `public/index.html`); Inter/system (legacy).

## Content lives in 3 places — keep in sync
When updating resume/projects/experience/contact, update **all three**:
1. **Skeuo sections** — `src/components/{Home,Experience,Projects,Resume,Contact}.js`
2. **CLI virtual filesystem** — `src/components/cli/fs.js` (the `cat`-able `.txt`/`.md` files)
3. **Legacy mobile** — `src/legacy/components/{Home,Experience,Projects,Contact}.js`

Static assets: `public/photo.jpg` (headshot), `public/resume.pdf`. SEO/OG/structured-data live in `public/index.html`, plus `public/sitemap.xml` and `manifest.json`.

## Conventions & gotchas
- Comments in this codebase are lowercase, terse, and explain *why* (e.g. the z-index/stacking notes). Match that voice.
- `framer-motion` is a dependency **only** because the legacy components use it; it must stay installed even though desktop never loads it.
- Both apps mount independently — there is no shared state across the desktop/mobile switch.
- Working dir name contains a space (`VS code`); prefer absolute paths and avoid `cd` in compound shell commands.
- On `main`, branch before committing feature work; only push/merge to `main` when the user asks (it deploys).
