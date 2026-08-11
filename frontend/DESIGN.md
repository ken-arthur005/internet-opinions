# DESIGN.md — Internet Opinions

## Design Brief

A brand sentiment analysis dashboard. Dark, data-heavy, techy. The interface has two states: a cinematic search hero and a full analytics dashboard. The signature moment is the brand-matched background — every search transforms the page into a branded environment, making the data feel alive and specific rather than generic.

Target audience: anyone who wants to know what people are saying about a brand — students, marketers, curious people.

---

## Signature Element

**The brand environment shift.** When results load, the background transforms into a high-quality image pulled from Unsplash matching the searched brand. A dark overlay keeps it readable. Combined with GSAP staggered card entrances, the dashboard doesn't just appear — it arrives. This is the one moment the design is remembered by.

---

## Typography

| Role | Typeface | Usage |
|---|---|---|
| Display | Unbounded | Logo, hero headline, card titles |
| Body | Albert Sans | Body text, labels, descriptions |
| Data | JetBrains Mono | Numbers, scores, percentages, timestamps |

### Type scale
```
--text-xs:   11px / 1.4  (timestamps, captions)
--text-sm:   13px / 1.5  (labels, meta)
--text-base: 15px / 1.6  (body, card content)
--text-lg:   18px / 1.4  (card titles)
--text-xl:   24px / 1.3  (section headers)
--text-2xl:  32px / 1.2  (big numbers)
--text-3xl:  48px / 1.1  (hero headline)
--text-4xl:  64px / 1.0  (hero tagline display)
```

### Font loading (app/layout.js)

Loaded through `next/font/google`, not a CSS `@import` — self-hosted, no
render-blocking request to fonts.googleapis.com, and no flash of fallback text.
Unbounded and Albert Sans are variable fonts, so no weight list is needed.

```js
import { Unbounded, Albert_Sans, JetBrains_Mono } from "next/font/google";
```

They reach Tailwind as `font-display` / `font-body` / `font-mono` via the
`@theme inline` block in `globals.css`.

> **Note on hero sizing.** Unbounded is considerably wider than Space Grotesk,
> so the 64px hero headline below overflows narrow viewports. The wordmark uses
> a responsive ramp (`text-2xl` → `sm:text-3xl` → `lg:text-4xl`) at weight 600
> rather than a fixed 64px/700.

---

## Themes

All themes are dark. The difference is the accent color and surface tones.
Applied via `data-theme` on `<html>`. Every color is a CSS variable.

### Void (default)
Cold, pure dark. Professional and focused.
```css
[data-theme="void"] {
  --bg-base:       #080810;
  --bg-surface:    #0f0f1a;
  --bg-card:       #13131f;
  --bg-card-hover: #1a1a2a;
  --border:        #1e1e30;
  --border-accent: #2a2a42;
  --accent:        #6c6fff;
  --accent-dim:    #6c6fff22;
  --accent-glow:   #6c6fff44;
  --text-primary:  #f0f0ff;
  --text-secondary:#8888aa;
  --text-muted:    #4a4a66;
  --positive:      #22d3a0;
  --negative:      #f25f6a;
  --neutral:       #8888aa;
  --overlay:       rgba(8, 8, 16, 0.78);
}
```

### Aurora
Deep space purple. Moody and editorial.
```css
[data-theme="aurora"] {
  --bg-base:       #06060f;
  --bg-surface:    #0d0b1a;
  --bg-card:       #110f20;
  --bg-card-hover: #181530;
  --border:        #1c1830;
  --border-accent: #2e2850;
  --accent:        #a855f7;
  --accent-dim:    #a855f722;
  --accent-glow:   #a855f744;
  --text-primary:  #f5f0ff;
  --text-secondary:#9980cc;
  --text-muted:    #4a4066;
  --positive:      #34d399;
  --negative:      #f87171;
  --neutral:       #9980cc;
  --overlay:       rgba(6, 6, 15, 0.80);
}
```

