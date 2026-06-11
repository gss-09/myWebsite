import { useEffect, useRef, useState } from "react";

// Pong vs the machine — first to 7. Phosphor paddles, dashed net,
// ball speeds up with every return.
const W = 480, H = 300, PW = 8, PH = 56, R = 5, WIN = 7;

export default function Pong({ onExit }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState([0, 0]);
  const [over, setOver] = useState(null); // "you" | "cpu" | null
  const [paused, setPaused] = useState(false);

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
  }, [over, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

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
      scale = Math.min(w / W, Math.max(180, availH) / H);
      canvas.style.width = W * scale + "px";
      canvas.style.height = H * scale + "px";
      canvas.width = Math.round(W * scale * dpr);
      canvas.height = Math.round(H * scale * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const phosphor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--amber").trim() || "#ffb000";

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const bounce = (b, padY, dir) => {
      const off = clamp((b.y - (padY + PH / 2)) / (PH / 2), -1, 1);
      const sp = Math.min(Math.hypot(b.vx, b.vy) * 1.05, 560);
      const ang = off * 0.7;
      b.vx = Math.cos(ang) * sp * dir;
      b.vy = Math.sin(ang) * sp;
    };

    let raf, last = 0;
    const step = (ts) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((ts - last) / 1000, 0.035);
      last = ts;
      const g = game.current;

      if (!over && !paused) {
        if (g.keys.up) g.py -= 320 * dt;
        if (g.keys.down) g.py += 320 * dt;
        g.py = clamp(g.py, 0, H - PH);
        // cpu tracks the ball only when it's incoming, with a speed cap
        const target = g.ball.vx > 0 ? g.ball.y - PH / 2 : H / 2 - PH / 2;
        const d = target - g.cy;
        if (Math.abs(d) > 6) g.cy += Math.sign(d) * 225 * dt;
        g.cy = clamp(g.cy, 0, H - PH);

        const b = g.ball;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); }
        if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy); }
        // player paddle (left)
        if (b.vx < 0 && b.x - R < 18 + PW && b.x - R > 12 && b.y > g.py - R && b.y < g.py + PH + R) {
          b.x = 18 + PW + R;
          bounce(b, g.py, 1);
        }
        // cpu paddle (right)
        if (b.vx > 0 && b.x + R > W - 18 - PW && b.x + R < W - 12 && b.y > g.cy - R && b.y < g.cy + PH + R) {
          b.x = W - 18 - PW - R;
          bounce(b, g.cy, -1);
        }
        if (b.x < -12) {
          g.s[1]++;
          setScore([...g.s]);
          if (g.s[1] >= WIN) setOver("cpu"); else g.ball = serve(1);
        } else if (b.x > W + 12) {
          g.s[0]++;
          setScore([...g.s]);
          if (g.s[0] >= WIN) setOver("you"); else g.ball = serve(-1);
        }
      }

      // ---- draw ----
      const col = phosphor();
      ctx.clearRect(0, 0, W, H);
      // dashed net
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 8); ctx.lineTo(W / 2, H - 8); ctx.stroke();
      ctx.setLineDash([]);
      // scores
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.35;
      ctx.font = "600 38px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(g.s[0]), W / 2 - 50, 46);
      ctx.fillText(String(g.s[1]), W / 2 + 50, 46);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
      // paddles + ball
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.roundRect(18, g.py, PW, PH, 4); ctx.fill();
      ctx.beginPath(); ctx.roundRect(W - 18 - PW, g.cy, PW, PH, 4); ctx.fill();
      ctx.fillStyle = "#f2f5ee";
      ctx.shadowColor = "#f2f5ee";
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, R, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
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
        <span className="g-title">▸ PONG</span>
        <span className="g-score">YOU {score[0]} · CPU {score[1]}</span>
        <span className="g-keys">↑↓/ws move · space pause · esc quit</span>
      </div>
      <div className="game-stage">
        <canvas ref={canvasRef} className="game-canvas" />
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
