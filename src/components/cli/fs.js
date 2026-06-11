// A tiny in-memory unix-ish filesystem holding Shriyans' real info as files.
// Commands (ls / cd / cat / tree / pwd) walk this tree. File contents are
// plain strings so they can stream in character-by-character like a real shell.

const F = (content) => ({ type: "file", content });
const D = (children) => ({ type: "dir", children });

export const FS = D({
  "about.txt": F(
`SHRIYANS SAI
============================================
role     CS student @ University of Houston
focus    AI · machine learning · software
gpa      3.93 / 4.0
status   ● open to internships [2026]

Building systems at the intersection of AI,
machine learning & software. SURF research
scholar exploring world-models for time-series.`
  ),

  "skills.txt": F(
`languages   C++ · Python · SQL
ml / data   scikit-learn · Pandas · NumPy · PyTorch
web         React · Flask · Node
infra       MongoDB · Git · Linux · Docker

( tip: run 'skills' for the animated chart )`
  ),

  "resume.pdf": F(
`%PDF-1.7  ·  binary file (12 KB)
----------------------------------------
this is a PDF — don't cat it, open it:

  > open resume        download / view`
  ),

  "contact.txt": F(
`email       shriyansai73@gmail.com
github      github.com/gss-09
linkedin    linkedin.com/in/shriyans-sai
instagram   @shriyans_sai09

( run 'social' or 'email' to open these )`
  ),

  experience: D({
    "surf-researcher.txt": F(
`[research]  Undergraduate Researcher — SURF Scholar
University of Houston · Advisor: Prof. Sen Lin
2026.01 → now

Awarded the SURF scholarship to study whether
world-model architectures (e.g. DreamerV3) can be
adapted for time-series prediction — training and
benchmarking adapted models vs. traditional methods.`
    ),
    "math-tutor.txt": F(
`[work]  Mathematics Tutor
University of Houston · 2024.08 → now

Tutor 5–10 students daily in Pre-Calculus,
Calculus I & II, Statistics, and Engineering Math;
tailor sessions to diverse learning styles.`
    ),
    "ieee-coordinator.txt": F(
`[lead]  Events Coordinator
IEEE — UH Student Branch · 2025.08 → 26.01

Managed logistics — rooms, scheduling, equipment —
and co-hosted events with 100+ attendees alongside
other student orgs.`
    ),
    "genai-intern.txt": F(
`[work]  Generative AI & LLM Intern
Ideabytes Inc. · 2025.05 → 07

Researched open-source LLMs for local deployment and
built a prototype voice assistant for real-time
responses.`
    ),
  }),

  projects: D({
    "medic-aids.md": F(
`# medic(aids)                          2026.01
commit a1f76c4  (HEAD → main, tag: hackathon)
--------------------------------------------------
Predicts AIDS treatment outcomes at 76.4% accuracy
from only CD4/CD8 counts — ML classification +
Kaplan-Meier survival analysis (p < 0.0001).

stack   python · random-forest · scikit-learn
remote  devpost.com/software/medic-aids
        ( run 'open medic' to launch )`
    ),
    "watt-warriors.md": F(
`# watt-warriors                        2025.11
commit b3e91d0  (tag: hackathon)
--------------------------------------------------
ML-based plastic-waste detection — 3rd place ($1,500)
at the Coogs for Energy Hackathon. Supervised
computer-vision classifier on labeled RGB images,
architected for future RGB + NIR fusion.

stack   python · computer-vision · rgb+nir`
    ),
    "owlai.md": F(
`# owlai                                2025.09
commit 3dc1772  (tag: hackathon)
--------------------------------------------------
AI study assistant built in 36 hours at Rice
Hackathon — chat Q&A, a dynamic quiz/exam generator,
and a Gemini-powered voice tutor; Python + MongoDB.

stack   react · gemini · mongodb · flask
remote  devpost.com/software/owlai
        ( run 'open owlai' to launch )`
    ),
  }),

  games: D({
    "README.txt": F(
`ARCADE — playable right here in the tube.

  play snake     classic snake, phosphor glow
  play type      typing-speed test (live WPM)
  play guess     number guessing game

arrow keys move · esc quits · enter restarts`
    ),
  }),

  ".secret": D({
    "flag.txt": F(
`you found the hidden directory. nice instincts.

      ( (
       ) )
    ........
    |      |]
    \\      /
     \`----'

people who read flag.txt get coffee on me —
mention it when you reach out: shriyansai73@gmail.com

more easter eggs: 'matrix' · 'sudo make me a sandwich'`
    ),
  }),
});

// turn "/a/b" or "../c" into a normalized path array, relative to cwd
export function resolve(cwd, arg = "") {
  const base = arg.startsWith("/") ? [] : [...cwd];
  for (const seg of arg.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") base.pop();
    else base.push(seg);
  }
  return base;
}

// node at a path array, or null if it doesn't exist
export function nodeAt(path) {
  let n = FS;
  for (const seg of path) {
    if (n.type !== "dir" || !n.children[seg]) return null;
    n = n.children[seg];
  }
  return n;
}

export const pathStr = (path) => "~/" + path.join("/") + (path.length ? "" : "");
