import { useEffect, useRef, useState } from "react";

const USER = "AnuragRocks";
const API = "https://api.github.com";
const CACHE = "gh-activity-v1";

type Push = { repo: string; msg: string; sha: string; at: string };
type Repo = { name: string; desc: string; lang: string; stars: number; pushed: string; url: string };
type Data = { pushes: Push[]; repos: Repo[]; total: number; at: number };

const r0 = (r: Repo) => r.pushed;
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  if (s < 86400 * 30) return Math.round(s / 86400) + "d ago";
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
};

const LANG: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5", Java: "#b07219", C: "#555555",
  "C++": "#f34b7d", Kotlin: "#A97BFF", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051",
};

async function load(): Promise<Data> {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE) || "null") as Data | null;
    if (c && Date.now() - c.at < 10 * 60 * 1000) return c;
  } catch { /* storage blocked: just fetch */ }
  const [ev, rp, us] = await Promise.all([
    fetch(`${API}/users/${USER}/events/public?per_page=60`).then((r) => (r.ok ? r.json() : [])),
    fetch(`${API}/users/${USER}/repos?sort=pushed&per_page=6`).then((r) => (r.ok ? r.json() : [])),
    fetch(`${API}/users/${USER}`).then((r) => (r.ok ? r.json() : {})),
  ]);
  const pushes: Push[] = [];
  for (const e of Array.isArray(ev) ? ev : []) {
    if (e.type !== "PushEvent") continue;
    const commits = e.payload?.commits ?? [];
    const last = commits[commits.length - 1];
    pushes.push({
      repo: e.repo.name.replace(USER + "/", ""),
      msg: (last?.message ?? (e.payload?.ref ? `pushed to ${String(e.payload.ref).replace("refs/heads/", "")}` : "pushed")).split("\n")[0],
      sha: (last?.sha ?? e.payload?.head ?? "").slice(0, 7),
      at: e.created_at,
    });
    if (pushes.length >= 6) break;
  }
  const repos: Repo[] = (Array.isArray(rp) ? rp : []).filter((r: { fork: boolean }) => !r.fork).slice(0, 4).map((r: Record<string, never>) => ({
    name: r.name, desc: r.description ?? "", lang: r.language ?? "", stars: r.stargazers_count, pushed: r.pushed_at, url: r.html_url,
  }));
  // the events feed can be empty or trimmed, so top it up with recent commits from the latest repos
  if (pushes.length < 4 && repos.length) {
    const extra = await Promise.all(
      repos.slice(0, 3).map((r) =>
        fetch(`${API}/repos/${USER}/${r.name}/commits?per_page=3`).then((x) => (x.ok ? x.json() : [])).catch(() => []),
      ),
    );
    extra.forEach((list, i) => {
      for (const c of Array.isArray(list) ? list : []) {
        if (pushes.some((p) => c.sha.startsWith(p.sha))) continue;
        pushes.push({ repo: repos[i].name, msg: String(c.commit?.message ?? "").split("\n")[0], sha: c.sha.slice(0, 7), at: c.commit?.author?.date ?? r0(repos[i]) });
      }
    });
    pushes.sort((a, b) => +new Date(b.at) - +new Date(a.at));
    pushes.splice(6);
  }
  const data = { pushes, repos, total: (us as { public_repos?: number }).public_repos ?? 0, at: Date.now() };
  if (!pushes.length && !repos.length) throw new Error("empty");
  try { sessionStorage.setItem(CACHE, JSON.stringify(data)); } catch { /* ignore */ }
  return data;
}

/** Live strip of recent public GitHub activity. Loads only when scrolled near, and degrades to a plain link. */
export default function GitHubActivity() {
  const ref = useRef<HTMLElement>(null);
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const go = () => load().then((d) => alive && setData(d)).catch(() => alive && setFailed(true));
    if (!("IntersectionObserver" in window)) return void go();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        go();
      }
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, []);

  return (
    <section className="gh" ref={ref} aria-labelledby="gh-h">
      <div className="wrap">
        <div className="gh-head">
          <div>
            <p className="eyebrow"><span className="live" aria-hidden="true" />Live from GitHub</p>
            <h2 id="gh-h" className="gh-title">What I've pushed lately</h2>
          </div>
          <a className="gh-link" href={`https://github.com/${USER}`} target="_blank" rel="noopener">
            @{USER}{data?.total ? ` · ${data.total} public repos` : ""} ↗
          </a>
        </div>

        {failed ? (
          <p className="gh-empty">GitHub didn't answer just now. <a href={`https://github.com/${USER}`} target="_blank" rel="noopener">See my activity on GitHub ↗</a></p>
        ) : (
          <div className="gh-grid">
            <ol className="gh-feed" aria-label="Recent pushes" aria-busy={!data}>
              {(data?.pushes ?? Array.from({ length: 4 }, () => null)).map((p, i) =>
                p ? (
                  <li key={p.sha + i} style={{ animationDelay: i * 70 + "ms" }}>
                    <a href={`https://github.com/${USER}/${p.repo}/commit/${p.sha}`} target="_blank" rel="noopener">
                      <code>{p.sha}</code>
                      <span className="m">{p.msg}</span>
                      <span className="r">{p.repo}</span>
                      <time dateTime={p.at}>{ago(p.at)}</time>
                    </a>
                  </li>
                ) : <li key={i} className="sk" />,
              )}
              {data && !data.pushes.length && <li className="gh-empty">No public pushes in the last 90 days.</li>}
            </ol>
            <div className="gh-repos">
              {(data?.repos ?? Array.from({ length: 4 }, () => null)).map((r, i) =>
                r ? (
                  <a className="gh-repo" key={r.name} href={r.url} target="_blank" rel="noopener">
                    <b>{r.name}</b>
                    {r.desc && <span className="d">{r.desc}</span>}
                    <span className="meta">
                      {r.lang && <span><i style={{ background: LANG[r.lang] ?? "var(--muted)" }} />{r.lang}</span>}
                      <span>updated {ago(r.pushed)}</span>
                    </span>
                  </a>
                ) : <div className="gh-repo sk" key={i} />,
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
