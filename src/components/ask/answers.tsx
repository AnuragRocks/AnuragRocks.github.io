import type { CSSProperties, ReactNode } from "react";
import { EMAIL, RESUME_URL } from "@/lib/motion";
import CopyButton from "@/components/CopyButton";
import Terminal from "./Terminal";

/** Canned answers for the "ask me anything" chat, drawn from the résumé and GitHub. */
export type Intent =
  | "me" | "projects" | "experience" | "skills" | "fun" | "contact" | "now" | "fullstack"
  | "cloud" | "k8s" | "cicd" | "certs" | "open" | "resume" | "all" | "fallback";

const RULES: Array<[RegExp, Intent]> = [
  [/see all|full list|all projects/, "all"],
  [/r[eé]sum[eé]|cv\b|pdf/, "resume"],
  [/cert/, "certs"],
  [/ci\/?cd|pipeline|github actions|deploy/, "cicd"],
  [/kube|k8s|container|docker/, "k8s"],
  [/open to|hire|hiring|available|looking|job|role/, "open"],
  [/contact|email|reach|linkedin|phone/, "contact"],
  [/\bnow\b|current|working on|co-?op|ovpri/, "now"],
  [/full.?stack|front.?end|back.?end|react|node|mern|web dev|javascript/, "fullstack"],
  [/cloud|aws|real time data|terraform|ansible|uptime|incident|devops/, "cloud"],
  [/project|built|build|portfolio|work\b|repo/, "projects"],
  [/experience|career|education|degree|master|university|study|background|job history/, "experience"],
  [/skill|stack|tool|tech|language/, "skills"],
  [/fun|hobby|terminal|shell|game/, "fun"],
  [/who|about|yourself|\bme\b|intro/, "me"],
];

export function intent(q: string): Intent {
  const s = q.toLowerCase();
  return RULES.find(([re]) => re.test(s))?.[1] ?? "fallback";
}

const PROJ: Array<[string, string, string, string, string, string, string]> = [
  ["Full-stack + DevOps", "Rodent Care Records Platform", "CI with Postgres 16 service containers, multi-stage non-root Docker, JWT + RBAC, Vercel + Render.", "", "#0e1b3d", "#e8edff", "#7c95ff"],
  ["Full-stack + DevOps", "ACare Aquatic Facility", "FastAPI + React monorepo, OTA releases with SHA-256 checksums, signed APK pipeline.", "", "#2b1036", "#fbe9ff", "#e879f9"],
  ["Observability", "Distributed Data Observability", "Kafka, Spark and Kubernetes with Prometheus and Grafana boards.", "https://github.com/AnuragRocks/Distributed-Data-Observability-Platform", "#0c2a24", "#e3fff7", "#34d399"],
  ["Full-stack", "Production Control Dashboard", "Broadcast switcher with WebSocket sync, Dockerised.", "https://github.com/AnuragRocks/Production-Control-Dashboard", "#2d1a06", "#fff3e2", "#f59e0b"],
  ["Web · UWindsor", "Windsor Research Computing", "UWindsor’s first Digital Research Infrastructure site.", "https://github.com/AnuragRocks/Windsor-Research-Computing-website", "#0b2240", "#e6f1ff", "#38bdf8"],
  ["Systems · C", "MiniBash", "A Unix-style shell from scratch: parsing, built-ins, fork/exec.", "https://github.com/AnuragRocks/minibash", "#1d1d22", "#f2f2f5", "#a3a3b5"],
];

const ext = { target: "_blank", rel: "noopener" } as const;

function ProjRail() {
  return (
    <div className="rail">
      {PROJ.map(([k, title, d, href, bg, fg, accent]) => {
        const style = { "--card-bg": bg, "--card-fg": fg, "--card-accent": accent } as CSSProperties;
        const inner = (
          <>
            <span className="k">{k}</span>
            <b>{title}</b>
            <span className="d">{d}</span>
            <span className="go">{href ? "View repo ↗" : "Private repo"}</span>
          </>
        );
        return href ? (
          <a key={title} className="pcard" href={href} {...ext} style={style}>{inner}</a>
        ) : (
          <div key={title} className="pcard" style={style}>{inner}</div>
        );
      })}
    </div>
  );
}

