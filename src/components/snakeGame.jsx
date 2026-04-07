import React, { useEffect, useState, useRef } from "react";

const GRID_SIZE = 20;

const SnakeGame = () => {
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([5, 5]);
  const [dir, setDir] = useState([0, 1]);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef();

  // 🔁 Reset Game
  const resetGame = () => {
    setSnake([[10, 10]]);
    setFood([
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
    ]);
    setDir([0, 1]);
    setGameOver(false);
  };

  // Controls
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;

      if (e.key === "ArrowUp") setDir([-1, 0]);
      if (e.key === "ArrowDown") setDir([1, 0]);
      if (e.key === "ArrowLeft") setDir([0, -1]);
      if (e.key === "ArrowRight") setDir([0, 1]);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    intervalRef.current = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = [head[0] + dir[0], head[1] + dir[1]];

        // Collision
        if (
          newHead[0] < 0 ||
          newHead[1] < 0 ||
          newHead[0] >= GRID_SIZE ||
          newHead[1] >= GRID_SIZE ||
          prev.some((s) => s[0] === newHead[0] && s[1] === newHead[1])
        ) {
          setGameOver(true);
          clearInterval(intervalRef.current);
          return prev;
        }

        let newSnake = [newHead, ...prev];

        // Eat food
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setFood([
            Math.floor(Math.random() * GRID_SIZE),
            Math.floor(Math.random() * GRID_SIZE),
          ]);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120);

    return () => clearInterval(intervalRef.current);
  }, [dir, food, gameOver]);

  return (
    <div className="w-full flex flex-col items-center">

      {/* Game Grid */}
      <div
        className="grid bg-[#0a0a1a] border border-[#6366f1]/30 rounded-xl"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: "min(90vw, 380px)",
          aspectRatio: "1",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = Math.floor(i / GRID_SIZE);
          const y = i % GRID_SIZE;

          const isSnake = snake.some(
            (s) => s[0] === x && s[1] === y
          );
          const isFood = food[0] === x && food[1] === y;

          return (
            <div
              key={i}
              className={`border border-[#1a1a2e] ${
                isSnake
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_#6366f1]"
                  : isFood
                  ? "bg-pink-500 shadow-[0_0_8px_#ec4899]"
                  : ""
              }`}
            />
          );
        })}
      </div>

      {/* Game Over + Restart */}
      {gameOver && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-red-400 text-sm">Game Over</p>

          <button
            onClick={resetGame}
            className="px-4 py-2 text-xs font-semibold rounded-lg
              bg-gradient-to-r from-[#6366f1] to-[#a855f7]
              text-white shadow-md hover:scale-105 transition-all"
          >
            🔄 Restart Game
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;