import { useEffect, useRef, useState } from "react";
import { sfx, useBest, TitleCard, drawDigits, makeParticles, makeShake } from "./arcade";

// breakout — atari 2600. rainbow brick rows, square white ball, flat red
// paddle, particle bursts in the brick's own color, shake when it hurts.
const W = 480, H = 320, BC = 10, BR = 5, BH = 14, R = 5, PADW = 70, PADY = H - 22;

// classic wall, top -> bottom
const ROWCOL = ["#c84848", "#c66c3a", "#b47a30", "#a2a22a", "#48a048"];
const PADCOL = "#c84848";
const WHITE = "#ececec";

const ART = [
  "█▀▄ █▀█ █▀▀ ▄▀█ █▄▀ █▀█ █ █ ▀█▀",
  "█▄▀ █▀▄ ██▄ █▀█ █ █ █▄█ █▄█  █ ",
].join("\n");

export default function Breakout({ onExit }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("title");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [best, submitBest] = useBest("breakout");
  const [newBest, setNewBest] = useState(false);

  const wall = () => {
    const bricks = [];
    for (let r = 0; r < BR; r++)
      for (let c = 0; c < BC; c++)
        bricks.push({ x: c * (W / BC) + 1, y: 36 + r * (BH + 2), r, alive: true });
    return bricks;
  };
  const fresh = () => ({
    px: W / 2,
    ball: { x: W / 2, y: PADY - R - 1, vx: 0, vy: 0 },
    stuck: true,
    bricks: wall(),
    keys: { left: false, right: false },
    score: 0, lives: 3, level: 1,
  });

  const game = useRef(null);
  if (!game.current) game.current = fresh();
  const parts = useRef(makeParticles());
  const shake = useRef(makeShake());

  const reset = () => {
    game.current = fresh();
    setScore(0); setLives(3); setLevel(1); setOver(false); setPaused(false); setNewBest(false);
  };

  const launch = (g) => {
    if (!g.stuck) return;
    g.stuck = false;
    const a = -Math.PI / 2 + (Math.random() * 0.5 - 0.25);
    const sp = 240 + (g.level - 1) * 40;
    g.ball.vx = Math.cos(a) * sp;
    g.ball.vy = Math.sin(a) * sp;
    sfx.play({ freq: 340, dur: 0.05 });
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const g = game.current;
      if (k === "Escape") return onExit(g.score > 0 ? `breakout — score ${g.score} · wall ${g.level}` : "breakout — see you next time");
      if (phase === "title") {
        e.preventDefault();
        sfx.play({ freq: 620, dur: 0.06 });
        setPhase("play");
        return;
      }
      if (k === "m" || k === "M") { sfx.toggleMute(); return; }
      if (k === "Enter" && over) return reset();
      if ((k === "p" || k === "P") && !over) { setPaused((p) => !p); return; }
      if (k === " " && !over && !paused) { e.preventDefault(); launch(g); return; }
      if (k === "ArrowLeft" || k === "a") { e.preventDefault(); g.keys.left = true; }
      if (k === "ArrowRight" || k === "d") { e.preventDefault(); g.keys.right = true; }
    };
    const onUp = (e) => {
      const g = game.current;
      if (e.key === "ArrowLeft" || e.key === "a") g.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") g.keys.right = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [over, paused, phase, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scale = 1;
    const fit = () => {
      const stage = canvas.parentElement;
      const w = (stage?.parentElement?.clientWidth || W) - 16;
      const scroller = canvas.closest(".crt-scroll, .cli.standalone");
      const availH = (scroller?.clientHeight || window.innerHeight) - 140;
      scale = Math.min(w / W, Math.max(200, availH) / H);
      canvas.style.width = W * scale + "px";
      canvas.style.height = H * scale + "px";
      canvas.width = Math.round(W * scale * dpr);
      canvas.height = Math.round(H * scale * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      game.current.px = ((e.clientX - rect.left) / rect.width) * W;
    };
    const onClick = () => { if (phase === "play" && !over && !paused) launch(game.current); };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    let raf, last = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((ts - last) / 1000, 0.035);
      last = ts;
      const g = game.current;

      if (phase === "play" && !over && !paused) {
        if (g.keys.left) g.px -= 380 * dt;
        if (g.keys.right) g.px += 380 * dt;
        g.px = clamp(g.px, PADW / 2, W - PADW / 2);

        const b = g.ball;
        if (g.stuck) {
          b.x = g.px;
          b.y = PADY - R - 1;
        } else {
          const prevX = b.x;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); sfx.play({ freq: 180, dur: 0.04 }); }
          if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); sfx.play({ freq: 180, dur: 0.04 }); }
          if (b.y < R) {
            b.y = R; b.vy = Math.abs(b.vy);
            shake.current.kick(2);
            sfx.play({ freq: 180, dur: 0.04 });
          }
          // paddle
          if (b.vy > 0 && b.y + R > PADY && b.y + R < PADY + 14 &&
              b.x > g.px - PADW / 2 - R && b.x < g.px + PADW / 2 + R) {
            b.y = PADY - R;
            const off = clamp((b.x - g.px) / (PADW / 2), -1, 1);
            const sp = Math.min(Math.hypot(b.vx, b.vy) * 1.02, 520);
            const ang = -Math.PI / 2 + off * 1.0;
            b.vx = Math.cos(ang) * sp;
            b.vy = Math.sin(ang) * sp;
            sfx.play({ freq: 240, dur: 0.05 });
          }
          // bricks — one hit per frame, bounce off the side it entered from
          const bw = W / BC - 2;
          for (const br of g.bricks) {
            if (!br.alive) continue;
            if (b.x + R > br.x && b.x - R < br.x + bw && b.y + R > br.y && b.y - R < br.y + BH) {
              br.alive = false;
              g.score += (BR - br.r) * 10 + 10;
              setScore(g.score);
              parts.current.burst(br.x + bw / 2, br.y + BH / 2, ROWCOL[br.r], 8, 140);
              sfx.play({ freq: 620 - br.r * 70, dur: 0.05, vol: 0.05 });
              if (prevX + R <= br.x || prevX - R >= br.x + bw) b.vx = -b.vx;
              else b.vy = -b.vy;
              break;
            }
          }
          if (g.bricks.every((x) => !x.alive)) {
            g.level += 1;
            g.bricks = wall();
            g.stuck = true;
            setLevel(g.level);
            sfx.play({ freq: 520, dur: 0.08 });
            sfx.play({ freq: 780, dur: 0.12, delay: 0.09 });
          }
          if (b.y > H + R * 3) {
            g.lives -= 1;
            setLives(g.lives);
            g.stuck = true;
            shake.current.kick(5);
            sfx.play({ freq: 90, dur: 0.4, type: "sawtooth", slide: -50, vol: 0.05 });
            if (g.lives <= 0) {
              setOver(true);
              setNewBest(submitBest(g.score));
            }
          }
        }
      }
      parts.current.step(dt);
      shake.current.step(dt);

      // ---- draw: flat 2600, sharp corners, no glow ----
      const off = shake.current.offset();
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(off.x, off.y);
      const bw = W / BC - 2;
      g.bricks.forEach((br) => {
        if (!br.alive) return;
        ctx.fillStyle = ROWCOL[br.r];
        ctx.fillRect(br.x, br.y, bw, BH);
      });
      parts.current.draw(ctx, 3);
      // paddle
      ctx.fillStyle = PADCOL;
      ctx.fillRect(g.px - PADW / 2, PADY, PADW, 9);
      // square ball
      ctx.fillStyle = WHITE;
      ctx.fillRect(g.ball.x - R, g.ball.y - R, R * 2, R * 2);
      // score top-left, lives as little paddles top-right
      drawDigits(ctx, String(g.score).padStart(4, "0"), 8, 8, 4);
      ctx.fillStyle = PADCOL;
      for (let i = 0; i < g.lives; i++) ctx.fillRect(W - 20 - i * 18, 10, 12, 4);
      if (g.stuck && phase === "play" && !over && !paused) {
        ctx.fillStyle = WHITE;
        ctx.globalAlpha = 0.6;
        ctx.font = "12px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText("space / click to launch", W / 2, H - 36);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, [over, paused, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game cab-atari">
      <div className="game-hud">
        <span className="g-title">▸ BREAKOUT</span>
        <span className="g-score">BEST {String(best).padStart(4, "0")} · WALL {level} · ♥ {lives}</span>
        <span className="g-keys">←→/ad or mouse · space launch · p pause · m sound · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="game-canvas" />
        {phase === "title" && (
          <TitleCard art={ART} tagline="atari 2600 · three lives, five colors" best={best} />
        )}
        {paused && !over && <div className="game-veil">PAUSED</div>}
        {over && (
          <div className="game-veil over">
            <div className="go-title">GAME OVER</div>
            <div className="go-score">score · {score} &nbsp;·&nbsp; wall · {level}{newBest ? " — NEW BEST!" : ""}</div>
            <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
