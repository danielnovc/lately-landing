import type { Metadata } from "next";
import { Sour_Gummy } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import "./globals.css";

const display = Sour_Gummy({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://latelyapp.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Lately — your year of memories", template: "%s · Lately" },
  description: "Capture everyday memories with voice, text and photos, then revisit your year as a gentle journey.",
  applicationName: "Lately",
  keywords: ["journal", "memories", "voice journal", "photo journal", "iPhone app"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Lately",
    title: "Lately — your year of memories",
    description: "Capture everyday memories with voice, text and photos, then revisit your year as a gentle journey.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Lately — your year of memories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lately — your year of memories",
    description: "Capture everyday memories with voice, text and photos, then revisit your year as a gentle journey.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Lately",
        url: siteUrl,
        email: "support@latelyapp.app",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Lately",
        url: siteUrl,
        description: "A gentle journal for the memories that matter.",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "MobileApplication",
        name: "Lately",
        operatingSystem: "iOS",
        applicationCategory: "LifestyleApplication",
        description: "Capture everyday memories with voice, text and photos, then revisit your year as a gentle journey.",
        url: siteUrl,
      },
    ],
  };

  return <html lang="en" className={`${display.variable} h-full antialiased`}><body className="min-h-full text-[var(--ink)]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><SmoothScrollProvider>{children}</SmoothScrollProvider></body></html>;
}
