import React, { useRef, useState } from "react";
import SectionHeading from "./SectionHeading";

const projects = [
  {
    name: "MEDIC(AIDS)",
    description:
      "Predicts AIDS treatment outcomes with 76.4% accuracy using only CD4 and CD8 immune cell counts — affordable markers available anywhere. Combines ML classification with Kaplan-Meier survival analysis to identify high-risk patients. Independently validated drug resistance findings from the original 1996 clinical trial (p < 0.0001).",
    tech: ["Python", "Random Forest", "Survival Analysis", "scikit-learn", "Pandas"],
    link: "https://devpost.com/software/medic-aids",
    accent: "rgba(56, 189, 248, 0.35)",
  },
  {
    name: "Owlai",
    description:
      "AI-powered study assistant with three modes: chat-based Q&A on any subject, a dynamic quiz/exam generator with multiple-choice and fill-in-the-blank questions, and a voice-based tutor powered by Google Gemini for natural, step-by-step concept explanations.",
    tech: ["React", "Python", "Gemini", "MongoDB", "HTML/CSS"],
    link: "https://devpost.com/software/owlai",
    accent: "rgba(168, 85, 247, 0.35)",
  },
  {
    name: "Local RAG Voice Chatbot",
    description:
      "Voice-enabled AI chatbot running fully locally — no cloud required. Uses Gemma LLM via Ollama for generation, FAISS for vector search over documents, and a Flask backend to tie it together.",
    tech: ["Python", "Gemma", "FAISS", "Flask", "Ollama"],
    link: null,
    accent: "rgba(244, 114, 182, 0.35)",
  },
];

function ProjectCard({ project }) {
  const ref = useRef(null);
  const [spot, setSpot] = useState({ x: -200, y: -200, on: false });

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setSpot((s) => ({ ...s, on: true }))}
      onMouseLeave={() => setSpot((s) => ({ ...s, on: false }))}
      className="group relative p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700
        bg-white/40 dark:bg-black/30 backdrop-blur-sm shadow
        transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, ${project.accent}, transparent 60%)`,
          transition: "opacity 300ms ease",
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg sm:text-xl font-semibold">{project.name}</h3>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-sm font-medium px-3 py-1 rounded-md
                border border-gray-400 dark:border-gray-500
                hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                transition-colors duration-200"
            >
              Devpost ↗
            </a>
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-md
                bg-gray-100 dark:bg-gray-800
                text-gray-600 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 transition-colors duration-500">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
        <SectionHeading index={2} title="Projects" subtitle="Things I've built recently." />
        <div className="flex flex-col gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
