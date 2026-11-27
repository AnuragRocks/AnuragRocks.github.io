import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import headshot from "@/assets/headshot.jpg";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { answer, intent, type Intent } from "./answers";
import { BfsTree, RouteGraph } from "./HeroFigures";

type Ask = (text: string, key?: Intent) => void;
type Msg = { id: number; from: "me"; text: string } | { id: number; from: "bot"; intent: Intent | null };

const icon = (paths: ReactNode, color: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
);
const TILES: Array<[string, Intent, ReactNode]> = [
  ["Me", "me", icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>, "#0f9d76")],
  ["Projects", "projects", icon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>, "#2446d8")],
  ["Experience", "experience", icon(<><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></>, "#c2410c")],
  ["Skills", "skills", icon(<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>, "#7c3aed")],
  ["Fun", "fun", icon(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></>, "#db2777")],
  ["Contact", "contact", icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, "#b45309")],
];

function Tiles({ ask }: { ask: Ask }) {
  return (
    <div className="tiles">
      {TILES.map(([label, key, svg]) => (
        <button key={key} type="button" className="tile" onClick={() => ask(label, key)}>
          {svg}
          {label}
        </button>
      ))}
    </div>
  );
}

function AskBar({ ask, id, label, placeholder }: { ask: Ask; id: string; label: string; placeholder: string }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="askbar"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        ask(value);
        setValue("");
      }}
    >
      <label className="sr" htmlFor={id}>{label}</label>
      <input id={id} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
      <button className="send" type="submit" aria-label="Send question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}

/** Headline split into letters that rise in; the last word gets the accent underline. */
function SplitHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  let n = 0;
  return (
    <h1 className="role" aria-label={text}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span className={"w" + (wi === words.length - 1 ? " grad" : "")} aria-hidden="true">
            {w.split("").map((c, ci) => (
              <span key={ci} className="ch" style={{ "--i": n++ } as CSSProperties}>{c}</span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}

const TYPED = ["React + Node apps", "CI/CD pipelines", "Kubernetes deployments", "REST APIs that scale", "Terraform-built infra", "dashboards that stay live"];

function Typer() {
  const [text, setText] = useState(() => (prefersReducedMotion() ? TYPED[0] : ""));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let li = 0, ci = 0, del = false;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      const w = TYPED[li];
      if (!del) {
        ci++;
        setText(w.slice(0, ci));
        if (ci === w.length) {
          del = true;
          t = setTimeout(step, 1600);
          return;
        }
      } else {
        ci--;
        setText(w.slice(0, ci));
        if (ci === 0) {
          del = false;
          li = (li + 1) % TYPED.length;
        }
      }
      t = setTimeout(step, del ? 35 : 70);
    };
    step();
    return () => clearTimeout(t);
  }, []);
  return (
    <p className="typer" aria-live="off">
      &gt; currently building <span className="t">{text}</span>
      <span className="caret" aria-hidden="true" />
    </p>
  );
}

function Landing({ ask, hidden, burst }: { ask: Ask; hidden: boolean; burst: boolean }) {
  return (
    <div className="landing" hidden={hidden}>
      <span className="status"><span className="dot" aria-hidden="true" />Open to full-stack, DevOps &amp; cloud roles</span>
      <div className={"orbit-wrap" + (burst ? " burst" : "")}>
        <span className="orbit" aria-hidden="true"><i /><i /></span>
        <span className="orbit o2" aria-hidden="true"><i /></span>
        <img className="avatar-xl" src={headshot} alt="Anurag Sharma" width={320} height={320} />
      </div>
      <p className="hello">Hey, I'm Anurag Sharma <span className="wave" aria-hidden="true">👋</span></p>
      <SplitHeadline text="Full-Stack & Cloud Engineer" />
      <p className="lede">I build full-stack apps with React and Node, and run them on AWS, Docker and Kubernetes. Ask me anything below.</p>
      <Typer />
      <AskBar ask={ask} id="ask1" label="Ask me anything" placeholder="Ask me anything… try “what's your Kubernetes experience?”" />
      <Tiles ask={ask} />
      <a className="scroll-hint" href="#about">or scroll for the full portfolio ↓</a>
    </div>
  );
}

