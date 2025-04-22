"use client";
import React, { useEffect, useState, useRef } from "react";
import "./globals.css"; // Ensure Tailwind styles are loaded
import "./change-theme-button.css"; // Ensure custom button styles are loaded

const ThemeToggle = () => {
  const toggleRef = useRef(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const handleToggle = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return newTheme;
    });
  };

  return (
    <button ref={toggleRef} aria-pressed={theme === "light"} className="toggle" onClick={handleToggle}>
      <div className="socket">
        <div className="socket-shadow"></div>
      </div>
      <div className="face">
        <div className="face-shadow"></div>
        <div className="face-glowdrop"></div>
        <div className="face-plate"></div>
        <div className="face-shine">
          <div className="face-shine-shadow"></div>
        </div>
        <div className="face-glows"><div></div></div>
      </div>

      {/* 🌞 Sun Icon (Light Mode) */}
      <div className="sun-icon">
        <svg className="w-6 h-6 text-yellow-300 transition-transform duration-500" 
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="5" strokeWidth="2"></circle>
          <line x1="12" y1="1" x2="12" y2="4" strokeWidth="2"></line>
          <line x1="12" y1="20" x2="12" y2="23" strokeWidth="2"></line>
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" strokeWidth="2"></line>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" strokeWidth="2"></line>
          <line x1="1" y1="12" x2="4" y2="12" strokeWidth="2"></line>
          <line x1="20" y1="12" x2="23" y2="12" strokeWidth="2"></line>
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" strokeWidth="2"></line>
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" strokeWidth="2"></line>
        </svg>
      </div>

      {/* 🌙 Moon Icon (Dark Mode) */}
      <div className="moon-icon">
        <svg className="w-6 h-6 text-purple-300 transition-transform duration-500" 
          xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 12.79A9 9 0 0111.21 3a7 7 0 106.58 6.58 9 9 0 013.21 3.21z" strokeWidth="2"></path>
        </svg>
      </div>

      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};

export default ThemeToggle;
