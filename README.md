Exit code: 0
Wall time: 1.5 seconds
Output:
# Lately Landing

Marketing site for [Lately](../lately-app) â€” Next.js App Router, no auth, no database.

## Stack

- **Next.js 16** (App Router + Turbopack)
- **Lenis** ([darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)) â€” smooth scroll via `lenis/react`
- **GSAP** + **ScrollTrigger** + **@gsap/react** â€” scroll-driven animations, synced to Lenisâ€™s raf ticker

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy with Coolify

Create a new **Dockerfile** resource in Coolify and point it at this repository. Coolify can use the included `Dockerfile` directly; the container listens on port `3000` and exposes `/api/health` for health checks.

Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS URL for the site (for example, `https://latelyapp.app`). This value powers canonical URLs, Open Graph metadata, JSON-LD, `robots.txt`, and `sitemap.xml`.

The image uses Next.js standalone output and runs as a non-root user. Keep the default start command from the Dockerfile and configure TLS/domain handling in Coolify's proxy.

## Structure

```
app/                  # routes + global styles
components/
  providers/          # SmoothScrollProvider (Lenis â†” GSAP)
  landing/            # page sections (Hero, JourneyPreview, â€¦)
lib/
  gsap.ts             # client plugin registration helper
```

## Lenis + GSAP

`SmoothScrollProvider` follows the official Lenis React + GSAP pattern:

1. `ReactLenis` with `autoRaf: false`
2. Drive Lenis from `gsap.ticker`
3. Call `ScrollTrigger.update` on Lenis `scroll`

Build the journey recreation under `components/landing/JourneyPreview.tsx` (or split into new components as it grows).

