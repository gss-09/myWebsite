import React from "react";

const SKILLS = [
  "Python", "React", "PyTorch", "TensorFlow", "scikit-learn",
  "Pandas", "NumPy", "Flask", "FastAPI", "MongoDB",
  "PostgreSQL", "Tailwind", "JavaScript", "TypeScript", "Java",
  "C++", "Git", "Docker", "Linux", "FAISS",
  "Ollama", "Gemini", "LangChain",
];

function Row({ reverse = false }) {
  return (
    <div
      className="flex gap-4 whitespace-nowrap py-2"
      style={{
        animation: `${reverse ? "marquee-rev" : "marquee"} 40s linear infinite`,
      }}
    >
      {[...SKILLS, ...SKILLS].map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="px-4 py-1.5 rounded-full text-sm font-medium
            border border-gray-300/70 dark:border-gray-600/70
            bg-white/30 dark:bg-white/5 backdrop-blur-sm
            text-gray-700 dark:text-gray-200"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export default function SkillsMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden py-4"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <Row />
    </div>
  );
}
