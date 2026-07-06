import { useEffect, useRef, useState } from "react";
import { sfx, useBest, TitleCard, drawDigits } from "./arcade";

// pong — 1972. pure white on black, square ball, block-segment score
// digits, nothing rounded, nothing glowing. first to 7.
const W = 480, H = 300, PW = 8, PH = 56, R = 5, WIN = 7;
const WHITE = "#f4f4f4";

const ART = [
  "█▀█ █▀█ █▄ █ █▀▀",
  "█▀▀ █▄█ █ ▀█ █▄█",
].join("\n");

export default function Pong({ onExit }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("title");
  const [score, setScore] = useState([0, 0]);
  const [over, setOver] = useState(null); // "you" | "cpu" | null
  const [paused, setPaused] = useState(false);
  const [wins, addWin] = useBest("pong"); // lifetime wins vs the machine

  const serve = (dir) => {
    const a = (Math.random() * 0.6 - 0.3) * Math.PI;
    return { x: W / 2, y: H / 2, vx: Math.cos(a) * 240 * dir, vy: Math.sin(a) * 240 };
  };
  const fresh = () => ({
    py: H / 2 - PH / 2,
    cy: H / 2 - PH / 2,
    ball: serve(Math.random() < 0.5 ? 1 : -1),
    keys: { up: false, down: false },
    s: [0, 0],
    freeze: 0,          // brief hit-stop after a paddle hit
    wait: 0, waitDir: 0, blink: -1, // serve delay + which digit blinks
  });

  const game = useRef(null);
  if (!game.current) game.current = fresh();

  const reset = () => {
    game.current = fresh();
    setScore([0, 0]); setOver(null); setPaused(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const g = game.current;
      if (k === "Escape") return onExit(`pong — you ${g.s[0]} · cpu ${g.s[1]}`);
      if (phase === "title") {
        e.preventDefault();
        sfx.play({ freq: 459, dur: 0.06 });
        setPhase("play");
        return;
      }
      if (k === "m" || k === "M") { sfx.toggleMute(); return; }
      if (k === "Enter" && over) return reset();
      if ((k === " " || k === "p") && !over) { e.preventDefault(); setPaused((p) => !p); return; }
      if (k === "ArrowUp" || k === "w") { e.preventDefault(); g.keys.up = true; }
      if (k === "ArrowDown" || k === "s") { e.preventDefault(); g.keys.down = true; }
    };
    const onUp = (e) => {
      const g = game.current;
      if (e.key === "ArrowUp" || e.key === "w") g.keys.up = false;
      if (e.key === "ArrowDown" || e.key === "s") g.keys.down = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [over, phase, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scale = 1;
    const fit = () => {
      const stage = canvas.parentElement;
      const w = (stage?.parentElement?.clientWidth || W) - 8;
      const scroller = canvas.closest(".crt-scroll, .cli.standalone");
      const availH = (scroller?.clientHeight || window.innerHeight) - 140;
      scale = Math.min(w / W, Math.max(180, availH) / H);
      canvas.style.width = W * scale + "px";
      canvas.style.height = H * scale + "px";
      canvas.width = Math.round(W * scale * dpr);
      canvas.height = Math.round(H * scale * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const bounce = (b, padY, dir) => {
      const off = clamp((b.y - (padY + PH / 2)) / (PH / 2), -1, 1);
      const sp = Math.min(Math.hypot(b.vx, b.vy) * 1.05, 560);
      const ang = off * 0.7;
      b.vx = Math.cos(ang) * sp * dir;
      b.vy = Math.sin(ang) * sp;
    };
    // a point was scored: hide the ball, blink the loser's digit, then serve
    const point = (g, who) => {
      g.s[who]++;
      setScore([...g.s]);
      sfx.play({ freq: 490, dur: 0.26, vol: 0.055 });
      if (g.s[who] >= WIN) {
        setOver(who === 0 ? "you" : "cpu");
        if (who === 0) addWin(wins + 1);
      } else {
        g.wait = 0.9;
        g.waitDir = who === 0 ? -1 : 1;
        g.blink = who === 0 ? 1 : 0;
        g.ball.x = -100; g.ball.vx = 0; g.ball.vy = 0;
      }
    };

    let raf, last = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((ts - last) / 1000, 0.035);
      last = ts;
      const g = game.current;

      if (phase === "play" && !over && !paused) {
        if (g.keys.up) g.py -= 320 * dt;
        if (g.keys.down) g.py += 320 * dt;
        g.py = clamp(g.py, 0, H - PH);
        // cpu tracks the ball only when it's incoming, with a speed cap
        const target = g.ball.vx > 0 ? g.ball.y - PH / 2 : H / 2 - PH / 2;
        const d = target - g.cy;
        if (Math.abs(d) > 6) g.cy += Math.sign(d) * 225 * dt;
        g.cy = clamp(g.cy, 0, H - PH);

        if (g.wait > 0) {
          g.wait -= dt;
          if (g.wait <= 0) { g.blink = -1; g.ball = serve(g.waitDir); }
        } else if (g.freeze > 0) {
          g.freeze -= dt;
        } else {
          const b = g.ball;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); sfx.play({ freq: 226, dur: 0.05 }); }
          if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy); sfx.play({ freq: 226, dur: 0.05 }); }
          // player paddle (left)
          if (b.vx < 0 && b.x - R < 18 + PW && b.x - R > 12 && b.y > g.py - R && b.y < g.py + PH + R) {
            b.x = 18 + PW + R;
            bounce(b, g.py, 1);
            g.freeze = 0.04;
            sfx.play({ freq: 459, dur: 0.05 });
          }
          // cpu paddle (right)
          if (b.vx > 0 && b.x + R > W - 18 - PW && b.x + R < W - 12 && b.y > g.cy - R && b.y < g.cy + PH + R) {
            b.x = W - 18 - PW - R;
            bounce(b, g.cy, -1);
            g.freeze = 0.04;
            sfx.play({ freq: 459, dur: 0.05 });
          }
          if (b.x < -12) point(g, 1);
          else if (b.x > W + 12) point(g, 0);
        }
      }

      // ---- draw: flat 1972, no rounding, no glow ----
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = WHITE;
      // net — a column of squares
      for (let y = 6; y < H - 8; y += 18) ctx.fillRect(W / 2 - 2, y, 4, 10);
      // block-segment scores; the scored-on digit blinks before the serve
      const hide = (i) => g.blink === i && ((ts / 150) | 0) % 2 === 0;
      if (!hide(0)) drawDigits(ctx, String(g.s[0]), W / 2 - 34, 14, 7, "right");
      if (!hide(1)) drawDigits(ctx, String(g.s[1]), W / 2 + 34, 14, 7, "left");
      // paddles + square ball
      ctx.fillRect(18, g.py, PW, PH);
      ctx.fillRect(W - 18 - PW, g.cy, PW, PH);
      if (g.wait <= 0) {
        const flash = g.freeze > 0 ? 2 : 0;
        ctx.fillRect(g.ball.x - R - flash, g.ball.y - R - flash, (R + flash) * 2, (R + flash) * 2);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [over, paused, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game cab-pong">
      <div className="game-hud">
        <span className="g-title">▸ PONG</span>
        <span className="g-score">YOU {score[0]} · CPU {score[1]}{wins > 0 ? ` · WINS ${wins}` : ""}</span>
        <span className="g-keys">↑↓/ws move · space pause · m sound · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="game-canvas" />
        {phase === "title" && (
          <TitleCard art={ART} tagline="1972 · first to seven vs the machine" best={wins} hint="press any key · best = wins" />
        )}
        {paused && !over && <div className="game-veil">PAUSED</div>}
        {over && (
          <div className="game-veil over">
            <div className="go-title">{over === "you" ? "YOU WIN" : "CPU WINS"}</div>
            <div className="go-score">{score[0]} · {score[1]}</div>
            <div className="go-hint">[enter] rematch &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
