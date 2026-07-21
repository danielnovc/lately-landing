# Lately Landing

Marketing site for [Lately](../lately-app) — Next.js App Router, no auth, no database.

## Stack

- **Next.js 16** (App Router + Turbopack)
- **Lenis** ([darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)) — smooth scroll via `lenis/react`
- **GSAP** + **ScrollTrigger** + **@gsap/react** — scroll-driven animations, synced to Lenis’s raf ticker

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/                  # routes + global styles
components/
  providers/          # SmoothScrollProvider (Lenis ↔ GSAP)
  landing/            # page sections (Hero, JourneyPreview, …)
lib/
  gsap.ts             # client plugin registration helper
```

## Lenis + GSAP

`SmoothScrollProvider` follows the official Lenis React + GSAP pattern:

1. `ReactLenis` with `autoRaf: false`
2. Drive Lenis from `gsap.ticker`
3. Call `ScrollTrigger.update` on Lenis `scroll`

Build the journey recreation under `components/landing/JourneyPreview.tsx` (or split into new components as it grows).
