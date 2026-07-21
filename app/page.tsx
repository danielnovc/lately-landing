import { Hero } from "@/components/landing/Hero";
import { JourneyPreview } from "@/components/landing/JourneyPreview";
import { Waitlist } from "@/components/landing/Waitlist";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="relative flex-1 overflow-x-hidden">
      <Hero />
      <JourneyPreview />
      <Waitlist />
      <SiteFooter />
    </main>
  );
}
