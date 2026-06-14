import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bug, Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const GRID_SIZE = 15;
const INITIAL_SPEED = 150; // ms per tick

const BUG_TYPES = [
  { name: "NullPointerException", color: "#f87171" },
  { name: "SyntaxError", color: "#fbbf24" },
  { name: "StackOverflow", color: "#60a5fa" },
  { name: "OutOfMemory", color: "#f472b6" },
  { name: "ConcurrentModification", color: "#c084fc" },
];

const SnakeGame = () => {
  const [snake, setSnake] = useState([[7, 7]]);
  const [bug, setBug] = useState([3, 3]);
  const [bugType, setBugType] = useState(BUG_TYPES[0]);
  const [direction, setDirection] = useState([0, -1]); // moving UP initially
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("pg_snake_highscore")) || 0;
  });
  const [gameStarted, setGameStarted] = useState(false);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateBug = useCallback((currentSnake) => {
    let newBug;
    while (true) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const onSnake = currentSnake.some((cell) => cell[0] === x && cell[1] === y);
      if (!onSnake) {
        newBug = [x, y];
        break;
      }
    }
    setBug(newBug);
    setBugType(BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)]);
  }, []);

  const resetGame = useCallback(() => {
    playTap();
    setSnake([[7, 7]]);
    setDirection([0, -1]);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    generateBug([[7, 7]]);
  }, [generateBug]);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const dir = directionRef.current;
      const newHead = [head[0] + dir[0], head[1] + dir[1]];

      // Check boundary collisions
      if (
        newHead[0] < 0 ||
        newHead[0] >= GRID_SIZE ||
        newHead[1] < 0 ||
        newHead[1] >= GRID_SIZE
      ) {
        playFail();
        setGameOver(true);
        setGameStarted(false);
        trackGamePlayed("snake-game");
        return prevSnake;
      }

      // Check self collisions
      const selfCollision = prevSnake.some((cell) => cell[0] === newHead[0] && cell[1] === newHead[1]);
      if (selfCollision) {
        playFail();
        setGameOver(true);
        setGameStarted(false);
        trackGamePlayed("snake-game");
        return prevSnake;
      }

      const nextSnake = [newHead, ...prevSnake];

      // Check bug collision
      if (newHead[0] === bug[0] && newHead[1] === bug[1]) {
        playSuccess();
        const newScore = score + 10;
        setScore(newScore);

        if (newScore > highScore) {
          localStorage.setItem("pg_snake_highscore", newScore);
          setHighScore(newScore);
        }

        // Achievements triggers
        if (newScore >= 100) {
          unlockAchievement("quiz-master");
        }

        generateBug(nextSnake);
      } else {
        nextSnake.pop();
      }

      return nextSnake;
    });
  }, [bug, gameOver, gameStarted, generateBug, score, highScore]);

  // Handle keystroke movements
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return;
      
      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (dir[1] !== 1) setDirection([0, -1]);
          break;
        case "ArrowDown":
          if (dir[1] !== -1) setDirection([0, 1]);
          break;
        case "ArrowLeft":
          if (dir[0] !== 1) setDirection([-1, 0]);
          break;
        case "ArrowRight":
          if (dir[0] !== -1) setDirection([1, 0]);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted]);

  // Game Loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    // Speed up slightly as snake gets longer
    const currentSpeed = Math.max(INITIAL_SPEED - score, 60);

    const interval = setInterval(moveSnake, currentSpeed);
    return () => clearInterval(interval);
  }, [moveSnake, gameStarted, gameOver, score]);

  const changeDirection = (newDir) => {
    if (!gameStarted) return;
    const dir = directionRef.current;
    if (newDir[0] === -dir[0] && newDir[1] === -dir[1]) return; // prevent reverse
    playTap();
    setDirection(newDir);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-400" />
            Bug Resolver (Snake)
          </h4>
          <p className="text-xs text-gray-500 mt-1">Resolve bugs to increase code strength!</p>
        </div>
      </div>

      {/* Score and Highscore */}
      <div className="flex justify-between items-center bg-white/3 rounded-xl p-3 border border-white/5 font-mono text-xs text-center">
        <div className="flex-1 border-r border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Score</p>
          <p className="text-base font-bold text-white mt-0.5">{score}</p>
        </div>
        <div className="flex-1 border-r border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Target Bug</p>
          <p className="text-[10px] font-bold mt-0.5 truncate px-1" style={{ color: bugType.color }}>
            {bugType.name}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">High Score</p>
          <p className="text-base font-bold text-[#eab308] mt-0.5">{highScore}</p>
        </div>
      </div>

      {/* Snake Canvas Grid */}
      <div className="relative aspect-square w-full rounded-xl border border-white/10 bg-black/40 overflow-hidden select-none">
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-10">
            <Bug className="w-12 h-12 text-[#6366f1] mb-4 animate-bounce" />
            <h5 className="text-lg font-bold text-white mb-1">Debug the Terminal</h5>
            <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
              Use keyboard arrows or the controller below to steer the compiler to resolve errors!
            </p>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Compile & Start</span>
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10">
            <Bug className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
            <h5 className="text-lg font-bold text-red-500 mb-1">Compilation Failed</h5>
            <p className="text-xs text-gray-400 max-w-xs mb-6">
              Critical error! Your code compiled with score <span className="font-bold text-white font-mono">{score}</span>.
            </p>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recompile Code</span>
            </button>
          </div>
        )}

        {/* Board squares */}
        <div 
          className="grid h-full w-full"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const isSnake = snake.some((cell) => cell[0] === x && cell[1] === y);
            const isSnakeHead = snake[0][0] === x && snake[0][1] === y;
            const isBug = bug[0] === x && bug[1] === y;

            return (
              <div
                key={idx}
                className="w-full h-full flex items-center justify-center border border-white/[0.02] aspect-square"
              >
                {isSnakeHead ? (
                  <div className="w-4/5 h-4/5 rounded bg-gradient-to-br from-[#6366f1] to-[#a855f7] border border-white/30" />
                ) : isSnake ? (
                  <div className="w-3/4 h-3/4 rounded bg-[#6366f1]/60" />
                ) : isBug ? (
                  <div 
                    className="w-3/5 h-3/5 rounded-full animate-ping shrink-0"
                    style={{ backgroundColor: bugType.color }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* D-Pad Virtual Controller for Mobile compatibility */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <button
          onClick={() => changeDirection([0, -1])}
          className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-10">
          <button
            onClick={() => changeDirection([-1, 0])}
            className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeDirection([1, 0])}
            className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => changeDirection([0, 1])}
          className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SnakeGame;
