import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import ParticlesBg from "./components/ParticlesBg";
import FadeIn from "./components/FadeIn";
import "./index.css";

function App() {
  return (
    <>
      <CustomCursor />
      <div className="bg-fade fixed inset-0 -z-10"></div>
      <ParticlesBg />
      <Navbar />
      <div className="h-24 md:h-28"></div>
      <main>
        <div id="home" className="scroll-section"><FadeIn><Home /></FadeIn></div>
        <div id="experience" className="scroll-section"><FadeIn><Experience /></FadeIn></div>
        <div id="projects" className="scroll-section"><FadeIn><Projects /></FadeIn></div>
        <div id="contact" className="scroll-section"><FadeIn><Contact /></FadeIn></div>
      </main>
    </>
  );
}

export default App;
