import React from "react";

const projects = [
  {
    name: "MEDIC(AIDS)",
    description:
      "Predicts AIDS treatment outcomes with 76.4% accuracy using only CD4 and CD8 immune cell counts — affordable markers available anywhere. Combines ML classification with Kaplan-Meier survival analysis to identify high-risk patients. Independently validated drug resistance findings from the original 1996 clinical trial (p < 0.0001).",
    tech: ["Python", "Random Forest", "Survival Analysis", "scikit-learn", "Pandas"],
    link: "https://devpost.com/software/medic-aids",
  },
  {
    name: "Owlai",
    description:
      "AI-powered study assistant with three modes: chat-based Q&A on any subject, a dynamic quiz/exam generator with multiple-choice and fill-in-the-blank questions, and a voice-based tutor powered by Google Gemini for natural, step-by-step concept explanations.",
    tech: ["React", "Python", "Gemini", "MongoDB", "HTML/CSS"],
    link: "https://devpost.com/software/owlai",
  },
  {
    name: "Local RAG Voice Chatbot",
    description:
      "Voice-enabled AI chatbot running fully locally — no cloud required. Uses Gemma LLM via Ollama for generation, FAISS for vector search over documents, and a Flask backend to tie it together.",
    tech: ["Python", "Gemma", "FAISS", "Flask", "Ollama"],
    link: null,
  },
];

function Projects() {
  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 transition-colors duration-500">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-3xl font-bold mb-8 text-center">Projects</h2>
        <div className="flex flex-col gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className="p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700
                bg-white/40 dark:bg-black/30 backdrop-blur-sm shadow
                transition-transform duration-200 hover:-translate-y-1"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
