import { SplitHeading } from "@/components/MotionExtras";
import aboutPhoto from "@/assets/about-fusion.jpg";

export default function About() {
  return (
    <section className="block" id="about">
      <div className="wrap">
        <p className="eyebrow">About</p>
        <div className="about">
          <figure className="photo">
            <img src={aboutPhoto} alt="Anurag at a FUSION Innovation and Entrepreneurship Network event, University of Windsor" width={560} height={700} loading="lazy" />
            <figcaption>FUSION Innovation &amp; Entrepreneurship Network, UWindsor</figcaption>
          </figure>
          <div>
            <SplitHeading text="I build the app, then the pipeline and infrastructure it runs on." />
            <p>I started as a full-stack developer, shipping six MERN projects for clients in Delhi. Then I moved into cloud operations at Real Time Data Services, where I ran production AWS and Linux environments. I automated provisioning with Terraform and Ansible, moved workloads onto Docker and Kubernetes and kept GitLab pipelines green. Proactive monitoring and root-cause work raised uptime by 15% and cut incident response time by 30%.</p>
            <p>Now I'm finishing a Master of Applied Computing at the University of Windsor. In my co-op with the Office of Research and Innovation I own an animal care digitisation platform end to end, from requirements meetings with the Vice-President's office to Docker images and GitHub Actions. I also lead the university's first Digital Research Infrastructure website with the Digital Research Alliance of Canada.</p>
            <dl className="facts">
              <div><dt>Based in</dt><dd>Windsor, Ontario</dd></div>
              <div><dt>Studying</dt><dd>MAC (Co-op), University of Windsor</dd></div>
              <div><dt>Certified</dt><dd>AWS Academy Cloud Foundations</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
