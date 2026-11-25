import { useEffect } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * Page-wide progressive enhancements, ported from the original vanilla script:
 * scroll progress bar, scroll reveal, heading underline sweep, 3D tilt with glare,
 * magnetic primary buttons and click ripples.
 * Tilt, magnet and ripple use event delegation, so elements React mounts later
 * (chat cards, replayed intro tiles) pick them up too.
 */
export function useSiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = prefersReducedMotion();
    const fine = hasFinePointer();
    const cleanups: Array<() => void> = [];

    // scroll progress
    const bar = document.querySelector<HTMLElement>(".progress");
    const onScroll = () => {
      const m = root.scrollHeight - innerHeight;
      bar?.style.setProperty("--p", m > 0 ? (scrollY / m).toFixed(4) : "0");
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => removeEventListener("scroll", onScroll));

    if ("IntersectionObserver" in window) {
      // scroll reveal (content stays readable before it animates)
      document
        .querySelectorAll(".stat, #projects .card, .skills>div, .tl li, .archive, .contact, .about>*")
        .forEach((e) => e.classList.add("rv"));
      root.classList.add("js-reveal");
      const reveal = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              reveal.unobserve(e.target);
            }
          }),
        { rootMargin: "0px 0px -8% 0px" },
      );
      document.querySelectorAll<HTMLElement>(".rv").forEach((e, i) => {
        e.style.transitionDelay = (i % 4) * 60 + "ms";
        reveal.observe(e);
      });

      // heading underline sweep
      const heads = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            heads.unobserve(e.target);
            e.target.classList.add("in");
          }),
        { threshold: 0.6 },
      );
      document.querySelectorAll("section.block h2").forEach((e) => heads.observe(e));
      cleanups.push(() => {
        reveal.disconnect();
        heads.disconnect();
      });
    }

    if (fine && !reduce) {
      // 3D tilt + glare
      const TILT = "#projects .card, .tile, .stat, .lab, .pcard";
      let current: HTMLElement | null = null;
      const onMove = (e: PointerEvent) => {
        const el = (e.target as Element | null)?.closest<HTMLElement>(TILT) ?? null;
        if (current && current !== el) current.style.transform = "";
        current = el;
        if (!el) return;
        el.classList.add("tilt");
        const max = el.classList.contains("lab") ? 2.5 : el.classList.contains("tile") ? 10 : 6;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * max).toFixed(2)}deg) rotateY(${((x - 0.5) * max).toFixed(2)}deg) translateY(-3px)`;
        el.style.setProperty("--gx", x * 100 + "%");
        el.style.setProperty("--gy", y * 100 + "%");
      };
      const onLeave = () => {
        if (current) current.style.transform = "";
        current = null;
      };

      // magnetic primary buttons
      const MAGNET = ".send, .mode, .chip.go";
      let magnet: HTMLElement | null = null;
      const onMagnet = (e: PointerEvent) => {
        const el = (e.target as Element | null)?.closest<HTMLElement>(MAGNET) ?? null;
        if (magnet && magnet !== el) magnet.style.translate = "";
        magnet = el;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.18).toFixed(1)}px`;
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointermove", onMagnet);
      document.documentElement.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointermove", onMagnet);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });
    }

    // click ripple
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".chip,.tile,.btn,.send");
      if (!el || reduce) return;
      const r = el.getBoundingClientRect();
      const s = Math.max(r.width, r.height);
      const sp = document.createElement("span");
      sp.className = "rip";
      sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      el.appendChild(sp);
      setTimeout(() => sp.remove(), 650);
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    return () => cleanups.forEach((f) => f());
  }, []);
}
