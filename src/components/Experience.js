import { lines } from "./lines";

const experiences = [
  {
    type: "research",
    role: "Undergraduate Researcher — SURF Scholar",
    org: "University of Houston · Advisor: Prof. Sen Lin",
    date: "2026.01 → now",
    body: "Awarded a competitive $4,000 Summer Undergraduate Research Fellowship (SURF) to investigate whether world models can be applied to time-series forecasting. Built a PyTorch implementation of DreamerV3's RSSM for univariate and multivariate forecasting, and developed a rolling-origin method that cut 120-step forecast MSE from 0.93 to 0.18 — up to 20× lower error than naive baselines on structured signals.",
  },
  {
    type: "work",
    role: "Mathematics Tutor",
    org: "University of Houston",
    date: "2024.08 → 26.05",
    body: "Tutor 5–10 students daily in Pre-Calculus, Calculus I & II, Statistics, and Engineering Math; strengthen problem-solving and conceptual understanding through adaptive teaching, tailoring sessions to diverse learning styles.",
  },
  {
    type: "lead",
    role: "Events Coordinator",
    org: "IEEE — UH Student Branch",
    date: "2025.08 → 26.01",
    body: "Managed logistics — rooms, scheduling, equipment — and co-hosted events with 100+ attendees alongside other student orgs.",
  },
  {
    type: "work",
    role: "Generative AI & LLM Intern",
    org: "Ideabytes Inc.",
    date: "2025.05 → 07",
    body: "Benchmarked open-source LLMs on company hardware to find the best by inference speed, resource use, and response quality; engineered a real-time voice assistant using local LLMs and speech-processing pipelines; and built Retrieval-Augmented Generation (RAG) systems that answer questions from company documents and internal knowledge bases.",
  },
];

export default function Experience() {
  return (
    <section className="section" id="experience" data-lines={lines(24)}>
      <div className="ps1">
        <b>shriyans</b>@<b>portfolio</b> <span className="amber">~</span>
      </div>
      <div className="cmd">ls ./experience</div>
      <div className="ls">
        {experiences.map((e) => (
          <div className="lsrow" key={e.role}>
            <span className={"ltag t-" + e.type}>[{e.type}]</span>
            <div>
              <div className="role">{e.role}</div>
              <div className="org">{e.org}</div>
              <div className="body">{e.body}</div>
            </div>
            <span className="date">{e.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
