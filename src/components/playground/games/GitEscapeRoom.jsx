import React, { useState, useEffect } from "react";
import { Gamepad2, RefreshCw, GitFork, ChevronRight, Terminal, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const LEVELS = [
  {
    id: 1,
    fileName: "server.js",
    description: "The API backend needs to start on port 5000, while the web sockets and dashboard hook up to port 8080. Resolve the port variable collision.",
    codeHead: "const PORT = process.env.PORT || 5000;",
    codeIncoming: "const PORT = process.env.PORT || 8080;",
    codeCombined: "const API_PORT = process.env.PORT || 5000;\nconst WS_PORT = 8080;",
    options: [
      {
        id: "head",
        label: "Keep HEAD (Port 5000)",
        feedback: "Incorrect. While the server boots, the web sockets dashboard fails to connect to port 8080. System deadlock!",
        isCorrect: false,
        resolvedCode: "const PORT = process.env.PORT || 5000;"
      },
      {
        id: "incoming",
        label: "Keep Incoming (Port 8080)",
        feedback: "Incorrect. Changing the server port to 8080 crashes the API endpoints which are hardcoded to 5000 in production configuration.",
        isCorrect: false,
        resolvedCode: "const PORT = process.env.PORT || 8080;"
      },
      {
        id: "combine",
        label: "Combine & Resolve (Define API_PORT = 5000 & WS_PORT = 8080)",
        feedback: "Perfect! Separating the ports allows both services to run simultaneously. Conflict resolved!",
        isCorrect: true,
        resolvedCode: "const API_PORT = process.env.PORT || 5000;\nconst WS_PORT = 8080;"
      }
    ],
    originalCodeBlock: `<<<<<<< HEAD
const PORT = process.env.PORT || 5000;
=======
const PORT = process.env.PORT || 8080;
>>>>>>> feature/auth`
  },
  {
    id: 2,
    fileName: "auth.js",
    description: "We are migrating standard SQL username logins to email-based OAuth login with callbacks. Select the correct database query structure.",
    codeHead: `function authenticateUser(username, password) {
  return db.query("SELECT * FROM users WHERE user = ?", [username]);
}`,
    codeIncoming: `function authenticateUser(email, hashPassword, callback) {
  return authService.verify(email, hashPassword).then(callback);
}`,
    codeCombined: `function authenticateUser(email, hashPassword, callback) {
  return authService.verify(email, hashPassword).then(callback);
}`, // In this level, incoming is the clean upgrade
    options: [
      {
        id: "head",
        label: "Keep HEAD (Legacy Username Queries)",
        feedback: "Incorrect. This blocks the OAuth migration. The email login button will throw 500 server errors.",
        isCorrect: false,
        resolvedCode: `function authenticateUser(username, password) {
  return db.query("SELECT * FROM users WHERE user = ?", [username]);
}`
      },
      {
        id: "incoming",
        label: "Accept Incoming (OAuth Email Verify with Callback)",
        feedback: "Excellent! The incoming changes are exactly what is required for the new OAuth provider integrations.",
        isCorrect: true,
        resolvedCode: `function authenticateUser(email, hashPassword, callback) {
  return authService.verify(email, hashPassword).then(callback);
}`
      },
      {
        id: "combine",
        label: "Combine (Nest SQL inside callback)",
        feedback: "Incorrect. Nesting SQL inside the OAuth verification is redundant and causes double authentication cycles.",
        isCorrect: false,
        resolvedCode: `function authenticateUser(email, hashPassword, callback) {
  db.query("SELECT * FROM users WHERE email = ?", [email]);
  return authService.verify(email, hashPassword).then(callback);
}`
      }
    ],
    originalCodeBlock: `<<<<<<< HEAD
function authenticateUser(username, password) {
  return db.query("SELECT * FROM users WHERE user = ?", [username]);
}
=======
function authenticateUser(email, hashPassword, callback) {
  return authService.verify(email, hashPassword).then(callback);
}
>>>>>>> feature/oauth`
  },
  {
    id: 3,
    fileName: "db_connector.js",
    description: "Prevent an infinite loop when the database fails to respond, while retaining the resilience reconnect attempts.",
    codeHead: `while (retryCount < MAX_RETRIES) {
  connectToDB();
  retryCount++;
}`,
    codeIncoming: `while (true) {
  connectToDB();
  if (isConnected) break;
}`,
    codeCombined: `while (retryCount < MAX_RETRIES) {
  connectToDB();
  if (isConnected) break;
  retryCount++;
}`,
    options: [
      {
        id: "head",
        label: "Keep HEAD (Retries Loop)",
        feedback: "Incorrect. While it limits retries, it keeps trying even if it connects successfully on the first try, creating duplicate sessions.",
        isCorrect: false,
        resolvedCode: `while (retryCount < MAX_RETRIES) {
  connectToDB();
  retryCount++;
}`
      },
      {
        id: "incoming",
        label: "Keep Incoming (Infinite Loop)",
        feedback: "Incorrect. If the DB server is down, this creates an infinite blocking thread loop, crashing the entire NodeJS server process.",
        isCorrect: false,
        resolvedCode: `while (true) {
  connectToDB();
  if (isConnected) break;
}`
      },
      {
        id: "combine",
        label: "Combine & Resolve (Limit retries AND break early if connected)",
        feedback: "Awesome! You limited the loops to MAX_RETRIES and added a break statement once a connection is established. Peak software engineering!",
        isCorrect: true,
        resolvedCode: `while (retryCount < MAX_RETRIES) {
  connectToDB();
  if (isConnected) break;
  retryCount++;
}`
      }
    ],
    originalCodeBlock: `<<<<<<< HEAD
while (retryCount < MAX_RETRIES) {
  connectToDB();
  retryCount++;
}
=======
while (true) {
  connectToDB();
  if (isConnected) break;
}
>>>>>>> feature/resilience`
  }
];

const GitEscapeRoom = () => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [filesState, setFilesState] = useState([
    { id: 1, name: "server.js", status: "conflict" },
    { id: 2, name: "auth.js", status: "conflict" },
    { id: 3, name: "db_connector.js", status: "conflict" }
  ]);
  
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [resolvedCode, setResolvedCode] = useState("");
  const [score, setScore] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [terminalLogs, setTerminalLogs] = useState([
    "Initialized Git Escape Terminal v1.0.0",
    "Running: git merge feature/critical-updates",
    "CONFLICT (content): Merge conflict detected. Resolve to escape!"
  ]);

  const currentLevel = LEVELS[currentLevelIdx];

  // Game timer
  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setScore(prev => Math.max(10, prev - 1)); // Slowly decrease score as time ticks
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const handleStartGame = () => {
    playTap();
    setGameStarted(true);
    setGameOver(false);
    setCurrentLevelIdx(0);
    setScore(100);
    setTimeElapsed(0);
    setSelectedOptionId(null);
    setFeedback("");
    setShowResolved(false);
    setFilesState([
      { id: 1, name: "server.js", status: "conflict" },
      { id: 2, name: "auth.js", status: "conflict" },
      { id: 3, name: "db_connector.js", status: "conflict" }
    ]);
    setTerminalLogs([
      "Initialized Git Escape Terminal v1.0.0",
      "Running: git merge feature/critical-updates",
      "CONFLICT (content): Merge conflict in server.js",
      "Automatic merge failed; fix conflicts and then commit."
    ]);
    trackGamePlayed("git-escape-room");
  };

  const handleSelectOption = (option) => {
    if (showResolved) return; // Wait for level progression
    playTap();
    setSelectedOptionId(option.id);
    
    if (option.isCorrect) {
      playSuccess();
      setFeedback(option.feedback);
      setResolvedCode(option.resolvedCode);
      setShowResolved(true);
      
      // Update file state to resolved
      setFilesState(prev => prev.map((f, idx) => 
        idx === currentLevelIdx ? { ...f, status: "merged" } : f
      ));

      setTerminalLogs(prev => [
        ...prev,
        `> Selecting choice: ${option.id}`,
        `[Sys]: Success. Conflict in ${currentLevel.fileName} resolved.`,
        `Running: git add ${currentLevel.fileName}`
      ]);
    } else {
      playFail();
      setFeedback(option.feedback);
      setScore(prev => Math.max(10, prev - 15)); // Major penalty for wrong answer
      setTerminalLogs(prev => [
        ...prev,
        `> Selecting choice: ${option.id}`,
        `[Error]: Failed compile checks on ${currentLevel.fileName}!`,
        `Merge conflict still active.`
      ]);
    }
  };

  const handleNextLevel = () => {
    playTap();
    setSelectedOptionId(null);
    setFeedback("");
    setShowResolved(false);
    
    if (currentLevelIdx < LEVELS.length - 1) {
      const nextIdx = currentLevelIdx + 1;
      setCurrentLevelIdx(nextIdx);
      setTerminalLogs(prev => [
        ...prev,
        `CONFLICT (content): Merge conflict in ${LEVELS[nextIdx].fileName}`,
        `Fix conflict markers in IDE to proceed.`
      ]);
    } else {
      // Completed all levels!
      setGameOver(true);
      setTerminalLogs(prev => [
        ...prev,
        "Running: git commit -m 'resolve all merge conflicts'",
        "[Sys]: Clean workspace. Commit successful.",
        "Running: git push origin main",
        "✓ Push successful! escape sequence complete. You are free!"
      ]);
      
      // Unlock Achievement
      setTimeout(() => {
        unlockAchievement("git-escape-expert");
      }, 1000);
    }
  };

  // Helper to format seconds
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#06001a]/90 backdrop-blur-xl p-5 md:p-6 flex flex-col gap-6 shadow-[0_8px_32px_rgba(99,102,241,0.15)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GitFork className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              Git Merge Escape Room
            </h4>
            <p className="text-xs text-gray-400">Resolve branch conflicts under pressure to push and escape.</p>
          </div>
        </div>
        
        {gameStarted && !gameOver && (
          <button
            onClick={handleStartGame}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Restart Game"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!gameStarted ? (
        /* START MENU SCREEN */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
          <Gamepad2 className="w-16 h-16 text-indigo-400 mb-4 animate-bounce" />
          <h5 className="text-lg font-bold text-white mb-2">Merge conflicts block production!</h5>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Your feature branches are locked out by conflict blocks. Go through conflicted files one-by-one, inspect the code diffs, select the correct logical resolution, and push to main. Watch your timer!
          </p>
          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl py-3 px-6 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            Enter Escape Room
          </button>
        </div>
      ) : gameOver ? (
        /* GAME OVER / VICTORY SCREEN */
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mb-4 animate-bounce">
            🎉
          </div>
          <h5 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 mb-2">
            Merge Conflicts Resolved!
          </h5>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            You successfully navigated git logs, combined ports, authorized OAuth dependencies, and patched database loops. Your build is green!
          </p>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 font-mono text-xs">
            <div className="border-r border-white/10">
              <span className="text-gray-500 uppercase text-[10px]">Escape Time</span>
              <p className="text-lg font-bold text-white mt-1">{formatTime(timeElapsed)}</p>
            </div>
            <div>
              <span className="text-gray-500 uppercase text-[10px]">Efficiency Score</span>
              <p className="text-lg font-bold text-yellow-500 mt-1">{score} / 100</p>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={handleStartGame}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer"
            >
              Play Again
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE GAME SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Conflicted Files Sidebar (Col 3) */}
          <div className="lg:col-span-3 flex flex-col gap-3 border border-white/5 bg-white/3 rounded-xl p-4">
            <span className="text-gray-400 text-[10px] font-mono uppercase tracking-wider">Conflicted Files</span>
            <div className="flex flex-col gap-2">
              {filesState.map((f, idx) => {
                const isActive = idx === currentLevelIdx;
                return (
                  <div
                    key={f.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all ${
                      isActive
                        ? "border-indigo-500/40 bg-indigo-500/10 text-white font-bold"
                        : f.status === "merged"
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                        : "border-white/5 bg-transparent text-gray-500"
                    }`}
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px]">
                      {f.status === "merged" ? (
                        <span className="text-emerald-400">✓ Add</span>
                      ) : (
                        <span className="text-red-400 animate-pulse">[!]</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Score Timer Indicators */}
            <div className="mt-auto pt-4 border-t border-white/5 space-y-3 font-mono text-[11px] text-gray-400">
              <div className="flex justify-between">
                <span>TIME ELAPSED:</span>
                <span className="text-white font-bold">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex justify-between">
                <span>RELIABILITY SCORE:</span>
                <span className="text-yellow-500 font-bold">{score}%</span>
              </div>
            </div>
          </div>

          {/* Code IDE Panel (Col 9) */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            
            {/* Editor window tab label */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-t-xl bg-[#030014]/60 border border-white/10 border-b-0 text-[11px] font-mono text-gray-400 select-none">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">⚡</span>
                <span>{currentLevel.fileName} — Merge Conflict Mode</span>
              </div>
              <HelpCircle className="w-3.5 h-3.5 hover:text-white cursor-pointer" title={currentLevel.description} />
            </div>

            {/* Code Content display */}
            <div className="bg-[#030014]/90 border border-white/10 rounded-b-xl p-4 font-mono text-xs text-left overflow-x-auto min-h-[160px] relative">
              {showResolved ? (
                /* RESOLVED CODE SCREEN */
                <pre className="text-emerald-400 leading-relaxed transition-all duration-300">
                  {resolvedCode}
                </pre>
              ) : (
                /* CONFLICT CODE SCREEN */
                <pre className="leading-relaxed select-text">
                  <div className="bg-blue-500/10 border-l-2 border-blue-500 pl-2 text-blue-300 select-none">
                    {"<<<<<<< HEAD (Current Change)"}
                  </div>
                  <div className="text-white pl-2">
                    {currentLevel.codeHead}
                  </div>
                  <div className="bg-white/10 border-l-2 border-white/30 pl-2 text-gray-400 select-none">
                    {"======="}
                  </div>
                  <div className="text-purple-300 pl-2">
                    {currentLevel.codeIncoming}
                  </div>
                  <div className="bg-purple-500/10 border-l-2 border-purple-500 pl-2 text-purple-400 select-none">
                    {`>>>>>>> feature/${currentLevelIdx === 0 ? "auth" : currentLevelIdx === 1 ? "oauth" : "resilience"}`}
                  </div>
                </pre>
              )}
            </div>

            {/* Description panel */}
            <div className="text-xs text-gray-300 text-left bg-white/3 border border-white/5 rounded-xl p-3.5 leading-relaxed">
              <span className="font-bold text-indigo-400">Task Objective:</span> {currentLevel.description}
            </div>

            {/* Interactive Options list */}
            <div className="flex flex-col gap-2.5">
              {!showResolved ? (
                currentLevel.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-between ${
                        isSelected
                          ? "border-red-500/40 bg-red-500/5 text-red-300"
                          : "border-white/10 bg-white/4 text-gray-300 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  );
                })
              ) : (
                <button
                  onClick={handleNextLevel}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <span>Resolved successfully. Continue</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Micro Feedback Message */}
            {feedback && !showResolved && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{feedback}</span>
              </div>
            )}
            
            {feedback && showResolved && (
              <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-left animate-pulse">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Terminal logs console */}
            <div className="bg-black/80 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-left min-h-[90px] max-h-[120px] overflow-y-auto space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-white/5 pb-1 mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>CONSOLE OUTPUT logs</span>
              </div>
              {terminalLogs.map((log, idx) => (
                <p key={idx} className={log.startsWith("[Error]") ? "text-red-400" : log.startsWith("✓") || log.startsWith("[Sys]: Success") ? "text-emerald-400" : "text-gray-400"}>
                  {log}
                </p>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default GitEscapeRoom;
