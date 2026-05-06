import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const TOTAL_DURATION_MS = 5000;

export default function Intro() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (prefersReducedMotion()) return false;
    return true;
  });

  useEffect(() => {
    if (!visible) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => setVisible(false), TOTAL_DURATION_MS);
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") setVisible(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          onClick={() => setVisible(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "#000",
            overflow: "hidden",
          }}
          exit={{
            opacity: 0,
            transition: { duration: 2.0, ease: "easeInOut" },
          }}
        >
          <div className="absolute inset-0" style={{ height: "100vh", position: "relative" }}>
            
            {/* Horizon hairline */}
            <motion.div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                willChange: "opacity" // Hardware acceleration hint
              }}
              animate={{ opacity: [1, 1, 0] }}
              transition={{ duration: 3.0, times: [0, 0.75, 1] }}
              aria-hidden
            >
              <div
                style={{
                  width: "60vw",
                  height: 1,
                  background:
                    "linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent)",
                }}
              />
            </motion.div>

            {/* Ball Wrapper */}
            <div
              style={{
                position: "absolute",
                top: "calc(50% - 18px)",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
              }}
              aria-hidden
            >
              <motion.div
                animate={{
                  scale: [1, 1, 300],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 3.5,
                  times: [0, 0.65, 1],
                  ease: "easeInOut",
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  willChange: "transform, opacity" // Hardware acceleration hint
                }}
              >
                {/* Inner Ball - Separated the background from the shadow */}
                <motion.div
                  style={{
                    position: "relative", // Needed to hold the absolute glow layer
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    transformOrigin: "bottom center", 
                    willChange: "transform" // Hardware acceleration hint
                  }}
                  initial={{ y: "-50vh", scaleX: 0.6, scaleY: 0.6, opacity: 0 }}
                  animate={{
                    y: ["-50vh", "0vh", "-14vh", "0vh", "-6vh", "0vh", "-2vh", "0vh"],
                    scaleX: [0.6, 1.3, 0.9, 1.15, 0.95, 1.05, 0.98, 1],
                    scaleY: [0.6, 0.7, 1.1, 0.85, 1.05, 0.95, 1.02, 1],
                    opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                  }}
                  transition={{
                    duration: 2.0,
                    times: [0, 0.5, 0.625, 0.75, 0.825, 0.9, 0.95, 1],
                    ease: [
                      [0.5, 0, 1, 1], 
                      [0, 0, 0.5, 1], 
                      [0.5, 0, 1, 1], 
                      [0, 0, 0.5, 1], 
                      [0.5, 0, 1, 1], 
                      [0, 0, 0.5, 1], 
                      [0.5, 0, 1, 1], 
                    ],
                  }}
                >
                  {/* The Glow Layer - Fades out entirely right before the giant zoom happens! */}
                  <motion.div 
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      boxShadow: "0 0 28px rgba(255,255,255,0.75), 0 0 70px rgba(168,85,247,0.6), 0 0 140px rgba(56,189,248,0.4)"
                    }}
                    animate={{ opacity: [1, 1, 0] }}
                    transition={{
                      duration: 3.5,
                      // Fades out exactly at 65% of the timeline, right as the 300x scale begins
                      times: [0, 0.6, 0.65], 
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* WELCOME Name */}
            <div
              style={{
                position: "absolute",
                top: "45%", 
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                transform: "translateY(-50%)",
              }}
            >
              <motion.h1
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  background:
                    "linear-gradient(to right, #38bdf8 10%, #a855f7 50%, #f472b6 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                  willChange: "transform, opacity" // Hardware acceleration hint
                }}
                // Removed the expensive "filter: blur()" and replaced with a smooth Y slide
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 3.5,
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                WELCOME
              </motion.h1>
            </div>
          </div>

          {/* Subtle vignette */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Skip control */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              zIndex: 10,
              fontSize: 10,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              background: "transparent",
              border: "none",
              padding: "8px 12px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            Skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}