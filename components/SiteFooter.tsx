import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer wrap"><Link className="wordmark" href="/">Lately</Link><p>Made for remembering the ordinary.</p><nav aria-label="Legal links"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link><a href="mailto:support@latelyapp.app">Support</a></nav><span>© 2026 Lately</span></footer>;
}
