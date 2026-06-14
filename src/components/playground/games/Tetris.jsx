import React, { useState, useEffect, useRef, useCallback } from "react";
import { Gamepad2, Play, RotateCcw, ArrowLeft, ArrowRight, ArrowDown, RefreshCw } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const COLS = 10;
const ROWS = 20;

const TETROMINOES = {
  I: { matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "rgba(34, 211, 238, 0.75)", border: "#22d3ee" },
  J: { matrix: [[1,0,0],[1,1,1],[0,0,0]], color: "rgba(59, 130, 246, 0.75)", border: "#3b82f6" },
  L: { matrix: [[0,0,1],[1,1,1],[0,0,0]], color: "rgba(249, 115, 22, 0.75)", border: "#f97316" },
  O: { matrix: [[1,1],[1,1]], color: "rgba(234, 179, 8, 0.75)", border: "#eab308" },
  S: { matrix: [[0,1,1],[1,1,0],[0,0,0]], color: "rgba(34, 197, 94, 0.75)", border: "#22c55e" },
  T: { matrix: [[0,1,0],[1,1,1],[0,0,0]], color: "rgba(168, 85, 247, 0.75)", border: "#a855f7" },
  Z: { matrix: [[1,1,0],[0,1,1],[0,0,0]], color: "rgba(239, 68, 68, 0.75)", border: "#ef4444" }
};

