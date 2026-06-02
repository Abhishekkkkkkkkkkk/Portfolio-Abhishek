import React, { useEffect, useState, useCallback, memo } from "react";
import { Code2, Database, Cpu, Terminal, Braces, Globe, RefreshCw, Award } from "lucide-react";

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
  const [showSuccess, setShowSuccess] = useState(false);

  const initGame = useCallback(() => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setShowSuccess(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;

      if (cards[first].id === cards[second].id) {
        const updatedMatched = [...matched, cards[first].id];
        setMatched(updatedMatched);
        setFlipped([]);
        if (updatedMatched.length === TECH_CARDS.length) {
          setTimeout(() => setShowSuccess(true), 600);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#a78bfa]" />
            Dev Stack Matcher
          </h4>
          <p className="text-[10px] text-gray-500 font-mono">Moves: {moves}</p>
        </div>
        <button
          onClick={initGame}
          aria-label="Restart Game"
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 w-full aspect-[4/3]">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isFlipped = flipped.includes(index) || matched.includes(card.id);

          return (
            <div
              key={card.uuid}
              onClick={() => handleClick(index)}
              className="relative rounded-xl cursor-pointer overflow-hidden border border-white/8 bg-white/3 aspect-square select-none transition-all duration-300 hover:border-white/15"
            >
              {/* Inner card card flip wrapper */}
              <div
                className="w-full h-full relative transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {/* Front Side (Card Back) */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0c0a1f] to-[#04020a] rounded-xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-xs font-mono text-gray-600 font-bold">?</span>
                </div>

                {/* Back Side (Card Front) */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/25"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                >
                  <Icon className="w-6 h-6 mb-1" style={{ color: card.color }} />
                  <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest text-center truncate px-0.5 w-full">
                    {card.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 rounded-2xl bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
          <span className="text-4xl mb-2">🎉</span>
          <h5 className="text-base font-bold text-white">Stack Synced!</h5>
          <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-4">
            You completed the grid in <span className="text-[#a78bfa] font-bold">{moves}</span> moves. Ready to interview Abhishek?
          </p>
          <div className="flex gap-2">
            <a href="#Contact" onClick={() => setShowSuccess(false)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform">
              Contact Me
            </a>
            <button onClick={initGame} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MemoryGame);
