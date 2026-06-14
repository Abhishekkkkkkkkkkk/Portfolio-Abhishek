import React, { useState, useEffect, useRef } from "react";
import { Zap, RefreshCw, Trophy, Timer } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const ReactionTest = () => {
  const [gameState, setGameState] = useState("idle"); // idle, waiting, ready, finished, click-too-early
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(() => {
    return Number(localStorage.getItem("pg_best_reaction")) || null;
  });

  const timerRef = useRef(null);
  const startTimerRef = useRef(null);

  const startTest = () => {
    playTap();
    setGameState("waiting");
    setReactionTime(null);

    const randomDelay = Math.random() * 3000 + 2000; // 2 to 5 seconds
    timerRef.current = setTimeout(() => {
      setGameState("ready");
      startTimerRef.current = performance.now();
    }, randomDelay);
  };

  const handleAreaClick = () => {
    if (gameState === "idle" || gameState === "finished" || gameState === "click-too-early") {
      startTest();
    } else if (gameState === "waiting") {
      // Too early!
      clearTimeout(timerRef.current);
      playFail();
      setGameState("click-too-early");
      trackGamePlayed("reaction-test");
    } else if (gameState === "ready") {
      playSuccess();
      const endTime = performance.now();
      const difference = Math.round(endTime - startTimerRef.current);
      setReactionTime(difference);
      setGameState("finished");
      trackGamePlayed("reaction-test");

      const storedBest = Number(localStorage.getItem("pg_best_reaction")) || Infinity;
      if (difference < storedBest) {
        localStorage.setItem("pg_best_reaction", difference);
        setBestTime(difference);
      }

      // Unlock achievements for exceptional speed
      if (difference < 250) {
        unlockAchievement("quiz-master"); // Quick trigger
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
            Reaction Speed Test
          </h4>
          <p className="text-xs text-gray-500 mt-1">Measure your visual response time</p>
        </div>
        <button
          onClick={startTest}
          aria-label="Restart test"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info Stats */}
      <div className="flex justify-between items-center bg-white/3 rounded-xl p-3 border border-white/5 text-center font-mono text-xs">
        <div className="flex-1 border-r border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">LATEST</p>
          <p className="text-base font-bold text-white mt-0.5">
            {reactionTime ? `${reactionTime} ms` : "--"}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            BEST TIME
          </p>
          <p className="text-base font-bold text-[#eab308] mt-0.5">
            {bestTime ? `${bestTime} ms` : "--"}
          </p>
        </div>
      </div>

      {/* Main Interactive Button Area */}
      <div
        onClick={handleAreaClick}
        className={`w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center border cursor-pointer select-none transition-all duration-300 ${
          gameState === "idle"
            ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            : gameState === "waiting"
            ? "bg-[#ef4444]/20 border-[#ef4444]/40 hover:border-[#ef4444]/60 text-white"
            : gameState === "ready"
            ? "bg-[#22c55e]/20 border-[#22c55e]/50 hover:border-[#22c55e]/70 text-white"
            : gameState === "click-too-early"
            ? "bg-red-500/10 border-red-500/30 text-white"
            : "bg-[#6366f1]/10 border-[#6366f1]/30 hover:border-[#6366f1]/50 text-white"
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-center p-4">
          {gameState === "idle" && (
            <>
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                <Timer className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-base text-white">Click to Start</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  Click inside this box, then wait for it to turn green!
                </p>
              </div>
            </>
          )}

          {gameState === "waiting" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 rounded-full bg-red-500 animate-ping" />
              </div>
              <div>
                <p className="font-bold text-base text-red-500">Wait for Green...</p>
                <p className="text-xs text-gray-400 mt-1.5">Do not click yet!</p>
              </div>
            </>
          )}

          {gameState === "ready" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/25 border border-green-500/50 flex items-center justify-center animate-bounce">
                <Zap className="w-8 h-8 text-green-500 fill-green-500" />
              </div>
              <div>
                <p className="font-bold text-xl text-green-400 uppercase tracking-widest animate-pulse">CLICK NOW!</p>
                <p className="text-xs text-gray-400 mt-1">HURRY!</p>
              </div>
            </>
          )}

          {gameState === "click-too-early" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-base text-red-500">Too Early!</p>
                <p className="text-xs text-gray-400 mt-1.5">Click to try again.</p>
              </div>
            </>
          )}

          {gameState === "finished" && (
            <>
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#818cf8]" />
              </div>
              <div>
                <p className="text-3xl font-black font-mono text-[#818cf8]">
                  {reactionTime} ms
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Click anywhere in this box to restart.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionTest;
