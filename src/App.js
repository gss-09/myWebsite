import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import ParticlesBg from "./components/ParticlesBg";
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
        <div id="home" className="scroll-section"><Home /></div>
        <div id="projects" className="scroll-section"><Projects /></div>
        <div id="contact" className="scroll-section"><Contact /></div>
      </main>
    </>
  );
}

export default App;
