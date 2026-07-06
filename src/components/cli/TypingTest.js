import { useEffect, useRef, useState } from "react";
import { sfx, useBest, TitleCard } from "./arcade";

// typing test — teletype edition: ink on a cream paper strip, carriage
// cursor, a clack per keystroke and a bell when the line completes.
const PROMPTS = [
  "the quick brown fox jumps over the lazy dog",
  "machine learning models are only as good as their data",
  "shriyans builds at the intersection of ai and software",
  "premature optimization is the root of all evil",
  "type fast type clean and never trust user input",
  "a neural network is just matrix math wearing a costume",
];

export default function TypingTest({ onExit }) {
  const [phase, setPhase] = useState("title");
  const [target, setTarget] = useState(() => PROMPTS[(Math.random() * PROMPTS.length) | 0]);
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState(null);
  const [done, setDone] = useState(false);
  const [best, submitBest] = useBest("typing");
  const [newBest, setNewBest] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (phase === "play") inputRef.current?.focus();
  }, [phase]);

  const elapsed = start ? (Date.now() - start) / 1000 : 0;
  const words = target.trim().split(/\s+/).length;
  const wpm = done && elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
  const correct = [...typed].filter((c, i) => c === target[i]).length;
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;

  const onChange = (e) => {
    if (done) return;
    const v = e.target.value;
    if (v.length > typed.length) sfx.play({ freq: 150, dur: 0.02, vol: 0.045 });
    if (!start && v.length) setStart(Date.now());
    setTyped(v);
    if (v.length >= target.length) {
      setDone(true);
      sfx.play({ freq: 1180, dur: 0.45, type: "sine", vol: 0.06 }); // carriage bell
      const el = (Date.now() - start) / 1000;
      const w = Math.round((words / el) * 60);
      setNewBest(submitBest(w));
    }
  };

  const again = () => {
    setTarget(PROMPTS[(Math.random() * PROMPTS.length) | 0]);
    setTyped(""); setStart(null); setDone(false); setNewBest(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Escape") onExit(done ? `typing · ${wpm} wpm @ ${acc}%` : "typing test — cancelled");
    if (e.key === "Enter" && done) again();
  };

  // title phase: no input mounted yet, listen on window
  useEffect(() => {
    if (phase !== "title") return;
    const onKey = (e) => {
      if (e.key === "Escape") return onExit("typing test — cancelled");
      e.preventDefault();
      sfx.play({ freq: 150, dur: 0.02, vol: 0.045 });
      setPhase("play");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onExit]);

  return (
    <div className="game type-test cab-tty" onClick={() => inputRef.current?.focus()}>
      <div className="game-hud">
        <span className="g-title">▸ TELETYPE</span>
        <span className="g-score">{wpm ? `${wpm} WPM` : best ? `BEST ${best} WPM` : "go!"}</span>
        <span className="g-keys">esc quit{done ? " · enter again" : ""}</span>
      </div>
      <div className="tty-paper">
        {phase === "title" ? (
          <TitleCard big="TELETYPE" tagline="one line, full speed, clean copy" best={best} hint="press any key to load paper" />
        ) : (
          <>
            <div className="type-target">
              {[...target].map((ch, i) => {
                let cls = "tc";
                if (i < typed.length) cls += typed[i] === ch ? " ok" : " bad";
                else if (i === typed.length) cls += " cursor";
                return (
                  <span key={i} className={cls}>
                    {ch === " " ? " " : ch}
                  </span>
                );
              })}
            </div>
            {done && (
              <div className="type-result">
                <span><b>{wpm}</b> wpm</span>
                <span><b>{acc}%</b> accuracy</span>
                {newBest && <span className="tty-stamp">NEW BEST</span>}
                <span className="dim">[enter] again · [esc] quit</span>
              </div>
            )}
          </>
        )}
      </div>
      <input
        ref={inputRef}
        className="type-input"
        value={typed}
        onChange={onChange}
        onKeyDown={onKeyDown}
        spellCheck="false"
        autoComplete="off"
        aria-label="typing test input"
      />
    </div>
  );
}
