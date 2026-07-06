import { useState } from "react";

// shared arcade kit — every game defines its own "hardware" palette on top
// of these primitives so no two cabinets look alike.

/* ---- sfx: tiny webaudio synth, no audio files ---- */
let actx = null;
let muted = (() => {
  try { return localStorage.getItem("arcade-mute") === "1"; } catch { return false; }
})();

export const sfx = {
  get muted() { return muted; },
  toggleMute() {
    muted = !muted;
    try { localStorage.setItem("arcade-mute", muted ? "1" : "0"); } catch {}
    return muted;
  },
  // one enveloped oscillator per call; games layer calls for richer hits
  play({ freq = 440, dur = 0.08, type = "square", slide = 0, vol = 0.045, delay = 0 }) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime + delay;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(Math.max(30, freq), t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch {}
  },
};

/* ---- high scores: localStorage, read fresh on submit so restarts
   within one session never race a stale closure ---- */
const readBest = (k) => {
  try { return parseInt(localStorage.getItem(k), 10) || 0; } catch { return 0; }
};

export function useBest(game) {
  const key = "arcade-best-" + game;
  const [best, setBest] = useState(() => readBest(key));
  const submit = (score) => {
    if (score > readBest(key)) {
      setBest(score);
      try { localStorage.setItem(key, String(score)); } catch {}
      return true;
    }
    return false;
  };
  return [best, submit];
}

/* ---- title card: shown while a game is in its "title" phase;
   cabinet class on the game root colors it ---- */
export function TitleCard({ art, big, tagline, best, hint = "press any key" }) {
  return (
    <div className="title-card">
      {art ? <pre className="tc-art">{art}</pre> : <div className="tc-big">{big}</div>}
      {tagline && <div className="tc-tag">{tagline}</div>}
      {best > 0 && <div className="tc-best">best · {best}</div>}
      <div className="tc-press">{hint}</div>
    </div>
  );
}

/* ---- particles: square confetti, gravity + fade ---- */
export function makeParticles() {
  const ps = [];
  return {
    burst(x, y, color, n = 8, speed = 130) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = speed * (0.4 + Math.random() * 0.8);
        ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 1, color });
      }
    },
    step(dt) {
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 260 * dt;
        p.life -= dt * 2.4;
        if (p.life <= 0) ps.splice(i, 1);
      }
    },
    draw(ctx, size = 3) {
      for (const p of ps) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ---- screen shake: kick() on impact, offset() each frame ---- */
export function makeShake() {
  let amt = 0;
  return {
    kick(v = 5) { amt = Math.max(amt, v); },
    step(dt) { amt = Math.max(0, amt - dt * 26); },
    offset() {
      return amt > 0.1
        ? { x: (Math.random() * 2 - 1) * amt, y: (Math.random() * 2 - 1) * amt }
        : { x: 0, y: 0 };
    },
  };
}

/* ---- 3x5 block digits — the pong/nokia score look ---- */
const DIGITS = {
  0: ["111", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "111"],
  2: ["111", "001", "111", "100", "111"],
  3: ["111", "001", "111", "001", "111"],
  4: ["101", "101", "111", "001", "001"],
  5: ["111", "100", "111", "001", "111"],
  6: ["111", "100", "111", "101", "111"],
  7: ["111", "001", "001", "010", "010"],
  8: ["111", "101", "111", "101", "111"],
  9: ["111", "101", "111", "001", "111"],
};

// each char cell is 4*px wide (3 blocks + 1 gap); align "right" hangs left of x
export function drawDigits(ctx, str, x, y, px, align = "left") {
  const w = str.length * 4 * px - px;
  let cx = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
  for (const ch of String(str)) {
    const glyph = DIGITS[ch];
    const gx = cx;
    if (glyph) {
      glyph.forEach((row, r) => {
        for (let c = 0; c < 3; c++) {
          if (row[c] === "1") ctx.fillRect(gx + c * px, y + r * px, px, px);
        }
      });
    }
    cx += 4 * px;
  }
}
