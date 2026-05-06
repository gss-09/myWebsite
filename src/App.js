import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import FadeIn from "./components/FadeIn";
import ScrollProgress from "./components/ScrollProgress";
import Aurora from "./components/Aurora";
import InteractiveBg from "./components/InteractiveBg";
import "./index.css";

function App() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <div className="bg-fade fixed inset-0 -z-10"></div>
      <Aurora />
      <InteractiveBg />
      <div className="noise" aria-hidden />
      <div className="vignette" aria-hidden />
      <Navbar />
      <div className="h-24 md:h-28"></div>
      <main>
        <div id="home" className="scroll-section"><FadeIn><Home /></FadeIn></div>
        <div id="experience" className="scroll-section"><FadeIn><Experience /></FadeIn></div>
        <div id="projects" className="scroll-section"><FadeIn><Projects /></FadeIn></div>
        <div id="contact" className="scroll-section"><FadeIn><Contact /></FadeIn></div>
        <footer className="py-10 text-center text-xs font-mono tracking-wider text-gray-500 dark:text-gray-500">
          <span className="opacity-70">Built with React + Tailwind · </span>
          <a href="https://github.com/gss-09" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
            github.com/gss-09
          </a>
        </footer>
      </main>
    </>
  );
}

export default App;
