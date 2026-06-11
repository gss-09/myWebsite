import { useEffect, useRef, useState } from "react";

const PROMPTS = [
  "the quick brown fox jumps over the lazy dog",
  "machine learning models are only as good as their data",
  "shriyans builds at the intersection of ai and software",
  "premature optimization is the root of all evil",
  "type fast type clean and never trust user input",
  "a neural network is just matrix math wearing a costume",
];

export default function TypingTest({ onExit }) {
  const [target] = useState(() => PROMPTS[(Math.random() * PROMPTS.length) | 0]);
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const elapsed = start ? (Date.now() - start) / 1000 : 0;
  const words = target.trim().split(/\s+/).length;
  const wpm = done && elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
  const correct = [...typed].filter((c, i) => c === target[i]).length;
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;

  const onChange = (e) => {
    if (done) return;
    const v = e.target.value;
    if (!start && v.length) setStart(Date.now());
    setTyped(v);
    if (v.length >= target.length) setDone(true);
  };

  const onKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Escape") onExit(done ? `typing · ${wpm} wpm @ ${acc}%` : "typing test — cancelled");
    if (e.key === "Enter" && done) {
      setTyped(""); setStart(null); setDone(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="game type-test" onClick={() => inputRef.current?.focus()}>
      <div className="game-hud">
        <span className="g-title">▸ TYPING TEST</span>
        <span className="g-score">{wpm ? `${wpm} WPM` : "go!"}</span>
        <span className="g-keys">esc quit{done ? " · enter again" : ""}</span>
      </div>
      <div className="type-target">
        {[...target].map((ch, i) => {
          let cls = "tc";
          if (i < typed.length) cls += typed[i] === ch ? " ok" : " bad";
          else if (i === typed.length) cls += " cursor";
          return (
            <span key={i} className={cls}>
              {ch === " " ? " " : ch}
            </span>
          );
        })}
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
      {done && (
        <div className="type-result">
          <span><b>{wpm}</b> wpm</span>
          <span><b>{acc}%</b> accuracy</span>
          <span className="dim">[enter] again · [esc] quit</span>
        </div>
      )}
    </div>
  );
}
