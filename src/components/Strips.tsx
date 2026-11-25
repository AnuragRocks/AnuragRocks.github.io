import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const TECH: Array<[string, string]> = [
  ["AWS", "#f59e0b"], ["Docker", "#0ea5e9"], ["Kubernetes", "#2446d8"], ["Terraform", "#7c3aed"],
  ["Ansible", "#e11d48"], ["GitHub Actions", "#16a34a"], ["React", "#06b6d4"], ["Node.js", "#22c55e"],
  ["TypeScript", "#3b82f6"], ["PostgreSQL", "#0369a1"], ["MongoDB", "#15803d"], ["FastAPI", "#0d9488"],
  ["Prometheus", "#ea580c"], ["Grafana", "#f97316"], ["Kafka", "#64748b"], ["Linux", "#eab308"],
];

export function Ticker() {
  const row = TECH.map(([t, c]) => <span key={t} style={{ "--c": c } as CSSProperties}>{t}</span>);
  return (
    <div className="ticker" aria-label="Tech I use">
      <div className="track">
        {row}
        {/* second copy makes the marquee loop seamlessly */}
        <div className="dup" aria-hidden="true" style={{ display: "contents" }}>{row}</div>
      </div>
    </div>
  );
}

/** Counts the first number in a stat up from zero when it scrolls into view. */
function CountUp({ text }: { text: string }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(text);
  useEffect(() => {
    const m = text.match(/^([^\d]*)(\d+)(.*)$/);
    const el = ref.current;
    if (!m || !el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const target = +m[2];
        const t0 = performance.now();
        const f = (ts: number) => {
          const p = Math.min(1, (ts - t0) / 1100), ease = 1 - Math.pow(1 - p, 3);
          setShown(m[1] + Math.round(target * ease) + m[3]);
          if (p < 1) raf = requestAnimationFrame(f);
        };
        raf = requestAnimationFrame(f);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);
  return <b ref={ref}>{shown}</b>;
}

const STATS = [
  ["6+", "full-stack apps shipped to production"],
  ["+15%", "production uptime"],
  ["−30%", "incident response time"],
  ["2h → 15m", "incident resolution, via 20+ scripts"],
];

export function Stats() {
  return (
    <div className="stats">
      <div className="wrap">
        {STATS.map(([n, label]) => (
          <div className="stat" key={label}>
            <CountUp text={n} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTIONS = ["about", "work", "skills", "lab", "journey", "contact"];
const LABELS: Record<string, string> = { lab: "playground" };

/** Section nav drawn as a linked list; the node for the section in view lights up. */
export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
    return () => io.disconnect();
  }, []);
  return (
    <div className="ll-wrap">
      <nav className="ll wrap" aria-label="Page sections">
        <span className="lbl">head →</span>
        {SECTIONS.map((id) => (
          <Fragment key={id}>
            <a href={"#" + id} className={active === id ? "on" : undefined}>
              <span>{LABELS[id] ?? id}</span>
              <i>•</i>
            </a>
            <span className="arr" />
          </Fragment>
        ))}
        <span className="null">null</span>
      </nav>
    </div>
  );
}
