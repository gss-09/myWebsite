import { lines } from "./lines";

const projects = [
  {
    hash: "a1f76c4",
    ref: "(HEAD → main, tag: hackathon)",
    name: "medic(aids)",
    body: (
      <>
        Predicts AIDS treatment outcomes at{" "}
        <span className="amber">76.4% accuracy</span> from only CD4/CD8 counts —
        ML classification + Kaplan-Meier survival analysis.
      </>
    ),
    remote: "https://devpost.com/software/medic-aids",
    tags: ["python", "random-forest", "scikit-learn", "pandas"],
  },
  {
    hash: "3dc1772",
    ref: "(tag: hackathon)",
    name: "owlai",
    body: "AI study assistant in three modes — chat Q&A, a dynamic quiz/exam generator, and a Gemini-powered voice tutor.",
    remote: "https://devpost.com/software/owlai",
    tags: ["react", "gemini", "mongodb", "flask"],
  },
  {
    hash: "e76fb09",
    ref: "",
    name: "local-rag-voice-chatbot",
    body: "Fully-local voice chatbot — Gemma via Ollama, FAISS vector search over docs, Flask backend. No cloud required.",
    remote: null,
    tags: ["gemma", "faiss", "ollama"],
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
            <div>
              <span className="hash">{p.hash}</span>{" "}
              {p.ref && <span className="ref">{p.ref} </span>}
              <h3>{p.name}</h3>
            </div>
            <div className="body">{p.body}</div>
            <div className="remote">
              <span className="dim">remote:</span>{" "}
              {p.remote ? (
                <a href={p.remote} target="_blank" rel="noopener noreferrer">
                  {p.remote.replace("https://", "")} ↗
                </a>
              ) : (
                <span className="dim">local-only — no deploy</span>
              )}
            </div>
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