const Chips = ({ list }: { list: string[] }) => (
  <div className="chipset">{list.map((x) => <span key={x}>{x}</span>)}</div>
);

type Ask = (q: string) => void;

const Suggest = ({ list, ask }: { list: string[]; ask: Ask }) => (
  <div className="suggest">
    {list.map((x) => (
      <button key={x} type="button" onClick={() => ask(x)}>{x}</button>
    ))}
  </div>
);

const B = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={"bubble" + (className ? " " + className : "")}>{children}</div>
);

/** Render the reply for an intent. `ask` lets suggestion buttons ask follow-up questions. */
export function answer(key: Intent, ask: Ask): ReactNode[] {
  switch (key) {
    case "me":
      return [
        <B><p>I’m Anurag, a full-stack developer and DevOps/cloud engineer finishing my Master of Applied Computing at the University of Windsor (Dec 2026).</p><p>I started as a full-stack developer, then spent a year running production AWS and Linux at Real Time Data Services, where I raised uptime 15% and cut incident response 30%. Right now I’m on co-op at UWindsor’s Office of Research and Innovation, owning a platform from requirements to CI/CD.</p></B>,
        <Suggest ask={ask} list={["Tell me about your full-stack work", "Tell me about your cloud experience", "Are you open to work?"]} />,
      ];
    case "projects":
      return [
        <B><p>Here’s what I’ve built recently. The first two are platforms I run at UWindsor, so their repos are private.</p></B>,
        <ProjRail />,
        <Suggest ask={ask} list={["Tell me about the CI/CD pipeline", "See all projects"]} />,
      ];
    case "experience":
      return [
        <B><p>About two and a half years of industry work, plus a co-op now.</p></B>,
        <B>
          <ul className="mini-tl">
            <li><b>Digital Projects &amp; Communications Assistant (Co-op)</b><small>Office of Research and Innovation, UWindsor · Sep–Dec 2026</small></li>
            <li><b>Cloud Service Engineer</b><small>Real Time Data Services, Gurugram · Jun 2024–Aug 2025</small></li>
            <li><b>Full Stack Developer</b><small>Webgross Solutions, Delhi · Feb 2023–Apr 2024</small></li>
            <li><b>MAC (Co-op), University of Windsor</b><small>Sep 2025–Dec 2026</small></li>
            <li><b>B.Tech CSE, GGSIPU · CGPA 8.74</b><small>Aug 2020–Jul 2024</small></li>
          </ul>
        </B>,
        <Suggest ask={ask} list={["What did you do at Real Time Data Services?", "What are you working on now?"]} />,
      ];
    case "skills":
      return [
        <B><p>I work across the stack: React and Node.js on the front and back end, and AWS, Docker, Kubernetes and CI/CD underneath.</p></B>,
        <B>
          <p className="mini-h">Cloud &amp; DevOps</p>
          <Chips list={["AWS", "Terraform", "Ansible", "CloudFormation", "Docker", "Kubernetes", "GitHub Actions", "GitLab CI", "Jenkins", "Prometheus", "Grafana", "Linux"]} />
          <p className="mini-h" style={{ marginTop: ".8rem" }}>Backend &amp; data</p>
          <Chips list={["Node.js", "Express", "FastAPI", "React", "Next.js", "PostgreSQL", "MongoDB", "Kafka", "Spark"]} />
          <p className="mini-h" style={{ marginTop: ".8rem" }}>Languages</p>
          <Chips list={["Python", "TypeScript", "JavaScript", "Java", "C / C++", "SQL"]} />
        </B>,
        <Suggest ask={ask} list={["What certifications do you have?", "Tell me about your Kubernetes experience"]} />,
      ];
    case "fun":
      return [
        <B><p>For fun I wrote a Unix shell in C for my systems course. Here’s a tiny version of it. Try <code>kubectl get pods</code>.</p></B>,
        <Terminal />,
      ];
    case "contact":
      return [
        <B><p>Email is the fastest way to reach me. I’m open to full-stack, DevOps and cloud roles from early 2027.</p></B>,
        <B className="ccard">
          <div className="r"><span>Email</span><span className="copy-wrap"><span>{EMAIL}</span><CopyButton text={EMAIL} /></span></div>
          <div className="r"><span>LinkedIn</span><a href="https://www.linkedin.com/in/anurag-sharma-dev/" {...ext}>in/anurag-sharma-dev ↗</a></div>
          <div className="r"><span>GitHub</span><a href="https://github.com/AnuragRocks" {...ext}>AnuragRocks ↗</a></div>
          <div className="r"><span>Résumé</span><a href={RESUME_URL} {...ext}>Open PDF ↗</a></div>
        </B>,
      ];
    case "now":
      return [
        <B><p>I’m on co-op at UWindsor’s Office of Research and Innovation. I own the animal care digitisation platform: React web app, Android app via Capacitor, Node.js and PostgreSQL, shipped with Docker and GitHub Actions. I run weekly requirement meetings with directors and the Vice-President, and I lead the university’s first Digital Research Infrastructure website with the Digital Research Alliance of Canada.</p></B>,
        <Suggest ask={ask} list={["Tell me about the CI/CD pipeline", "Show me your projects"]} />,
      ];
    case "fullstack":
      return [
        <B><p>Full-stack is where I started. At Webgross Solutions I delivered 6+ MERN client projects from development through production, building REST APIs with secure authentication and third-party integrations.</p><p>Since then I’ve built the Rodent Care platform (React, Node.js, PostgreSQL, plus an Android app via Capacitor), ACare (FastAPI, React/Vite, MongoDB) and a real-time production control dashboard with React, TypeScript and WebSockets.</p></B>,
        <Suggest ask={ask} list={["Show me your projects", "Tell me about your cloud experience"]} />,
      ];
    case "cloud":
      return [
        <B><p>At Real Time Data Services I operated production AWS and Linux environments for client services. I automated provisioning with Terraform and Ansible, ran workloads on Docker and Kubernetes, and maintained GitLab CI/CD.</p><p>Monitoring, tuning and root-cause work raised uptime 15% and cut incident response 30%. I wrote 20+ automation and diagnostic scripts that took incident resolution from about 2 hours to 15 minutes.</p></B>,
        <Suggest ask={ask} list={["What tools do you use?", "Contact"]} />,
      ];
    case "k8s":
      return [
        <B><p>I containerised and orchestrated client workloads on Kubernetes in production at Real Time Data Services, alongside Docker and GitLab CI/CD. I’ve also deployed a Kafka and Spark observability stack on Kubernetes with Prometheus and Grafana.</p></B>,
        <Suggest ask={ask} list={["Tell me about your cloud experience", "Show me your projects"]} />,
      ];
    case "cicd":
      return [
        <B><p>On the Rodent Care platform, every push and pull request runs GitHub Actions with a Postgres 16 service container: Prisma migrations, a build, then Vitest and Supertest integration tests. The API ships as a multi-stage Docker image running as a non-root user.</p><p>On ACare I co-built an OTA release workflow that SHA-256 checksums the web bundle and publishes to GitHub Releases, plus a signed Android APK workflow that verifies signatures.</p></B>,
        <Suggest ask={ask} list={["Show me your projects", "What tools do you use?"]} />,
      ];
    case "certs":
      return [<B><p>AWS Academy Graduate: Cloud Foundations (2025), and Generative AI Foundations (2026).</p></B>];
    case "open":
      return [
        <B><p>Yes. I finish my master’s in December 2026 and I’m looking for full-stack developer, DevOps and cloud engineering roles in Canada.</p></B>,
        <Suggest ask={ask} list={["Contact", "Download your résumé"]} />,
      ];
    case "resume":
      return [<B><p>Here’s my résumé: <a href={RESUME_URL} {...ext}>Anurag_Sharma_Resume.pdf ↗</a></p></B>];
    case "all":
      return [<B><p>Taking you to the full project list below.</p></B>];
    case "fallback":
      return [
        <B><p>I don’t have a good answer to that one here. Try one of these, or email me at {EMAIL}.</p></B>,
        <Suggest ask={ask} list={["Tell me about yourself", "Show me your projects", "What tools do you use?", "Are you open to work?"]} />,
      ];
  }
}