### Ember
Dark with warm amber fire. Energetic, bold.
```css
[data-theme="ember"] {
  --bg-base:       #0c0804;
  --bg-surface:    #140f06;
  --bg-card:       #1a1208;
  --bg-card-hover: #221808;
  --border:        #2a1e0a;
  --border-accent: #3d2c10;
  --accent:        #f59e0b;
  --accent-dim:    #f59e0b22;
  --accent-glow:   #f59e0b44;
  --text-primary:  #fff8f0;
  --text-secondary:#aa8855;
  --text-muted:    #5a4020;
  --positive:      #10b981;
  --negative:      #ef4444;
  --neutral:       #aa8855;
  --overlay:       rgba(12, 8, 4, 0.80);
}
```

### Matrix
Terminal green. Hacker energy. Maximum data density.
```css
[data-theme="matrix"] {
  --bg-base:       #020805;
  --bg-surface:    #040f08;
  --bg-card:       #061210;
  --bg-card-hover: #0a1a14;
  --border:        #0d2018;
  --border-accent: #153020;
  --accent:        #00ff88;
  --accent-dim:    #00ff8820;
  --accent-glow:   #00ff8840;
  --text-primary:  #eeffee;
  --text-secondary:#44aa66;
  --text-muted:    #1a4428;
  --positive:      #00ff88;
  --negative:      #ff4466;
  --neutral:       #44aa66;
  --overlay:       rgba(2, 8, 5, 0.82);
}
```

---

## Layout

### Hero state (before search)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│              [Theme switcher — top right]            │
│                                                     │
│                                                     │
│                  Internet Opinions                  │  ← Unbounded 600, responsive (types in)
│           Discover what the internet thinks         │  ← Albert Sans 400, 18px, muted
│                                                     │
│         ┌───────────────────────────────────┐       │
│         │  🔍  Search a brand...            │       │  ← search input
│         └───────────────────────────────────┘       │
│                  [Analyze] button below             │
│                                                     │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Full viewport height. Content centered vertically and horizontally.
Subtle noise texture over the theme background image (see Theming — per-theme
background). The Unsplash brand image is not fetched until a search runs.

The headline types in on first load (~1.2s), then the tagline fades up. Once per
tab via `sessionStorage`, so returning via "Search again" shows the finished
title rather than replaying. Skipped entirely under `prefers-reduced-motion`.

---

### Loading state (during search)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│                  Internet Opinions                  │
│                                                     │
│              ◉  Analyzing {brand}...                │  ← GSAP pulsing dot
│                                                     │
│         Collecting articles · Running sentiment     │  ← step indicator
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Background image begins loading and fading in during this state.

---

### Dashboard state (results loaded)

```
┌─────────────────────────────────────────────────────────────────┐
│  Internet Opinions          {Brand}          ← Search again  🎨 │  ← top bar
├──────────────────────────────────────────────┬──────────────────┤
│                                              │                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │   Pie chart      │
│  │ POSITIVE │ │ NEGATIVE │ │ NEUTRAL  │     │   breakdown      │
│  │   67%    │ │   20%    │ │   13%    │     │                  │
│  └──────────┘ └──────────┘ └──────────┘     │                  │
│                                              │                  │
│  Overall sentiment score                     ├──────────────────┤
│  ████████░░  0.78 / 1.00                     │                  │
│                                              │  Recent mentions │
├──────────────────────────────────────────────┤  feed            │
│                                              │                  │
│  [mentions feed — scrollable]                │  article 1  🟢   │
│  article title · source · date · sentiment   │  article 2  🔴   │
│                                              │  article 3  ⚪   │
│                                              │                  │
└──────────────────────────────────────────────┴──────────────────┘
```

Background: brand image with dark overlay.
Cards: `--bg-card` with `border: 1px solid var(--border)`.
All cards have `backdrop-filter: blur(12px)` for the frosted glass effect over the background image.

---

## Component Specs

