import React, { useEffect, useState, useRef } from "react";

function isTouchDevice() {
  return (
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0)
  );
}

function CustomCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [ring, setRing] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [isTouch] = useState(isTouchDevice);
  const mouseRef = useRef({ x: -200, y: -200 });
  const ringRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef();

  useEffect(() => {
    if (isTouch) return;

    const onMove = (e) => {
      // Hide custom cursor when mouse is over the scrollbar gutter
      // (clientWidth excludes scrollbar; clientHeight excludes horizontal scrollbar)
      const overScrollbar =
        e.clientX > document.documentElement.clientWidth ||
        e.clientY > document.documentElement.clientHeight;
      if (overScrollbar) {
        setVisible(false);
        return;
      }
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const onOver = (e) => {
      setIsHover(
        !!e.target.closest('a, button, [role="button"], label, [tabindex="0"], select, input, textarea')
      );
    };

    const onDown = (e) => {
      setIsDown(true);
      setRipples((r) => [
        ...r,
        { x: e.clientX, y: e.clientY, time: Date.now(), id: Math.random().toString(36).slice(2) },
      ]);
    };
    const onUp = () => setIsDown(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onIframeEnter = () => setVisible(false);
    const onIframeLeave = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("cursorhide", onIframeEnter);
    window.addEventListener("cursorshow", onIframeLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    function animate() {
      const LERP = 0.13;
      ringRef.current = {
        x: ringRef.current.x + (mouseRef.current.x - ringRef.current.x) * LERP,
        y: ringRef.current.y + (mouseRef.current.y - ringRef.current.y) * LERP,
      };
      setRing({ ...ringRef.current });
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("cursorhide", onIframeEnter);
      window.removeEventListener("cursorshow", onIframeLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch]);

  useEffect(() => {
    if (!ripples.length) return;
    const t = setInterval(() => {
      setRipples((r) => r.filter((rip) => Date.now() - rip.time < 650));
    }, 60);
    return () => clearInterval(t);
  }, [ripples]);

  if (isTouch || !visible) return null;

  const ringSize = isHover ? 44 : isDown ? 16 : 28;
  const dotSize = isHover ? 4 : isDown ? 3 : 6;

  const base = {
    position: "fixed",
    pointerEvents: "none",
    mixBlendMode: "difference",
    borderRadius: "50%",
  };

  return (
    <>
      {/* Ripples */}
      {ripples.map((rip) => {
        const p = Math.min(1, (Date.now() - rip.time) / 650);
        const size = 10 + p * 48;
        return (
          <div
            key={rip.id}
            style={{
              ...base,
              left: rip.x,
              top: rip.y,
              transform: "translate(-50%, -50%)",
              width: size,
              height: size,
              border: "1px solid rgba(255,255,255,0.8)",
              opacity: 1 - p,
              zIndex: 9999,
            }}
          />
        );
      })}

      {/* Outer ring — lags behind, morphs on hover */}
      <div
        style={{
          ...base,
          left: ring.x,
          top: ring.y,
          transform: "translate(-50%, -50%)",
          width: ringSize,
          height: ringSize,
          border: "1.5px solid white",
          background: isHover ? "rgba(255,255,255,0.12)" : "transparent",
          zIndex: 9997,
          transition:
            "width 0.2s cubic-bezier(.4,0,.2,1), height 0.2s cubic-bezier(.4,0,.2,1), background 0.2s ease",
        }}
      />

      {/* Inner dot — instant, always sharp */}
      <div
        style={{
          ...base,
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          width: dotSize,
          height: dotSize,
          background: "white",
          zIndex: 9999,
          transition: "width 0.12s ease, height 0.12s ease",
        }}
      />
    </>
  );
}

export default CustomCursor;
