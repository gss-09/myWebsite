import { useEffect, useRef, useState } from "react";

// Tetris on a canvas — monochrome phosphor pieces (brighter = hotter),
// ghost-drop preview, and a side panel for next/score/level.
const COLS = 10;
const ROWS = 20;
const PANEL = 5; // extra columns of canvas for the side panel

const SHAPES = [
  [[1, 1, 1, 1]],          // I
  [[1, 1], [1, 1]],        // O
  [[0, 1, 0], [1, 1, 1]],  // T
  [[0, 1, 1], [1, 1, 0]],  // S
  [[1, 1, 0], [0, 1, 1]],  // Z
  [[1, 0, 0], [1, 1, 1]],  // J
  [[0, 0, 1], [1, 1, 1]],  // L
];
const GLOW = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52]; // per-piece phosphor intensity
const LINE_PTS = [0, 100, 300, 500, 800];

const rotateCW = (m) => m[0].map((_, c) => m.map((row) => row[c]).reverse());

export default function Tetris({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const game = useRef(null);
  const fresh = () => {
    const bag = [];
    const draw = () => {
      if (!bag.length) bag.push(...[0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5));
      return bag.pop();
    };
    const spawn = (t) => ({
      t,
      m: SHAPES[t].map((r) => [...r]),
      x: ((COLS - SHAPES[t][0].length) / 2) | 0,
      y: 0,
    });
    return {
      board: Array.from({ length: ROWS }, () => Array(COLS).fill(-1)),
      draw, spawn,
      cur: spawn(draw()),
      next: draw(),
      score: 0, lines: 0,
    };
  };
  if (!game.current) game.current = fresh();

  const hits = (g, m, x, y) =>
    m.some((row, r) =>
      row.some((v, c) =>
        v && (x + c < 0 || x + c >= COLS || y + r >= ROWS || (y + r >= 0 && g.board[y + r][x + c] >= 0))));

  const lock = (g) => {
    g.cur.m.forEach((row, r) => row.forEach((v, c) => {
      if (v && g.cur.y + r >= 0) g.board[g.cur.y + r][g.cur.x + c] = g.cur.t;
    }));
    const kept = g.board.filter((row) => row.some((v) => v < 0));
    const n = ROWS - kept.length;
    while (kept.length < ROWS) kept.unshift(Array(COLS).fill(-1));
    g.board = kept;
    if (n) {
      g.lines += n;
      g.score += LINE_PTS[n] * (1 + ((g.lines / 10) | 0));
      setLines(g.lines);
      setScore(g.score);
    }
    g.cur = g.spawn(g.next);
    g.next = g.draw();
    if (hits(g, g.cur.m, g.cur.x, g.cur.y)) setOver(true);
  };

  const reset = () => {
    game.current = fresh();
    setScore(0); setLines(0); setOver(false); setPaused(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const g = game.current;
      if (k === "Escape") return onExit(g.score > 0 ? `tetris — score ${g.score} · ${g.lines} lines` : "tetris — see you next time");
      if (k === "Enter" && over) return reset();
      if ((k === "p" || k === "P") && !over) { setPaused((p) => !p); return; }
      if (over || paused) return;
      if (k === "ArrowLeft" || k === "a") {
        e.preventDefault();
        if (!hits(g, g.cur.m, g.cur.x - 1, g.cur.y)) g.cur.x--;
      } else if (k === "ArrowRight" || k === "d") {
        e.preventDefault();
        if (!hits(g, g.cur.m, g.cur.x + 1, g.cur.y)) g.cur.x++;
      } else if (k === "ArrowDown" || k === "s") {
        e.preventDefault();
        if (!hits(g, g.cur.m, g.cur.x, g.cur.y + 1)) { g.cur.y++; g.score += 1; setScore(g.score); }
      } else if (k === "ArrowUp" || k === "w" || k === "x") {
        e.preventDefault();
        const m = rotateCW(g.cur.m);
        // simple wall kick — try in place, then nudge sideways
        for (const dx of [0, -1, 1, -2, 2]) {
          if (!hits(g, m, g.cur.x + dx, g.cur.y)) { g.cur.m = m; g.cur.x += dx; break; }
        }
      } else if (k === " ") {
        e.preventDefault();
        let d = 0;
        while (!hits(g, g.cur.m, g.cur.x, g.cur.y + 1)) { g.cur.y++; d++; }
        g.score += d * 2;
        setScore(g.score);
        lock(g);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, paused, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cell = 18;
    const fit = () => {
      const stage = canvas.parentElement;
      const w = (stage?.parentElement?.clientWidth || (COLS + PANEL) * 18) - 2;
      const scroller = canvas.closest(".crt-scroll, .cli.standalone");
      const availH = (scroller?.clientHeight || window.innerHeight) - 140;
      cell = Math.min(w / (COLS + PANEL), Math.max(240, availH) / ROWS);
      canvas.style.width = (COLS + PANEL) * cell + "px";
      canvas.style.height = ROWS * cell + "px";
      canvas.width = Math.round((COLS + PANEL) * cell * dpr);
      canvas.height = Math.round(ROWS * cell * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const phosphor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--amber").trim() || "#ffb000";

    const block = (x, y, alpha, ghost) => {
      const pad = 1.5, r = 3;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.roundRect(x * cell + pad, y * cell + pad, cell - pad * 2, cell - pad * 2, r);
      if (ghost) ctx.stroke(); else ctx.fill();
    };

    let raf, last = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const g = game.current;
      const level = (g.lines / 10) | 0;
      const speed = Math.max(70, 600 - level * 55);
      if (!over && !paused && ts - last > speed) {
        last = ts;
        if (!hits(g, g.cur.m, g.cur.x, g.cur.y + 1)) g.cur.y++;
        else lock(g);
      }

      // ---- draw ----
      const col = phosphor();
      ctx.clearRect(0, 0, (COLS + PANEL) * cell, ROWS * cell);
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, ROWS * cell); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(COLS * cell, y * cell); ctx.stroke();
      }
      // settled stack
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 6;
      g.board.forEach((row, y) => row.forEach((t, x) => {
        if (t >= 0) block(x, y, 0.32 + 0.5 * GLOW[t]);
      }));
      // ghost landing preview
      let gy = g.cur.y;
      while (!hits(g, g.cur.m, g.cur.x, gy + 1)) gy++;
      ctx.strokeStyle = col;
      ctx.shadowBlur = 0;
      g.cur.m.forEach((row, r) => row.forEach((v, c) => {
        if (v && gy + r >= 0) block(g.cur.x + c, gy + r, 0.28, true);
      }));
      // falling piece
      ctx.shadowBlur = 12;
      g.cur.m.forEach((row, r) => row.forEach((v, c) => {
        if (v && g.cur.y + r >= 0) block(g.cur.x + c, g.cur.y + r, GLOW[g.cur.t]);
      }));
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // side panel
      const px = (COLS + 0.7) * cell;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.moveTo(COLS * cell + 1, 0); ctx.lineTo(COLS * cell + 1, ROWS * cell); ctx.stroke();
      ctx.fillStyle = col;
      ctx.font = `600 ${Math.max(10, cell * 0.55)}px ui-monospace, Menlo, monospace`;
      ctx.globalAlpha = 0.85;
      ctx.fillText("NEXT", px, cell * 1.2);
      const nm = SHAPES[g.next];
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      nm.forEach((row, r) => row.forEach((v, c) => {
        if (v) {
          ctx.globalAlpha = GLOW[g.next];
          ctx.beginPath();
          ctx.roundRect(px + c * cell * 0.8, cell * 1.8 + r * cell * 0.8, cell * 0.8 - 3, cell * 0.8 - 3, 3);
          ctx.fill();
        }
      }));
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.85;
      ctx.fillText("SCORE", px, cell * 6.2);
      ctx.fillText(String(g.score), px, cell * 7.2);
      ctx.fillText("LINES", px, cell * 9.2);
      ctx.fillText(String(g.lines), px, cell * 10.2);
      ctx.fillText("LEVEL", px, cell * 12.2);
      ctx.fillText(String(level + 1), px, cell * 13.2);
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [over, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game">
      <div className="game-hud">
        <span className="g-title">▸ TETRIS</span>
        <span className="g-score">SCORE {String(score).padStart(4, "0")} · LINES {lines}</span>
        <span className="g-keys">arrows/wasd · space drop · p pause · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="game-canvas" />
        {paused && !over && <div className="game-veil">PAUSED</div>}
        {over && (
          <div className="game-veil over">
            <div className="go-title">GAME OVER</div>
            <div className="go-score">score · {score} &nbsp;·&nbsp; lines · {lines}</div>
            <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
