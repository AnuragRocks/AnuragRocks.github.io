import { useRef, useState, type MouseEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const NAV = [
  ["#top", "Ask me"],
  ["#about", "About"],
  ["#work", "Work"],
  ["#skills", "Skills"],
  ["#lab", "Playground"],
  ["#notes", "Notes"],
  ["#journey", "Journey"],
  ["#contact", "Contact"],
];
const GLYPHS = "01<>{}[]#$%&*/\\|=+?";
const NAME = "anurag";

export default function Header({ onReplay }: { onReplay: () => void }) {
  const [night, setNight] = useState(false);
  const [name, setName] = useState(NAME);
  const [glitch, setGlitch] = useState(false);
  const busy = useRef(false);

  // day by default; night only when the visitor flips the switch
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theming");
    const on = root.classList.toggle("night");
    setNight(on);
    setTimeout(() => root.classList.remove("theming"), 650);
  };

  const scramble = () => {
    const total = 16;
    let frame = 0;
    setGlitch(true);
    const f = () => {
      frame++;
      let out = "";
      for (let i = 0; i < NAME.length; i++) {
        out += frame > (total * (i + 1)) / NAME.length ? NAME[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setName(out);
      if (frame < total + 2) setTimeout(f, 40);
      else {
        setName(NAME);
        setGlitch(false);
      }
    };
    f();
  };

  // click ~/anurag to scramble the logo, scroll home and replay the intro
  const onBrand = (e: MouseEvent) => {
    e.preventDefault();
    // on a case study or note page the logo just takes you home
    if (location.hash.startsWith("#/")) {
      location.hash = "#top";
      return;
    }
    if (busy.current) return;
    busy.current = true;
    setTimeout(() => (busy.current = false), 900);
    const reduce = prefersReducedMotion();
    const atTop = scrollY < 40;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (reduce) return onReplay();
    scramble();
    if (atTop) return onReplay();
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      clearTimeout(t);
      removeEventListener("scrollend", go);
      onReplay();
    };
    const t = setTimeout(go, 900);
    addEventListener("scrollend", go, { once: true });
  };

  return (
    <header className="top">
      <div className="wrap">
        <a className={"brand" + (glitch ? " glitch" : "")} href="#top" aria-label="Back to the start" onClick={onBrand}>
          <b>~/</b>
          <span className="brand-name">{name}</span>
        </a>
        <div className="nav-right">
          <nav aria-label="Sections">
            <ul>
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <button className="mode" type="button" role="switch" aria-checked={night} aria-label="Night mode" onClick={toggleTheme}>
            <span className="knob">
              <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
              <svg className="moon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
