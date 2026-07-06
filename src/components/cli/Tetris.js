import { useEffect, useRef, useState } from "react";
import { sfx, useBest, TitleCard, makeShake } from "./arcade";

// tetris — game boy dmg. the canonical 4-shade green palette, patterned
// bricks instead of glow, row-flash line clears, shake on hard drops.
const COLS = 10;
const ROWS = 20;
const PANEL = 5; // extra columns of canvas for the side panel

// dmg palette, darkest -> lightest
const GB = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"];

const SHAPES = [
  [[1, 1, 1, 1]],          // I
  [[1, 1], [1, 1]],        // O
  [[0, 1, 0], [1, 1, 1]],  // T
  [[0, 1, 1], [1, 1, 0]],  // S
  [[1, 1, 0], [0, 1, 1]],  // Z
  [[1, 0, 0], [1, 1, 1]],  // J
  [[0, 0, 1], [1, 1, 1]],  // L
];
// per-piece brick texture: 0 solid+pip, 1 framed, 2 checker
const PAT = [0, 1, 2, 2, 2, 0, 1];
const LINE_PTS = [0, 100, 300, 500, 800];
const FLASH_MS = 260;

const ART = [
  "▀█▀ █▀▀ ▀█▀ █▀█ █ █▀",
  " █  ██▄  █  █▀▄ █ ▄█",
].join("\n");

const rotateCW = (m) => m[0].map((_, c) => m.map((row) => row[c]).reverse());

