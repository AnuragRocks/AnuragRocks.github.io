import { Fragment, type ReactNode } from "react";
import { CASE_STUDIES } from "@/content/caseStudies";
import { NOTES, type Note } from "@/content/notes";
import { SplitHeading } from "@/components/MotionExtras";
import { usePageMeta } from "@/lib/route";

const GH = "https://github.com/AnuragRocks/";
const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

function Back({ to, label }: { to: string; label: string }) {
  return <a className="back" href={to}>← {label}</a>;
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const cs = CASE_STUDIES.find((c) => c.slug === slug);
  usePageMeta(cs ? `${cs.title} · Case study · Anurag Sharma` : "Not found · Anurag Sharma", cs?.summary ?? "");
  if (!cs) return <NotFound />;
  const others = CASE_STUDIES.filter((c) => c.slug !== slug);
  return (
    <article className="page wrap">
      <Back to="#work" label="All work" />
      <p className="eyebrow">Case study · {cs.kicker}</p>
      <SplitHeading text={cs.title} />
      <p className="page-lede">{cs.summary}</p>
      <dl className="cs-meta">
        <div><dt>When</dt><dd>{cs.when}</dd></div>
        <div><dt>My role</dt><dd>{cs.role}</dd></div>
        <div><dt>Repository</dt><dd>{cs.repo ? <a href={GH + cs.repo} target="_blank" rel="noopener">View ↗</a> : "Private"}</dd></div>
      </dl>

      <section className="cs-block">
        <h2 className="cs-h">The problem</h2>
        <ul className="cs-list">{cs.problem.map((p) => <li key={p}>{p}</li>)}</ul>
      </section>

      <section className="cs-block">
        <h2 className="cs-h">How it fits together</h2>
        <ol className="flow" aria-label="Architecture, from client to hosting">
          {cs.flow.map((f, i) => (
            <Fragment key={f.label}>
              <li style={{ animationDelay: i * 120 + "ms" }}><b>{f.label}</b><span>{f.sub}</span></li>
            </Fragment>
          ))}
        </ol>
      </section>

      <section className="cs-block">
        <h2 className="cs-h">What I built</h2>
        <div className="cs-grid">
          {cs.built.map((b) => <div className="cs-card" key={b.title}><h3>{b.title}</h3><p>{b.text}</p></div>)}
        </div>
      </section>

      <section className="cs-block">
        <h2 className="cs-h">Hard parts</h2>
        <div className="cs-grid">
          {cs.hard.map((b) => <div className="cs-card warn" key={b.title}><h3>{b.title}</h3><p>{b.text}</p></div>)}
        </div>
      </section>

      <section className="cs-block">
        <h2 className="cs-h">Outcome</h2>
        <ul className="cs-results">{cs.results.map((r) => <li key={r}>{r}</li>)}</ul>
        <div className="stack">{cs.stack.map((s) => <span key={s}>{s}</span>)}</div>
      </section>

      <nav className="page-next" aria-label="More">
        {others.map((o) => <a key={o.slug} href={`#/case/${o.slug}`}><small>Next case study</small>{o.title} →</a>)}
        <a href="#contact"><small>Hiring?</small>Get in touch →</a>
      </nav>
    </article>
  );
}

/** Renders the tiny block format used in notes.ts. */
function Blocks({ body }: { body: string[] }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={"l" + out.length}>{list.map((x) => <li key={x}>{inline(x)}</li>)}</ul>);
    list = [];
  };
  body.forEach((b) => {
    if (b.startsWith("- ")) return void list.push(b.slice(2));
    flush();
    if (b.startsWith("## ")) out.push(<h2 key={out.length}>{b.slice(3)}</h2>);
    else if (b.startsWith("```")) {
      const nl = b.indexOf("\n");
      out.push(<pre key={out.length} data-lang={b.slice(3, nl)}><code>{b.slice(nl + 1)}</code></pre>);
    } else out.push(<p key={out.length}>{inline(b)}</p>);
  });
  flush();
  return <>{out}</>;
}
const inline = (s: string) => s.split(/(`[^`]+`)/).map((part, i) => (part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part));

export function NotePage({ slug }: { slug: string }) {
  const n = NOTES.find((x) => x.slug === slug);
  usePageMeta(n ? `${n.title} · Notes · Anurag Sharma` : "Not found · Anurag Sharma", n?.blurb ?? "");
  if (!n) return <NotFound />;
  const i = NOTES.indexOf(n);
  const next = NOTES[(i + 1) % NOTES.length];
  return (
    <article className="page wrap note">
      <Back to="#notes" label="All notes" />
      <p className="eyebrow">Notes · {fmt(n.date)} · {n.read} read</p>
      <SplitHeading text={n.title} />
      <div className="note-tags">{n.tags.map((t) => <span key={t}>{t}</span>)}</div>
      <div className="prose"><Blocks body={n.body} /></div>
      <nav className="page-next" aria-label="More">
        {next !== n && <a href={`#/notes/${next.slug}`}><small>Next note</small>{next.title} →</a>}
        <a href="#contact"><small>Questions?</small>Get in touch →</a>
      </nav>
    </article>
  );
}

function NotFound() {
  return (
    <article className="page wrap">
      <p className="eyebrow">404</p>
      <h2>That page doesn't exist.</h2>
      <Back to="#top" label="Back home" />
    </article>
  );
}

function NoteCard({ n }: { n: Note }) {
  return (
    <a className="note-card" href={`#/notes/${n.slug}`}>
      <span className="when">{fmt(n.date)} · {n.read}</span>
      <h3>{n.title}</h3>
      <p>{n.blurb}</p>
      <span className="note-tags">{n.tags.map((t) => <span key={t}>{t}</span>)}</span>
      <span className="go">Read note →</span>
    </a>
  );
}

export function NotesSection() {
  return (
    <section className="block" id="notes">
      <div className="wrap">
        <p className="eyebrow">Notes</p>
        <SplitHeading text="Things I've learned shipping" />
        <p className="lab-intro">Short write-ups on CI, containers and on-call, taken from real projects.</p>
        <div className="notes-grid">{NOTES.map((n) => <NoteCard n={n} key={n.slug} />)}</div>
      </div>
    </section>
  );
}
