import React, { useState, useEffect } from "react";
import { ACHIEVEMENTS, getUnlockedAchievements } from "./achievementHelper";
import { Lock, Unlock, Trophy, Sparkles } from "lucide-react";

const AchievementsPanel = () => {
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    setUnlocked(getUnlockedAchievements());

    // Listen for unlocks to keep in sync
    const handleUnlock = () => {
      setUnlocked(getUnlockedAchievements());
    };

    window.addEventListener("achievement-unlocked", handleUnlock);
    return () => {
      window.removeEventListener("achievement-unlocked", handleUnlock);
    };
  }, []);

  const total = Object.keys(ACHIEVEMENTS).length;
  const count = unlocked.length;
  const progressPercent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0a0a1a]/40 backdrop-blur-xl p-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
            Your Achievements
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Unlock achievements by playing games, passing quizzes, and exploring.
          </p>
        </div>
        
        {/* Progress Circle or Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-[200px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 font-bold mb-1.5 font-mono">
              <span>PROGRESS</span>
              <span className="text-yellow-500">{count} / {total}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(ACHIEVEMENTS).map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          
          return (
            <div
              key={ach.id}
              className={`relative rounded-xl border p-4 flex gap-4 transition-all duration-500 overflow-hidden group ${
                isUnlocked
                  ? "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40 hover:shadow-[0_4px_20px_rgba(234,179,8,0.1)]"
                  : "border-white/5 bg-white/2 opacity-60 hover:opacity-85"
              }`}
            >
              {/* Unlock glow overlay */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent pointer-events-none" />
              )}

              {/* Icon / Status Indicator */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all duration-300 ${
                  isUnlocked
                    ? "border-yellow-500/30 bg-[#0a0a1a] text-yellow-500"
                    : "border-white/10 bg-white/5 text-gray-600"
                }`}>
                  {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-gray-600" />}
                </div>
                <div className="flex items-center gap-1">
                  {isUnlocked ? (
                    <span className="text-[9px] font-black text-yellow-500 tracking-wider uppercase flex items-center gap-0.5">
                      <Unlock className="w-2.5 h-2.5" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-gray-600 tracking-wider uppercase flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      LOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className={`text-sm font-bold truncate transition-colors duration-300 ${
                  isUnlocked ? "text-white group-hover:text-yellow-400" : "text-gray-500"
                }`}>
                  {ach.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {/* Sparkle decoration on hover for unlocked cards */}
              {isUnlocked && (
                <div className="absolute bottom-2 right-2 text-yellow-500/0 group-hover:text-yellow-500/20 transition-all duration-500 pointer-events-none">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;
