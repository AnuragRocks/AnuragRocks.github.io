import { useCallback, useState } from "react";
import SortPane, { type SortStats } from "./SortPane";
import BstPane from "./BstPane";

export default function Lab() {
  const [tab, setTab] = useState<"sort" | "bst">("sort");
  const [stats, setStats] = useState<SortStats>({ cmp: 0, swp: 0, n: 32 });
  const onStats = useCallback((s: SortStats) => setStats(s), []);

  return (
    <section className="block" id="lab">
      <div className="wrap">
        <p className="eyebrow">Playground</p>
        <h2>Algorithms, running live</h2>
        <p className="lab-intro">Pick an algorithm and watch it sort, or build a binary search tree and walk it in order. It's all running live in React on this page.</p>
        <div className="lab rv">
          <div className="lab-bar">
            <div className="tabs" role="tablist" aria-label="Playground">
              <button type="button" role="tab" id="tabSort" aria-selected={tab === "sort"} aria-controls="paneSort" onClick={() => setTab("sort")}>Sorting</button>
              <button type="button" role="tab" id="tabBst" aria-selected={tab === "bst"} aria-controls="paneBst" onClick={() => setTab("bst")}>Binary search tree</button>
            </div>
            <div className="lab-stats" style={{ visibility: tab === "sort" ? "visible" : "hidden" }}>
              <span>comparisons <b>{stats.cmp}</b></span>
              <span>swaps <b>{stats.swp}</b></span>
              <span>n <b>{stats.n}</b></span>
            </div>
          </div>
          <SortPane hidden={tab !== "sort"} onStats={onStats} />
          <BstPane hidden={tab !== "bst"} />
        </div>
      </div>
    </section>
  );
}
