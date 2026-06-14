import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, X, Bug, Award, Sparkles } from "lucide-react";
import { unlockAchievement } from "./achievements/achievementHelper";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

const EasterEggs = ({ toggleTheme }) => {
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [bugVisible, setBugVisible] = useState(false);
  const [bugSolved, setBugSolved] = useState(false);
  
  const navigate = useNavigate();

  // Listen for keydown events
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Konami Code detection
      const key = e.key;
      const expected = KONAMI_CODE[konamiIdx];

      if (key.toLowerCase() === expected.toLowerCase()) {
        const nextIdx = konamiIdx + 1;
        if (nextIdx === KONAMI_CODE.length) {
          // Trigger Konami Code action!
          setShowTerminal(true);
          unlockAchievement("secret-hunter");
          setTerminalLogs([
            "SYSTEM: Init Retro Terminal...",
            "SYSTEM: Compiling hidden EasterEgg configuration...",
            "SUCCESS: Access granted. Welcome Abhishek's terminal.",
            "Type 'help' to review compiled commands.",
          ]);
          setKonamiIdx(0);
        } else {
          setKonamiIdx(nextIdx);
        }
      } else {
        // Reset code progress
        setKonamiIdx(key.toLowerCase() === KONAMI_CODE[0].toLowerCase() ? 1 : 0);
      }

      // 2. Keyboard shortcuts
      // 'H' to go home
      if (e.key === "h" || e.key === "H") {
        if (!showTerminal) {
          navigate("/");
        }
      }
      // 'L' to toggle theme
      if (e.key === "l" || e.key === "L") {
        if (!showTerminal && toggleTheme) {
          toggleTheme();
        }
      }
      // 'D' to log developer joke in console
      if (e.key === "d" || e.key === "D") {
        console.log("%c💡 Dev Joke: There are 10 kinds of people in this world. Those who understand binary, and those who don't.", "color: #a78bfa; font-size: 14px; font-weight: bold;");
        console.log("%cYou also unlocked a secret console log! Try finding the floating bug on the page next.", "color: #6366f1; font-size: 11px;");
        unlockAchievement("secret-hunter");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIdx, showTerminal, navigate, toggleTheme]);

  // Make the hidden bug appear at a random time interval on the page
  useEffect(() => {
    const timer = setInterval(() => {
      if (!bugSolved && Math.random() > 0.6) {
        setBugVisible(true);
        // auto-hide after 8 seconds if not clicked
        setTimeout(() => setBugVisible(false), 8000);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [bugSolved]);

  const handleBugClick = () => {
    setBugVisible(false);
    setBugSolved(true);
    unlockAchievement("secret-hunter");
    
    // Alert via custom toast or visual effect
    const event = new CustomEvent("achievement-unlocked", {
      detail: {
        id: "bug-clicked",
        title: "Bug Squasher!",
        description: "You clicked and resolved the hidden compiler bug.",
        icon: "🐛"
      }
    });
    window.dispatchEvent(event);
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const input = e.target.cmd.value.trim().toLowerCase();
    e.target.cmd.value = "";

    let response = [];
    switch (input) {
      case "help":
        response = [
          "Available Commands:",
          "  about    - Detailed bio credentials.",
          "  skills   - Core Java / Fullstack technologies.",
          "  joke     - Generate a programming joke.",
          "  matrix   - Trigger cascading digital code matrix rain.",
          "  clear    - Clear terminal shell output.",
          "  exit     - Exit retro terminal console."
        ];
        break;
      case "about":
        response = [
          "ABHISHEK KUMAR - SOFTWARE ENGINEER",
          "  Location: Pune, India",
          "  Experience: 3 Years",
          "  Focus: Scale-secure microservices & premium responsive UIs."
        ];
        break;
      case "skills":
        response = [
          "CORE TECH MATRIX:",
          "  Java, Spring Boot, REST APIs, MySQL, MongoDB, Redis,",
          "  JavaScript, TypeScript, React.js, Next.js, Tailwind, Docker."
        ];
        break;
      case "joke":
        const jokes = [
          "Why do programmers wear glasses? Because they can't C#.",
          "There are 10 types of people: those who understand binary, and those who don't.",
          "How many programmers does it take to change a light bulb? None, it's a hardware problem.",
          "Real programmers count from 0."
        ];
        response = [jokes[Math.floor(Math.random() * jokes.length)]];
        break;
      case "matrix":
        response = [
          "Initializing Matrix Rain simulation...",
          "Wake up, Neo...",
          "The Matrix has you...",
          "Follow the white rabbit..."
        ];
        break;
      case "clear":
        setTerminalLogs([]);
        return;
      case "exit":
        setShowTerminal(false);
        return;
      default:
        response = [`Command '${input}' unrecognized. Type 'help' for options.`];
    }

    setTerminalLogs((prev) => [...prev, `> ${input}`, ...response]);
  };

  return (
    <>
      {/* Hidden Clickable Compiler Bug */}
      {bugVisible && (
        <button
          onClick={handleBugClick}
          className="fixed bottom-24 left-6 z-[999] p-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer animate-[bounce_2s_infinite]"
          title="Click to resolve the compiler bug!"
        >
          <Bug className="w-5 h-5" />
        </button>
      )}

      {/* Retro Fullscreen Hacker Terminal */}
      {showTerminal && (
        <div className="fixed inset-0 z-[10000] bg-black text-green-500 font-mono p-4 sm:p-8 flex flex-col gap-4 text-left leading-relaxed select-text retro-terminal">
          {/* Header Panel */}
          <div className="flex items-center justify-between border-b border-green-900 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-green-400">
              <Terminal className="w-4 h-4" />
              <span>TERMINAL::ROOT@ABHISHEK_PORTFOLIO:/bin/bash</span>
            </div>
            <button
              onClick={() => setShowTerminal(false)}
              className="p-1 rounded bg-green-950 border border-green-800 text-green-400 hover:text-green-300 hover:bg-green-900 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Logs Output Screen */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 text-xs sm:text-sm">
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={log.startsWith(">") ? "text-green-300 font-bold" : "text-green-500"}
              >
                {log}
              </div>
            ))}
          </div>

          {/* Input Shell Form */}
          <form onSubmit={handleTerminalSubmit} className="flex gap-2 border-t border-green-900 pt-3">
            <span className="text-green-300 font-bold shrink-0">$ root_guest:</span>
            <input
              name="cmd"
              type="text"
              autoFocus
              autoComplete="off"
              placeholder="type 'help' and press Enter..."
              className="flex-1 bg-transparent border-0 outline-none text-green-400 placeholder-green-900 focus:ring-0 focus:outline-none"
            />
          </form>
        </div>
      )}
    </>
  );
};

export default EasterEggs;