function BotMessage({ intent: k, ask, log }: { intent: Intent | null; ask: Ask; log: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bot = ref.current, l = log.current;
    if (!k || !bot || !l) return;
    bot.scrollIntoView({ block: "nearest" });
    l.scrollTop = bot.offsetTop - l.offsetTop - 8;
  }, [k, log]);
  return (
    <div className="msg bot" ref={ref}>
      <img src={headshot} alt="" width={32} height={32} />
      <div className="body">
        {k ? (
          answer(k, (q) => ask(q)).map((part, i) => <Fragment key={i}>{part}</Fragment>)
        ) : (
          <div className="bubble typing" aria-label="Typing"><i /><i /><i /></div>
        )}
      </div>
    </div>
  );
}

/** The "ask me anything" hero: a landing that opens into a scripted chat. */
export default function AskSection({ replay }: { replay: number }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [landingKey, setLandingKey] = useState(0);
  const [burst, setBurst] = useState(false);
  const section = useRef<HTMLElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const watermark = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const ask: Ask = (raw, key) => {
    const text = String(raw).trim();
    if (!text) return;
    setOpen(true);
    const id = nextId.current;
    nextId.current += 2;
    const k = key ?? intent(text);
    setMsgs((m) => [...m, { id, from: "me", text }, { id: id + 1, from: "bot", intent: null }]);
    setTimeout(() => {
      setMsgs((m) => m.map((x) => (x.id === id + 1 ? { ...x, intent: k } : x)));
      if (k === "all") setTimeout(() => document.getElementById("work")?.scrollIntoView(), 300);
    }, prefersReducedMotion() ? 0 : 650);
    const s = section.current;
    if (s && s.getBoundingClientRect().top < -40) s.scrollIntoView();
  };

  const restart = () => {
    setMsgs([]);
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [msgs.length]);

  // logo click: close the chat and replay the intro animations
  useEffect(() => {
    if (!replay) return;
    restart();
    setLandingKey((k) => k + 1);
    setBurst(true);
    const t = setTimeout(() => setBurst(false), 2300);
    return () => clearTimeout(t);
  }, [replay]);

  const onPointerMove = (e: React.PointerEvent) => {
    // ink reveal: colour floods into the SHARMA watermark under the cursor (or finger).
    // It only follows the pointer, so it stays on for every device and motion setting.
    const wm = watermark.current;
    if (wm) {
      const w = wm.getBoundingClientRect();
      wm.style.setProperty("--wx", e.clientX - w.left + "px");
      wm.style.setProperty("--wy", e.clientY - w.top + "px");
    }
    if (!hasFinePointer() || prefersReducedMotion() || !section.current || !spot.current) return;
    const r = section.current.getBoundingClientRect();
    spot.current.style.setProperty("--sx", e.clientX - r.left + "px");
    spot.current.style.setProperty("--sy", e.clientY - r.top + "px");
  };
  const onPointerLeave = () => watermark.current?.style.setProperty("--wx", "-999px");

  return (
    <section className={"ask" + (burst ? " flash" : "")} aria-label="Ask Anurag" ref={section} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className="grid-floor" aria-hidden="true" />
      <div className="beams" aria-hidden="true"><i /><i /><i /></div>
      <div className="spot" aria-hidden="true" ref={spot} />
      <div className="watermark" aria-hidden="true" ref={watermark}>SHARMA</div>
      <BfsTree />
      <RouteGraph />
      <div className="wrap">
        <Landing key={landingKey} ask={ask} hidden={open} burst={burst} />
        <div className="chat" hidden={!open}>
          <div className="chat-top">
            <div className="who">
              <img src={headshot} alt="" width={40} height={40} />
              <div>Anurag Sharma<small>Answers drawn from my résumé and GitHub</small></div>
            </div>
            <button className="ghost-btn" type="button" onClick={restart}>Start over</button>
          </div>
          <div className="log" aria-live="polite" ref={log}>
            {msgs.map((m) =>
              m.from === "me" ? (
                <div key={m.id} className="msg me"><div className="bubble">{m.text}</div></div>
              ) : (
                <BotMessage key={m.id} intent={m.intent} ask={ask} log={log} />
              ),
            )}
          </div>
          <Tiles ask={ask} />
          <AskBar ask={ask} id="ask2" label="Ask another question" placeholder="Ask me anything…" />
        </div>
      </div>
    </section>
  );
}
