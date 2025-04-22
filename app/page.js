"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import "./globals.css";

const studyQuotes = [
  "An investment in knowledge pays the best interest. - Benjamin Franklin",
  "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. - Malcolm X",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi",
  "The only thing that you absolutely have to know, is the location of the library. - Albert Einstein",
  "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world. - Albert Einstein",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
  "If you want to shine like the sun, first burn like the sun. - A.P.J. Abdul Kalam",
  "It is not that I'm so smart, it's just that I stay with problems longer. - Albert Einstein",
  "I am become Death, the destroyer of worlds. - J. Robert Oppenheimer (Bhagavad Gita)",
  "The most powerful weapon on earth is the human soul on fire. - Ferdinand Foch",
  "To be prepared for war is one of the most effective means of preserving peace. - George Washington",
  "The supreme art of war is to subdue the enemy without fighting. - Sun Tzu",
  "Opportunities multiply as they are seized. - Sun Tzu",
  "The empires of the future are the empires of the mind. - Winston Churchill",
  "We shall not fail or falter; we shall not weaken or tire… Give us the tools and we will finish the job. - Winston Churchill",
  "War does not determine who is right – only who is left. - Bertrand Russell",
  "Victory has a thousand fathers, but defeat is an orphan. - John F. Kennedy",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "A room without books is like a body without a soul. - Marcus Tullius Cicero",
  "Knowledge will bring you the opportunity to make a difference. - Claire Fagin",
  "Reading is essential for those who seek to rise above the ordinary. - Jim Rohn",
  "Wisdom is not a product of schooling but of the lifelong attempt to acquire it. - Albert Einstein",
  "Your mind is a garden, your thoughts are the seeds. You can grow flowers, or you can grow weeds. - Unknown",
  "Study the past if you would define the future. - Confucius",
];

const LandingPage = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [quote, setQuote] = useState(studyQuotes[0]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    if (isSignedIn) {
      router.push("/dashboard");
    }

    const interval = setInterval(() => {
      setQuote(studyQuotes[Math.floor(Math.random() * studyQuotes.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isSignedIn, router]);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-br ${
        darkMode
          ? "from-[#1a0235] via-[#3b0764] to-[#1a0235] text-white"
          : "from-[#e2d6f8] via-[#d4afff] to-[#e2d6f8] text-black"
      }`}
    >
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="p-4 flex justify-between items-center">
          <h1 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            IntelliStudy Hub
          </h1>

          {/* Unique Dark/Light Mode Switch */}
          <div
            onClick={toggleTheme}
            className="relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-500"
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #6a00f4, #d400d4)"
                : "linear-gradient(135deg, #ffcc00, #ff8800)",
              boxShadow: darkMode
                ? "0 0 12px rgba(106, 0, 244, 0.7)"
                : "0 0 12px rgba(255, 136, 0, 0.7)",
            }}
          >
            {/* Sun Icon (Light Mode) */}
            <div
              className={`absolute left-2 transition-all duration-500 ${
                darkMode ? "opacity-0 scale-50" : "opacity-100 scale-100 rotate-0"
              }`}
            >
              <svg
                className="w-5 h-5 text-yellow-300 transition-transform duration-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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

            {/* Moon Icon (Dark Mode) */}
            <div
              className={`absolute right-2 transition-all duration-500 ${
                darkMode ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50"
              }`}
            >
              <svg
                className="w-5 h-5 text-purple-300 transition-transform duration-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M21 12.79A9 9 0 0111.21 3a7 7 0 106.58 6.58 9 9 0 013.21 3.21z"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>

            {/* Moving Toggle Knob */}
            <div
              className={`relative w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-500 ${
                darkMode ? "translate-x-8 bg-yellow-500 shadow-purple-500" : "bg-white shadow-yellow-400"
              }`}
            ></div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 pt-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            IntelliStudy Hub <br />
            <span className={darkMode ? "text-purple-300" : "text-purple-700"}>
              Learning Management System
            </span>
          </h1>

          <p className={`mt-6 text-xl max-w-3xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Unlock your potential with the power of AI: revolutionize your study routine and achieve
            mastery through personalized, intelligent learning tools.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/sign-in">
              <button className="relative h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:brightness-90">
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="relative h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-gray-500 to-gray-700 text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:brightness-90">
                Sign Up
              </button>
            </Link>
          </div>
        </main>

        {/* Quote Box */}
        <div className="mt-20 flex flex-col items-center">
          <div className={`relative p-6 w-2/3 md:w-1/2 rounded-lg shadow-lg border-4 transition-transform transform hover:scale-105 ${darkMode ? "bg-[#1a0235] border-purple-400" : "bg-white border-purple-500"}`}>
            <h2 className={`text-2xl font-semibold text-center mb-6 ${darkMode ? "text-purple-300" : "text-purple-700"}`}>
              {quote.split(" - ")[0]}
            </h2>
            <p className="absolute bottom-3 right-4 text-lg font-bold" style={{ color: darkMode ? "#d4afff" : "#6b21a8" }}>
              - {quote.split(" - ")[1]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
