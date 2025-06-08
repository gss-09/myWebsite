import { useCallback, useLayoutEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function ParticlesBg() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  useLayoutEffect(() => {
    const updateDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    updateDark();
    const observer = new MutationObserver(updateDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Particles
      key={isDark ? "dark" : "light"}
      id="tsparticles"
      init={particlesInit}
      style={{
        position: "fixed",
        zIndex: -1,
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 90,
        fullScreen: false,
        particles: {
          number: { value: 80, density: { enable: true, value_area: 1000 } },
          color: { value: isDark ? "#fff" : "#000" },
          links: {
            enable: true,
            color: isDark ? "#fff" : "#000",
            opacity: 0.4, // faint lines!
            width: 1.2,
            distance: 120,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            outModes: "bounce",
          },
          opacity: { value: 0.55 },
          size: { value: 4, random: true },
        },
        interactivity: {
          events: {
            onHover: { enable: false },
            onClick: { enable: false },
            resize: true
          }
        },
        detectRetina: true,
      }}
    />
  );
}

export default ParticlesBg;
