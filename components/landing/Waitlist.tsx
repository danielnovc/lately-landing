import Link from "next/link";

export function Waitlist() {
  return (
    <>
      <section id="privacy" className="privacy-section wrap">
        <div><p className="kicker">Privacy, in plain language</p><h2>On your device. Synced only when you choose.</h2></div>
        <div className="privacy-text">
          <p>Turn on private iCloud sync when you want it. Recaps only run when you ask, using only the memories needed. Lately does not sell your personal information.</p>
          <Link className="quiet-link" href="/privacy">Read the Privacy Policy <span aria-hidden>→</span></Link>
        </div>
      </section>
      <section id="download" className="download">
        <div className="download-inner">
          <div className="record-ring download-ring" aria-hidden><span className="download-plus">+</span><span className="hand-circle" /></div>
          <h2>Start with what happened today.</h2>
          <p>Lately is coming to iPhone and iPad.</p>
          <span className="primary-button">App Store — coming soon</span>
        </div>
      </section>
    </>
  );
}
