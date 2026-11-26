import { Fragment, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const WORDS = ["Full-stack", "Cloud", "DevOps", "Kubernetes", "React", "Node.js", "AWS", "CI/CD", "Terraform"];

function Row({ offset, className }: { offset: number; className: string }) {
  // two copies so the row can loop seamlessly at half its width
  const items = [...WORDS, ...WORDS];
  return (
    <div className={className}>
      {items.map((w, i) => (
        <Fragment key={i}>
          <span className={(i + offset) % 3 === 0 ? "f" : ""}>{w}</span>
          <b>✦</b>
        </Fragment>
      ))}
    </div>
  );
}

/** Big outlined words that drift sideways and speed up / skew with scroll velocity. */
export function BigMarquee() {
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = band.current;
    if (!el || prefersReducedMotion()) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".row"));
    const pos = rows.map(() => 0);
    let vel = 0;
    let lastY = scrollY;
    let visible = false;
    let raf = 0;

    const io = new IntersectionObserver((es) => (visible = es[0].isIntersecting));
    io.observe(el);
    const onScroll = () => {
      const d = scrollY - lastY;
      lastY = scrollY;
      vel = Math.max(-40, Math.min(40, vel + d * 0.15));
    };
    addEventListener("scroll", onScroll, { passive: true });

    const loop = () => {
      if (visible) {
        vel *= 0.92;
        rows.forEach((r, i) => {
          const dir = i % 2 ? 1 : -1;
          const w = r.scrollWidth / 2;
          pos[i] += dir * (0.6 + Math.abs(vel)) * (vel < 0 ? -1 : 1);
          if (pos[i] <= -w) pos[i] += w;
          if (pos[i] > 0) pos[i] -= w;
          r.style.transform = `translate3d(${pos[i].toFixed(1)}px,0,0) skewX(${(-vel * 0.4).toFixed(2)}deg)`;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="big-marquee" aria-hidden="true" ref={band}>
      <Row offset={0} className="row" />
      <Row offset={1} className="row r2" />
    </div>
  );
}

type P = { tx: number; ty: number; x: number; y: number; vx: number; vy: number; c: number };

/** "ANURAG" drawn in particles that scatter away from the cursor and spring back. */
export function ParticleName() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = prefersReducedMotion();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const mouse = { x: -9999, y: -9999 };
    let P: P[] = [];
    let W = 0;
    let H = 0;
    let running = false;
    let inView = false;
    let entered = false;
    let disposed = false;

    const token = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    const draw = () => {
      const a = token("--accent");
      const c = token("--signal");
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        ctx.fillStyle = p.c === 1 ? "#a855f7" : p.c === 2 ? c : a;
        ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
      }
    };

    const build = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      if (!W || !H) return;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d")!;
      const fs = Math.min(H * 0.72, W / 5.2);
      o.font = `800 ${fs}px "Bricolage Grotesque", system-ui, sans-serif`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillText("ANURAG", W / 2, H / 2);
      const data = o.getImageData(0, 0, W, H).data;
      const gap = W < 640 ? 5 : 6;
      const old = P;
      const next: P[] = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap)
          if (data[(y * W + x) * 4 + 3] > 128) {
            const i = next.length;
            const q = old[i];
            next.push({ tx: x, ty: y, x: q ? q.x : Math.random() * W, y: q ? q.y : Math.random() * H, vx: 0, vy: 0, c: i % 7 === 0 ? 1 : i % 11 === 0 ? 2 : 0 });
          }
      P = next;
      if (reduce) {
        P.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
        draw();
      }
    };

    const step = () => {
      if (!inView || disposed) {
        running = false;
        return;
      }
      for (const p of P) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 6400) {
          const f = ((6400 - d2) / 6400) * 6;
          const d = Math.sqrt(d2) || 1;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (p.tx - p.x) * 0.045;
        p.vy += (p.ty - p.y) * 0.045;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw();
      requestAnimationFrame(step);
    };
    const start = () => {
      if (!running && !reduce) {
        running = true;
        requestAnimationFrame(step);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => (mouse.x = mouse.y = -9999);
    const onClick = () => {
      P.forEach((p) => ((p.vx += (Math.random() - 0.5) * 60), (p.vy += (Math.random() - 0.5) * 60)));
      start();
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("click", onClick);

    const io = new IntersectionObserver((es) => {
      inView = es[0].isIntersecting;
      if (inView) {
        if (!entered) {
          // first time on screen: fly in from random positions
          entered = true;
          P.forEach((p) => ((p.x = Math.random() * W), (p.y = Math.random() * H)));
        }
        start();
      }
    });
    io.observe(cv);

    // redraw in the new colours when the day/night switch flips
    const mo = new MutationObserver(() => setTimeout(draw, 650));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(build, 200);
    };
    addEventListener("resize", onResize);
    (document.fonts?.ready ?? Promise.resolve()).then(() => !disposed && build());

    return () => {
      disposed = true;
      io.disconnect();
      mo.disconnect();
      removeEventListener("resize", onResize);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <section className="particles" aria-label="My name drawn in particles">
      <canvas ref={canvas} />
      <span className="hint">move your cursor through it · click to scatter</span>
    </section>
  );
}
