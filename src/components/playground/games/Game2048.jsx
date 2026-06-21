import React, { useState, useEffect, useCallback } from "react";
import { Gamepad2, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Award } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const Game2048 = () => {
  const [board, setBoard] = useState(Array(4).fill(null).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("pg_2048_highscore")) || 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Spawns a random tile (2 or 4) on an empty spot
  const spawnTile = useCallback((grid) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() > 0.9 ? 4 : 2;
    }
  }, []);

  // Initialize a new game
  const initGame = useCallback(() => {
    const freshBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    spawnTile(freshBoard);
    spawnTile(freshBoard);
    setBoard(freshBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, [spawnTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Transpose matrix
  const transpose = (grid) => {
    return grid[0].map((_, colIdx) => grid.map((row) => row[colIdx]));
  };

  // Reverse rows
  const reverseRows = (grid) => {
    return grid.map((row) => [...row].reverse());
  };

  // Core slide left logic
  const slideLeft = (grid) => {
    let scoreGain = 0;
    const newGrid = grid.map((row) => {
      let filtered = row.filter((val) => val !== 0);
      let mergedRow = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedVal = filtered[i] * 2;
          mergedRow.push(mergedVal);
          scoreGain += mergedVal;
          i++;
        } else {
          mergedRow.push(filtered[i]);
        }
      }
      while (mergedRow.length < 4) {
        mergedRow.push(0);
      }
      return mergedRow;
    });
    return { newGrid, scoreGain };
  };

  // Check if any moves are possible
  const checkGameOver = (grid) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) return false;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      }
    }
    return true;
  };

  // Core movement triggers
  const move = useCallback((direction) => {
    if (gameOver) return;

    let gridCopy = board.map((row) => [...row]);
    let resultGrid;
    let scoreGain = 0;

    if (direction === "left") {
      const res = slideLeft(gridCopy);
      resultGrid = res.newGrid;
      scoreGain = res.scoreGain;
    } else if (direction === "right") {
      gridCopy = reverseRows(gridCopy);
      const res = slideLeft(gridCopy);
      resultGrid = reverseRows(res.newGrid);
      scoreGain = res.scoreGain;
    } else if (direction === "up") {
      gridCopy = transpose(gridCopy);
      const res = slideLeft(gridCopy);
      resultGrid = transpose(res.newGrid);
      scoreGain = res.scoreGain;
    } else if (direction === "down") {
      gridCopy = transpose(gridCopy);
      gridCopy = reverseRows(gridCopy);
      const res = slideLeft(gridCopy);
      let temp = reverseRows(res.newGrid);
      resultGrid = transpose(temp);
      scoreGain = res.scoreGain;
    }

    if (JSON.stringify(board) !== JSON.stringify(resultGrid)) {
      playTap();
      spawnTile(resultGrid);
      setBoard(resultGrid);

      const nextScore = score + scoreGain;
      setScore(nextScore);

      if (nextScore > highScore) {
        localStorage.setItem("pg_2048_highscore", String(nextScore));
        setHighScore(nextScore);
      }

      // Check if player won (reached 2048)
      let has2048 = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (resultGrid[r][c] === 2048) {
            has2048 = true;
          }
        }
      }

      if (has2048 && !won) {
        setWon(true);
        playSuccess();
        unlockAchievement("quiz-master"); // Unlock achievement for finishing game tasks
      }

      // Check game over
      if (checkGameOver(resultGrid)) {
        setGameOver(true);
        playFail();
        trackGamePlayed("2048-game");
      }
    }
  }, [board, gameOver, score, highScore, won, spawnTile]);

  // Keypress event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        move("up");
      } else if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        move("down");
      } else if (["ArrowLeft", "KeyA"].includes(e.code)) {
        e.preventDefault();
        move("left");
      } else if (["ArrowRight", "KeyD"].includes(e.code)) {
        e.preventDefault();
        move("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  // Styling helper for tile numbers
  const getTileStyle = (val) => {
    if (val === 0) return "bg-white/3 border border-white/5";
    if (val === 2) return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]";
    if (val === 4) return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]";
    if (val === 8) return "bg-teal-500/15 text-teal-400 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.15)]";
    if (val === 16) return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-bold";
    if (val === 32) return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/40 font-bold";
    if (val === 64) return "bg-orange-500/20 text-orange-400 border border-orange-500/50 font-bold";
    if (val === 128) return "bg-red-500/20 text-red-400 border border-red-500/50 font-bold shadow-[0_0_15px_rgba(239,68,68,0.25)]";
    if (val === 256) return "bg-pink-500/20 text-pink-400 border border-pink-500/50 font-bold shadow-[0_0_15px_rgba(236,72,153,0.25)]";
    if (val === 512) return "bg-purple-500/25 text-purple-400 border border-purple-500/50 font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)]";
    if (val === 1024) return "bg-fuchsia-500/25 text-fuchsia-400 border border-fuchsia-500/50 font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)]";
    if (val === 2048) return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-yellow-400/50 scale-[1.03]";
    return "bg-gradient-to-r from-rose-500 to-red-500 text-white font-extrabold shadow-[0_0_35px_rgba(244,63,94,0.6)] border border-red-400/50 scale-[1.03]";
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            2048 Classic
          </h4>
          <p className="text-xs text-gray-500 mt-1">Combine tiles to reach 2048!</p>
        </div>
        <button
          onClick={initGame}
          aria-label="Restart Game"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Score and High Score */}
      <div className="grid grid-cols-2 gap-3 bg-white/3 rounded-xl p-3 border border-white/5 font-mono text-center text-xs">
        <div className="border-r border-white/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">SCORE</p>
          <p className="text-base font-bold text-white mt-0.5">{score}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            BEST SCORE
          </p>
          <p className="text-base font-bold text-[#eab308] mt-0.5">{highScore}</p>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative aspect-square w-full rounded-2xl border border-white/10 bg-black/40 p-3 select-none overflow-hidden">
        {/* Game Grid */}
        <div className="grid grid-cols-4 grid-rows-4 gap-3 h-full w-full">
          {board.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`rounded-xl flex items-center justify-center text-lg sm:text-xl font-mono font-bold transition-all duration-200 select-none ${getTileStyle(val)}`}
              >
                {val > 0 ? val : ""}
              </div>
            ))
          )}
        </div>

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <Gamepad2 className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
            <h5 className="text-xl font-bold text-red-500 mb-2">Game Over</h5>
            <p className="text-sm text-gray-400 max-w-xs mb-6">
              No moves left! Your final score is <span className="text-white font-bold font-mono">{score}</span>.
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Win Screen */}
        {won && !gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <Award className="w-16 h-16 text-yellow-500 fill-yellow-500/20 mb-4 animate-bounce" />
            <h5 className="text-xl font-bold text-white mb-2">2048 Reached!</h5>
            <p className="text-sm text-gray-400 max-w-xs mb-6">
              Amazing job! You successfully compiled the 2048 block. Keep playing to reach higher blocks!
            </p>
            <button
              onClick={() => setWon(false)}
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              Keep Playing
            </button>
          </div>
        )}
      </div>

      {/* Virtual D-pad for mobile swipe/direction inputs */}
      <div className="flex flex-col items-center gap-1 mt-1 sm:hidden">
        <button
          onClick={() => move("up")}
          className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-10">
          <button
            onClick={() => move("left")}
            className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => move("right")}
            className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => move("down")}
          className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 hover:border-[#6366f1]/40 flex items-center justify-center text-gray-300 active:scale-90 transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Game2048;
