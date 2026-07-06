import { useEffect, useRef, useState } from "react";
import { sfx, useBest, TitleCard, drawDigits } from "./arcade";

// snake ii — nokia 3310 lcd. olive screen, near-black pixels, zero glow.
// score lives on-canvas in a top strip; the tail leaves an lcd smear.
const COLS = 26;
const ROWS = 16;
const LCD = "#9ead86";   // passive-matrix olive
const INK = "#26301c";   // pixel ink

const ART = [
  "█▀ █▄ █ ▄▀█ █▄▀ █▀▀   █ █",
  "▄█ █ ▀█ █▀█ █ █ ██▄   █ █",
].join("\n");

export default function Snake({ onExit }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("title");
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [best, submitBest] = useBest("snake");
  const [newBest, setNewBest] = useState(false);

  // mutable game state lives in a ref so the loop sees fresh values
  const game = useRef(null);
  const fresh = () => ({
    snake: [{ x: 8, y: 8 }],
    dir: { x: 1, y: 0 },
    next: { x: 1, y: 0 },
    food: { x: 16, y: 8 },
    trail: [], // lcd ghost cells left behind by the tail
    grow: 0,
  });
  if (!game.current) game.current = fresh();

  const reset = () => {
    game.current = fresh();
    setScore(0);
    setOver(false);
    setPaused(false);
    setNewBest(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === "Escape") return onExit(score > 0 ? `snake — final score ${score}` : "snake — see you next time");
      if (phase === "title") {
        e.preventDefault();
        sfx.play({ freq: 1180, dur: 0.05 });
        sfx.play({ freq: 1560, dur: 0.06, delay: 0.06 });
        setPhase("play");
        return;
      }
      if (k === "m" || k === "M") { sfx.toggleMute(); return; }
      if (k === "Enter" && over) { sfx.play({ freq: 980, dur: 0.05 }); return reset(); }
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
  }, [score, over, phase, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // size the board as wide as the pane allows without overflowing vertically
    let cell = 22, strip = 26;
    const fit = () => {
      const stage = canvas.parentElement;             // .game-stage
      const w = (stage?.parentElement?.clientWidth || COLS * 22) - 32;
      const scroller = canvas.closest(".crt-scroll, .cli.standalone");
      const availH = (scroller?.clientHeight || window.innerHeight) - 160;
      cell = Math.min(w / COLS, Math.max(160, availH) / (ROWS + 1.3));
      strip = Math.round(cell * 1.3);
      canvas.style.width = COLS * cell + "px";
      canvas.style.height = ROWS * cell + strip + "px";
      canvas.width = Math.round(COLS * cell * dpr);
      canvas.height = Math.round((ROWS * cell + strip) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    let raf, last = 0, lastTs = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      const g = game.current;
      const speed = Math.max(70, 130 - g.snake.length * 2); // speeds up as you grow
      if (phase === "play" && !over && !paused && ts - last > speed) {
        last = ts;
        g.dir = g.next;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
        const hit =
          head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
          g.snake.some((s) => s.x === head.x && s.y === head.y);
        if (hit) {
          setOver(true);
          setNewBest(submitBest(g.snake.length - 1));
          sfx.play({ freq: 220, dur: 0.35, type: "sawtooth", slide: -170, vol: 0.05 });
        } else {
          g.snake.unshift(head);
          if (head.x === g.food.x && head.y === g.food.y) {
            setScore((s) => s + 1);
            sfx.play({ freq: 880, dur: 0.04 });
            sfx.play({ freq: 1320, dur: 0.05, delay: 0.05 });
            g.food = {
              x: (Math.random() * COLS) | 0,
              y: (Math.random() * ROWS) | 0,
            };
          } else {
            const tail = g.snake.pop();
            g.trail.push({ x: tail.x, y: tail.y, life: 0.5 });
          }
        }
      }
      // decay the lcd smear
      for (let i = g.trail.length - 1; i >= 0; i--) {
        g.trail[i].life -= dt * 1.6;
        if (g.trail[i].life <= 0) g.trail.splice(i, 1);
      }

      // ---- draw: flat lcd, no glow anywhere ----
      const FY = strip; // field offset below the score strip
      ctx.fillStyle = LCD;
      ctx.fillRect(0, 0, COLS * cell, ROWS * cell + strip);
      ctx.fillStyle = INK;
      // score strip — blocky nokia digits + divider
      const px = Math.max(2, Math.floor(strip * 0.5 / 5));
      drawDigits(ctx, String(g.snake.length - 1).padStart(4, "0"), 6, (strip - 5 * px) / 2, px);
      ctx.fillRect(0, strip - 2, COLS * cell, 2);
      // field border
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(3, FY + 3, COLS * cell - 6, ROWS * cell - 6);
      // ghost smear behind the tail (passive-matrix trailing)
      for (const t of g.trail) {
        ctx.globalAlpha = t.life * 0.45;
        ctx.fillStyle = INK;
        ctx.fillRect(t.x * cell + 3, FY + t.y * cell + 3, cell - 6, cell - 6);
      }
      ctx.globalAlpha = 1;
      // blinking food — solid / hollow, the classic lcd flicker
      const on = ((ts / 300) | 0) % 2 === 0;
      const fx = g.food.x * cell, fy = FY + g.food.y * cell;
      ctx.fillStyle = INK;
      if (on) ctx.fillRect(fx + 4, fy + 4, cell - 8, cell - 8);
      else { ctx.lineWidth = 2; ctx.strokeRect(fx + 5, fy + 5, cell - 10, cell - 10); }
      // snake — chunky segments with a punched center so they read segmented
      g.snake.forEach((s, i) => {
        const x = s.x * cell, y = FY + s.y * cell;
        ctx.fillStyle = INK;
        ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        if (i > 0) {
          const d = Math.max(2, cell * 0.18);
          ctx.fillStyle = LCD;
          ctx.fillRect(x + (cell - d) / 2, y + (cell - d) / 2, d, d);
        }
      });
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [over, paused, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game cab-nokia">
      <div className="game-hud">
        <span className="g-title">▸ SNAKE II</span>
        <span className="g-score">BEST {String(best).padStart(3, "0")}</span>
        <span className="g-keys">arrows/wasd · space pause · m sound · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="snake-canvas" />
        {phase === "title" && (
          <TitleCard art={ART} tagline="nokia 3310 · eat, grow, don't bite yourself" best={best} />
        )}
        {paused && !over && <div className="game-veil">PAUSED</div>}
        {over && (
          <div className="game-veil over">
            <div className="go-title">GAME OVER</div>
            <div className="go-score">score · {score}{newBest ? " — NEW BEST!" : ""}</div>
            <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
