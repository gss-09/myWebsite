import { useEffect, useRef } from "react";

// Easter egg: green code rain over the screen for a few seconds.
export default function MatrixRain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    const fs = 16 * dpr;
    const cols = Math.max(1, Math.floor(c.width / fs));
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = "アァカサタナハマヤラ0123456789ABCDEF<>/$#*".split("");
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(6,8,7,0.16)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${fs}px monospace`;
      ctx.fillStyle = "#5bd66f";
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillText(ch, i * fs, drops[i] * fs);
        if (drops[i] * fs > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="matrix-canvas" aria-hidden />;
}
