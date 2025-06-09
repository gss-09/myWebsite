// src/App.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import ParticlesBg from "./components/ParticlesBg";
import AnimatedPage from "./components/AnimatedPage";
import "./index.css";

// 1. AnimatedRoutes function
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
        <Route path="/projects" element={<AnimatedPage><Projects /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
        {/* Only add Resume if you have it */}
        {/* <Route path="/resume" element={<AnimatedPage><Resume /></AnimatedPage>} /> */}
      </Routes>
    </AnimatePresence>
  );
}

// 2. Main App
function App() {
  return (
    <>
      <CustomCursor />
      <div className="bg-fade fixed inset-0 -z-10"></div>
      <ParticlesBg />
      <Navbar />
      {/* Spacer for fixed navbar height */}
      <div className="h-20 md:h-24"></div>
      <AnimatedRoutes />
    </>
  );
}

export default App;