const Tetris = () => {
  const [grid, setGrid] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("pg_tetris_highscore")) || 0;
  });

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;

  // Generate a random tetromino piece
  const randomPiece = useCallback(() => {
    const keys = Object.keys(TETROMINOES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    const tetro = TETROMINOES[type];
    return {
      matrix: tetro.matrix.map((row) => [...row]),
      color: tetro.color,
      border: tetro.border,
      x: Math.floor((COLS - tetro.matrix[0].length) / 2),
      y: -1
    };
  }, []);

  // Initialize values
  const initGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    const first = randomPiece();
    const second = randomPiece();
    setCurrentPiece(first);
    setNextPiece(second);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
    playTap();
  };

  // Check collision helper
  const checkCollision = (piece, board, offsetX = 0, offsetY = 0) => {
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c] !== 0) {
          const nextX = piece.x + c + offsetX;
          const nextY = piece.y + r + offsetY;

          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
            return true;
          }
          if (nextY >= 0 && board[nextY][nextX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Lock piece to grid
  const lockPiece = (piece, board) => {
    const nextBoard = board.map((row) => [...row]);
    let hasLockError = false;

    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c] !== 0) {
          const targetY = piece.y + r;
          const targetX = piece.x + c;

          if (targetY < 0) {
            hasLockError = true;
          } else {
            nextBoard[targetY][targetX] = { color: piece.color, border: piece.border };
          }
        }
      }
    }

    if (hasLockError) {
      setGameOver(true);
      setIsPlaying(false);
      playFail();
      trackGamePlayed("tetris-game");
      return;
    }

    // Line clearing checks
    let clearedLines = 0;
    const filteredBoard = nextBoard.filter((row) => {
      const isFull = row.every((val) => val !== 0);
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(0));
    }

    if (clearedLines > 0) {
      playSuccess();
      const lineScores = [0, 100, 300, 500, 800];
      const points = lineScores[clearedLines] * level;
      const totalLines = lines + clearedLines;

      setScore((s) => {
        const nextScore = s + points;
        if (nextScore > highScore) {
          localStorage.setItem("pg_tetris_highscore", String(nextScore));
          setHighScore(nextScore);
        }
        return nextScore;
      });
      setLines(totalLines);
      setLevel(Math.floor(totalLines / 10) + 1);

      // Achievements unlock
      if (totalLines >= 10) {
        unlockAchievement("quiz-master");
      }
    }

    setGrid(filteredBoard);
    
    // Spawn next piece
    const nextCurrent = { ...nextPiece };
    if (checkCollision(nextCurrent, filteredBoard)) {
      setGameOver(true);
      setIsPlaying(false);
      playFail();
      trackGamePlayed("tetris-game");
    } else {
      setCurrentPiece(nextCurrent);
      setNextPiece(randomPiece());
    }
  };

  // Move active piece left or right
  const moveHorizontal = (dir) => {
    if (!isPlaying || gameOver || !currentPiece) return;
    const nextPiece = { ...currentPiece, x: currentPiece.x + dir };
    if (!checkCollision(nextPiece, grid)) {
      setCurrentPiece(nextPiece);
      playTap();
    }
  };

  // Move active piece down (soft drop)
  const drop = useCallback(() => {
    if (!isPlayingRef.current || gameOverRef.current || !currentPiece) return;

    const nextPiece = { ...currentPiece, y: currentPiece.y + 1 };
    if (!checkCollision(nextPiece, grid)) {
      setCurrentPiece(nextPiece);
    } else {
      lockPiece(currentPiece, grid);
    }
  }, [currentPiece, grid, lines, level]);

  // Hard drop immediately to bottom
  const hardDrop = () => {
    if (!isPlaying || gameOver || !currentPiece) return;
    
    let dropY = 0;
    while (!checkCollision(currentPiece, grid, 0, dropY + 1)) {
      dropY++;
    }
    
    const finalPiece = { ...currentPiece, y: currentPiece.y + dropY };
    lockPiece(finalPiece, grid);
    playTap();
  };

  // Rotate piece matrix clockwise
  const rotatePiece = () => {
    if (!isPlaying || gameOver || !currentPiece) return;

    const matrix = currentPiece.matrix;
    const N = matrix.length;
    // Transpose and reverse rows
    const rotatedMatrix = Array(N).fill(null).map(() => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        rotatedMatrix[c][N - 1 - r] = matrix[r][c];
      }
    }

    const rotatedPiece = { ...currentPiece, matrix: rotatedMatrix };

    // Kick mechanics: if rotated piece collides, try shifting it left or right to fit
    const kicks = [0, -1, 1, -2, 2];
    for (let kick of kicks) {
      if (!checkCollision(rotatedPiece, grid, kick, 0)) {
        rotatedPiece.x += kick;
        setCurrentPiece(rotatedPiece);
        playTap();
        return;
      }
    }
  };

  // Ghost landing preview calculation
  const getGhostY = () => {
    if (!currentPiece) return 0;
    let dropY = 0;
    while (!checkCollision(currentPiece, grid, 0, dropY + 1)) {
      dropY++;
    }
    return currentPiece.y + dropY;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlayingRef.current || gameOverRef.current) return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        moveHorizontal(1);
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        drop();
      } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        rotatePiece();
      } else if (e.code === "Space") {
        e.preventDefault();
        hardDrop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPiece, grid, isPlaying]);

  // Drop Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const speed = Math.max(1000 - (level - 1) * 90, 100);
    const timer = setInterval(() => {
      drop();
    }, speed);
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, level, drop]);

  // Render combined matrix helper
  const renderDisplayGrid = () => {
    const display = grid.map((row) => row.map((cell) => (cell ? { ...cell } : 0)));
    
    // 1. Project Ghost piece (translucent outline preview)
    if (currentPiece && isPlaying) {
      const ghostY = getGhostY();
      for (let r = 0; r < currentPiece.matrix.length; r++) {
        for (let c = 0; c < currentPiece.matrix[r].length; c++) {
          if (currentPiece.matrix[r][c] !== 0) {
            const gy = ghostY + r;
            const gx = currentPiece.x + c;
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
              if (display[gy][gx] === 0) {
                display[gy][gx] = { isGhost: true, border: currentPiece.border };
              }
            }
          }
        }
      }
    }

    // 2. Draw current piece
    if (currentPiece && isPlaying) {
      for (let r = 0; r < currentPiece.matrix.length; r++) {
        for (let c = 0; c < currentPiece.matrix[r].length; c++) {
          if (currentPiece.matrix[r][c] !== 0) {
            const py = currentPiece.y + r;
            const px = currentPiece.x + c;
            if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
              display[py][px] = { color: currentPiece.color, border: currentPiece.border };
            }
          }
        }
      }
    }

    return display;
  };

  const displayGrid = renderDisplayGrid();

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-5 flex flex-col md:flex-row gap-5">
      {/* LEFT AREA: Gameboard Grid */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/8">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              Tetris Blocks
            </h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Stack block lines to clear loops!</p>
          </div>
        </div>

        {/* Board Display */}
        <div className="relative aspect-[1/2] w-full rounded-xl border border-white/10 bg-black/40 p-1 select-none overflow-hidden max-h-[440px]">
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
              <Gamepad2 className="w-12 h-12 text-[#6366f1] mb-4 animate-bounce" />
              <h5 className="text-sm font-bold text-white mb-1">Interactive Tetris</h5>
              <p className="text-[11px] text-gray-400 max-w-xs mb-6 leading-relaxed">
                Use Arrow Keys (Left/Right to slide, Up to rotate, Down to drop, Space to drop fully).
              </p>
              <button
                onClick={initGame}
                className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Session</span>
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
              <Gamepad2 className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
              <h5 className="text-sm font-bold text-red-500 mb-1">Grid Overflown</h5>
              <p className="text-[11px] text-gray-400 max-w-xs mb-6">
                Compiler out of bounds! Final score achieved: <span className="font-bold text-white font-mono">{score}</span>.
              </p>
              <button
                onClick={initGame}
                className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recompile & Run</span>
              </button>
            </div>
          )}

          {/* Board squares */}
          <div className="grid grid-cols-10 grid-rows-20 h-full w-full gap-[1px]">
            {displayGrid.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-[3px] transition-all duration-75"
                  style={{
                    backgroundColor: cell?.isGhost ? "transparent" : cell?.color || "rgba(255, 255, 255, 0.015)",
                    border: cell?.border 
                      ? `1.5px ${cell.isGhost ? "dashed" : "solid"} ${cell.isGhost ? `${cell.border}40` : cell.border}` 
                      : "1px solid rgba(255, 255, 255, 0.02)"
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Scoreboards & Controls */}
      <div className="w-full md:w-44 flex flex-col gap-4 justify-between">
        {/* Next Piece Panel */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-3 flex flex-col gap-2 items-center text-center">
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">NEXT PIECE</span>
          <div className="w-16 h-16 border border-white/5 bg-black/20 rounded-lg flex items-center justify-center relative">
            {nextPiece ? (
              <div 
                className="grid gap-[1px]"
                style={{ gridTemplateColumns: `repeat(${nextPiece.matrix[0].length}, 1fr)` }}
              >
                {nextPiece.matrix.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`next-${rIdx}-${cIdx}`}
                      className="w-3 h-3 rounded-[2px]"
                      style={{
                        backgroundColor: val !== 0 ? nextPiece.color : "transparent",
                        border: val !== 0 ? `1px solid ${nextPiece.border}` : "none"
                      }}
                    />
                  ))
                )}
              </div>
            ) : (
              <span className="text-gray-600 font-mono text-[9px]">-</span>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="flex flex-col gap-2 font-mono text-[10px] text-left bg-white/3 border border-white/8 rounded-xl p-4">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-500">SCORE:</span>
            <span className="font-bold text-white">{score}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-500">LEVEL:</span>
            <span className="font-bold text-cyan-400">{level}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-500">LINES:</span>
            <span className="font-bold text-indigo-400">{lines}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-gray-500">BEST:</span>
            <span className="font-bold text-yellow-500">{highScore}</span>
          </div>
        </div>

        {/* Mobile Virtual Controller */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2">
          <button
            onClick={() => moveHorizontal(-1)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 active:bg-white/15 flex items-center justify-center text-gray-400 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={rotatePiece}
            className="p-3 rounded-xl bg-white/5 border border-white/10 active:bg-white/15 flex items-center justify-center text-gray-400 cursor-pointer active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => moveHorizontal(1)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 active:bg-white/15 flex items-center justify-center text-gray-400 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="col-span-3 flex gap-2">
            <button
              onClick={drop}
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 active:bg-white/15 flex items-center justify-center text-gray-400 cursor-pointer active:scale-95 text-[10px] font-bold gap-1 transition-transform"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>SOFT</span>
            </button>
            <button
              onClick={hardDrop}
              className="flex-1 py-2 rounded-xl bg-white/10 border border-[#6366f1]/30 active:bg-[#6366f1]/20 flex items-center justify-center text-indigo-300 cursor-pointer active:scale-95 text-[10px] font-bold gap-1 transition-transform"
            >
              <span>HARD DROP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