export default function Tetris({ onExit }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("title");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [best, submitBest] = useBest("tetris");
  const [newBest, setNewBest] = useState(false);

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
      clearing: null, // { rows, start } while full rows flash
      score: 0, lines: 0,
    };
  };
  if (!game.current) game.current = fresh();

  const shake = useRef(makeShake());

  const hits = (g, m, x, y) =>
    m.some((row, r) =>
      row.some((v, c) =>
        v && (x + c < 0 || x + c >= COLS || y + r >= ROWS || (y + r >= 0 && g.board[y + r][x + c] >= 0))));

  const nextPiece = (g) => {
    g.cur = g.spawn(g.next);
    g.next = g.draw();
    if (hits(g, g.cur.m, g.cur.x, g.cur.y)) {
      setOver(true);
      setNewBest(submitBest(g.score));
      sfx.play({ freq: 200, dur: 0.5, type: "sawtooth", slide: -150, vol: 0.05 });
    }
  };

  const lock = (g) => {
    g.cur.m.forEach((row, r) => row.forEach((v, c) => {
      if (v && g.cur.y + r >= 0) g.board[g.cur.y + r][g.cur.x + c] = g.cur.t;
    }));
    const full = [];
    g.board.forEach((row, y) => { if (row.every((v) => v >= 0)) full.push(y); });
    if (full.length) {
      g.clearing = { rows: full, start: performance.now() };
      if (full.length === 4) shake.current.kick(6);
      // rising arpeggio, one note per line
      full.forEach((_, i) =>
        sfx.play({ freq: 520 + i * 140, dur: 0.09, delay: i * 0.06, vol: 0.05 }));
    } else {
      sfx.play({ freq: 160, dur: 0.05, vol: 0.04 });
      nextPiece(g);
    }
  };

  const collapse = (g) => {
    const gone = new Set(g.clearing.rows);
    g.board = g.board.filter((_, y) => !gone.has(y));
    const n = gone.size;
    while (g.board.length < ROWS) g.board.unshift(Array(COLS).fill(-1));
    g.lines += n;
    g.score += LINE_PTS[n] * (1 + ((g.lines / 10) | 0));
    setLines(g.lines);
    setScore(g.score);
    g.clearing = null;
    nextPiece(g);
  };

  const reset = () => {
    game.current = fresh();
    setScore(0); setLines(0); setOver(false); setPaused(false); setNewBest(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const g = game.current;
      if (k === "Escape") return onExit(g.score > 0 ? `tetris — score ${g.score} · ${g.lines} lines` : "tetris — see you next time");
      if (phase === "title") {
        e.preventDefault();
        sfx.play({ freq: 660, dur: 0.06 });
        setPhase("play");
        return;
      }
      if (k === "m" || k === "M") { sfx.toggleMute(); return; }
      if (k === "Enter" && over) return reset();
      if ((k === "p" || k === "P") && !over) { setPaused((p) => !p); return; }
      if (over || paused || g.clearing) return;
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
          if (!hits(g, m, g.cur.x + dx, g.cur.y)) {
            g.cur.m = m; g.cur.x += dx;
            sfx.play({ freq: 720, dur: 0.03, vol: 0.03 });
            break;
          }
        }
      } else if (k === " ") {
        e.preventDefault();
        let d = 0;
        while (!hits(g, g.cur.m, g.cur.x, g.cur.y + 1)) { g.cur.y++; d++; }
        g.score += d * 2;
        setScore(g.score);
        shake.current.kick(3);
        sfx.play({ freq: 110, dur: 0.07, vol: 0.05 });
        lock(g);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, paused, phase, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cell = 18;
    const fit = () => {
      const w = (canvas.closest(".game")?.clientWidth || (COLS + PANEL) * 18) - 60;
      const scroller = canvas.closest(".crt-scroll, .cli.standalone");
      const availH = (scroller?.clientHeight || window.innerHeight) - 190;
      cell = Math.min(w / (COLS + PANEL), Math.max(240, availH) / ROWS);
      canvas.style.width = (COLS + PANEL) * cell + "px";
      canvas.style.height = ROWS * cell + "px";
      canvas.width = Math.round((COLS + PANEL) * cell * dpr);
      canvas.height = Math.round(ROWS * cell * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    // dmg brick: dark base with a per-piece texture, never a glow
    const block = (x, y, t, ghost) => {
      const s = cell, X = x * s, Y = y * s;
      if (ghost) {
        ctx.strokeStyle = GB[1];
        ctx.lineWidth = 1;
        ctx.strokeRect(X + 1.5, Y + 1.5, s - 3, s - 3);
        return;
      }
      const b = Math.max(1.5, s * 0.12);
      ctx.fillStyle = GB[0];
      ctx.fillRect(X, Y, s - 1, s - 1);
      const p = PAT[t];
      if (p === 0) { // solid + light pip
        ctx.fillStyle = GB[2];
        const d = Math.max(2, s * 0.2);
        ctx.fillRect(X + b, Y + b, d, d);
      } else if (p === 1) { // framed with a dark core
        ctx.fillStyle = GB[2];
        ctx.fillRect(X + b, Y + b, s - 1 - b * 2, s - 1 - b * 2);
        ctx.fillStyle = GB[0];
        const c = Math.max(2, s * 0.3);
        ctx.fillRect(X + (s - 1 - c) / 2, Y + (s - 1 - c) / 2, c, c);
      } else { // checker
        ctx.fillStyle = GB[1];
        const h = (s - 1) / 2;
        ctx.fillRect(X, Y, h, h);
        ctx.fillRect(X + h, Y + h, h, h);
      }
    };

    let raf, last = 0, lastTs = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      const g = game.current;
      const level = (g.lines / 10) | 0;
      const speed = Math.max(70, 600 - level * 55);
      if (g.clearing && performance.now() - g.clearing.start > FLASH_MS) collapse(g);
      if (phase === "play" && !over && !paused && !g.clearing && ts - last > speed) {
        last = ts;
        if (!hits(g, g.cur.m, g.cur.x, g.cur.y + 1)) g.cur.y++;
        else lock(g);
      }

      // ---- draw ----
      shake.current.step(dt);
      const off = shake.current.offset();
      ctx.save();
      ctx.translate(off.x, off.y);
      // lcd background across board + panel
      ctx.fillStyle = GB[3];
      ctx.fillRect(-8, -8, (COLS + PANEL) * cell + 16, ROWS * cell + 16);
      // faint corner dots instead of a grid
      ctx.fillStyle = GB[2];
      for (let x = 1; x < COLS; x++)
        for (let y = 1; y < ROWS; y++) ctx.fillRect(x * cell, y * cell, 1, 1);
      // settled stack
      g.board.forEach((row, y) => row.forEach((t, x) => {
        if (t >= 0) block(x, y, t);
      }));
      // flashing rows during a clear
      if (g.clearing) {
        const lit = (((performance.now() - g.clearing.start) / 70) | 0) % 2 === 0;
        ctx.fillStyle = lit ? GB[3] : GB[0];
        g.clearing.rows.forEach((y) => ctx.fillRect(0, y * cell, COLS * cell, cell - 1));
      } else if (phase === "play") {
        // ghost landing preview
        let gy = g.cur.y;
        while (!hits(g, g.cur.m, g.cur.x, gy + 1)) gy++;
        g.cur.m.forEach((row, r) => row.forEach((v, c) => {
          if (v && gy + r >= 0) block(g.cur.x + c, gy + r, g.cur.t, true);
        }));
        // falling piece
        g.cur.m.forEach((row, r) => row.forEach((v, c) => {
          if (v && g.cur.y + r >= 0) block(g.cur.x + c, g.cur.y + r, g.cur.t);
        }));
      }

      // side panel — boxed next + stats, all in dmg ink
      const px = (COLS + 0.7) * cell;
      ctx.fillStyle = GB[0];
      ctx.fillRect(COLS * cell + Math.max(2, cell * 0.15), 0, 2, ROWS * cell);
      ctx.font = `700 ${Math.max(10, cell * 0.55)}px ui-monospace, Menlo, monospace`;
      ctx.fillText("NEXT", px, cell * 1.2);
      ctx.strokeStyle = GB[0];
      ctx.lineWidth = 2;
      // box flush with the text column; piece centered inside it
      const bw = cell * 3.6, bh = cell * 3.2;
      ctx.strokeRect(px, cell * 1.5, bw, bh);
      const nm = SHAPES[g.next];
      const s = cell * 0.8;
      const ox = px + (bw - nm[0].length * s + 2) / 2;
      const oy = cell * 1.5 + (bh - nm.length * s + 2) / 2;
      nm.forEach((row, r) => row.forEach((v, c) => {
        if (v) {
          const X = ox + c * s, Y = oy + r * s;
          ctx.fillStyle = GB[0];
          ctx.fillRect(X, Y, s - 2, s - 2);
          ctx.fillStyle = GB[2];
          const d = Math.max(2, s * 0.2);
          ctx.fillRect(X + 2, Y + 2, d, d);
        }
      }));
      ctx.fillStyle = GB[0];
      ctx.fillText("SCORE", px, cell * 6.6);
      ctx.fillText(String(g.score), px, cell * 7.6);
      ctx.fillText("LINES", px, cell * 9.6);
      ctx.fillText(String(g.lines), px, cell * 10.6);
      ctx.fillText("LEVEL", px, cell * 12.6);
      ctx.fillText(String(level + 1), px, cell * 13.6);
      ctx.restore();
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [over, paused, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game cab-gb">
      <div className="game-hud">
        <span className="g-title">▸ TETRIS</span>
        <span className="g-score">BEST {String(best).padStart(4, "0")}</span>
        <span className="g-keys">arrows/wasd · space drop · p pause · m sound · esc quit</span>
      </div>
      <div className="game-stage">
        <div className="gb-caption">DOT MATRIX WITH STEREO SOUND</div>
        {/* screen wrapper owns the bezel border so overlays align exactly */}
        <div className="gb-screen">
          <canvas ref={canvasRef} className="game-canvas" />
          {phase === "title" && (
            <TitleCard art={ART} tagline="game boy dmg · stack clean, clear four" best={best} />
          )}
          {paused && !over && <div className="game-veil">PAUSED</div>}
          {over && (
            <div className="game-veil over">
              <div className="go-title">GAME OVER</div>
              <div className="go-score">score · {score} &nbsp;·&nbsp; lines · {lines}{newBest ? " — NEW BEST!" : ""}</div>
              <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
