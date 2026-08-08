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

## Recap API

The iOS app calls `POST https://api.uselately.app/v1/recaps`. Add
`api.uselately.app` as a second domain on this same Coolify resource, then create
a proxied Cloudflare DNS record for `api` pointing at the Coolify server. Keep
the Coolify origin port private so requests cannot bypass Cloudflare.

Use Cloudflare SSL/TLS mode **Full (strict)**. If your plan supports rate-limit
rules, add a rule for `api.uselately.app/v1/recaps` using the same 12 requests
per 10 minutes per-IP ceiling as the application. Do not cache `/v1/*`. For the
strongest origin protection, allow inbound web traffic only from Cloudflare's
published IP ranges; the application still enforces subscription and customer
rate limits if that is not possible.

Configure these server-only environment variables in Coolify:

- `GEMINI_API_KEY`: a rotated Gemini authorization key
- `GEMINI_MODEL`: defaults to `gemini-2.5-flash`
- `REVENUECAT_V2_SECRET_API_KEY`: a RevenueCat v2 secret key limited to
  `customer_information:customers:read`
- `REVENUECAT_PROJECT_ID`: the RevenueCat project ID (`proj...`)
- `REVENUECAT_ENTITLEMENT_ID`: the RevenueCat entitlement ID (`entl...`), not
  its display name
- `NEXT_PUBLIC_SITE_URL`: `https://uselately.app`

Do not prefix Gemini or RevenueCat secret keys with `NEXT_PUBLIC_`. The endpoint
validates request size and shape, verifies the caller's active RevenueCat
entitlement, and rate-limits both the Cloudflare client IP and RevenueCat user.
The in-memory limiter assumes one Coolify replica; use a shared Redis-backed
limiter before scaling this resource horizontally.

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

