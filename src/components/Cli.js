import { useEffect, useRef, useState } from "react";
import Snake from "./cli/Snake";
import TypingTest from "./cli/TypingTest";
import Tetris from "./cli/Tetris";
import Pong from "./cli/Pong";
import Breakout from "./cli/Breakout";
import Game2048 from "./cli/Game2048";
import { FS, resolve, nodeAt } from "./cli/fs";

const COMMANDS = [
  "help", "ls", "cd", "cat", "tree", "pwd", "whoami", "about", "experience",
  "projects", "resume", "contact", "skills", "open", "social", "email",
  "neofetch", "date", "clear", "theme", "color", "play", "games",
  "reboot", "poweroff", "exit", "echo", "sudo", "vim", "matrix",
];

const SECTION = {
  whoami: "home", about: "home", experience: "experience",
  projects: "projects", resume: "resume", contact: "contact",
};

const SOCIALS = [
  ["github", "github.com/gss-09", "https://github.com/gss-09"],
  ["linkedin", "in/shriyans-sai", "https://www.linkedin.com/in/shriyans-sai/"],
  ["instagram", "@shriyans_sai09", "https://www.instagram.com/shriyans_sai09/"],
];

const PROJECT_LINKS = {
  medic: "https://devpost.com/software/medic-aids",
  "medic(aids)": "https://devpost.com/software/medic-aids",
  owlai: "https://devpost.com/software/owlai",
  resume: "/resume.pdf",
};

const HELP = [
  ["explore", [
    ["ls", "list files"],
    ["cd <dir>", "move into a folder"],
    ["cat <file>", "read a file"],
    ["tree", "map the whole system"],
  ]],
  ["about", [
    ["whoami", "who I am"],
    ["skills", "skill chart"],
    ["experience", "work history"],
    ["projects", "things I've built"],
    ["resume", "the formal version"],
    ["contact", "get in touch"],
  ]],
  ["play", [
    ["play snake", "the classic"],
    ["play tetris", "falling blocks"],
    ["play pong", "you vs the machine"],
    ["play breakout", "brick breaker"],
    ["play 2048", "merge the tiles"],
    ["play type", "typing speed test"],
    ["play guess", "number guessing game"],
  ]],
  ["links", [
    ["open <name>", "medic · owlai · resume"],
    ["social", "github · linkedin · instagram"],
    ["email", "send me a mail"],
  ]],
  ["system", [
    ["theme <mode>", "light · dark"],
    ["color <name>", "amber · green · blue"],
    ["neofetch", "system info"],
    ["clear", "wipe the screen"],
  ]],
];

const SKILLS = [
  ["Python", 95], ["C++", 88], ["React", 86], ["scikit-learn", 90],
  ["Pandas", 84], ["SQL", 80], ["MongoDB", 74], ["Git / Linux", 88],
];

// streams a string in one character at a time, then drops a blinking cursor
function Typed({ text, speed = 12, onTick, onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) { onDone && onDone(); return; }
    const id = setTimeout(() => { setN(n + 1); onTick && onTick(); }, speed);
    return () => clearTimeout(id);
  }, [n, text, speed, onTick, onDone]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="tw-cur" />}
    </>
  );
}

// animated phosphor bar chart for `skills`
function SkillBars() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="skillchart">
      {SKILLS.map(([name, lvl], i) => (
        <div className="skrow" key={name} style={{ "--d": `${i * 80}ms` }}>
          <span className="skname">{name}</span>
          <span className="skbar">
            <span className="skfill" style={{ width: show ? `${lvl}%` : 0 }} />
          </span>
          <span className="skpct">{lvl}</span>
        </div>
      ))}
    </div>
  );
}

