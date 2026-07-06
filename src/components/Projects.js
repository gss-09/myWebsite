import { lines } from "./lines";

const projects = [
  {
    hash: "9c2f1e8",
    ref: "(HEAD → main, tag: client)",
    name: "college-connect",
    date: "2026.07",
    body: (
      <>
        Multi-campus college administration platform, custom-built to a real
        client's requirements — <span className="amber">running in production
        at a college in India with 2,000–3,000 students</span>. Hostel bed
        management, exams &amp; marks with Excel import/export, maintenance
        ticketing, a parent portal, per-module permissions with campus-level
        scoping and a full audit log. Marks arrive as{" "}
        <span className="amber">messy real-world spreadsheets</span> — the
        importer normalizes inconsistent names and duplicate roll numbers and
        flags bad rows instead of choking on them. Public repo is a sanitized
        fork seeded with fictional data.
      </>
    ),
    remote: "https://github.com/gss-09/college-connect-demo",
    live: "https://college-connect-demo.vercel.app",
    tags: ["python", "flask", "postgres", "vanilla-js"],
  },
  {
    hash: "7d48b2a",
    ref: "(tag: client)",
    name: "admissions-ledger",
    date: "2026.07",
    body: (
      <>
        Recruiting &amp; revenue analytics for the same client — tracks{" "}
        <span className="amber">1,400+ real applicants in production</span>{" "}
        through the admissions funnel: per-recruiter conversion, fee analytics,
        true cost-per-admission. Role-scoped to the field level — PII and fee
        columns are stripped server-side per role.
      </>
    ),
    remote: "https://github.com/gss-09/admissions-ledger-demo",
    live: "https://admissions-ledger-demo.vercel.app",
    tags: ["python", "flask", "postgres", "vanilla-js"],
  },
  {
    hash: "a1f76c4",
    ref: "(tag: hackathon)",
    name: "medic(aids)",
    date: "2026.01",
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
    <section className="section" id="projects" data-lines={lines(44)}>
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
                <h3>{p.name}</h3>
                {p.ref && <span className="ref"> {p.ref}</span>}
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
            {p.live && (
              <div className="remote">
                <span className="dim">live:</span>{" "}
                <a href={p.live} target="_blank" rel="noopener noreferrer">
                  {p.live.replace("https://", "")} ↗
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
