import { useEffect, useRef, useState } from "react";

// Snake, rendered on a canvas with phosphor glow + a fading trail.
// Uses the current --amber phosphor color so it matches the active theme.
const COLS = 26;
const ROWS = 16;

export default function Snake({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);

  // mutable game state lives in a ref so the loop sees fresh values
  const game = useRef(null);
  if (!game.current) {
    game.current = {
      snake: [{ x: 8, y: 8 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 16, y: 8 },
      grow: 0,
      tick: 0,
    };
  }

  const reset = () => {
    game.current = {
      snake: [{ x: 8, y: 8 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 16, y: 8 },
      grow: 0,
      tick: 0,
    };
    setScore(0);
    setOver(false);
    setPaused(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === "Escape") return onExit(score > 0 ? `snake — final score ${score}` : "snake — see you next time");
      if (k === "Enter" && over) return reset();
      if ((k === " " || k === "p") && !over) {
        e.preventDefault();
        setPaused((p) => !p);
        return;
      }
      const g = game.current;
      const set = (x, y) => {
        // disallow reversing directly into yourself
        if (g.dir.x === -x && g.dir.y === -y) return;
        g.next = { x, y };
      };
      if (k === "ArrowUp" || k === "w") { e.preventDefault(); set(0, -1); }
      else if (k === "ArrowDown" || k === "s") { e.preventDefault(); set(0, 1); }
      else if (k === "ArrowLeft" || k === "a") { e.preventDefault(); set(-1, 0); }
      else if (k === "ArrowRight" || k === "d") { e.preventDefault(); set(1, 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [score, over, onExit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // size the board as wide as the pane allows without overflowing vertically
    let cell = 22;
    const fit = () => {
      const stage = canvas.parentElement;             // .game-stage
      const w = (stage?.parentElement?.clientWidth || COLS * 22) - 2;
      const scroller = canvas.closest(".crt-scroll, .cli.standalone");
      const availH = (scroller?.clientHeight || window.innerHeight) - 140; // hud + padding
      cell = Math.min(w / COLS, Math.max(160, availH) / ROWS);
      canvas.style.width = COLS * cell + "px";
      canvas.style.height = ROWS * cell + "px";
      canvas.width = Math.round(COLS * cell * dpr);
      canvas.height = Math.round(ROWS * cell * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const phosphor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--amber").trim() || "#ffb000";

    let raf, last = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const g = game.current;
      const speed = Math.max(70, 130 - g.snake.length * 2); // speeds up as you grow
      if (!over && !paused && ts - last > speed) {
        last = ts;
        g.dir = g.next;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
        const hit =
          head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
          g.snake.some((s) => s.x === head.x && s.y === head.y);
        if (hit) {
          setOver(true);
        } else {
          g.snake.unshift(head);
          if (head.x === g.food.x && head.y === g.food.y) {
            setScore((s) => s + 1);
            g.food = {
              x: (Math.random() * COLS) | 0,
              y: (Math.random() * ROWS) | 0,
            };
          } else {
            g.snake.pop();
          }
        }
      }

      // ---- draw ----
      const col = phosphor();
      ctx.clearRect(0, 0, COLS * cell, ROWS * cell);
      // faint grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, ROWS * cell); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(COLS * cell, y * cell); ctx.stroke();
      }
      // pulsing food
      const pulse = 0.5 + 0.5 * Math.sin(ts / 200);
      ctx.fillStyle = "#ff5b6f";
      ctx.shadowColor = "#ff5b6f";
      ctx.shadowBlur = 10 + 8 * pulse;
      const fc = cell * 0.5;
      ctx.beginPath();
      ctx.arc(g.food.x * cell + cell / 2, g.food.y * cell + cell / 2, fc * (0.55 + 0.12 * pulse), 0, 7);
      ctx.fill();
      // snake with glow + fading tail
      ctx.shadowColor = col;
      ctx.fillStyle = col;
      g.snake.forEach((s, i) => {
        const t = 1 - i / (g.snake.length + 2);
        ctx.globalAlpha = 0.35 + 0.65 * t;
        ctx.shadowBlur = i === 0 ? 16 : 8 * t;
        const pad = i === 0 ? 2 : 3;
        const r = 5;
        const x = s.x * cell + pad, y = s.y * cell + pad, w = cell - pad * 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, w, r);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [over, paused]);

  return (
    <div className="game">
      <div className="game-hud">
        <span className="g-title">▸ SNAKE</span>
        <span className="g-score">SCORE {String(score).padStart(3, "0")}</span>
        <span className="g-keys">arrows/wasd · space pause · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="snake-canvas" />
        {paused && !over && <div className="game-veil">PAUSED</div>}
        {over && (
          <div className="game-veil over">
            <div className="go-title">GAME OVER</div>
            <div className="go-score">score · {score}</div>
            <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
