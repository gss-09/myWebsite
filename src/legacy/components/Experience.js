import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "./SectionHeading";

// monochrome — every type shares the same neutral gray treatment
const NEUTRAL_STYLE = {
  pill: "bg-gray-500/15 text-gray-700 dark:text-gray-200 border-gray-400/40",
  dot: "bg-gray-500 dark:bg-gray-400",
  glow: "shadow-[0_0_12px_3px_rgba(120,120,120,0.4)]",
};
const TYPE_STYLES = {
  Research: NEUTRAL_STYLE,
  Work: NEUTRAL_STYLE,
  Leadership: NEUTRAL_STYLE,
};

const experiences = [
  {
    type: "Research",
    role: "Undergraduate Researcher — SURF Scholar",
    org: "University of Houston · Advisor: Prof. Sen Lin",
    dates: "Jan 2026 – Present",
    description:
      "Awarded a competitive $4,000 Summer Undergraduate Research Fellowship (SURF) to investigate whether world models can be applied to time-series forecasting. Built a PyTorch implementation of DreamerV3's RSSM for univariate and multivariate time-series forecasting, and developed a rolling-origin forecasting method that reduced 120-step forecast MSE from 0.93 to 0.18 — up to 20× lower error than naive baselines on structured signals.",
  },
  {
    type: "Work",
    role: "Mathematics Tutor",
    org: "University of Houston",
    dates: "Aug 2024 – May 2026",
    description:
      "Tutored 5–10 students daily in Pre-Calculus, Calculus I & II, Statistics, and Engineering Math. Strengthened problem-solving abilities and conceptual understanding through adaptive teaching, and tailored sessions to diverse learning styles to build student confidence and academic performance.",
  },
  {
    type: "Leadership",
    role: "Events Coordinator",
    org: "IEEE — UH Student Branch",
    dates: "Aug 2025 – Jan 2026",
    description:
      "Managed logistics including room reservations, scheduling, and equipment. Collaborated with other student organizations to co-host events with 100+ attendees, strengthening leadership and communication skills.",
  },
  {
    type: "Work",
    role: "Generative AI & LLM Intern",
    org: "Ideabytes Inc.",
    dates: "May 2025 – Jul 2025",
    description:
      "Benchmarked and analyzed multiple open-source LLMs on company-provided hardware to identify optimal models based on inference speed, resource utilization, and response quality. Engineered a real-time voice assistant using local LLMs and speech-processing pipelines, and built Retrieval-Augmented Generation (RAG) systems that enabled LLMs to answer questions using company documents and internal knowledge bases.",
  },
];

const FILTERS = ["All", "Research", "Work", "Leadership"];

export default function Experience() {
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const filtered =
    filter === "All" ? experiences : experiences.filter((e) => e.type === filter);

  const countFor = (f) =>
    f === "All" ? experiences.length : experiences.filter((e) => e.type === f).length;

  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 transition-colors duration-500">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto">
        <SectionHeading
          index={1}
          title="Experience"
          subtitle="Filter by category, click any card to expand."
        />

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border
                  transition-all duration-200
                  ${active
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                  }`}
              >
                {f}
                <span className={`ml-1.5 text-[10px] ${active ? "opacity-70" : "opacity-50"}`}>
                  {countFor(f)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — draws in on scroll */}
          <motion.div
            className="absolute left-3 top-3 bottom-3 w-px origin-top
              bg-gradient-to-b from-gray-300 via-gray-300/60 to-transparent
              dark:from-gray-500 dark:via-gray-500/60"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div layout className="flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((exp, i) => {
                const s = TYPE_STYLES[exp.type];
                const id = `${exp.type}-${exp.role}`;
                const expanded = expandedId === id;

                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      duration: 0.35,
                      delay: i * 0.05,
                    }}
                    className="relative pl-10"
                  >
                    {/* Timeline dot */}
                    <motion.span
                      animate={{ scale: expanded ? 1.35 : 1 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={`absolute left-1 top-5 w-4 h-4 rounded-full ${s.dot} ${s.glow}
                        ring-4 ring-white/40 dark:ring-black/40`}
                    />

                    <motion.div
                      layout
                      onClick={() => setExpandedId(expanded ? null : id)}
                      className={`rounded-xl border bg-white/40 dark:bg-black/30 backdrop-blur-sm p-5
                        cursor-pointer select-none
                        transition-colors duration-200
                        ${expanded
                          ? "border-gray-400 dark:border-gray-500"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                    >
                      <motion.div layout="position" className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-widest
                              px-2 py-0.5 rounded-md mb-2 border ${s.pill}`}
                          >
                            {exp.type}
                          </span>
                          <h3 className="text-base sm:text-lg font-semibold leading-tight">{exp.role}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{exp.org}</p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {exp.dates}
                          </span>
                          <motion.svg
                            animate={{ rotate: expanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </div>
                      </motion.div>

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            key="desc"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 14 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {exp.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
