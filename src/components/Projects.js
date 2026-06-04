import { lines } from "./lines";

const projects = [
  {
    hash: "a1f76c4",
    ref: "(HEAD → main, tag: hackathon)",
    name: "medic(aids)",
    date: "2026.09",
    body: (
      <>
        Predicts AIDS treatment outcomes at{" "}
        <span className="amber">76.4% accuracy</span> from only CD4/CD8 counts —
        ML classification + Kaplan-Meier survival analysis (p &lt; 0.0001).
      </>
    ),
    remote: "https://devpost.com/software/medic-aids",
    tags: ["python", "random-forest", "scikit-learn", "survival-analysis"],
  },
  {
    hash: "b3e91d0",
    ref: "(tag: hackathon)",
    name: "watt-warriors",
    date: "2025.11",
    body: (
      <>
        ML-based plastic-waste detection — <span className="amber">3rd place
        ($1,500)</span> at the Coogs for Energy Hackathon. Supervised
        computer-vision classifier on labeled RGB images, architected for
        future RGB + NIR fusion.
      </>
    ),
    remote: null,
    tags: ["python", "computer-vision", "image-classification", "rgb+nir"],
  },
  {
    hash: "3dc1772",
    ref: "(tag: hackathon)",
    name: "owlai",
    date: "2025.09",
    body: "AI study assistant built in 36 hours at Rice Hackathon — chat Q&A, a dynamic quiz/exam generator, and a Gemini-powered voice tutor; Python + MongoDB backend.",
    remote: "https://devpost.com/software/owlai",
    tags: ["react", "gemini", "mongodb", "flask"],
  },
];

export default function Projects() {
  return (
    <section className="section" id="projects" data-lines={lines(26)}>
      <div className="ps1">
        <b>shriyans</b>@<b>portfolio</b> <span className="amber">~</span>
      </div>
      <div className="cmd">git log --oneline ./projects</div>
      <div className="log">
        {projects.map((p) => (
          <div className="commit" key={p.name}>
            <div className="chead">
              <span className="cmeta">
                <span className="hash">{p.hash}</span>{" "}
                {p.ref && <span className="ref">{p.ref} </span>}
                <h3>{p.name}</h3>
              </span>
              <span className="cdate">{p.date}</span>
            </div>
            <div className="body">{p.body}</div>
            {p.remote && (
              <div className="remote">
                <span className="dim">remote:</span>{" "}
                <a href={p.remote} target="_blank" rel="noopener noreferrer">
                  {p.remote.replace("https://", "")} ↗
                </a>
              </div>
            )}
            <div className="tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
