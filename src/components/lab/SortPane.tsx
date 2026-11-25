import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { createSortEngine, type Algo } from "./sortEngine";

const NOTES: Record<Algo, [string, string]> = {
  bubble: ["O(n²)", "Bubble sort swaps neighbours until the largest values bubble to the end."],
  insertion: ["O(n²)", "Insertion sort grows a sorted prefix, sliding each new value into place."],
  merge: ["O(n log n)", "Merge sort splits the array in half, sorts each half and merges them."],
  quick: ["O(n log n)", "average. Quick sort partitions around a pivot, then recurses on each side."],
};
const ALGOS: Array<[Algo, string]> = [["bubble", "Bubble"], ["insertion", "Insertion"], ["merge", "Merge"], ["quick", "Quick"]];
const DELAYS = [0, 220, 150, 100, 70, 45, 30, 18, 10, 5, 2];

export type SortStats = { cmp: number; swp: number; n: number };

export default function SortPane({ hidden, onStats }: { hidden: boolean; onStats: (s: SortStats) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const speed = useRef<HTMLInputElement>(null);
  const engine = useRef<ReturnType<typeof createSortEngine> | null>(null);
  const [algo, setAlgo] = useState<Algo>("quick");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const n = innerWidth < 640 ? 20 : 32;
    const e = createSortEngine(host.current!, n, {
      delay: () => DELAYS[Number(speed.current?.value ?? 6)],
      onStats: (cmp, swp) => onStats({ cmp, swp, n }),
      onRunning: setRunning,
    });
    engine.current = e;

    // auto-play once when the playground scrolls into view
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window && !prefersReducedMotion()) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            io?.disconnect();
            if (!e.isRunning()) e.go();
          }
        },
        { threshold: 0.5 },
      );
      io.observe(host.current!);
    }
    return () => {
      io?.disconnect();
      e.destroy();
    };
  }, [onStats]);

  const [big, note] = NOTES[algo];
  return (
    <div className="lab-body" id="paneSort" role="tabpanel" aria-labelledby="tabSort" hidden={hidden}>
      <div className="bars" ref={host} aria-label="Array being sorted" />
      <div className="controls">
        {ALGOS.map(([a, label]) => (
          <button
            key={a}
            type="button"
            className="chip"
            aria-pressed={algo === a}
            onClick={() => {
              setAlgo(a);
              engine.current?.pick(a);
            }}
          >
            {label}
          </button>
        ))}
        <span className="sep" />
        <label className="speed" htmlFor="speed">
          speed <input type="range" id="speed" min={1} max={10} defaultValue={6} ref={speed} />
        </label>
        <button type="button" className="chip" onClick={() => engine.current?.shuffle()}>Shuffle</button>
        <button type="button" className="chip go" onClick={() => engine.current?.go()}>{running ? "■ Stop" : "▶ Sort"}</button>
      </div>
      <div className="legend">
        <span style={{ "--c": "var(--signal)" } as React.CSSProperties}>comparing</span>
        <span style={{ "--c": "#e11d48" } as React.CSSProperties}>swapping</span>
        <span style={{ "--c": "#7c3aed" } as React.CSSProperties}>pivot</span>
        <span style={{ "--c": "var(--ok)" } as React.CSSProperties}>sorted</span>
      </div>
      <p className="algo-note"><code>{big}</code> {note}</p>
    </div>
  );
}
