import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// True if the device has a mouse / trackpad (fine pointer with hover).
// Returns true on touch-screen laptops too — we want the mesh to react to
// mouse there.
function hasFinePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

const SPACING = 44;
const INFLUENCE = 280;
const MAX_PULL = 26;
const LERP = 0.18;

// Click ripples (water wave propagating through the mesh)
const RIPPLE_LIFE = 1400;
const RIPPLE_MAX_RADIUS = 820;
const RIPPLE_THICKNESS = 90;
const RIPPLE_PUSH = 30;
const RIPPLE_BRIGHT = 0.55;

export default function InteractiveBg() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -10000, y: -10000 });
  const targetRef = useRef({ x: -10000, y: -10000 });
  const ripplesRef = useRef([]);
  const rafRef = useRef();
  const isDarkRef = useRef(false);
  const [hasMouse] = useState(hasFinePointer);
  const skip = !hasMouse;

  useLayoutEffect(() => {
    const update = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (skip) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, cols = 0, rows = 0;
    let pointsX, pointsY, pointsA;

    const setup = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SPACING) + 1;
      rows = Math.ceil(h / SPACING) + 1;
      const total = cols * rows;
      pointsX = new Float32Array(total);
      pointsY = new Float32Array(total);
      pointsA = new Float32Array(total);
    };
    setup();

    const onMove = (e) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };
    const onLeave = () => {
      targetRef.current.x = -10000;
      targetRef.current.y = -10000;
    };
    const onDown = (e) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * LERP;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * LERP;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const dark = isDarkRef.current;
      const baseColor = dark ? "255,255,255" : "0,0,0";
      const lineAlpha = dark ? 0.07 : 0.10;
      const baseDotAlpha = dark ? 0.18 : 0.22;
      const INFL2 = INFLUENCE * INFLUENCE;
      const PULL_SCALE = INFLUENCE / 5;

      // Prune expired ripples once per frame
      const now = performance.now();
      const ripples = ripplesRef.current.filter(
        (r) => now - r.startTime < RIPPLE_LIFE
      );
      ripplesRef.current = ripples;

      // Pre-compute ripple state (radius + decay) so the inner loop is cheap
      const rippleState = ripples.map((rp) => {
        const t = (now - rp.startTime) / RIPPLE_LIFE;
        const ease = 1 - (1 - t) * (1 - t); // ease-out quadratic
        return {
          x: rp.x,
          y: rp.y,
          radius: ease * RIPPLE_MAX_RADIUS,
          decay: 1 - t,
        };
      });

      for (let i = 0; i < cols; i++) {
        const x = i * SPACING;
        for (let j = 0; j < rows; j++) {
          const y = j * SPACING;
          const k = i * rows + j;

          let px = x;
          let py = y;
          let alpha = baseDotAlpha;

          // Cursor gravity well
          const cdx = mx - x;
          const cdy = my - y;
          const cd2 = cdx * cdx + cdy * cdy;
          if (cd2 < INFL2) {
            const cd = Math.sqrt(cd2) + 0.001;
            const inf = 1 - cd / INFLUENCE;
            const pull = Math.min(MAX_PULL, inf * PULL_SCALE);
            px += (cdx / cd) * pull;
            py += (cdy / cd) * pull;
            alpha = baseDotAlpha + inf * 0.6;
          }

          // Click ripples — expanding ring pushes points outward like water
          for (let r = 0; r < rippleState.length; r++) {
            const rp = rippleState[r];
            const rdx = x - rp.x;
            const rdy = y - rp.y;
            const rd = Math.sqrt(rdx * rdx + rdy * rdy);
            const distFromRing = Math.abs(rd - rp.radius);
            if (distFromRing < RIPPLE_THICKNESS) {
              const ringInf =
                (1 - distFromRing / RIPPLE_THICKNESS) * rp.decay;
              if (rd > 0.001) {
                const push = ringInf * RIPPLE_PUSH;
                px += (rdx / rd) * push;
                py += (rdy / rd) * push;
              }
              const ringAlpha = baseDotAlpha + ringInf * RIPPLE_BRIGHT;
              if (ringAlpha > alpha) alpha = ringAlpha;
            }
          }

          pointsX[k] = px;
          pointsY[k] = py;
          pointsA[k] = alpha;
        }
      }

      // Soft cursor glow — drawn behind the mesh, looks like a light source
      // pulling the lattice. One radial gradient per frame, negligible cost.
      if (mx > -1000) {
        const glowR = INFLUENCE * 1.2;
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
        if (dark) {
          glow.addColorStop(0, "rgba(168, 85, 247, 0.22)");
          glow.addColorStop(0.45, "rgba(56, 189, 248, 0.06)");
          glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          glow.addColorStop(0, "rgba(168, 85, 247, 0.14)");
          glow.addColorStop(0.45, "rgba(56, 189, 248, 0.04)");
          glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = glow;
        ctx.fillRect(mx - glowR, my - glowR, glowR * 2, glowR * 2);
      }

      ctx.strokeStyle = `rgba(${baseColor},${lineAlpha})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows; j++) {
          const a = i * rows + j;
          const b = (i + 1) * rows + j;
          ctx.moveTo(pointsX[a], pointsY[a]);
          ctx.lineTo(pointsX[b], pointsY[b]);
        }
      }
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows - 1; j++) {
          const a = i * rows + j;
          const b = i * rows + (j + 1);
          ctx.moveTo(pointsX[a], pointsY[a]);
          ctx.lineTo(pointsX[b], pointsY[b]);
        }
      }
      ctx.stroke();

      ctx.fillStyle = `rgba(${baseColor},${baseDotAlpha})`;
      ctx.beginPath();
      const epsilon = 0.005;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const k = i * rows + j;
          if (pointsA[k] <= baseDotAlpha + epsilon) {
            ctx.moveTo(pointsX[k] + 0.9, pointsY[k]);
            ctx.arc(pointsX[k], pointsY[k], 0.9, 0, Math.PI * 2);
          }
        }
      }
      ctx.fill();

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const k = i * rows + j;
          if (pointsA[k] > baseDotAlpha + epsilon) {
            ctx.fillStyle = `rgba(${baseColor},${pointsA[k]})`;
            ctx.beginPath();
            ctx.arc(pointsX[k], pointsY[k], 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    document.documentElement.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [skip]);

  if (skip) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
