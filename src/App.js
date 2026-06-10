import { useEffect, useRef, useState, useCallback } from "react";
import Home from "./components/Home";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Resume from "./components/Resume";
import Contact from "./components/Contact";
import Clock from "./components/Clock";
import Cli from "./components/Cli";
import MatrixRain from "./components/MatrixRain";
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
  const [accent, setAccent] = useState("amber"); // phosphor color
  const [matrix, setMatrix] = useState(false);
  const [tabs, setTabs] = useState([{ id: 0, name: "landing", kind: "landing" }]);
  const [activeTab, setActiveTab] = useState(0);
  const tabId = useRef(1);
  const scrollRef = useRef(null);
  const ticking = useRef(false);

  const togglePower = () => {
    setInteracted(true);
    setOn((o) => !o);
  };
  const powerOff = () => {
    setInteracted(true);
    setOn(false);
  };
  const reboot = () => {
    setInteracted(true);
    setOn(false);
    setTimeout(() => setOn(true), 850);
  };
  const openLink = (url) =>
    window.open(url, url.startsWith("mailto") ? "_self" : "_blank", "noopener");
  const showMatrix = () => {
    setMatrix(true);
    setTimeout(() => setMatrix(false), 5200);
  };

  // theme — class on <html>, persisted
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("crt-theme", light ? "light" : "dark");
  }, [light]);

  // phosphor accent color
  useEffect(() => {
    const r = document.documentElement;
    r.classList.remove("acc-green", "acc-blue");
    if (accent === "green") r.classList.add("acc-green");
    if (accent === "blue") r.classList.add("acc-blue");
  }, [accent]);

  // keyboard navigation (ignored while typing in a CLI input)
  useEffect(() => {
    const onKey = (e) => {
      if (!on) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("cli-input-" + activeTab)?.focus();
        return;
      }
      if (activeTab !== 0) return; // section nav only on the landing tab
      const el = scrollRef.current;
      if (!el) return;
      const idx = NAV.findIndex((n) => n.id === active);
      if (e.key === "j") goTo(NAV[Math.min(idx + 1, NAV.length - 1)].id);
      else if (e.key === "k") goTo(NAV[Math.max(idx - 1, 0)].id);
      else if (e.key >= "1" && e.key <= "5") goTo(NAV[+e.key - 1].id);
      else if (e.key === "g") el.scrollTo({ top: 0, behavior: "smooth" });
      else if (e.key === "G") el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on, active, activeTab]);

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
  // jump to a section, switching back to the landing tab first if needed
  const goToTab = (id) => {
    setActiveTab(0);
    requestAnimationFrame(() => goTo(id));
  };

  const addTab = () => {
    const id = tabId.current++;
    setTabs((ts) => [...ts, { id, name: `shell-${id}`, kind: "shell" }]);
    setActiveTab(id);
  };
  const closeTab = (id) => {
    setTabs((ts) => ts.filter((t) => t.id !== id));
    setActiveTab((a) => (a === id ? 0 : a));
  };

  // focus a freshly-opened / re-selected shell tab
  useEffect(() => {
    const t = tabs.find((x) => x.id === activeTab);
    if (t && t.kind === "shell") {
      setTimeout(() => document.getElementById("cli-input-" + activeTab)?.focus(), 0);
    }
  }, [activeTab, tabs]);

  const cliActions = {
    go: goToTab,
    openLink,
    setLight,
    setAccent,
    reboot,
    powerOff,
    matrix: showMatrix,
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
              {matrix && <MatrixRain />}
              <div className="standby">STANDBY</div>

              <div
                className={on ? "tube on" : interacted ? "tube off" : "tube off-static"}
              >
              {/* tab bar */}
              <div className="tabbar">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    className={"tab" + (activeTab === t.id ? " active" : "")}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <span className="tdot" />
                    {t.name}
                    {t.kind === "shell" && (
                      <span
                        className="tx"
                        role="button"
                        aria-label="close tab"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(t.id);
                        }}
                      >
                        ×
                      </span>
                    )}
                  </button>
                ))}
                <button className="tabadd" onClick={addTab} title="new terminal" aria-label="new terminal">
                  +
                </button>
              </div>

              {/* landing tab — the portfolio */}
              <div className="tabpane" style={{ display: activeTab === 0 ? "flex" : "none" }}>
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
                <div className="crt-scroll" ref={scrollRef} onScroll={onScroll}>
                  <div className="buffer">
                    <div className="gutter" aria-hidden>{GUTTER}</div>
                    <Home />
                    <Experience />
                    <Projects />
                    <Resume />
                    <Contact />
                    <Cli actions={cliActions} inputId="cli-input-0" />
                  </div>
                </div>
              </div>

              {/* shell tabs — fresh terminals */}
              {tabs
                .filter((t) => t.kind === "shell")
                .map((t) => (
                  <div
                    key={t.id}
                    className="tabpane"
                    style={{ display: activeTab === t.id ? "flex" : "none" }}
                  >
                    <Cli actions={cliActions} inputId={"cli-input-" + t.id} standalone />
                  </div>
                ))}

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
