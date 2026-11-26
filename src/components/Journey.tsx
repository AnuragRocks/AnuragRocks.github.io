import { SplitHeading } from "@/components/MotionExtras";
const STOPS = [
  { when: "Sep 2026 – Dec 2026 · Windsor, ON", title: "Digital Projects and Communications Assistant (Co-op)", org: "Office of Research and Innovation, University of Windsor",
    text: "Own the animal care digitisation platform end to end, shipped with Docker and GitHub Actions. Lead weekly requirements meetings with directors, the Vice-President and the Chair. Lead the university's first DRI website, and run usability and WCAG reviews on the OVPRI Drupal site." },
  { when: "Sep 2025 – Dec 2026", title: "Master of Applied Computing (Co-op)", org: "University of Windsor",
    text: "Advanced Systems Programming, Advanced Computing Concepts and more. Built MiniBash and a distributed file mirror server in C." },
  { when: "Jun 2024 – Aug 2025 · Gurugram, India", title: "Cloud Service Engineer", org: "Real Time Data Services",
    text: "Operated production AWS and Linux environments. Automated provisioning with Terraform and Ansible, ran Docker and Kubernetes workloads and maintained GitLab CI/CD. Raised uptime 15%, cut incident response time 30%, and wrote 20+ scripts that took incident resolution from 2 hours to 15 minutes." },
  { when: "Feb 2023 – Apr 2024 · Delhi, India", title: "Full Stack Developer", org: "Webgross Solutions",
    text: "Delivered 6+ MERN client projects from development to production. Built REST APIs with secure authentication and third-party integrations." },
  { when: "Aug 2020 – Jul 2024", title: "B.Tech, Computer Science & Engineering", org: "Guru Gobind Singh Indraprastha University · CGPA 8.74/10" },
];

export default function Journey() {
  return (
    <section className="block" id="journey">
      <div className="wrap">
        <p className="eyebrow">Experience &amp; education</p>
        <SplitHeading text="Where I've been" />
        <ol className="tl">
          {STOPS.map((s) => (
            <li key={s.title}>
              <span className="when">{s.when}</span>
              <h3>{s.title}</h3>
              <span className="org">{s.org}</span>
              {s.text && <p>{s.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
