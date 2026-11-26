import { useState } from "react";
import { useSiteMotion } from "@/hooks/useSiteMotion";
import Header from "@/components/Header";
import AskSection from "@/components/ask/AskSection";
import { Ticker, Stats, SectionNav } from "@/components/Strips";
import About from "@/components/About";
import Work from "@/components/Work";
import Skills from "@/components/Skills";
import Lab from "@/components/lab/Lab";
import Journey from "@/components/Journey";
import Contact from "@/components/Contact";
import GitHubActivity from "@/components/GitHubActivity";
import { BigMarquee, ParticleName } from "@/components/MotionBands";
import { Cursor, ShipPipeline, useTimelineDraw, usePhotoParallax } from "@/components/MotionExtras";
import { CaseStudyPage, NotePage, NotesSection } from "@/components/Pages";
import { useRoute } from "@/lib/route";

function Home({ replay }: { replay: number }) {
  // these hooks look up elements on the home page, so they run whenever it mounts
  useSiteMotion();
  useTimelineDraw();
  usePhotoParallax();
  return (
    <>
      <main id="top">
        <AskSection replay={replay} />
        <Ticker />
        <Stats />
        <SectionNav />
        <About />
        <BigMarquee />
        <Work />
        <GitHubActivity />
        <Skills />
        <ShipPipeline />
        <Lab />
        <NotesSection />
        <Journey />
        <Contact />
      </main>
      <ParticleName />
    </>
  );
}

export default function App() {
  // Bumped when the ~/anurag logo is clicked: the hero closes the chat and replays its intro.
  const [replay, setReplay] = useState(0);
  const route = useRoute();

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <Header onReplay={() => setReplay((n) => n + 1)} />
      {route.page === "home" && <Home replay={replay} />}
      {route.page === "case" && <main id="top" key={route.slug}><CaseStudyPage slug={route.slug} /></main>}
      {route.page === "note" && <main id="top" key={route.slug}><NotePage slug={route.slug} /></main>}
      <Cursor />
      <footer>
        <div className="wrap">
          <span>© 2026 Anurag Sharma</span>
          <span>return 0; // built by hand with React + Vite</span>
        </div>
      </footer>
    </>
  );
}
