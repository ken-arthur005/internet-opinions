# CLAUDE.md — Internet Opinions Frontend

## Project Overview

**Internet Opinions** is a brand sentiment analysis dashboard. Users type a brand name, the app collects recent news articles about that brand, runs them through a sentiment model, and displays the results as a live analytics dashboard with charts, summaries, and a feed of analyzed mentions.

**Tagline:** Discover what the internet thinks.

---

## Architecture

This is a Next.js 16 App Router frontend. It is one piece of a three-service system:

```
Next.js (frontend) → Spring Boot :8080 (backend API) → FastAPI :8000 (Python ML service) → Supabase
```

The frontend never calls Supabase or the Python service directly. All requests go through Spring Boot.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, JavaScript (not TypeScript)
- **Styling:** Tailwind CSS v4 — CSS-first config in `globals.css`, no `tailwind.config` file
- **Components:** hand-rolled against DESIGN.md specs (shadcn/ui is installed but unused — see note below)
- **Charts:** Recharts 3
- **Animations:** GSAP + `@gsap/react` (`useGSAP`)
- **HTTP:** fetch API (no Axios)
- **Fonts:** Unbounded (display), Albert Sans (body), JetBrains Mono (data/numbers) — loaded via `next/font/google`

> **On shadcn/ui:** the four primitives this app needs (card, input, button, theme menu) are fully specified as raw CSS in DESIGN.md, and the Radix + CVA layer adds indirection around CSS-variable theming without earning it. `Card`, `StateMessage` and `SentimentPill` in `src/components/ui/` fill that role instead.

> **On React Compiler:** `reactCompiler: true` is enabled in `next.config.mjs`. Never read `ref.current` during render, and keep `useGSAP` dependency arrays primitive (`[phase]`, not `[someObject]`).

---

## API Endpoints (Spring Boot on port 8080)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/collect?brand={brand}` | Triggers Python pipeline — collects + analyzes mentions |
| GET | `/api/mentions?brand={brand}` | Returns list of analyzed mentions from Supabase |
| GET | `/api/sentiment-summary?brand={brand}` | Returns sentiment breakdown + average score |

`brand` is required on all three — omitting it returns 400.

### Search flow (always in this order)
1. Call `POST /api/collect?brand={brand}` — wait for completion
2. Call `GET /api/sentiment-summary?brand={brand}` — get summary
3. Call `GET /api/mentions?brand={brand}` — get mentions feed

The order is not stylistic: `/api/collect` blocks until Supabase has the rows, so
running these in parallel reads stale or empty data.

**Collect is slow.** It scores up to 50 articles one at a time through
RoBERTa-large, so it routinely exceeds the 5–15s figure this doc used to quote.
The client caps it at 90s. The loading state has to stay alive for that long.

### Response shapes (verified against the Java source)

```js
// GET /api/mentions — note: NO title field
{ id, brand, text, source, url, sentimentLabel, sentimentScore, createdAt }

// GET /api/sentiment-summary — raw counts, not percentages
{ brand, total, positive, negative, neutral, averageScore }
```

### Three backend quirks the frontend works around

These are deliberate, documented in `src/lib/sentiment.js`, and should not be
"fixed" by reverting to the raw API values:

1. **`summary.neutral` is always 0.** The ML model
   (`siebert/sentiment-roberta-large-english`) is a *binary* classifier — it
   only ever emits POSITIVE or NEGATIVE, so the backend's
   `neutral = total - positive - negative` is always exactly zero. The frontend
   derives neutral from confidence instead: below `NEUTRAL_THRESHOLD` (0.75) the
   model is treated as undecided.

2. **`summary.averageScore` is not a sentiment score.** It averages raw model
   *confidence*, which sits at 0.5–1.0 regardless of which label won — so a
   brand with uniformly hostile coverage scores ~0.97. The frontend computes a
   signed score (`+score` positive, `−score` negative, mapped to 0..1) so 0.5
   means genuinely balanced.

3. **No `title` field.** The Python collector concatenates title + description
   into one `text` blob, so the feed renders that blob clamped to two lines
   rather than splitting it heuristically.

**Empty vs. error:** an unknown brand returns 200 with `[]`, never 404. Emptiness
is determined by `mentions.length`, not by status code. A 500 from `/collect`
leaks a raw Python exception string — never surface it.

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

