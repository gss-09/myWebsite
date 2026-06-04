import { useEffect, useRef, useState, useCallback } from "react";
import Home from "./components/Home";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Resume from "./components/Resume";
import Contact from "./components/Contact";
import Clock from "./components/Clock";
import "./index.css";

const NAV = [
  { id: "home", label: "whoami" },
  { id: "experience", label: "experience" },
  { id: "projects", label: "projects" },
  { id: "resume", label: "resume" },
  { id: "contact", label: "contact" },
];

// one continuous line-number gutter for the whole buffer (decorative)
const GUTTER = Array.from({ length: 260 }, (_, i) =>
  String(i + 1).padStart(2, "0")
).join("\n");

function App() {
  const [light, setLight] = useState(
    () => localStorage.getItem("crt-theme") === "light"
  );
  const [active, setActive] = useState("home");
  const [on, setOn] = useState(false); // land in standby; visitor powers it on
  const [interacted, setInteracted] = useState(false);
  const scrollRef = useRef(null);
  const ticking = useRef(false);

  const togglePower = () => {
    setInteracted(true);
    setOn((o) => !o);
  };

  // theme — class on <html>, persisted
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("crt-theme", light ? "light" : "dark");
  }, [light]);

  // active-section tracking — throttled to one rAF per frame, updates only on change
  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const el = scrollRef.current;
      if (!el) return;
      const probe = el.scrollTop + 120;
      let current = NAV[0].id;
      for (const { id } of NAV) {
        const node = document.getElementById(id);
        if (node && node.offsetTop <= probe) current = id;
      }
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
        current = NAV[NAV.length - 1].id;
      }
      setActive((prev) => (prev === current ? prev : current));
    });
  }, []);

  const goTo = (id) => {
    const node = document.getElementById(id);
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="desk">
      <div className="setup">
        <div className="monitor">
          <i className="screw tl" />
          <i className="screw tr" />
          <i className="screw bl" />
          <i className="screw br" />

          <div className="bezel">
            <div className={"screen" + (on ? "" : " is-off")}>
              <div
                className={on ? "crtline on" : interacted ? "crtline off" : "crtline"}
                aria-hidden
              />
              <div className="curve" />
              <div className="scan" />
              <div className="glare" />
              <div className="standby">STANDBY</div>

              <div
                className={on ? "tube on" : interacted ? "tube off" : "tube off-static"}
              >
              {/* prompt nav */}
              <nav className="crt-nav">
                <span className="who">
                  <b>shriyans</b>@<b>portfolio</b>:~$
                </span>
                <span className="links">
                  {NAV.map((n) => (
                    <button
                      key={n.id}
                      className={active === n.id ? "on" : ""}
                      onClick={() => goTo(n.id)}
                    >
                      <span className="br">./</span>
                      {n.label}
                    </button>
                  ))}
                </span>
              </nav>

              {/* scrolling buffer */}
              <div className="crt-scroll" ref={scrollRef} onScroll={onScroll}>
                <div className="buffer">
                  <div className="gutter" aria-hidden>{GUTTER}</div>
                  <Home />
                  <Experience />
                  <Projects />
                  <Resume />
                  <Contact />
                  <div className="eof" aria-hidden>
                    {"~\n~\n~\n~\n~\n~  — end of buffer —"}
                  </div>
                </div>
              </div>

              {/* status bar */}
              <div className="crt-status">
                <span className="mode">NORMAL</span>
                <span className="seg">~/shriyans_sai/portfolio.jsx</span>
                <span className="sp" />
                <span className="seg alt">utf-8 · jsx</span>
                <span className="seg">{active}</span>
                <Clock />
              </div>
              </div>
            </div>
          </div>

          {/* casing controls */}
          <div className="controls">
            <span className="brand">
              SHRIYANS<span>{"//OS"}</span>
            </span>
            <span className={"led" + (on ? "" : " dead")} title="power" />
            <span className="ledlabel">PWR</span>
            <span className="sp" />
            <span className="vents">
              <i /><i /><i /><i /><i /><i />
            </span>
            <button
              className="themebtn"
              onClick={() => setLight((v) => !v)}
              aria-label="Toggle light/dark"
            >
              <span className="ic" />
              {light ? "LIGHT" : "DARK"}
            </button>
            <button
              className={"pwr" + (on ? " lit" : "")}
              onClick={togglePower}
              aria-label={on ? "Power off" : "Power on"}
              title="Power"
            >
              ⏻
            </button>
          </div>

          {/* mobile handheld control deck */}
          <div className="deck">
            <div className="dpad" aria-hidden>
              <i className="dv" />
              <i className="dh" />
            </div>
            <div className="deck-mid">
              <span className="speaker" aria-hidden>
                <i /><i /><i /><i /><i /><i /><i /><i /><i />
              </span>
              <span className="deck-brand">
                SHRIYANS<span>{"//OS"}</span> · POCKET
              </span>
            </div>
            <div className="deck-actions">
              <button
                className="rbtn"
                onClick={() => setLight((v) => !v)}
                aria-label="Toggle light/dark"
              >
                {light ? "☀" : "☾"}
              </button>
              <button
                className={"rbtn pwr2" + (on ? " lit" : "")}
                onClick={togglePower}
                aria-label={on ? "Power off" : "Power on"}
              >
                ⏻
              </button>
            </div>
          </div>
        </div>

        <div className="neck" />
        <div className="base" />
        <div className="caption">
          {"SHRIYANS//OS"} · MODEL SS-2026 · 14&quot; PHOSPHOR DISPLAY
        </div>
      </div>
    </div>
  );
}

export default App;
