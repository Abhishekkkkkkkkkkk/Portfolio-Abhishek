import React, { useState, useEffect, useRef } from "react";
import { Keyboard, RefreshCw, Trophy, Zap, Sparkles } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess } from "../../../services/soundEffects";

const CODE_SNIPPETS = [
  {
    language: "java",
    code: "public class Singleton { private static Singleton instance; private Singleton() {} public static Singleton getInstance() { if (instance == null) { instance = new Singleton(); } return instance; } }",
    title: "Java Singleton Pattern"
  },
  {
    language: "javascript",
    code: "const memoize = (fn) => { const cache = {}; return (...args) => { const key = JSON.stringify(args); return cache[key] || (cache[key] = fn(...args)); }; };",
    title: "JS Memoization Closures"
  },
  {
    language: "java",
    code: "List<String> names = list.stream().filter(s -> s.startsWith(\"A\")).map(String::toUpperCase).collect(Collectors.toList());",
    title: "Java Streams Lambda API"
  },
  {
    language: "javascript",
    code: "const fetchUserData = async (userId) => { try { const res = await fetch(`/api/users/${userId}`); return await res.json(); } catch (err) { console.error(err); } };",
    title: "JS Async/Await API Fetch"
  },
  {
    language: "java",
    code: "@RestController @RequestMapping(\"/api/v1\") public class UserController { @Autowired private UserService userService; @GetMapping(\"/users\") public ResponseEntity<List<User>> getAllUsers() { return ResponseEntity.ok(userService.findAll()); } }",
    title: "Spring Boot RestController"
  }
];

const TypingTest = () => {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isTestActive, setIsTestActive] = useState(false);
  const [bestWPM, setBestWPM] = useState(() => {
    return Number(localStorage.getItem("pg_best_wpm")) || null;
  });

  const inputRef = useRef(null);

  const snippet = CODE_SNIPPETS[snippetIdx];
  const targetCode = snippet.code;

  const initTest = () => {
    playTap();
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsTestActive(true);
    setSnippetIdx((prev) => (prev + 1) % CODE_SNIPPETS.length);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // Start stopwatch on first keypress
    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(val);

    // Calculate accuracy
    let errors = 0;
    const minLength = Math.min(val.length, targetCode.length);
    for (let i = 0; i < minLength; i++) {
      if (val[i] !== targetCode[i]) {
        errors++;
      }
    }
    const currentAccuracy = val.length > 0 
      ? Math.max(0, Math.round(((val.length - errors) / val.length) * 100))
      : 100;
    setAccuracy(currentAccuracy);

    // Check if user finished typing
    if (val.length >= targetCode.length) {
      playSuccess();
      const finishTime = Date.now();
      setEndTime(finishTime);
      setIsTestActive(false);
      trackGamePlayed("typing-test");

      // Calculate final stats
      const totalTimeMinutes = (finishTime - (startTime || Date.now())) / 60000;
      // WPM = (total characters / 5) / time in minutes
      const finalWPM = Math.round((val.length / 5) / totalTimeMinutes);
      setWpm(finalWPM);

      // Check best WPM
      const storedBest = Number(localStorage.getItem("pg_best_wpm")) || 0;
      if (finalWPM > storedBest && currentAccuracy >= 90) {
        localStorage.setItem("pg_best_wpm", finalWPM);
        setBestWPM(finalWPM);
      }

      // Achievement unlock
      if (finalWPM >= 50 && currentAccuracy >= 95) {
        unlockAchievement("quiz-master"); // Speed coder
      }
    }
  };

  // Live timer stats calculation
  useEffect(() => {
    let interval;
    if (isTestActive && startTime && !endTime) {
      interval = setInterval(() => {
        const timeElapsedMin = (Date.now() - startTime) / 60000;
        const currentWpm = Math.round((userInput.length / 5) / timeElapsedMin);
        setWpm(isNaN(currentWpm) || !isFinite(currentWpm) ? 0 : currentWpm);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isTestActive, startTime, endTime, userInput]);

  // Styling character highlights
  const renderHighlightedCode = () => {
    return targetCode.split("").map((char, index) => {
      let colorClass = "text-gray-600";
      if (index < userInput.length) {
        colorClass = userInput[index] === char ? "text-green-400 font-bold" : "bg-red-500/30 text-red-500 font-bold";
      } else if (index === userInput.length) {
        colorClass = "border-b-2 border-indigo-400 text-white animate-pulse";
      }
      return (
        <span key={index} className={colorClass}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            Syntax Speed Typer
          </h4>
          <p className="text-xs text-gray-500 mt-1">Test your typing speed on real source code snippets</p>
        </div>
        <button
          onClick={initTest}
          aria-label="New snippet"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Snippet Header */}
      <div className="flex justify-between items-center bg-white/3 px-4 py-2 border border-white/5 rounded-lg text-xs font-mono">
        <span className="text-indigo-400 font-bold uppercase tracking-wider">{snippet.language}</span>
        <span className="text-gray-400">{snippet.title}</span>
      </div>

      {/* Output Stats panel */}
      <div className="grid grid-cols-3 gap-3 bg-white/3 rounded-xl p-3 border border-white/5 font-mono text-center">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#22d3ee]" />
            WPM
          </p>
          <p className="text-lg font-black text-white mt-0.5">{wpm}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Accuracy</p>
          <p className={`text-lg font-black mt-0.5 ${accuracy >= 90 ? "text-green-400" : accuracy >= 70 ? "text-yellow-400" : "text-red-500"}`}>
            {accuracy}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            BEST
          </p>
          <p className="text-lg font-black text-[#eab308] mt-0.5">{bestWPM ? `${bestWPM} WPM` : "--"}</p>
        </div>
      </div>

      {/* Fenced Display Code Text block */}
      <div 
        className="w-full rounded-xl border border-white/8 bg-black/50 p-4 font-mono text-xs text-left leading-relaxed max-h-48 overflow-y-auto select-none select-none"
        onClick={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
      >
        {renderHighlightedCode()}
      </div>

      {/* Target input field */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={!isTestActive}
          placeholder={isTestActive ? "Focus here and type the code snippet exactly as shown above..." : "Click 'Start Typing Test' below to begin!"}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all resize-none"
        />
        
        {!isTestActive && (
          <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <button
              onClick={initTest}
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg hover:shadow-[#6366f1]/20"
            >
              <Keyboard className="w-4 h-4" />
              <span>Start Typing Test</span>
            </button>
          </div>
        )}
      </div>

      {/* Success banner */}
      {endTime && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3.5 flex items-center gap-3 animate-fade-in text-left">
          <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white">Syntax Completed!</h5>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Awesome job! You typed the code at <span className="text-green-400 font-bold font-mono">{wpm} WPM</span> and <span className="text-green-400 font-bold font-mono">{accuracy}% accuracy</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
