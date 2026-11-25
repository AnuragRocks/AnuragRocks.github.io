import { useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const css = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Breadth-first search walking a complete binary tree, top left of the hero. */
export function BfsTree() {
  const vals = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85];
  const W = 250;
  const pos = vals.map((_, i) => {
    const d = Math.floor(Math.log2(i + 1));
    const k = i - (2 ** d - 1);
    return [(W * (k + 0.5)) / 2 ** d, 16 + d * 58];
  });
  // index of the node being visited; -1 before the walk starts, past the end while pausing
  const [i, setI] = useState(-1);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let step = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const tick = () => setI(step++ % (vals.length + 3));
    const t = setTimeout(() => {
      tick();
      iv = setInterval(tick, 700);
    }, 2200);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [vals.length]);

  const shown = i < 0 ? "50 30 70 20 40 60 80 …" : vals.slice(0, Math.min(i, vals.length - 1) + 1).join(" ");

  return (
    <div className="ds ds-tree" aria-hidden="true">
      <svg viewBox={`0 0 ${W} 210`} width="100%">
        <g>
          {vals.map((_, j) => {
            if (j === 0) return null;
            const p = (j - 1) >> 1;
            const len = Math.hypot(pos[j][0] - pos[p][0], pos[j][1] - pos[p][1]);
            return (
              <line
                key={j}
                x1={pos[p][0]} y1={pos[p][1]} x2={pos[j][0]} y2={pos[j][1]}
                className={"edge" + (i >= 0 && j <= i ? " hot" : "")}
                style={css({ "--len": len.toFixed(0), "--d": (0.15 * Math.floor(Math.log2(j + 1))).toFixed(2) + "s" })}
              />
            );
          })}
        </g>
        <g>
          {vals.map((v, j) => (
            <g
              key={j}
              className={"node" + (j === i ? " hot" : i >= 0 && j < i ? " seen" : "")}
              style={css({ "--d": (0.12 * j).toFixed(2) + "s" })}
            >
              <circle cx={pos[j][0]} cy={pos[j][1]} r={j < 7 ? 13 : 11} />
              <text x={pos[j][0]} y={pos[j][1]}>{v}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="cap">
        bfs(root) → <b>{shown}</b>
      </div>
    </div>
  );
}

const N: Record<string, [number, number]> = {
  user: [20, 30], cdn: [110, 20], lb: [200, 60], api: [120, 105],
  cache: [30, 130], db: [210, 160], queue: [100, 190], worker: [25, 215],
};
const E: Array<[string, string]> = [
  ["user", "cdn"], ["cdn", "lb"], ["lb", "api"], ["cdn", "api"], ["api", "cache"],
  ["api", "db"], ["api", "queue"], ["queue", "worker"], ["worker", "db"], ["user", "cache"],
];
const PATH = ["user", "cdn", "api", "db"];

/** A request packet routed along the shortest path of a service graph, top right of the hero. */
export function RouteGraph() {
  const packet = useRef<SVGCircleElement>(null);
  const onPath = (a: string, b: string) => PATH.some((k, i) => k === a && PATH[i + 1] === b);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const pk = packet.current!;
    const seg = 900;
    let t0: number | null = null;
    let raf = 0;
    const frame = (ts: number) => {
      if (t0 === null) t0 = ts;
      const t = Math.max(0, ((ts - t0) % (seg * (PATH.length - 1) + 800)) / seg);
      const i = Math.floor(t);
      if (i < PATH.length - 1) {
        const a = N[PATH[i]], b = N[PATH[i + 1]], f = t - i;
        const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        pk.setAttribute("cx", String(a[0] + (b[0] - a[0]) * e));
        pk.setAttribute("cy", String(a[1] + (b[1] - a[1]) * e));
        pk.style.opacity = "1";
      } else pk.style.opacity = "0";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="ds ds-graph" aria-hidden="true">
      <svg viewBox="0 0 240 235" width="100%">
        <g>
          {E.map(([a, b], i) => {
            const len = Math.hypot(N[a][0] - N[b][0], N[a][1] - N[b][1]);
            return (
              <line
                key={a + b}
                x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]}
                className={"edge" + (onPath(a, b) ? " hot" : "")}
                style={css({ "--len": len.toFixed(0), "--d": (0.1 * i).toFixed(2) + "s" })}
              />
            );
          })}
        </g>
        <g>
          {Object.keys(N).map((k, i) => (
            <g key={k} className="node" style={css({ "--d": (0.1 * i).toFixed(2) + "s" })}>
              <circle cx={N[k][0]} cy={N[k][1]} r={17} />
              <text x={N[k][0]} y={N[k][1]} style={{ fontSize: "8.5px" }}>{k}</text>
            </g>
          ))}
        </g>
        <circle ref={packet} r={4.5} className="packet" cx={N.user[0]} cy={N.user[1]} />
      </svg>
      <div className="cap">
        dijkstra(user, db) → <b>user → cdn → api → db</b>
      </div>
    </div>
  );
}
