import { SplitHeading } from "@/components/MotionExtras";
import { useState } from "react";

const FILTERS: Array<[string, string]> = [
  ["all", "All"], ["devops", "DevOps & Cloud"], ["web", "Full-stack"],
  ["data", "Data & AI"], ["systems", "Systems"], ["mobile", "Mobile"],
];

type Project = { title: string; domain: string; tags: string; text: string; points?: string[]; stack: string[]; repo?: string };

const GH = "https://github.com/AnuragRocks/";
const PROJECTS: Project[] = [
  { title: "ACare Aquatic Facility Platform", domain: "Full-stack + DevOps · 2026", tags: "devops web mobile",
    text: "A monorepo with FastAPI, React/Vite and MongoDB Atlas, plus an Android tablet app. Role-based access and audit logging throughout.",
    points: ["OTA release workflow that SHA-256 checksums the web bundle and publishes to GitHub Releases", "Signed Android APK workflow with signature verification", "Docker Compose stack with an operations runbook"],
    stack: ["FastAPI", "MongoDB", "Docker", "GitHub Actions", "Render"] },
  { title: "Distributed Data Observability Platform", domain: "DevOps · Data", tags: "devops systems data",
    text: "Streaming pipeline health and metrics, from Kafka topics through Spark jobs to Grafana boards, deployed on Kubernetes.",
    stack: ["Java", "Kafka", "Spark", "Kubernetes", "Prometheus", "Grafana"], repo: "Distributed-Data-Observability-Platform" },
  { title: "Production Control Dashboard", domain: "Full-stack", tags: "web devops",
    text: "A broadcast-style production switcher with program and preview buses and a CUT transition.",
    points: ["WebSocket state sync across every connected client", "Containerised with Docker Compose"],
    stack: ["React 18", "TypeScript", "Node.js", "WebSocket", "Docker"], repo: "Production-Control-Dashboard" },
  { title: "Windsor Research Computing", domain: "Web · UWindsor", tags: "web",
    text: "The university's first Digital Research Infrastructure site, built with the Digital Research Alliance of Canada. It explains free HPC clusters, GPU farms, cloud VMs and 30+ PB of storage to researchers.",
    stack: ["HTML", "CSS", "WCAG"], repo: "Windsor-Research-Computing-website" },
  { title: "AI-Driven Transaction Anomaly Detection", domain: "Data & AI", tags: "data",
    text: "Flags unusual activity in a simulated banking dataset for a risk review queue, using time-of-day, velocity and per-customer baseline features with Isolation Forest.",
    stack: ["Python", "pandas", "scikit-learn"], repo: "AI-Driven-Transaction-Anomaly-Detection" },
  { title: "Real-Time Video Signal Monitor", domain: "Systems", tags: "systems",
    text: "A C++ frame capture and processing pipeline with a lock-free single-producer, single-consumer queue and live telemetry over REST.",
    stack: ["C++", "OpenCV", "REST"], repo: "Real-Time-Video-Signal-Monitor" },
  { title: "AI Home Assessment Copilot", domain: "Data & AI", tags: "data web",
    text: "Turns dictated narration, photos and measurement notes from occupational therapy home visits into structured data and clinician-ready summaries.",
    stack: ["TypeScript", "LLM"], repo: "AI-Home-Assessment-Copilot" },
  { title: "MiniBash", domain: "Systems · C", tags: "systems",
    text: "A Unix-style shell written from scratch: command parsing, built-ins, process creation and execution. The terminal at the top of this page is a nod to it.",
    stack: ["C", "POSIX", "fork/exec"], repo: "minibash" },
  { title: "ASP File Mirror Server", domain: "Systems · C", tags: "systems",
    text: "A distributed file server with a client and several mirror servers that share load and handle concurrent file operations over sockets.",
    stack: ["C", "Sockets", "Concurrency"], repo: "asp-file-mirror-server" },
];

const ARCHIVE: Array<[string, string, string, string]> = [
  ["Credit-Risk-Insights-Dashboard", "Credit Risk Insights", "Risk analytics over a simulated retail banking portfolio", "Python · SQL"],
  ["Sweet-Bank", "Sweet Bank", "Android banking app on Starling Bank's sandbox APIs, MVVM", "Kotlin"],
  ["groceries-price-comparison", "Grocery Price Comparison", "Scrapes and compares grocery prices across Ontario", "Python"],
  ["CanadaPublicLibrary", "Canada Public Library", "Discover, read, buy or locate books in one place", "JavaScript"],
  ["Chat-bot", "Chat-bot", "Command-line conversational AI on the Groq API", "Python"],
  ["pioneer-av-selenium-scraper", "Pioneer AV Scraper", "Selenium scraper for Advanced Computing Concepts", "Java"],
  ["weatherfit", "WeatherFit", "Suggests an outfit for the day's weather", "JavaScript"],
  ["Windows11", "Windows 11 in the browser", "A replica desktop with a moving background and taskbar", "HTML · CSS · JS"],
];

const ext = { target: "_blank", rel: "noopener" } as const;
const Stack = ({ items }: { items: string[] }) => (
  <div className="stack">{items.map((s) => <span key={s}>{s}</span>)}</div>
);
const shows = (tags: string, f: string) => f === "all" || tags.split(" ").includes(f);

export default function Work() {
  const [filter, setFilter] = useState("all");
  return (
    <section className="block" id="work">
      <div className="wrap">
        <p className="eyebrow">Selected work</p>
        <SplitHeading text="Things I've built and shipped" />
        <div className="filters" role="group" aria-label="Filter projects">
          {FILTERS.map(([f, label]) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{label}</button>
          ))}
        </div>

        <div className="grid" id="projects">
          <article className="card wide" hidden={!shows("devops web mobile", filter)}>
            <div className="card-head"><h3>Rodent Care Records Platform</h3><span className="domain">Full-stack + DevOps · UWindsor · 2026</span></div>
            <div>
              <p>The animal care digitisation platform I own at the University of Windsor's Office of Research and Innovation: a React web app, an Android app via Capacitor, and a Node.js API on PostgreSQL. I also built its notifications.</p>
            </div>
            <div>
              <ul className="pts">
                <li>GitHub Actions CI with a Postgres 16 service container that runs Prisma migrations and Vitest/Supertest integration tests on every push</li>
                <li>Multi-stage Docker build as a non-root user, Compose stack, frontend on Vercel, API on Render/Railway</li>
                <li>Helmet, rate limiting, JWT/bcrypt and role-based access; fixed a reverse-proxy crash and SPA routing 404s in production</li>
              </ul>
              <Stack items={["Docker", "GitHub Actions", "PostgreSQL", "Node.js", "React", "Vercel"]} />
              <span className="private">Private university repository</span>
            </div>
          </article>

          {PROJECTS.map((p) => (
            <article className="card" key={p.title} hidden={!shows(p.tags, filter)}>
              <div className="card-head"><h3>{p.title}</h3><span className="domain">{p.domain}</span></div>
              <p>{p.text}</p>
              {p.points && <ul className="pts">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>}
              <Stack items={p.stack} />
              {p.repo ? (
                <a className="repo" href={GH + p.repo} {...ext}>View repository ↗</a>
              ) : (
                <span className="private">Private repository</span>
              )}
            </article>
          ))}
        </div>

        <div className="archive">
          <h3>More from the archive</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Project</th><th>What it is</th><th>Built with</th></tr></thead>
              <tbody>
                {ARCHIVE.map(([repo, name, what, lang]) => (
                  <tr key={repo}>
                    <td><a href={GH + repo} {...ext}>{name}</a></td>
                    <td>{what}</td>
                    <td className="lang">{lang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
