import { useRef, useState } from "react";

const COMMANDS = [
  "help", "ls", "whoami", "about", "experience", "projects", "resume",
  "contact", "skills", "open", "social", "email", "neofetch", "date",
  "clear", "theme", "reboot", "poweroff", "exit", "echo", "sudo", "vim", "matrix",
];

const SECTION = {
  whoami: "home", about: "home", experience: "experience",
  projects: "projects", resume: "resume", contact: "contact",
};

const SKILLS = "C++ · Python · SQL · React · scikit-learn · Pandas · MongoDB · Flask · Git · Linux";

const SOCIALS = [
  ["github", "github.com/gss-09", "https://github.com/gss-09"],
  ["linkedin", "in/shriyans-sai", "https://www.linkedin.com/in/shriyans-sai/"],
  ["instagram", "@shriyans_sai09", "https://www.instagram.com/shriyans_sai09/"],
];

const PROJECT_LINKS = {
  medic: "https://devpost.com/software/medic-aids",
  "medic(aids)": "https://devpost.com/software/medic-aids",
  owlai: "https://devpost.com/software/owlai",
};

export default function Cli({ actions, inputId = "cli-input", standalone = false }) {
  const [log, setLog] = useState([
    { k: "sys", c: "SHRIYANS//OS shell — type 'help' for commands." },
  ]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const endRef = useRef(null);

  const print = (entry) => setLog((l) => [...l, entry]);
  // keep the latest output + prompt in view after it renders
  const scrollEnd = () =>
    setTimeout(
      () => endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }),
      0
    );

  function run(raw) {
    print({ k: "cmd", c: raw });
    const line = raw.trim();
    if (!line) {
      scrollEnd();
      return;
    }
    setHist((h) => [line, ...h]);
    setHi(-1);
    const [name, ...args] = line.split(/\s+/);
    const n = name.toLowerCase();
    let navigated = false; // commands that jump to a section shouldn't scroll back

    switch (n) {
      case "help":
        print({ k: "out", c: (
          <div className="cli-help">
            <div><b>navigate</b>whoami · experience · projects · resume · contact</div>
            <div><b>info</b>ls · skills · social · email · neofetch · date</div>
            <div><b>actions</b>open &lt;medic|owlai&gt; · theme &lt;amber|green|blue|light|dark&gt;</div>
            <div><b>system</b>clear · reboot · poweroff · echo &lt;text&gt;</div>
            <div className="dim">also: arrow/scroll, j·k = prev/next section, 1–5 = jump, / = focus this prompt</div>
          </div>
        ) });
        break;
      case "ls":
        print({ k: "out", c: "whoami/  experience/  projects/  resume/  contact/" });
        break;
      case "whoami":
      case "about":
        actions.go("home");
        navigated = true;
        print({ k: "out", c: "Shriyans Sai — CS student @ University of Houston, building at the intersection of AI, machine learning & software." });
        break;
      case "experience":
      case "projects":
      case "resume":
      case "contact":
        actions.go(SECTION[n]);
        navigated = true;
        print({ k: "out", c: `→ jumped to ${n}` });
        break;
      case "skills":
        print({ k: "out", c: SKILLS });
        break;
      case "social":
        print({ k: "out", c: (
          <div>{SOCIALS.map(([a, b, h]) => (
            <div key={a}>
              <span className="cli-k">{a}</span>
              <a href={h} target="_blank" rel="noopener noreferrer">{b} ↗</a>
            </div>
          ))}</div>
        ) });
        break;
      case "email":
        actions.openLink("mailto:shriyansai73@gmail.com");
        print({ k: "out", c: "opening mail → shriyansai73@gmail.com" });
        break;
      case "open": {
        const key = (args[0] || "").toLowerCase();
        const url = PROJECT_LINKS[key];
        if (url) {
          actions.openLink(url);
          print({ k: "out", c: `opening ${key} ↗` });
        } else {
          print({ k: "err", c: `no link for '${args[0] || ""}'. try: open medic | open owlai` });
        }
        break;
      }
      case "neofetch":
        print({ k: "out", c: (
          <pre className="neofetch">{`   ▟███▙     shriyans@portfolio
  ▟█▛ ▜█▙    ---------------------
  ▜█▙ ▟█▛    role    CS student @ UH
   ▜███▛     focus   AI · ML · software
    ▝▘       gpa     3.93 / 4.0
             stack   Python · React · ML
             status  open to internships`}</pre>
        ) });
        break;
      case "date":
        print({ k: "out", c: new Date().toString() });
        break;
      case "echo":
        print({ k: "out", c: args.join(" ") });
        break;
      case "clear":
        setLog([]);
        break;
      case "theme": {
        const a = (args[0] || "").toLowerCase();
        if (["amber", "green", "blue"].includes(a)) {
          actions.setAccent(a);
          print({ k: "out", c: `phosphor → ${a}` });
        } else if (a === "light") {
          actions.setLight(true);
          print({ k: "out", c: "theme → light" });
        } else if (a === "dark") {
          actions.setLight(false);
          print({ k: "out", c: "theme → dark" });
        } else {
          print({ k: "err", c: "usage: theme <amber|green|blue|light|dark>" });
        }
        break;
      }
      case "reboot":
        print({ k: "out", c: "rebooting…" });
        actions.reboot();
        break;
      case "poweroff":
      case "exit":
        print({ k: "out", c: "powering off…" });
        actions.powerOff();
        break;
      case "sudo":
        print({ k: "err", c: "nice try. permission denied 😏" });
        break;
      case "vim":
        print({ k: "out", c: "to exit vim: power off the computer and walk away." });
        break;
      case "matrix":
        actions.matrix();
        print({ k: "out", c: "wake up…" });
        break;
      default:
        print({ k: "err", c: `command not found: ${name}. type 'help'` });
    }
    if (!navigated) scrollEnd();
  }

  function onKeyDown(e) {
    e.stopPropagation(); // keep global section-nav from firing while typing
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hist.length) {
        const ni = Math.min(hi + 1, hist.length - 1);
        setHi(ni);
        setValue(hist[ni]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const ni = Math.max(hi - 1, -1);
      setHi(ni);
      setValue(ni === -1 ? "" : hist[ni]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const m = COMMANDS.filter((c) => c.startsWith(value.toLowerCase()));
      if (m.length === 1) setValue(m[0]);
    }
  }

  return (
    <div
      className={"cli" + (standalone ? " standalone" : "")}
      onClick={() => document.getElementById(inputId)?.focus()}
    >
      <div className="cli-log">
        {log.map((e, i) => (
          <div key={i} className={"cli-line " + e.k}>
            {e.k === "cmd" ? (
              <>
                <span className="cli-ps">❯</span> {e.c}
              </>
            ) : (
              e.c
            )}
          </div>
        ))}
      </div>
      <div className="cli-input-row">
        <span className="cli-ps">
          <b>shriyans</b>@<b>portfolio</b>:~$
        </span>
        <input
          id={inputId}
          className="cli-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={scrollEnd}
          spellCheck="false"
          autoComplete="off"
          aria-label="terminal input"
          placeholder="type a command — try 'help'"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