### Cards
```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 12px;
backdrop-filter: blur(12px);
padding: 20px 24px;
```

Hover state:
```css
background: var(--bg-card-hover);
border-color: var(--border-accent);
transition: all 0.2s ease;
```

### Sentiment score numbers
```css
font-family: 'JetBrains Mono', monospace;
font-size: 32px;
font-weight: 500;
```
Positive → `color: var(--positive)`
Negative → `color: var(--negative)`
Neutral → `color: var(--neutral)`

### Search input
```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 8px;
padding: 14px 20px;
font-size: 16px;
color: var(--text-primary);
width: 480px;
```
Focus:
```css
border-color: var(--accent);
box-shadow: 0 0 0 3px var(--accent-glow);
outline: none;
```

### Accent button
```css
background: var(--accent);
color: var(--bg-base);
border-radius: 8px;
padding: 14px 28px;
font-weight: 600;
font-size: 15px;
```
Hover: `opacity: 0.88`

---

## Animation Plan (GSAP)

### Hero → Loading transition
```javascript
const tl = gsap.timeline()
tl.to('.hero-content', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' })
  .to('.loading-screen', { opacity: 1, duration: 0.3 })
```

### Loading → Dashboard transition
```javascript
tl.to('.loading-screen', { opacity: 0, duration: 0.3 })
  .to('.dashboard-bg', { opacity: 1, duration: 0.8, ease: 'power2.out' })
  .from('.dashboard-card', {
    opacity: 0,
    y: 30,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power3.out'
  })
```

### Loading pulse
```javascript
gsap.to('.loading-dot', {
  scale: 1.4,
  opacity: 0.4,
  duration: 0.8,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
})
```

### Dashboard → Hero (search again)
```javascript
tl.to('.dashboard-card', { opacity: 0, y: -20, stagger: 0.04, duration: 0.3 })
  .to('.dashboard-bg', { opacity: 0, duration: 0.4 })
  .to('.hero-content', { opacity: 1, y: 0, duration: 0.4 })
```

---

## Unsplash Integration

```typescript
// lib/unsplash.ts
export async function getBrandBackground(brand: string): Promise<string> {
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${brand}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}` } }
  )
  const data = await res.json()
  return data.urls.full
}
```

Background application:
```css
.dashboard-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: url({imageUrl});
  background-size: cover;
  background-position: center;
}

.dashboard-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--overlay);
}
```

---

## Spacing System

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

---

## Recharts Config

Chart colors always pulled from CSS variables via `getComputedStyle`:

```typescript
const style = getComputedStyle(document.documentElement)
const positive = style.getPropertyValue('--positive').trim()
const negative = style.getPropertyValue('--negative').trim()
const neutral  = style.getPropertyValue('--neutral').trim()
```

Pie chart: no legends inside the chart — use custom legend below.
All chart backgrounds: transparent.
Grid lines: `var(--border)`.
Tooltip background: `var(--bg-card)`.

---

## Copy Decisions

| Element | Copy |
|---|---|
| App name | Internet Opinions |
| Tagline | Discover what the internet thinks |
| Search placeholder | Search a brand... |
| Analyze button | Analyze |
| Loading message | Analyzing {brand}... |
| Loading substep | Collecting articles · Running sentiment |
| Back button | ← Search again |
| Empty state | No results found for "{brand}". Try a different name. |
| Error state | Couldn't reach the server. Make sure the backend is running. |
| Positive label | Positive |
| Negative label | Negative |
| Neutral label | Neutral |
| Score label | Sentiment score |
| Total label | Articles analyzed |

---

## What Not To Do

- No light mode — all themes are dark
- No gradients on text (too trendy, distracts from data)
- No skeleton loaders — use the dedicated loading screen instead
- No animations on charts themselves — GSAP handles card entrance, Recharts handles internal animation
- No more than one accent color per theme — consistency over variety
- No border-radius above 16px on cards
- No shadows — depth comes from border color and backdrop blur, not box-shadow