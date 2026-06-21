import React, { useState } from "react";
import { Gamepad2, RefreshCw, Trophy } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const CHOICES = [
  { id: "rock", label: "Rock 💎", beats: "scissors", loses: "paper" },
  { id: "paper", label: "Paper 📄", beats: "rock", loses: "scissors" },
  { id: "scissors", label: "Scissors ✂️", beats: "paper", loses: "rock" },
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState(null); // win, lose, tie
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [aiCommentary, setAiCommentary] = useState("Pick your compiler symbol!");

  const handleChoice = (choice) => {
    const aiRandom = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    setPlayerChoice(choice);
    setAiChoice(aiRandom);
    trackGamePlayed("rock-paper-scissors");

    if (choice.id === aiRandom.id) {
      playTap();
      setResult("tie");
      setAiCommentary("A perfect tie. Thread deadlock!");
    } else if (choice.beats === aiRandom.id) {
      playSuccess();
      setResult("win");
      setScores((s) => ({ ...s, player: s.player + 1 }));
      setAiCommentary("You win this cycle. Committing database logs...");
      
      const newPlayerScore = scores.player + 1;
      if (newPlayerScore >= 5) {
        unlockAchievement("quiz-master"); // Unlock achievement
      }
    } else {
      playFail();
      setResult("lose");
      setScores((s) => ({ ...s, ai: s.ai + 1 }));
      setAiCommentary("I win. Garbage collector cleared your stack!");
    }
  };

  const resetGame = () => {
    playTap();
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setAiCommentary("Recompiled game logic. Play!");
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-pink-400" />
            Code, Stack, Compiler (RPS)
          </h4>
          <p className="text-xs text-gray-500 mt-1">Play classic Rock Paper Scissors vs AI</p>
        </div>
        <button
          onClick={resetGame}
          aria-label="Restart Game"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info Stats */}
      <div className="grid grid-cols-2 gap-3 bg-white/3 rounded-xl p-3 border border-white/5 font-mono text-center text-xs">
        <div className="border-r border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">YOUR SCORE</p>
          <p className="text-lg font-black text-white mt-0.5">{scores.player}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI SCORE</p>
          <p className="text-lg font-black text-[#a855f7] mt-0.5">{scores.ai}</p>
        </div>
      </div>

      {/* Commentary Terminal */}
      <div className="bg-black/45 border border-white/5 rounded-xl p-3 font-mono text-xs text-left min-h-[56px] flex items-center gap-2">
        <span className="text-pink-400 font-bold shrink-0">&gt;_</span>
        <span className="text-gray-300 leading-relaxed">{aiCommentary}</span>
      </div>

      {/* Duel Screen */}
      {playerChoice && aiChoice && (
        <div className="flex items-center justify-around bg-white/3 border border-white/8 rounded-2xl py-6 animate-fade-in">
          {/* Player Choice */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-mono tracking-wider">YOU</span>
            <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center text-2xl animate-[bounce_0.6s_ease]">
              {playerChoice.id === "rock" ? "💎" : playerChoice.id === "paper" ? "📄" : "✂️"}
            </div>
            <span className="text-xs font-semibold text-white">{playerChoice.label.split(" ")[0]}</span>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-black font-mono text-gray-600 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
              VS
            </span>
            <span className={`text-xs font-black mt-2 font-mono uppercase tracking-wider ${
              result === "win" ? "text-green-400" : result === "lose" ? "text-red-400" : "text-yellow-400"
            }`}>
              {result}
            </span>
          </div>

          {/* AI Choice */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-mono tracking-wider">AI</span>
            <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-2xl animate-[bounce_0.6s_ease_0.1s]">
              {aiChoice.id === "rock" ? "💎" : aiChoice.id === "paper" ? "📄" : "✂️"}
            </div>
            <span className="text-xs font-semibold text-[#a855f7]">{aiChoice.label.split(" ")[0]}</span>
          </div>
        </div>
      )}

      {/* Choice Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice)}
            className="group py-4 px-2 rounded-2xl border border-white/8 bg-white/3 hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 transition-all duration-300 active:scale-95 flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
              {choice.id === "rock" ? "💎" : choice.id === "paper" ? "📄" : "✂️"}
            </span>
            <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
              {choice.id.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      {playerChoice && (
        <button
          onClick={resetGame}
          className="w-full py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
        >
          Reset Duel
        </button>
      )}
    </div>
  );
};

export default RockPaperScissors;
