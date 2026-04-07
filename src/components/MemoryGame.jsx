import React, { useEffect, useState } from "react";
import {
  SiReact,
  SiJavascript,
  SiSpringboot,
  SiMysql,
  SiMongodb,
  SiJava,
} from "react-icons/si";

const techCards = [
  { id: 1, icon: SiReact },
  { id: 2, icon: SiJavascript },
  { id: 3, icon: SiSpringboot },
  { id: 4, icon: SiMysql },
  { id: 5, icon: SiMongodb },
  { id: 6, icon: SiJava },
];

// duplicate + shuffle
const shuffleCards = () => {
  const duplicated = [...techCards, ...techCards];
  return duplicated
    .map((card) => ({ ...card, uuid: Math.random() }))
    .sort(() => Math.random() - 0.5);
};

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    setCards(shuffleCards());
  }, []);

  const handleClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;

      if (cards[first].id === cards[second].id) {
        setMatched((prev) => [...prev, cards[first].id]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const resetGame = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
  };

  return (
    <div className="w-full flex flex-col items-center">

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isFlipped =
            flipped.includes(index) || matched.includes(card.id);

          return (
            <div
              key={card.uuid}
              onClick={() => handleClick(index)}
              className="aspect-square perspective cursor-pointer"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 bg-[#0a0a1a] border border-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 text-xs">?</span>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-[#6366f1]/40 rounded-xl flex items-center justify-center rotate-y-180">
                  <Icon className="text-2xl text-indigo-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restart */}
      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
      >
        🔄 Restart
      </button>
    </div>
  );
};

export default MemoryGame;