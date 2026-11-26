import { SplitHeading } from "@/components/MotionExtras";
const GROUPS: Array<[string, Array<[string, string?]>]> = [
  ["Cloud & DevOps", [["AWS", "CloudFormation"], ["Terraform, Ansible", "IaC"], ["Docker, Kubernetes"], ["GitHub Actions, GitLab CI", "Jenkins"], ["Prometheus, Grafana", "monitoring"], ["Linux / Unix", "hardening"]]],
  ["Backend & data", [["Node.js, Express", "REST"], ["FastAPI", "Python"], ["React, Next.js"], ["PostgreSQL, MongoDB"], ["Kafka, Spark"], ["Capacitor, Drupal"]]],
  ["Languages & infra", [["Python, JavaScript, TypeScript"], ["Java, C / C++, SQL"], ["VMware, Citrix Hypervisor"], ["Networking, benchmarking"], ["AWS Cloud Foundations", "2025"], ["Generative AI Foundations", "2026"]]],
];

export default function Skills() {
  return (
    <section className="block" id="skills">
      <div className="wrap">
        <p className="eyebrow">Toolbox</p>
        <SplitHeading text="What I work with" />
        <div className="skill-tree" aria-hidden="true"><span className="root">skills.root</span></div>
        <div className="skills">
          {GROUPS.map(([title, items]) => (
            <div key={title}>
              <h3>{title}</h3>
              <ul>
                {items.map(([name, note]) => (
                  <li key={name}>{name} {note && <span>{note}</span>}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
