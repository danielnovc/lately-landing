import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return <main className="legal-shell"><header className="legal-nav wrap"><Link className="wordmark" href="/">Lately</Link><Link className="back-home" href="/">← Back to the path</Link></header><section className="legal-hero wrap"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>Last updated {updated}</p></section><article className="legal-document wrap">{children}</article><SiteFooter /></main>;
}
