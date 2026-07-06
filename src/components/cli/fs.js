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

Awarded a competitive $4,000 SURF fellowship to see
whether world models apply to time-series forecasting.
Built a PyTorch DreamerV3 RSSM for uni/multivariate
forecasting; a rolling-origin method cut 120-step MSE
from 0.93 to 0.18 — up to 20× lower error than naive
baselines on structured signals.`
    ),
    "math-tutor.txt": F(
`[work]  Mathematics Tutor
University of Houston · 2024.08 → 26.05

Tutored 5–10 students daily in Pre-Calculus,
Calculus I & II, Statistics, and Engineering Math;
strengthened problem-solving through adaptive
teaching, tailoring sessions to diverse learners.`
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

Benchmarked open-source LLMs on company hardware by
inference speed, resource use, and response quality;
engineered a real-time voice assistant on local LLMs;
built RAG systems answering from company documents
and internal knowledge bases.`
    ),
  }),

  projects: D({
    "college-connect.md": F(
`# college-connect                      2026.07
commit 9c2f1e8  (HEAD → main, tag: client)
--------------------------------------------------
Multi-campus college administration platform,
custom-built to a real client's requirements —
RUNNING IN PRODUCTION at a college in India with
2,000–3,000 students. Hostel beds, exams & marks
(Excel import/export), maintenance tickets, parent
portal, per-module permissions + full audit log.
Marks arrive as messy real-world spreadsheets; the
importer normalizes names + duplicate roll numbers
and flags bad rows instead of choking on them.
Public repo is a sanitized fork, fictional data.

stack   python · flask · postgres · vanilla-js
remote  github.com/gss-09/college-connect-demo
live    college-connect-demo.vercel.app
        ( run 'open college' to launch )`
    ),
    "admissions-ledger.md": F(
`# admissions-ledger                    2026.07
commit 7d48b2a  (tag: client)
--------------------------------------------------
Recruiting & revenue analytics for the same client —
tracks 1,400+ real applicants in production through
the admissions funnel: per-recruiter conversion, fee
analytics, true cost-per-admission. Role-scoped to
the field level — PII/fee columns stripped
server-side per role.

stack   python · flask · postgres · vanilla-js
remote  github.com/gss-09/admissions-ledger-demo
live    admissions-ledger-demo.vercel.app
        ( run 'open ledger' to launch )`
    ),
    "medic-aids.md": F(
`# medic(aids)                          2026.01
commit a1f76c4  (tag: hackathon)
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

  play snake      classic snake, phosphor glow
  play tetris     falling blocks, ghost drop
  play pong       first to 7 vs the machine
  play breakout   brick breaker, 3 lives
  play 2048       merge tiles, charge the phosphor
  play type       typing-speed test (live WPM)
  play guess      number guessing game

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
