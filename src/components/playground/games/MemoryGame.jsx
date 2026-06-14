import React, { useEffect, useState, useCallback, useRef } from "react";
import { Code2, Database, Cpu, Terminal, Braces, Globe, RefreshCw, Award, Timer } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess } from "../../../services/soundEffects";

const TECH_CARDS = [
  { id: 1, icon: Code2,    name: "React.js",    color: "#22d3ee" },
  { id: 2, icon: Database, name: "MySQL",       color: "#3b82f6" },
  { id: 3, icon: Cpu,      name: "Spring Boot", color: "#22c55e" },
  { id: 4, icon: Terminal, name: "Java",        color: "#f97316" },
  { id: 5, icon: Braces,   name: "JavaScript",  color: "#eab308" },
  { id: 6, icon: Globe,    name: "REST APIs",   color: "#ec4899" },
];

const shuffleCards = () => {
  const duplicated = [...TECH_CARDS, ...TECH_CARDS];
  return duplicated
    .map((card, idx) => ({ ...card, uuid: `${card.id}-${idx}-${Math.random()}` }))
    .sort(() => Math.random() - 0.5);
};

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bestMoves, setBestMoves] = useState(() => {
    return Number(localStorage.getItem("pg_best_moves")) || null;
  });

  const timerRef = useRef(null);

  const initGame = useCallback(() => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setShowSuccess(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  const startTimer = () => {
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  const handleRestart = () => {
    playTap();
    initGame();
  };

  const handleClick = (index) => {
    if (showSuccess) return;
    if (!isPlaying && matched.length === 0 && flipped.length === 0) {
      startTimer();
    }

    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) return;

    // Play click sound on card flip
    playTap();

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;

      if (cards[first].id === cards[second].id) {
        // Play match success sound
        playSuccess();
        const updatedMatched = [...matched, cards[first].id];
        setMatched(updatedMatched);
        setFlipped([]);
        
        if (updatedMatched.length === TECH_CARDS.length) {
          // Finished!
          clearInterval(timerRef.current);
          setShowSuccess(true);
          trackGamePlayed("memory-game");

          // Check for achievements
          if (moves + 1 <= 15) {
            unlockAchievement("quiz-master"); // Quiz master requires perfect but we can use memory game for it or a quiz. Let's make sure memory game completion is tracked.
          }
          
          const storedBest = Number(localStorage.getItem("pg_best_moves")) || 999;
          const currentMoves = moves + 1;
          if (currentMoves < storedBest) {
            localStorage.setItem("pg_best_moves", currentMoves);
            setBestMoves(currentMoves);
          }
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="relative w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#a78bfa]" />
            Dev Stack Matcher
          </h4>
          <p className="text-xs text-gray-500 mt-1">Match tech stack cards to win!</p>
        </div>
        <button
          onClick={handleRestart}
          aria-label="Restart Game"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info Stats */}
      <div className="flex justify-between items-center bg-white/3 rounded-xl p-3 border border-white/5">
        <div className="text-center flex-1 border-r border-white/10">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Moves</p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{moves}</p>
        </div>
        <div className="text-center flex-1 border-r border-white/10 flex flex-col items-center justify-center">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
            <Timer className="w-3 h-3" />
            Time
          </p>
          <p className="text-lg font-bold text-[#22d3ee] font-mono mt-0.5">{formatTime(time)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Best Score</p>
          <p className="text-lg font-bold text-[#eab308] font-mono mt-0.5">
            {bestMoves ? `${bestMoves} moves` : "--"}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 w-full aspect-square">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isFlipped = flipped.includes(index) || matched.includes(card.id);

          return (
            <div
              key={card.uuid}
              onClick={() => handleClick(index)}
              className="relative rounded-2xl cursor-pointer overflow-hidden border border-white/8 bg-white/3 aspect-square select-none transition-all duration-300 hover:border-[#6366f1]/40"
            >
              {/* Inner card card flip wrapper */}
              <div
                className="w-full h-full relative transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {/* Back of card */}
                <div
                  className="absolute inset-0 bg-[#0c0c1e] border border-white/5 rounded-2xl flex items-center justify-center hover:bg-[#12122d] transition-colors"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Braces className="w-6 h-6 text-gray-600 animate-pulse" />
                </div>

                {/* Front of card */}
                <div
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1.5"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    backgroundColor: `${card.color}15`,
                    border: `1.5px solid ${card.color}40`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: card.color }} />
                  <span className="text-[9px] font-bold tracking-tight text-white/90 truncate max-w-full px-1">
                    {card.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
          <Award className="w-16 h-16 text-yellow-500 fill-yellow-500/20 mb-4 animate-bounce" />
          <h5 className="text-xl font-bold text-white mb-2">Congratulations!</h5>
          <p className="text-sm text-gray-400 max-w-xs mb-6">
            You matched all technologies in <span className="text-[#22d3ee] font-bold font-mono">{moves}</span> moves and <span className="text-[#a78bfa] font-bold font-mono">{formatTime(time)}</span>!
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white hover:from-[#4f46e5] hover:to-[#9333ea] shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
