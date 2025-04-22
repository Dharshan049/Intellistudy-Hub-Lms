"use client"
import { useEffect, useState } from "react";
import { Pane } from "tweakpane";

const ChangeThemeButton = () => {
  // Load stored theme or default to "dark"
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Update theme in localStorage and apply it to the document
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Initialize Tweakpane for external theme control
  useEffect(() => {
    const config = { theme };
    const pane = new Pane({ title: "Config", expanded: true });

    pane.addBinding(config, "theme", {
      label: "Theme",
      options: { System: "system", Light: "light", Dark: "dark" },
    }).on("change", (ev) => setTheme(ev.value));

    return () => pane.dispose(); // Cleanup on unmount
  }, []);

  // Toggle theme when button is clicked
  const handleToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      aria-pressed={theme === "light"}
      className="toggle"
      onClick={handleToggle}
    >
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
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};

export default ChangeThemeButton;
