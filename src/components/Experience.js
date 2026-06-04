import { lines } from "./lines";

const experiences = [
  {
    type: "research",
    role: "Undergraduate Researcher — SURF Scholar",
    org: "University of Houston · Advisor: Prof. Sen Lin",
    date: "2026.01 → now",
    body: "Awarded the SURF scholarship to study whether world-model architectures (e.g. DreamerV3) can be adapted for time-series prediction — training and benchmarking adapted models against traditional methods.",
  },
  {
    type: "work",
    role: "Mathematics Tutor",
    org: "University of Houston",
    date: "2024.08 → now",
    body: "Tutor 5–10 students daily in Pre-Calculus, Calculus I & II, Statistics, and Engineering Math; tailor sessions to diverse learning styles.",
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
    body: "Researched open-source LLMs for local deployment and built a prototype voice assistant for real-time responses.",
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