const BANNER =
` $$$$$$\\  $$\\   $$\\ $$$$$$$\\  $$$$$$\\ $$\\     $$\\  $$$$$$\\  $$\\   $$\\  $$$$$$\\
$$  __$$\\ $$ |  $$ |$$  __$$\\ \\_$$  _|\\$$\\   $$  |$$  __$$\\ $$$\\  $$ |$$  __$$\\
$$ /  \\__|$$ |  $$ |$$ |  $$ |  $$ |   \\$$\\ $$  / $$ /  $$ |$$$$\\ $$ |$$ /  \\__|
\\$$$$$$\\  $$$$$$$$ |$$$$$$$  |  $$ |    \\$$$$  /  $$$$$$$$ |$$ $$\\$$ |\\$$$$$$\\
 \\____$$\\ $$  __$$ |$$  __$$<   $$ |     \\$$  /   $$  __$$ |$$ \\$$$$ | \\____$$\\
$$\\   $$ |$$ |  $$ |$$ |  $$ |  $$ |      $$ |    $$ |  $$ |$$ |\\$$$ |$$\\   $$ |
\\$$$$$$  |$$ |  $$ |$$ |  $$ |$$$$$$\\     $$ |    $$ |  $$ |$$ | \\$$ |\\$$$$$$  |
 \\______/ \\__|  \\__|\\__|  \\__|\\______|    \\__|    \\__|  \\__|\\__|  \\__| \\______/`;

