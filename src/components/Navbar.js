import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const location = useLocation();
  const closeTimeout = useRef();

  const isMenuVisible = open || animating;
  const NAV_HEIGHT_MOBILE = 80; // matches h-20 in your App.js spacer

  useEffect(() => {
    if (isMenuVisible) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuVisible]);

  useEffect(() => {
    handleClose();
    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  function handleClose() {
    if (open) {
      setAnimating(true);
      setOpen(false);
      closeTimeout.current = setTimeout(() => {
        setAnimating(false);
      }, 300);
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
          flex items-center px-4 sm:px-8 py-4
          shadow-lg dark:[box-shadow:0_0_24px_2px_rgb(255,255,255,0.14)]
          z-40 bg-white/50 dark:bg-black/40 backdrop-blur-lg rounded-2xl transition"
        style={{
          boxSizing: "border-box",
        }}
      >
        <Link to="/" className="text-xl font-bold flex-shrink-0">
          Shriyan Sai
        </Link>
        <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link to="/" className="no-underline transition-all duration-200 hover:scale-110 hover:text-blue-600">Home</Link>
          <Link to="/about" className="no-underline transition-all duration-200 hover:scale-110 hover:text-blue-600">About</Link>
          <Link to="/projects" className="no-underline transition-all duration-200 hover:scale-110 hover:text-blue-600">Projects</Link>
          <Link to="/contact" className="no-underline transition-all duration-200 hover:scale-110 hover:text-blue-600">Contact</Link>
        </div>
        {/* Desktop: Toggle always right */}
        <div className="hidden md:flex items-center ml-6">
          <DarkModeToggle />
        </div>
        {/* Mobile: Toggle to the left of hamburger */}
        <div className="flex items-center md:hidden ml-auto">
          <DarkModeToggle />
          <button
            className="ml-2 flex flex-col justify-center items-center w-10 h-10 p-2 z-50"
            onClick={() => {
              if (open) {
                handleClose();
              } else {
                handleOpen();
              }
            }}
            aria-label={open ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ position: "relative" }}
          >
            <span
              className={`block w-6 h-0.5 mb-1 rounded transition-all duration-300 
              ${open ? "rotate-45 translate-y-2 bg-gray-600 dark:bg-gray-100" : "bg-black dark:bg-white"}`}
            ></span>
            <span
              className={`block w-6 h-0.5 mb-1 rounded transition-all duration-300 
              ${open ? "opacity-0" : "bg-black dark:bg-white"}`}
            ></span>
            <span
              className={`block w-6 h-0.5 rounded transition-all duration-300 
              ${open ? "-rotate-45 -translate-y-2 bg-gray-600 dark:bg-gray-100" : "bg-black dark:bg-white"}`}
            ></span>
          </button>
        </div>
      </nav>

      {/* Mobile: Drop-down menu just below navbar */}
      {isMenuVisible && (
        <div
          className={`fixed left-1/2 z-40
            bg-white/50 dark:bg-black/40 shadow-2xl dark:[box-shadow:0_0_24px_2px_rgb(255,255,255,0.14)] 
            backdrop-blur-lg rounded-2xl px-4 py-8 w-11/12 max-w-none
            flex flex-col items-center gap-4
            ${animating ? "dropdown-anim-out" : "dropdown-anim-in"}`}
          style={{
            top: `calc(${NAV_HEIGHT_MOBILE}px + 1rem)`,
            transform: "translate(-50%, 0)",
          }}
        >
          <Link
            to="/"
            className="inline-block text-center py-2 px-4 no-underline transition-transform duration-200 hover:scale-110 active:scale-110 origin-center text-lg font-semibold"
            onClick={handleClose}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="inline-block text-center py-2 px-4 no-underline transition-transform duration-200 hover:scale-110 active:scale-110 origin-center text-lg font-semibold"
            onClick={handleClose}
          >
            About
          </Link>
          <Link
            to="/projects"
            className="inline-block text-center py-2 px-4 no-underline transition-transform duration-200 hover:scale-110 active:scale-110 origin-center text-lg font-semibold"
            onClick={handleClose}
          >
            Projects
          </Link>
          <Link
            to="/contact"
            className="inline-block text-center py-2 px-4 no-underline transition-transform duration-200 hover:scale-110 active:scale-110 origin-center text-lg font-semibold"
            onClick={handleClose}
          >
            Contact
          </Link>
        </div>
      )}
    </>
  );
}

export default Navbar;

