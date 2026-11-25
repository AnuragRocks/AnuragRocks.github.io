import { sleep } from "@/lib/motion";

export type Algo = "bubble" | "insertion" | "merge" | "quick";

type Hooks = {
  delay: () => number;
  onStats: (cmp: number, swp: number) => void;
  onRunning: (running: boolean) => void;
};

/**
 * Animated sorting visualiser. It owns the bar elements inside `host` and mutates them
 * directly, because it updates heights and colours every few milliseconds.
 * React only renders the controls around it.
 */
export function createSortEngine(host: HTMLElement, n: number, hooks: Hooks) {
  let arr: number[] = [];
  let bars: HTMLElement[] = [];
  let running = false;
  let cmp = 0, swp = 0, token = 0;
  let algo: Algo = "quick";

  const stats = () => hooks.onStats(cmp, swp);
  const setRunning = (r: boolean) => {
    running = r;
    hooks.onRunning(r);
  };
  const build = () => {
    host.innerHTML = "";
    bars = arr.map((v) => {
      const b = document.createElement("i");
      b.style.height = v + "%";
      host.appendChild(b);
      return b;
    });
  };
  const shuffle = () => {
    token++;
    setRunning(false);
    arr = Array.from({ length: n }, () => 8 + Math.round(Math.random() * 92));
    cmp = 0;
    swp = 0;
    stats();
    build();
  };
  const mark = (i: number, c = "") => {
    if (bars[i]) bars[i].className = c;
  };
  const setH = (i: number) => (bars[i].style.height = arr[i] + "%");
  const C = async (i: number, j: number, t: number) => {
    cmp++;
    stats();
    mark(i, "cmp");
    mark(j, "cmp");
    await sleep(hooks.delay());
    if (t !== token) throw 0;
  };
  const S = async (i: number, j: number, t: number) => {
    swp++;
    stats();
    [arr[i], arr[j]] = [arr[j], arr[i]];
    mark(i, "swp");
    mark(j, "swp");
    setH(i);
    setH(j);
    await sleep(hooks.delay());
    if (t !== token) throw 0;
  };
  const clear = (a: number, b: number) => {
    for (let k = a; k <= b; k++) if (bars[k].className !== "ok") mark(k, "");
  };

  const ALGOS: Record<Algo, (t: number) => Promise<void>> = {
    bubble: async (t) => {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          await C(j, j + 1, t);
          if (arr[j] > arr[j + 1]) await S(j, j + 1, t);
          clear(j, j + 1);
        }
        mark(n - i - 1, "ok");
      }
    },
    insertion: async (t) => {
      for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0) {
          await C(j - 1, j, t);
          if (arr[j - 1] > arr[j]) {
            await S(j - 1, j, t);
            clear(j - 1, j);
            j--;
          } else {
            clear(j - 1, j);
            break;
          }
        }
      }
      for (let k = 0; k < n; k++) mark(k, "ok");
    },
    merge: async (t) => {
      const ms = async (l: number, r: number): Promise<void> => {
        if (l >= r) return;
        const m = (l + r) >> 1;
        await ms(l, m);
        await ms(m + 1, r);
        const L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < L.length && j < R.length) {
          cmp++;
          stats();
          mark(k, "cmp");
          await sleep(hooks.delay());
          if (t !== token) throw 0;
          arr[k] = L[i] <= R[j] ? L[i++] : R[j++];
          swp++;
          setH(k);
          mark(k, "swp");
          await sleep(hooks.delay());
          mark(k, "");
          k++;
        }
        while (i < L.length) { arr[k] = L[i++]; setH(k); k++; }
        while (j < R.length) { arr[k] = R[j++]; setH(k); k++; }
        if (l === 0 && r === n - 1) for (let q = 0; q < n; q++) mark(q, "ok");
      };
      await ms(0, n - 1);
    },
    quick: async (t) => {
      const qs = async (l: number, r: number): Promise<void> => {
        if (l > r) return;
        if (l === r) return mark(l, "ok");
        const p = arr[r];
        let i = l;
        mark(r, "pv");
        for (let j = l; j < r; j++) {
          await C(j, r, t);
          mark(r, "pv");
          if (arr[j] < p) {
            if (i !== j) await S(i, j, t);
            i++;
          }
          clear(l, r - 1);
        }
        await S(i, r, t);
        clear(l, r);
        mark(i, "ok");
        await qs(l, i - 1);
        await qs(i + 1, r);
      };
      await qs(0, n - 1);
    },
  };

  const go = async () => {
    if (running) {
      token++;
      setRunning(false);
      return;
    }
    if (arr.every((v, i) => i === 0 || arr[i - 1] <= v)) shuffle();
    setRunning(true);
    cmp = 0;
    swp = 0;
    stats();
    const t = ++token;
    bars.forEach((b) => (b.className = ""));
    try {
      await ALGOS[algo](t);
      bars.forEach((b, i) => setTimeout(() => (b.className = "ok"), i * 12));
    } catch {
      /* stopped or restarted */
    }
    if (t === token) setRunning(false);
  };

  const pick = (a: Algo) => {
    algo = a;
    if (running) {
      token++;
      running = false;
    }
    shuffle();
    go();
  };

  shuffle();
  return {
    go,
    shuffle,
    pick,
    isRunning: () => running,
    destroy: () => {
      token++;
      host.innerHTML = "";
    },
  };
}
