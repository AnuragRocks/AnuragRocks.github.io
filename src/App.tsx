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
import { BigMarquee, ParticleName } from "@/components/MotionBands";
import { Cursor, ShipPipeline, useTimelineDraw, usePhotoParallax } from "@/components/MotionExtras";

export default function App() {
  // Bumped when the ~/anurag logo is clicked: the hero closes the chat and replays its intro.
  const [replay, setReplay] = useState(0);
  useSiteMotion();
  useTimelineDraw();
  usePhotoParallax();

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <Header onReplay={() => setReplay((n) => n + 1)} />
      <main id="top">
        <AskSection replay={replay} />
        <Ticker />
        <Stats />
        <SectionNav />
        <About />
        <BigMarquee />
        <Work />
        <Skills />
        <ShipPipeline />
        <Lab />
        <Journey />
        <Contact />
      </main>
      <ParticleName />
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
