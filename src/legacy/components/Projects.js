import React, { useRef, useState } from "react";
import SectionHeading from "./SectionHeading";

const projects = [
  {
    name: "College Connect",
    description:
      "Multi-campus college administration platform, custom-built to a real client's requirements and running in production at a college in India with 2,000–3,000 students. Handles hostel bed management, exams & marks with Excel import/export, maintenance ticketing, a read-only parent portal, and per-module permissions with campus-level scoping and a full audit trail — one system replacing spreadsheets and paper registers, used daily by staff and parents. Marks arrive as messy real-world spreadsheets, so the importer normalizes inconsistent names and duplicate roll numbers and flags bad rows instead of choking on them. The public demo is a sanitized fork seeded with fictional data.",
    tech: ["Python", "Flask", "PostgreSQL", "Vanilla JS", "Vercel"],
    links: [
      { label: "GitHub ↗", href: "https://github.com/gss-09/college-connect-demo" },
      { label: "Live demo ↗", href: "https://college-connect-demo.vercel.app" },
    ],
    accent: "rgba(150, 150, 150, 0.28)",
  },
  {
    name: "Admissions Ledger",
    description:
      "Recruiting & revenue analytics built for the same client — in production it tracks 1,400+ real applicants through the admissions funnel, with per-recruiter conversion, fee analytics, and true cost-per-admission reporting. Access is role-scoped down to the field level: PII and fee columns are stripped server-side per role, and city-bound users only ever receive their own rows.",
    tech: ["Python", "Flask", "PostgreSQL", "Vanilla JS", "Vercel"],
    links: [
      { label: "GitHub ↗", href: "https://github.com/gss-09/admissions-ledger-demo" },
      { label: "Live demo ↗", href: "https://admissions-ledger-demo.vercel.app" },
    ],
    accent: "rgba(150, 150, 150, 0.28)",
  },
  {
    name: "MEDIC(AIDS)",
    description:
      "Predicts AIDS treatment outcomes with 76.4% accuracy using only CD4 and CD8 immune cell counts — affordable markers available anywhere. Combines ML classification with Kaplan-Meier survival analysis to identify high-risk patients. Independently validated drug resistance findings from the original 1996 clinical trial (p < 0.0001).",
    tech: ["Python", "Random Forest", "Survival Analysis", "scikit-learn", "Pandas"],
    link: "https://devpost.com/software/medic-aids",
    accent: "rgba(150, 150, 150, 0.28)",
  },
  {
    name: "Watt Warriors",
    description:
      "ML-based plastic-waste detection that placed 3rd ($1,500) at the Coogs for Energy Hackathon. Built a supervised computer-vision classifier on labeled RGB images, architected for future RGB + NIR sensor fusion.",
    tech: ["Python", "Computer Vision", "Image Classification", "scikit-learn"],
    link: null,
    accent: "rgba(150, 150, 150, 0.28)",
  },
  {
    name: "Owlai",
    description:
      "AI study assistant built in 36 hours at Rice Hackathon — chat-based Q&A on any subject, a dynamic quiz/exam generator, and a Gemini-powered voice tutor for natural, step-by-step concept explanations. Python + MongoDB backend.",
    tech: ["React", "Python", "Gemini", "MongoDB", "Flask"],
    link: "https://devpost.com/software/owlai",
    accent: "rgba(150, 150, 150, 0.28)",
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
          <div className="flex flex-shrink-0 flex-wrap justify-end gap-2">
            {(project.links || (project.link ? [{ label: "Devpost ↗", href: project.link }] : [])).map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium px-3 py-1 rounded-md
                  border border-gray-400 dark:border-gray-500
                  hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                  transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>
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
