import type { CSSProperties } from "react";
import CopyButton from "@/components/CopyButton";
import { EMAIL, RESUME_URL } from "@/lib/motion";

const ext = { target: "_blank", rel: "noopener" } as const;

export default function Contact() {
  return (
    <section className="block" id="contact">
      <div className="wrap">
        <div className="contact">
          <div className="eq" aria-hidden="true">
            {Array.from({ length: 12 }, (_, k) => <i key={k} style={{ "--k": k } as CSSProperties} />)}
          </div>
          <div>
            <p className="eyebrow" style={{ color: "var(--signal)" }}>Contact</p>
            <h2>Let's build something.</h2>
            <p>I'm looking for full-stack, DevOps and cloud engineering roles from early 2027. Email is the fastest way to reach me.</p>
          </div>
          <div className="links">
            <div className="row"><span>Email</span><span className="v copy-wrap"><span>{EMAIL}</span><CopyButton text={EMAIL} /></span></div>
            <div className="row"><span>LinkedIn</span><a href="https://www.linkedin.com/in/anurag-sharma-dev/" {...ext}>in/anurag-sharma-dev ↗</a></div>
            <div className="row"><span>GitHub</span><a href="https://github.com/AnuragRocks" {...ext}>github.com/AnuragRocks ↗</a></div>
            <div className="row"><span>Résumé</span><a href={RESUME_URL} {...ext}>Open PDF ↗</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}
