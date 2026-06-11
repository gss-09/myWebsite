import { useEffect, useRef, useState } from "react";

// Breakout — phosphor bricks that fade with depth, 3 lives,
// each cleared wall comes back faster.
const W = 480, H = 320, BC = 10, BR = 5, BH = 14, R = 5, PADW = 70, PADY = H - 22;

export default function Breakout({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const wall = () => {
    const bricks = [];
    for (let r = 0; r < BR; r++)
      for (let c = 0; c < BC; c++)
        bricks.push({ x: c * (W / BC) + 3, y: 36 + r * (BH + 5), r, alive: true });
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

  const reset = () => {
    game.current = fresh();
    setScore(0); setLives(3); setLevel(1); setOver(false); setPaused(false);
  };

  const launch = (g) => {
    if (!g.stuck) return;
    g.stuck = false;
    const a = -Math.PI / 2 + (Math.random() * 0.5 - 0.25);
    const sp = 240 + (g.level - 1) * 40;
    g.ball.vx = Math.cos(a) * sp;
    g.ball.vy = Math.sin(a) * sp;
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const g = game.current;
      if (k === "Escape") return onExit(g.score > 0 ? `breakout — score ${g.score} · wall ${g.level}` : "breakout — see you next time");
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
  }, [over, paused, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scale = 1;
    const fit = () => {
      const stage = canvas.parentElement;
      const w = (stage?.parentElement?.clientWidth || W) - 2;
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
    const onClick = () => { if (!over && !paused) launch(game.current); };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);

    const phosphor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--amber").trim() || "#ffb000";
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    let raf, last = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((ts - last) / 1000, 0.035);
      last = ts;
      const g = game.current;

      if (!over && !paused) {
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
          if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
          if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); }
          if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); }
          // paddle
          if (b.vy > 0 && b.y + R > PADY && b.y + R < PADY + 14 &&
              b.x > g.px - PADW / 2 - R && b.x < g.px + PADW / 2 + R) {
            b.y = PADY - R;
            const off = clamp((b.x - g.px) / (PADW / 2), -1, 1);
            const sp = Math.min(Math.hypot(b.vx, b.vy) * 1.02, 520);
            const ang = -Math.PI / 2 + off * 1.0;
            b.vx = Math.cos(ang) * sp;
            b.vy = Math.sin(ang) * sp;
          }
          // bricks — one hit per frame, bounce off the side it entered from
          const bw = W / BC - 6;
          for (const br of g.bricks) {
            if (!br.alive) continue;
            if (b.x + R > br.x && b.x - R < br.x + bw && b.y + R > br.y && b.y - R < br.y + BH) {
              br.alive = false;
              g.score += (BR - br.r) * 10 + 10;
              setScore(g.score);
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
          }
          if (b.y > H + R * 3) {
            g.lives -= 1;
            setLives(g.lives);
            g.stuck = true;
            if (g.lives <= 0) setOver(true);
          }
        }
      }

      // ---- draw ----
      const col = phosphor();
      ctx.clearRect(0, 0, W, H);
      const bw = W / BC - 6;
      ctx.shadowColor = col;
      ctx.fillStyle = col;
      g.bricks.forEach((br) => {
        if (!br.alive) return;
        ctx.globalAlpha = 1 - br.r * 0.16;
        ctx.shadowBlur = 8 - br.r;
        ctx.beginPath();
        ctx.roundRect(br.x, br.y, bw, BH, 3);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      // paddle
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(g.px - PADW / 2, PADY, PADW, 9, 4);
      ctx.fill();
      // ball
      ctx.fillStyle = "#f2f5ee";
      ctx.shadowColor = "#f2f5ee";
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, R, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      // lives as little dashes, bottom-left
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < g.lives; i++) {
        ctx.beginPath(); ctx.roundRect(8 + i * 18, H - 9, 12, 4, 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (g.stuck && !over && !paused) {
        ctx.globalAlpha = 0.6;
        ctx.font = "12px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText("space / click to launch", W / 2, H - 36);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, [over, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game">
      <div className="game-hud">
        <span className="g-title">▸ BREAKOUT</span>
        <span className="g-score">SCORE {String(score).padStart(4, "0")} · WALL {level} · ♥ {lives}</span>
        <span className="g-keys">←→/ad or mouse · space launch · p pause · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="game-canvas" />
        {paused && !over && <div className="game-veil">PAUSED</div>}
        {over && (
          <div className="game-veil over">
            <div className="go-title">GAME OVER</div>
            <div className="go-score">score · {score} &nbsp;·&nbsp; wall · {level}</div>
            <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