`UNSPLASH_ACCESS_KEY` is deliberately **not** `NEXT_PUBLIC_`-prefixed — that
prefix inlines the value into the client bundle, publishing the key to anyone
who opens devtools. It is read server-side only, by
`src/app/api/background/route.js`. See `.env.example`.

---

## Project Structure

Everything lives under `src/`, and components are grouped by the phase they
belong to rather than kept flat.

```
frontend/src/
├── app/
│   ├── layout.js                 # Fonts, no-flash theme script, <html data-theme>
│   ├── page.js                   # Phase machine + GSAP orchestration
│   ├── globals.css               # Theme blocks + Tailwind v4 @theme bridge
│   └── api/background/route.js   # Server-side Unsplash proxy (keeps the key secret)
├── components/
│   ├── hero/                     # SearchHero, BrandSearchForm, HeroWordmark
│   ├── loading/                  # LoadingState, LoadingSteps
│   ├── dashboard/                # Dashboard + 13 cards//rows (see below)
│   ├── ui/                       # Card, SentimentPill, StateMessage
│   └── ThemeSwitcher.js
├── hooks/
│   ├── useSearch.js              # The whole search lifecycle
│   ├── useTheme.js               # Reads/writes data-theme + localStorage
│   └── useThemeColors.js         # CSS vars → JS, for Recharts
└── lib/
    ├── api.js                    # fetch calls, ApiError/TimeoutError, normalization
    ├── sentiment.js              # Sentiment derivation + the three workarounds
    ├── format.js                 # Percent/score/relative-time formatting
    ├── themes.js                 # Theme list (shared by switcher + layout script)
    └── unsplash.js               # Client calls /api/background, image preload
```

`Dashboard.js` composes: `DashboardHeader`, `BrandBanner`, `SentimentSummary`
(→ `SentimentStatCard`), `SentimentScoreBar`, `SentimentChart` (→ `ChartLegend`,
`ChartTooltip`), `MentionsFeed` (→ `FeedFilters`, `MentionRow`),
`RecentMentions`, `UnsplashCredit`, plus `BrandBackdrop` rendered by `page.js`.

---

## Theming System

Themes are applied via a `data-theme` attribute on the `<html>` element. CSS variables are defined per theme in `globals.css`. All components use CSS variables — never hardcoded colors.

Available themes: `void`, `aurora`, `ember`, `matrix`

The switcher (`components/ThemeSwitcher.js`) is rendered in two places: top-right
of the hero (inside `.hero-content`, so it fades out with the hero) and in the
dashboard header. Both read the same `useTheme` hook, so the choice persists
across the transition.

### Per-theme background

Each theme block also sets three background variables:

```css
--theme-bg-image: url("/bg2.jpg");  /* artwork behind hero + loading */
--theme-bg-tint:  0.62;             /* 0..1 accent recolour strength */
--theme-bg-dim:   0;                /* 0..1 flat --bg-base darkening */
```

`ThemeBackdrop` stacks four layers: the image, an accent tint using
`mix-blend-mode: color`, a flat dim, and a scrim. The blend takes hue and
saturation from `--accent` while keeping the image's luminosity, so one asset
can serve several themes without the artwork turning to mud.

| Theme | Image | Tint | Dim |
|---|---|---|---|
| Void | `bg2.jpg` | `0` | `0` |
| Aurora | `bg4aurora.jpg` | `0` | `0.45` |
| Ember | `bg2.jpg` | `0.72` | `0` |
| Matrix | `bg3.jpg` | `0` | `0` |

Only Ember still tints. The other three sit at `0` because their artwork is
already their colour — `bg2.jpg` periwinkle, `bg4aurora.jpg` violet, `bg3.jpg`
emerald.

**Dim exists because tint cannot darken.** Preserving luminosity is the entire
point of `mix-blend-mode: color`, so no tint value makes a bright image safe to
put text on. `bg4aurora.jpg` is a pale sky with a near-white sun sitting almost
exactly where the hero wordmark lands — without dim, `--text-primary` falls to
roughly 2.5:1 against it. Dim is uniform rather than shaped, so it lowers the
whole frame and leaves the artwork's internal contrast intact; raising the
scrim's radial centre instead would blow out the middle of the frame.

