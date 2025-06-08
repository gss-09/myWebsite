import { useEffect, useState } from "react";

function DarkModeToggle() {
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // Your sizing
  const TOGGLE_WIDTH = 35;
  const TOGGLE_HEIGHT = 19;
  const CIRCLE_SIZE = 12;
  const OFFSET = 2.5; // Space from edge

  return (
    <button
      onClick={() => setDark((v) => !v)}
      aria-label="Toggle dark mode"
      className="relative flex items-center border border-gray-400 dark:border-gray-600 rounded-full focus:outline-none"
      style={{
        width: TOGGLE_WIDTH,
        height: TOGGLE_HEIGHT,
        minWidth: TOGGLE_WIDTH,
        minHeight: TOGGLE_HEIGHT,
        padding: 0,
        background: dark ? "#fff" : "#000",
        transition: "background 0.5s, border-color 0.5s",
      }}
    >
      {/* Toggle Circle (no border, always spaced from edge) */}
      <span
        className="absolute"
        style={{
          left: dark
            ? `${TOGGLE_WIDTH - CIRCLE_SIZE - OFFSET}px`
            : `${OFFSET}px`,
          top: "50%",
          transform: "translateY(-50%)",
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: "50%",
          background: dark ? "#222" : "#fff",
          // No border on circle!
          boxShadow: dark
            ? "0 0 5px #60a5fa88"
            : "0 0 5px #ffaaff44",
          transition: "left 0.5s, background 0.5s, box-shadow 0.5s",
          zIndex: 20,
        }}
      />
    </button>
  );
}

export default DarkModeToggle;


