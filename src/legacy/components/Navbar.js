import React, { useState, useRef, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";
import logo from './logo.png';

const NAV_LINKS = [
  { label: "Home",       id: "home",       href: "#home"       },
  { label: "Experience", id: "experience", href: "#experience" },
  { label: "Projects",   id: "projects",   href: "#projects"   },
  { label: "Contact",    id: "contact",    href: "#contact"    },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const closeTimeout = useRef();

  const isMenuVisible = open || animating;
  const NAV_HEIGHT_MOBILE = 80;

  useEffect(() => {
    if (isMenuVisible) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuVisible]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  // Active section detection (scroll-based — handles short last section)
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const offset = 140; // navbar height + buffer
      let active = NAV_LINKS[0].id;

      // If scrolled near the bottom, force the last section active
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;

      if (nearBottom) {
        active = NAV_LINKS[NAV_LINKS.length - 1].id;
      } else {
        for (const { id } of NAV_LINKS) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.getBoundingClientRect().top - offset <= 0) active = id;
        }
      }

      setActiveSection(active);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function handleClose() {
    if (open) {
      setAnimating(true);
      setOpen(false);
      closeTimeout.current = setTimeout(() => setAnimating(false), 300);
    }
  }

  function handleOpen() {
    setOpen(true);
    setAnimating(false);
  }

  return (
    <>
      <nav
        className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[92vw]
          flex items-center justify-between px-4 sm:px-8 py-4
          shadow-lg dark:[box-shadow:0_0_24px_2px_rgb(255,255,255,0.14)]
          z-40 bg-white/50 dark:bg-black/40 backdrop-blur-lg rounded-2xl transition"
        style={{ boxSizing: "border-box" }}
      >
        {/* Logo */}
        <a href="#home" className="text-xl font-bold flex-shrink-0 transition-transform duration-200 hover:scale-110">
          <img src={logo} alt="Shriyans Sai logo" className="h-12 w-12 object-cover rounded-full" />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
          {NAV_LINKS.map(({ label, id, href }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={label}
                href={href}
                className={`relative no-underline transition-all duration-200 hover:scale-110
                  ${isActive ? "font-semibold" : ""}`}
              >
                {label}
                <span
                  className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                    bg-black dark:bg-white transition-opacity duration-300
                    ${isActive ? "opacity-100" : "opacity-0"}`}
                  style={{
                    boxShadow: isActive ? "0 0 8px currentColor" : "none",
                  }}
                />
              </a>
            );
          })}
          <div className="ml-6">
            <DarkModeToggle />
          </div>
        </div>

        {/* Mobile: toggle + hamburger */}
        <div className="flex items-center md:hidden ml-auto">
          <DarkModeToggle />
          <button
            className="ml-2 flex flex-col justify-center items-center w-10 h-10 p-2 z-50"
            onClick={() => open ? handleClose() : handleOpen()}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className={`block w-6 h-0.5 mb-1 rounded transition-all duration-300
              ${open ? "rotate-45 translate-y-2 bg-gray-600 dark:bg-gray-100" : "bg-black dark:bg-white"}`} />
            <span className={`block w-6 h-0.5 mb-1 rounded transition-all duration-300
              ${open ? "opacity-0" : "bg-black dark:bg-white"}`} />
            <span className={`block w-6 h-0.5 rounded transition-all duration-300
              ${open ? "-rotate-45 -translate-y-2 bg-gray-600 dark:bg-gray-100" : "bg-black dark:bg-white"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMenuVisible && (
        <div
          className={`fixed left-1/2 z-40
            bg-white/50 dark:bg-black/40 shadow-2xl dark:[box-shadow:0_0_24px_2px_rgb(255,255,255,0.14)]
            backdrop-blur-lg rounded-2xl px-4 py-8 w-11/12
            flex flex-col items-center gap-4
            ${animating ? "dropdown-anim-out" : "dropdown-anim-in"}`}
          style={{ top: `calc(${NAV_HEIGHT_MOBILE}px + 1rem)`, transform: "translate(-50%, 0)" }}
        >
          {NAV_LINKS.map(({ label, id, href }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={label}
                href={href}
                onClick={handleClose}
                className={`inline-block text-center py-2 px-4 no-underline
                  transition-transform duration-200 hover:scale-110 active:scale-110
                  origin-center text-lg ${isActive ? "font-bold" : "font-semibold"}`}
              >
                {label}
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Navbar;
