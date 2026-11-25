import { useEffect, useRef, useState } from "react";
import { EMAIL } from "@/lib/motion";

const CMDS: Record<string, string> = {
  help: "commands: whoami · kubectl get pods · uptime · cat stack.txt · ps aux · contact · clear",
  whoami: "Anurag Sharma. Full-stack + cloud engineer. Ships the app, the pipeline and the infra.",
  "kubectl get pods":
    "NAME                READY  STATUS\nmac-uwindsor        1/1    Running\novpri-rodent-care   1/1    Running\ndri-website         1/1    Running\nnext-role           0/1    Pending  <- you?",
  uptime: "production uptime +15% · incident response -30% · 2+ years running AWS + Linux",
  "cat stack.txt":
    "aws  terraform  ansible  docker  kubernetes\ngithub-actions  gitlab-ci  jenkins  prometheus  grafana\nnode  react  fastapi  postgres  mongodb  python  typescript",
  "ps aux":
    "PID  STATUS    CMD\n101  running   master of applied computing @ uwindsor\n204  running   co-op @ office of research and innovation\n307  waiting   your-offer-letter",
  contact: `email:    ${EMAIL}\nlinkedin: linkedin.com/in/anurag-sharma-dev\ngithub:   github.com/AnuragRocks`,
  "sudo hire anurag": '[sudo] password for recruiter: ********\npermission granted. type "contact" to finish the job.',
};
const CHIPS = ["help", "kubectl get pods", "uptime", "ps aux", "sudo hire anurag"];
const PROMPT = "anurag@windsor:~$";

type Line = { id: number; kind: "intro" | "cmd" | "out" | "err"; text: string };

/** MiniBash: the C shell from the projects list, reborn as a toy terminal. */
export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([{ id: 0, kind: "intro", text: "" }]);
  const [value, setValue] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [lines]);

  const run = (raw: string) => {
    const c = raw.trim();
    if (!c) return;
    if (c === "clear") return setLines([]);
    const r = CMDS[c.toLowerCase()];
    setLines((ls) => [
      ...ls,
      { id: nextId.current++, kind: "cmd", text: c },
      { id: nextId.current++, kind: r ? "out" : "err", text: r ?? c },
    ]);
  };

  return (
    <div className="term" aria-label="Interactive terminal">
      <div className="term-bar">
        <i />
        <i />
        <i />
        <span>minibash — anurag@windsor</span>
      </div>
      <div
        className="term-body"
        ref={body}
        onClick={() => {
          if (!getSelection()?.toString()) input.current?.focus({ preventScroll: true });
        }}
      >
        {lines.map((l) =>
          l.kind === "intro" ? (
            <p key={l.id} className="dim">
              MiniBash 1.0 · the shell I wrote in C, reborn in JS. Type <span className="hl">help</span>.
            </p>
          ) : l.kind === "cmd" ? (
            <p key={l.id}>
              <span className="pr">{PROMPT}</span> {l.text}
            </p>
          ) : l.kind === "out" ? (
            <p key={l.id} className="pre">
              {l.text}
            </p>
          ) : (
            <p key={l.id}>
              <span className="dim">minibash: {l.text}: command not found. try </span>
              <span className="hl">help</span>
            </p>
          ),
        )}
        <div className="term-in">
          <span className="pr">{PROMPT}</span>
          <input
            ref={input}
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal command"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                run(value);
                setValue("");
              }
            }}
          />
        </div>
      </div>
      <div className="chips">
        {CHIPS.map((c) => (
          <button key={c} type="button" onClick={() => run(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
