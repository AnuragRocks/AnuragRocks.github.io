import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/** Heading whose words rise out of a mask one after another when it scrolls into view. */
export function SplitHeading({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return setOn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const words = text.split(" ");
  return (
    <h2 ref={ref} className={"split" + (on ? " split-in" : "")} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span style={{ "--i": i } as CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </h2>
  );
}

/** A soft ring that trails the cursor, swells over anything clickable and labels project cards. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion());

  useEffect(() => {
    const r = ring.current;
    const d = dot.current;
    if (!enabled || !r || !d) return;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let idle = true;

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      r.style.transform = `translate3d(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px,0)`;
      if (Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) < 0.2) {
        idle = true;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const classify = (t: Element | null) => {
      const card = t?.closest("#projects .card");
      const hot = t?.closest("a,button,[role=switch],.tile,.chip,input,textarea");
      r.classList.toggle("c-card", !!card && !hot);
      d.classList.toggle("off", !!card && !hot);
      r.classList.toggle("c-hot", !!hot);
      r.classList.toggle("c-ghost", !!t?.closest(".particles canvas"));
    };
    // scrolling moves the page under a still cursor, so re-check what it is over
    const onScroll = () => classify(document.elementFromPoint(target.x, target.y));
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      d.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      document.body.classList.add("has-cursor");
      classify(e.target as Element | null);
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };
    const onLeave = () => document.body.classList.remove("has-cursor");
    const onDown = () => r.classList.add("c-down");
    const onUp = () => r.classList.remove("c-down");
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div className="cur-ring" ref={ring} aria-hidden="true"><span>explore</span></div>
      <div className="cur-dot" ref={dot} aria-hidden="true" />
    </>
  );
}

const STAGES = [
  { n: "01", cmd: "git push", title: "Commit", text: "Small branches and reviewed pull requests. Every push kicks off the pipeline.", tools: ["Git", "GitHub", "GitLab"] },
  { n: "02", cmd: "npm ci && build", title: "Build", text: "CI on GitHub Actions or GitLab builds the app the same way every time.", tools: ["GitHub Actions", "GitLab CI", "Jenkins"] },
  { n: "03", cmd: "vitest run", title: "Test", text: "Integration tests run against a real Postgres 16 service container, with Prisma migrations applied first.", tools: ["Vitest", "Supertest", "PostgreSQL"] },
  { n: "04", cmd: "docker build", title: "Package", text: "Multi-stage images that run as a non-root user. Release bundles get SHA-256 checksums and signed APKs.", tools: ["Docker", "Compose", "SHA-256"] },
  { n: "05", cmd: "terraform apply", title: "Deploy", text: "Infrastructure as code on AWS, workloads on Kubernetes, frontends on Vercel and APIs on Render.", tools: ["Terraform", "Ansible", "Kubernetes", "AWS"] },
  { n: "06", cmd: "watch -n1 metrics", title: "Observe", text: "Dashboards, alerts and runbooks. This is where uptime went up 15% and response time fell 30%.", tools: ["Prometheus", "Grafana", "Linux"] },
];

/**
 * "How I ship" as a CI/CD pipeline. On wide screens the section pins while vertical scroll
 * slides the stages sideways and a packet travels down the rail. Elsewhere it is a swipeable row.
 */
export function ShipPipeline() {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current;
    const t = track.current;
    if (!o || !t) return;
    const mq = matchMedia("(min-width: 860px) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    let dist = 0;

    const measure = () => {
      if (!mq.matches) {
        o.style.height = "";
        t.style.transform = "";
        o.classList.remove("pinned");
        return;
      }
      o.classList.add("pinned");
      dist = Math.max(0, t.scrollWidth - innerWidth + 64);
      o.style.height = `${innerHeight + dist}px`;
      update();
    };
    const update = () => {
      raf = 0;
      if (!mq.matches) return;
      const top = o.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, -top / Math.max(1, dist)));
      t.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      o.style.setProperty("--pp", p.toFixed(4));
      const active = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length + 0.15));
      t.querySelectorAll(".stage").forEach((s, i) => s.classList.toggle("lit", i <= active));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section className="ship" ref={outer} aria-labelledby="ship-h">
      <div className="ship-stick">
        <div className="wrap ship-head">
          <p className="eyebrow">How I ship</p>
          <h2 id="ship-h">From <code>git push</code> to production</h2>
          <p className="ship-sub">The same pipeline sits behind most of my projects. Keep scrolling to run it.</p>
        </div>
        <div className="ship-rail" aria-hidden="true"><i /></div>
        <div className="ship-track" ref={track}>
          {STAGES.map((s) => (
            <article className="stage" key={s.n}>
              <span className="n">{s.n}</span>
              <code className="cmd">$ {s.cmd}</code>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <div className="stack">{s.tools.map((x) => <span key={x}>{x}</span>)}</div>
              <span className="ok">✓ passed</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Journey timeline: the line draws itself as you scroll and each stop lights up as the line reaches it. */
export function useTimelineDraw() {
  useEffect(() => {
    const tl = document.querySelector<HTMLElement>(".tl");
    if (!tl || prefersReducedMotion()) return;
    tl.classList.add("draw");
    const items = Array.from(tl.querySelectorAll<HTMLElement>("li"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = tl.getBoundingClientRect();
      const line = innerHeight * 0.6 - r.top;
      tl.style.setProperty("--tp", Math.min(1, Math.max(0, line / r.height)).toFixed(4));
      items.forEach((li) => li.classList.toggle("lit", li.offsetTop + 8 <= line));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);
}

/** About photo drifts a little slower than the page while it is on screen. */
export function usePhotoParallax() {
  useEffect(() => {
    const fig = document.querySelector<HTMLElement>(".photo");
    if (!fig || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = fig.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      fig.style.setProperty("--py", (p * 30).toFixed(1) + "px");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
    };
  }, []);
}
