import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { sleep } from "@/lib/motion";

type Node = { v: number; l: Node | null; r: Node | null; d: number };

const ins = (n: Node | null, v: number, d: number): Node => {
  if (!n) return { v, l: null, r: null, d };
  if (v < n.v) n.l = ins(n.l, v, d + 1);
  else if (v > n.v) n.r = ins(n.r, v, d + 1);
  return n;
};
const has = (n: Node | null, v: number) => {
  while (n) {
    if (v === n.v) return true;
    n = v < n.v ? n.l : n.r;
  }
  return false;
};
const depth = (n: Node | null): number => (n ? 1 + Math.max(depth(n.l), depth(n.r)) : 0);
const inorder = (n: Node | null, a: Node[] = []): Node[] => {
  if (n) {
    inorder(n.l, a);
    a.push(n);
    inorder(n.r, a);
  }
  return a;
};
const clone = (n: Node | null): Node | null => (n ? { ...n, l: clone(n.l), r: clone(n.r) } : null);
const seed = () => [50, 30, 70, 20, 40, 60, 80, 35, 65].reduce<Node | null>((t, v) => ins(t, v, 0), null);

/** Build a binary search tree one value at a time, then walk it in order. */
export default function BstPane({ hidden }: { hidden: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const tree = useRef<Node | null>(seed());
  const count = useRef(9);
  const busy = useRef(false);
  const [, rerender] = useState(0);
  const [size, setSize] = useState({ w: 600, h: 260 });
  const [hot, setHot] = useState<number | null>(null);
  const [vis, setVis] = useState<Set<number>>(new Set());
  const [newV, setNewV] = useState<number | null>(null);
  const [out, setOut] = useState<ReactNode>("Insert values, then run an in-order walk. A BST always reads back sorted.");
  const input = useRef<HTMLInputElement>(null);

  // measure when the tab is shown and on resize, like the original redraw
  useLayoutEffect(() => {
    if (hidden) return;
    const measure = () => {
      const el = svg.current;
      if (el) setSize({ w: el.clientWidth || 600, h: el.clientHeight || 260 });
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [hidden]);

  const add = async (raw: string | number) => {
    if (busy.current) return;
    const v = Math.round(+raw);
    if (!(v >= 1 && v <= 99)) return setOut("Enter a whole number from 1 to 99.");
    if (has(tree.current, v)) return setOut(`${v} is already in the tree. BSTs keep values unique here.`);
    if (count.current >= 15 || (tree.current && depth(ins(clone(tree.current), v, 0)) > 6))
      return setOut("The tree is full for this demo. Reset to start again.");
    busy.current = true;
    setVis(new Set());
    let n = tree.current;
    const path: number[] = [];
    while (n) {
      path.push(n.v);
      setHot(n.v);
      setOut(`insert ${v}: ${path.join(" → ")}${v < n.v ? " (go left)" : " (go right)"}`);
      await sleep(380);
      setHot(null);
      n = v < n.v ? n.l : n.r;
    }
    tree.current = ins(tree.current, v, 0);
    count.current++;
    setNewV(v);
    rerender((x) => x + 1);
    const c = count.current;
    setOut(<>inserted <b>{v}</b> at depth {path.length}. {c} node{c > 1 ? "s" : ""}.</>);
    busy.current = false;
  };

  const walk = async () => {
    if (busy.current || !tree.current) return;
    busy.current = true;
    const list = inorder(tree.current);
    const seen: number[] = [];
    setVis(new Set());
    for (const n of list) {
      seen.push(n.v);
      setVis(new Set(seen));
      setOut(<>in-order: <b>{seen.join(", ")}</b></>);
      await sleep(320);
    }
    setOut(<>in-order: <b>{seen.join(", ")}</b>. Sorted, every time.</>);
    busy.current = false;
  };

  const reset = () => {
    if (busy.current) return;
    tree.current = null;
    count.current = 0;
    setVis(new Set());
    setNewV(null);
    rerender((x) => x + 1);
    setOut("Tree cleared. Insert a value to start.");
  };

  const insertRandom = () => {
    let v: number, k = 0;
    do {
      v = 1 + Math.floor(Math.random() * 99);
      k++;
    } while (has(tree.current, v) && k < 50);
    add(v);
  };

  // layout: x by in-order rank, y by depth
  const list = inorder(tree.current);
  const D = depth(tree.current);
  const dx = size.w / (list.length + 1);
  const dy = Math.min(56, (size.h - 30) / Math.max(1, D - 1 || 1));
  const at = new Map(list.map((n, i) => [n.v, { x: dx * (i + 1), y: 18 + n.d * dy }]));

  return (
    <div className="lab-body" id="paneBst" role="tabpanel" aria-labelledby="tabBst" hidden={hidden}>
      <svg className="bst-svg" ref={svg} role="img" aria-label="Binary search tree">
        <g>
          {list.flatMap((n) =>
            [n.l, n.r].filter((c): c is Node => !!c).map((c) => (
              <line
                key={c.v}
                className={"e" + (vis.has(c.v) ? " hot" : "")}
                x1={at.get(n.v)!.x} y1={at.get(n.v)!.y} x2={at.get(c.v)!.x} y2={at.get(c.v)!.y}
              />
            )),
          )}
        </g>
        <g>
          {list.map((n) => {
            const p = at.get(n.v)!;
            const cls = "n" + (n.v === newV ? " new" : "") + (n.v === hot ? " hot" : "") + (vis.has(n.v) ? " vis" : "");
            return (
              <g key={n.v} className={cls}>
                <circle cx={p.x} cy={p.y} r={15} />
                <text x={p.x} y={p.y}>{n.v}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="controls">
        <label className="sr" htmlFor="bstIn">Value to insert</label>
        <input
          className="bst-in" id="bstIn" type="number" min={1} max={99} placeholder="1–99" ref={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              add(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
        <button
          type="button" className="chip go"
          onClick={() => {
            const el = input.current!;
            add(el.value);
            el.value = "";
            el.focus();
          }}
        >
          Insert
        </button>
        <button type="button" className="chip" onClick={insertRandom}>Insert random</button>
        <span className="sep" />
        <button type="button" className="chip" onClick={walk}>In-order walk</button>
        <button type="button" className="chip" onClick={reset}>Reset</button>
      </div>
      <p className="out">{out}</p>
    </div>
  );
}