**To give a theme its own artwork:** point `--theme-bg-image` at the new file,
set `--theme-bg-tint: 0`, and add `--theme-bg-dim` only if the art is light.
No component changes needed. Downscale first — the backdrop is a CSS `url()`,
so it bypasses `next/image` and ships raw from `/public`; ~2560px wide at q80
is plenty behind the scrim.

The wrapper carries `isolation: isolate` — without it the blend mode reaches
past the backdrop and recolours the page content above it.

The theme backdrop covers the hero and loading screens. On the dashboard the
Unsplash brand photo takes over, *unless* there isn't one (no key, or a failed
request), in which case the theme artwork stays as the fallback.

---

## Key Behaviors

### Brand background
When a search completes, fetch a brand-relevant image from Unsplash and set it as the full-page background with a dark overlay.

The overlay is a **vertical gradient**, not a flat fill: nearly clear at the top
so the photograph reads behind the brand name, resolving to solid `--bg-base` by
the time the card grid starts (`.brand-scrim` in `globals.css`). A flat scrim at
a single opacity looks like generic wallpaper — the fade is what makes it feel
like a branded environment. Per-theme `--overlay` values (0.78–0.82) supersede
the older flat `0.75` this doc used to specify.

The Unsplash fetch is fired **in parallel with** `/api/collect`, not after it, so
the image has decoded by the time the dashboard mounts.

### Search → Results transition
1. User submits search
2. Hero (logo + search bar) fades out with GSAP
3. Loading screen fades in
4. API calls run in sequence
5. Loading screen fades out
6. Dashboard cards stagger in one by one (80ms delay between each)
7. Background image transitions in

### Back to search
A small "Search again" button in the dashboard header triggers the reverse: dashboard fades out, hero fades back in, background resets.

Errors and empty results also return to the hero, with the message under the
search bar — retrying is one keystroke, not a navigation.

---

## Conventions

- All components are functional. The project is **JavaScript**, so use JSDoc
  `@typedef`s for API response shapes (see `src/lib/api.js`) rather than TS interfaces
- Raw API fields are touched **only** in `normalizeMention` / `normalizeSummary`.
  Components consume the normalized shape, so a backend DTO change is a one-file fix
- CSS variables for all colors — no hardcoded hex values in components
- Never build class names by interpolation (`` `text-${sentiment}` ``). Tailwind v4
  scans source as plain text, so those classes are never generated — use the
  `SENTIMENT_*_CLASS` lookup maps in `src/lib/sentiment.js`
- GSAP animations in `useGSAP` with proper cleanup (`tl.kill()`, `mm.revert()`)
- Use `gsap.fromTo`, never `gsap.from` — under React 19 StrictMode the double
  invoke reverts elements to the *from* state and strands cards at `opacity: 0`
- `loading`, `error`, and `empty` states handled in every data component
- Error messages are specific — "No results found for {brand}" not "Something went wrong"
- Sentence case everywhere in UI copy
- All chart colors pulled from theme CSS variables (via `useThemeColors`)

---

## Coding Rules

- Never call Supabase or FastAPI directly from the frontend
- Never hardcode `localhost:8080` in components — always use `NEXT_PUBLIC_API_URL`
- Always `await` the collect call before fetching summary or mentions
- Keep components small — if a component exceeds 150 lines, split it
- No inline styles — Tailwind classes or CSS variables only. This is why the
  chart uses custom `ChartTooltip`/`ChartLegend` components instead of Recharts'
  `contentStyle` prop, and why the backdrop uses `next/image` (a `src`
  attribute) instead of a runtime `style={{ backgroundImage }}`
- GSAP timelines must be cleaned up in the `useGSAP` return function
- The backdrop layer sits at `z-0` with content at `z-10`. Never give it
  `z-index: -1` — the root background paints over a negative-index layer and
  the image silently disappears
- Don't wrap the dashboard in a container you fade. An ancestor with
  `opacity < 1` creates a group that `backdrop-filter` can't sample outside of,
  which visibly tears the frosted glass mid-transition. Animate the cards and
  the backdrop separately
- Blur the feed *container*, not each row — per-row `backdrop-filter` means one
  expensive composite layer per article

## Design 
@DESIGN.md