import { useEffect, useState } from "react";
import { lines } from "./lines";

const TAG =
  "cs student building systems at the intersection of ai, machine learning & software.";

export default function Home() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    let id;
    const tick = () => {
      setTyped(TAG.slice(0, i));
      if (i++ < TAG.length) id = setTimeout(tick, 26);
    };
    tick();
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="section" id="home" data-lines={lines(18)}>
      <div className="ps1">
        <b>shriyans</b>@<b>portfolio</b> <span className="amber">~</span>{" "}
        <span className="dim">main ✗</span>
      </div>
      <div className="cmd">cat ./whoami.txt</div>

      <div className="hero">
        <div className="badge">
          <img src="/photo.jpg" alt="Shriyans Sai" />
          <div className="cap">ID — SS//2026</div>
        </div>
        <div className="htext">
          <div className="banner">
            SHRIYANS<span className="u">_</span>SAI
          </div>
          <div className="tag">
            <span className="dim">{"// "}</span>
            {typed}
            <span className="cur" />
          </div>
          <div className="kv">
            <div className="row">
              <span className="k">role</span>
              <span>CS student @ University of Houston</span>
            </div>
            <div className="row">
              <span className="k">focus</span>
              <span>AI · machine learning · software</span>
            </div>
            <div className="row">
              <span className="k">status</span>
              <span className="green">● open to internships [2026]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
