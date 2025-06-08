import React, { useEffect, useState } from "react";

const TAIL_LENGTH = 20;
const DOT_SIZE = 8; // circle diameter

function CustomCursor() {
  const [trail, setTrail] = useState(
    Array(TAIL_LENGTH).fill({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  );
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    document.body.style.cursor = "none";
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animFrame;
    function animate() {
      setTrail((prev) => {
        const newTrail = [...prev];
        newTrail[0] = {
          x: newTrail[0].x + (mouseX - newTrail[0].x) * 0.21,
          y: newTrail[0].y + (mouseY - newTrail[0].y) * 0.21,
        };
        for (let i = 1; i < TAIL_LENGTH; i++) {
          newTrail[i] = {
            x: newTrail[i].x + (newTrail[i - 1].x - newTrail[i].x) * 0.28,
            y: newTrail[i].y + (newTrail[i - 1].y - newTrail[i].y) * 0.28,
          };
        }
        return newTrail;
      });
      animFrame = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrame);
      document.body.style.cursor = "auto";
    };
  }, []);

  // Ripple effect on click
  useEffect(() => {
    const handleClick = (e) => {
      setRipples((r) => [
        ...r,
        {
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
          id: Math.random().toString(36).substr(2, 8),
        },
      ]);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // Remove old ripples
  useEffect(() => {
    if (!ripples.length) return;
    const timer = setInterval(() => {
      setRipples((r) => r.filter((rip) => Date.now() - rip.time < 350));
    }, 80);
    return () => clearInterval(timer);
  }, [ripples]);

  // Consistent black/white logic for all cursor parts:
  const dotBg = darkMode ? "#fff" : "#000";
  const dotBorder = darkMode ? "#000" : "#fff";
  const streakBg = darkMode ? "#fff" : "#000";
  const streakBorder = darkMode ? "#000" : "#fff";
  const streakShadow = darkMode
    ? "0 0 12px 2px #fff9"
    : "0 0 8px 2px #0005";

  return (
    <>
      {/* Ripple effects */}
      {ripples.map((rip) => {
        const age = Date.now() - rip.time;
        const opacity = 1 - age / 350;
        const size = 18 + (age / 350) * 24;
        return (
          <div
            key={rip.id}
            style={{
              position: "fixed",
              left: rip.x - size / 2,
              top: rip.y - size / 2,
              width: size,
              height: size,
              background: darkMode
                ? "radial-gradient(circle,rgba(255,255,255,0.17) 60%,transparent 90%)"
                : "radial-gradient(circle,rgba(0,0,0,0.13) 55%,transparent 90%)",
              border: `1.5px solid ${dotBorder}`,
              borderRadius: "50%",
              opacity,
              pointerEvents: "none",
              zIndex: 10000,
              filter: "blur(2px)",
              transition: "opacity 0.5s",
            }}
          />
        );
      })}

      {/* Circle main dot */}
      <div
        className="pointer-events-none fixed z-50"
        style={{
          left: trail[0].x - DOT_SIZE / 2,
          top: trail[0].y - DOT_SIZE / 2,
          width: `${DOT_SIZE}px`,
          height: `${DOT_SIZE}px`,
          borderRadius: "50%",
          background: dotBg,
          border: `2px solid ${dotBorder}`,
          boxShadow: streakShadow,
          transition: "background 0.5s, border 0.5s, box-shadow 0.5s",
          pointerEvents: "none",
          position: "fixed",
        }}
      />
      {/* Circle trailing streak */}
      {trail.slice(1).map((pos, idx) => (
        <div
          key={idx}
          className="pointer-events-none fixed z-40"
          style={{
            left: pos.x - DOT_SIZE / 2,
            top: pos.y - DOT_SIZE / 2,
            width: `${DOT_SIZE}px`,
            height: `${DOT_SIZE}px`,
            borderRadius: "50%",
            background: streakBg,
            border: `2px solid ${streakBorder}`,
            boxShadow: streakShadow,
            opacity: (1 - idx / TAIL_LENGTH) * 0.22,
            pointerEvents: "none",
            position: "fixed",
            transition: "background 0.5s, border 0.5s, box-shadow 0.5s, opacity 0.5s",
          }}
        />
      ))}
    </>
  );
}

export default CustomCursor;

