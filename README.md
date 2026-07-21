Exit code: 0
Wall time: 0.6 seconds
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

## Deploy with Coolify and Nixpacks

Create a Nixpacks resource in Coolify and point it at this repository. Nixpacks will detect Next.js automatically. Use `npm run build` as the build command and `npm run start` as the start command; expose port `3000` and use `/api/health` as the health-check path.

Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS URL for the site (for example, `https://latelyapp.app`). This value powers canonical URLs, Open Graph metadata, JSON-LD, `robots.txt`, and `sitemap.xml`.

Set the production domain and TLS certificate through Coolify's proxy settings.

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