export default function Cli({ actions, inputId = "cli-input", standalone = false }) {
  const [log, setLog] = useState([
    { k: "banner", c: BANNER },
    { k: "sys", c: "SHRIYANS//OS shell — type 'help', or 'ls' to look around." },
  ]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const [cwd, setCwd] = useState([]);     // filesystem location
  const [app, setApp] = useState(null);   // a running fullscreen app (game)
  const [guess, setGuess] = useState(null); // active number-guess game state
  const endRef = useRef(null);

  const print = (entry) => setLog((l) => [...l, entry]);
  const scrollNow = () => endRef.current?.scrollIntoView({ block: "end" });
  const scrollEnd = () =>
    setTimeout(() => endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }), 0);

  // launch a game; when it exits, drop back to the shell with a result line
  const launch = (node, label) => {
    setApp({ node, label });
    print({ k: "sys", c: `launching ${label}…` });
  };
  const exitApp = (msg) => {
    setApp(null);
    if (msg) print({ k: "out", c: msg, typed: true });
    setTimeout(() => document.getElementById(inputId)?.focus(), 0);
    scrollEnd();
  };

  function startGuess() {
    setGuess({ secret: 1 + ((Math.random() * 100) | 0), tries: 0 });
    print({ k: "out", c: "I'm thinking of a number between 1 and 100. Guess it — type a number.", typed: true });
    scrollEnd();
  }
  function handleGuess(line) {
    const g = parseInt(line, 10);
    if (Number.isNaN(g)) { print({ k: "err", c: "that's not a number. (or type 'q' to quit)" }); return; }
    const tries = guess.tries + 1;
    if (g === guess.secret) {
      print({ k: "out", c: `🎉 got it — ${guess.secret} in ${tries} tries.`, typed: true });
      setGuess(null);
    } else {
      setGuess({ ...guess, tries });
      print({ k: "out", c: g < guess.secret ? "↑ higher" : "↓ lower" });
    }
  }

  function run(raw) {
    print({ k: "cmd", c: raw, cwd: [...cwd] });
    const line = raw.trim();
    if (!line) { scrollEnd(); return; }
    setHist((h) => [line, ...h]);
    setHi(-1);

    // number-guessing minigame intercepts input while active
    if (guess) {
      if (/^q(uit)?$/i.test(line)) { print({ k: "sys", c: "left the game." }); setGuess(null); }
      else handleGuess(line);
      scrollEnd();
      return;
    }

    const [name, ...args] = line.split(/\s+/);
    const n = name.toLowerCase();
    let navigated = false;

    switch (n) {
      case "help":
        print({ k: "out", c: (
          <div className="cli-help">
            {HELP.map(([title, rows]) => (
              <div className="hgroup" key={title}>
                <div className="htitle">{title}</div>
                {rows.map(([cmd, desc]) => (
                  <div className="hrow" key={cmd}>
                    <span className="hcmd">{cmd}</span>
                    <span className="hdesc">{desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) });
        break;

      case "ls": {
        const path = resolve(cwd, args[0] || "");
        const node = nodeAt(path);
        if (!node) { print({ k: "err", c: `ls: ${args[0]}: no such file or directory` }); break; }
        if (node.type === "file") { print({ k: "out", c: args[0] }); break; }
        print({ k: "out", c: (
          <div className="lsgrid">
            {Object.entries(node.children).map(([nm, ch]) => (
              <span key={nm} className={ch.type === "dir" ? "lsdir" : "lsfile"}>
                {nm}{ch.type === "dir" ? "/" : ""}
              </span>
            ))}
          </div>
        ) });
        break;
      }

      case "cd": {
        if (!args[0]) { setCwd([]); break; } // bare `cd` goes home, like a real shell
        const path = resolve(cwd, args[0]);
        const node = nodeAt(path);
        if (!node) print({ k: "err", c: `cd: ${args[0]}: no such file or directory` });
        else if (node.type !== "dir") print({ k: "err", c: `cd: ${args[0]}: not a directory` });
        else setCwd(path);
        break;
      }

      case "pwd":
        print({ k: "out", c: "~/" + cwd.join("/") });
        break;

      case "cat": {
        if (!args[0]) { print({ k: "err", c: "usage: cat <file>" }); break; }
        const path = resolve(cwd, args[0]);
        const node = nodeAt(path);
        if (!node) print({ k: "err", c: `cat: ${args[0]}: no such file or directory` });
        else if (node.type === "dir") print({ k: "err", c: `cat: ${args[0]}: is a directory` });
        else print({ k: "out", c: node.content, typed: true, speed: 6 });
        break;
      }

      case "tree": {
        const root = nodeAt(cwd) || FS;
        const lines = [];
        const walk = (node, prefix) => {
          const kids = Object.entries(node.children);
          kids.forEach(([nm, ch], i) => {
            const last = i === kids.length - 1;
            lines.push(prefix + (last ? "└── " : "├── ") + nm + (ch.type === "dir" ? "/" : ""));
            if (ch.type === "dir") walk(ch, prefix + (last ? "    " : "│   "));
          });
        };
        lines.push("~/" + cwd.join("/"));
        walk(root, "");
        print({ k: "out", c: lines.join("\n"), typed: true, speed: 4 });
        break;
      }

      case "whoami":
      case "about":
        actions.go("home");
        navigated = true;
        print({ k: "out", c: "Shriyans Sai — CS student @ University of Houston, building at the intersection of AI, machine learning & software.", typed: true });
        break;

      case "experience":
      case "projects":
      case "resume":
      case "contact":
        actions.go(SECTION[n]);
        navigated = true;
        print({ k: "out", c: `→ jumped to ${n}`, typed: true });
        break;

      case "skills":
        print({ k: "out", c: <SkillBars /> });
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
        print({ k: "out", c: "opening mail → shriyansai73@gmail.com", typed: true });
        break;

      case "open": {
        const key = (args[0] || "").toLowerCase();
        const url = PROJECT_LINKS[key];
        if (url) {
          actions.openLink(url);
          print({ k: "out", c: `opening ${key} ↗`, typed: true });
        } else {
          print({ k: "err", c: `no link for '${args[0] || ""}'. try: open medic | owlai | resume` });
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
        if (a === "light") { actions.setLight(true); print({ k: "out", c: "theme → light" }); }
        else if (a === "dark") { actions.setLight(false); print({ k: "out", c: "theme → dark" }); }
        else print({ k: "err", c: "usage: theme <light|dark> — for glow color, see 'color'" });
        break;
      }

      case "color": {
        const a = (args[0] || "").toLowerCase();
        if (["amber", "green", "blue"].includes(a)) {
          actions.setAccent(a);
          print({ k: "out", c: `phosphor → ${a}` });
        } else print({ k: "err", c: "usage: color <amber|green|blue>" });
        break;
      }

      case "play": {
        const which = (args[0] || "").toLowerCase();
        if (which === "snake") launch(<Snake onExit={exitApp} />, "snake");
        else if (which === "tetris") launch(<Tetris onExit={exitApp} />, "tetris");
        else if (which === "pong") launch(<Pong onExit={exitApp} />, "pong");
        else if (which === "breakout" || which === "brick") launch(<Breakout onExit={exitApp} />, "breakout");
        else if (which === "2048") launch(<Game2048 onExit={exitApp} />, "2048");
        else if (which === "type" || which === "typing") launch(<TypingTest onExit={exitApp} />, "typing test");
        else if (which === "guess") startGuess();
        else print({ k: "err", c: "usage: play <snake|tetris|pong|breakout|2048|type|guess>" });
        break;
      }
      case "games":
        print({ k: "out", c: (
          <div className="cli-help">
            <div className="hrow"><span className="hcmd">play snake</span><span className="hdesc">arrows / wasd to move</span></div>
            <div className="hrow"><span className="hcmd">play tetris</span><span className="hdesc">falling blocks, ghost drop</span></div>
            <div className="hrow"><span className="hcmd">play pong</span><span className="hdesc">first to 7 vs the machine</span></div>
            <div className="hrow"><span className="hcmd">play breakout</span><span className="hdesc">brick breaker, 3 lives</span></div>
            <div className="hrow"><span className="hcmd">play 2048</span><span className="hdesc">merge tiles, charge the phosphor</span></div>
            <div className="hrow"><span className="hcmd">play type</span><span className="hdesc">typing speed test</span></div>
            <div className="hrow"><span className="hcmd">play guess</span><span className="hdesc">number guessing game</span></div>
          </div>
        ) });
        break;

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
        if (args.join(" ").toLowerCase() === "make me a sandwich")
          print({ k: "out", c: "okay. 🥪", typed: true });
        else print({ k: "err", c: "nice try. permission denied 😏" });
        break;
      case "make":
        if (args.join(" ").toLowerCase() === "me a sandwich")
          print({ k: "out", c: "what? make it yourself.", typed: true });
        else print({ k: "err", c: `make: *** no rule to make target '${args.join(" ")}'. stop.` });
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

  // ghost autocomplete — the dim remainder of the matched command
  const firstWord = value.split(/\s+/)[0];
  const ghost =
    value && !value.includes(" ")
      ? (COMMANDS.find((c) => c.startsWith(firstWord.toLowerCase()) && c !== firstWord.toLowerCase()) || "").slice(firstWord.length)
      : "";

  function onKeyDown(e) {
    e.stopPropagation();
    if (e.key === "Enter") { run(value); setValue(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hist.length) { const ni = Math.min(hi + 1, hist.length - 1); setHi(ni); setValue(hist[ni]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const ni = Math.max(hi - 1, -1); setHi(ni); setValue(ni === -1 ? "" : hist[ni]);
    } else if (e.key === "Tab" || (e.key === "ArrowRight" && ghost && value.length === e.target.selectionStart)) {
      e.preventDefault();
      if (ghost) setValue(firstWord + ghost);
    }
  }

  const prompt = (path) => (
    <span className="cli-ps">
      <b>shriyans</b>@<b>portfolio</b>:<span className="cli-cwd">~/{path.join("/")}</span>$
    </span>
  );

  return (
    <div className={"cli" + (standalone ? " standalone" : "")} onClick={() => document.getElementById(inputId)?.focus()}>
      <div className="cli-log">
        {log.map((e, i) => (
          <div key={i} className={"cli-line " + e.k}>
            {e.k === "cmd" ? (
              <><span className="cli-ps mini">❯</span> <span className="cmdtext">{e.c}</span></>
            ) : e.k === "banner" ? (
              <pre className="cli-banner">{e.c}</pre>
            ) : e.typed && typeof e.c === "string" ? (
              <Typed text={e.c} speed={e.speed || 12} onTick={scrollNow} />
            ) : (
              <span className="reveal">{e.c}</span>
            )}
          </div>
        ))}
      </div>

      {app ? (
        <div className="cli-app">{app.node}</div>
      ) : (
        <div className="cli-input-row">
          {prompt(cwd)}
          <span className="cli-field">
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
              placeholder={guess ? "type your guess…" : "type a command — try 'help' or 'ls'"}
            />
            {ghost && <span className="cli-ghost" aria-hidden>{value}<i>{ghost}</i></span>}
          </span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
