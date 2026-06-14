import React, { useState, useEffect, useRef } from "react";
import { Gamepad2, Play, RotateCcw, Award } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 450;
const GRAVITY = 0.22;
const JUMP = -4.8;
const PIPE_SPEED = 2;
const PIPE_SPAWN_INTERVAL = 110; // frames
const PIPE_GAP = 110;
const PIPE_WIDTH = 55;

const FlappyBird = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("pg_flappy_highscore")) || 0;
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Use refs to avoid stale closure references inside canvas frame loops
  const stateRef = useRef({
    birdY: 200,
    velocity: 0,
    pipes: [],
    score: 0,
    gameOver: false,
    gameStarted: false,
    frameIndex: 0,
    bgScroll: 0
  });

  const requestRef = useRef(null);

  // Initialize values
  const initGame = () => {
    stateRef.current = {
      birdY: 200,
      velocity: 0,
      pipes: [],
      score: 0,
      gameOver: false,
      gameStarted: true,
      frameIndex: 0,
      bgScroll: 0
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    playTap();
  };

  // Jump logic
  const jump = () => {
    if (stateRef.current.gameOver) return;
    if (!stateRef.current.gameStarted) {
      initGame();
      return;
    }
    stateRef.current.velocity = JUMP;
    playTap();
  };

  // Click / Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const updateAndDraw = () => {
      const state = stateRef.current;
      const isLightMode = document.body.classList.contains("light");

      // 1. Physics update
      if (state.gameStarted && !state.gameOver) {
        state.velocity += GRAVITY;
        state.birdY += state.velocity;
        state.frameIndex++;
        state.bgScroll = (state.bgScroll + 0.5) % 100;

        // Ceil/Floor bounds collision checks
        if (state.birdY > CANVAS_HEIGHT - 12 || state.birdY < 12) {
          triggerGameOver();
        }

        // Move pipes
        state.pipes.forEach((pipe) => {
          pipe.x -= PIPE_SPEED;
        });

        // Spawn pipes
        if (state.frameIndex % PIPE_SPAWN_INTERVAL === 0) {
          const minHeight = 60;
          const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
          state.pipes.push({
            x: CANVAS_WIDTH,
            topHeight,
            passed: false
          });
        }

        // Remove offscreen pipes
        state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

        // Check pipe collision
        const birdR = 10;
        const birdX = 80;
        
        for (let pipe of state.pipes) {
          // Top pipe rect bounds
          const inX = birdX + birdR > pipe.x && birdX - birdR < pipe.x + PIPE_WIDTH;
          const inTopY = state.birdY - birdR < pipe.topHeight;
          const inBottomY = state.birdY + birdR > pipe.topHeight + PIPE_GAP;

          if (inX && (inTopY || inBottomY)) {
            triggerGameOver();
            break;
          }

          // Check pass score increments
          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
            pipe.passed = true;
            state.score++;
            setScore(state.score);
            playSuccess();

            // Check high score
            const storedHighScore = Number(localStorage.getItem("pg_flappy_highscore")) || 0;
            if (state.score > storedHighScore) {
              localStorage.setItem("pg_flappy_highscore", String(state.score));
              setHighScore(state.score);
            }

            // Unlock achievements
            if (state.score >= 15) {
              unlockAchievement("quiz-master");
            }
          }
        }
      }

      // 2. Rendering operations
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Render Background Grid Lines (parallax feel)
      ctx.strokeStyle = isLightMode ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.08)";
      ctx.lineWidth = 1;
      const scrollOffset = state.bgScroll;
      for (let i = -100; i < CANVAS_WIDTH + 100; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i - scrollOffset, 0);
        ctx.lineTo(i - scrollOffset, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Draw obstacles (Pipes)
      state.pipes.forEach((pipe) => {
        // Gradient fill for glowing look
        const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        const botGrad = ctx.createLinearGradient(pipe.x, pipe.topHeight + PIPE_GAP, pipe.x + PIPE_WIDTH, CANVAS_HEIGHT);
        
        if (isLightMode) {
          topGrad.addColorStop(0, "rgba(99,102,241,0.2)");
          topGrad.addColorStop(1, "rgba(168,85,247,0.35)");
          botGrad.addColorStop(0, "rgba(99,102,241,0.2)");
          botGrad.addColorStop(1, "rgba(168,85,247,0.35)");
          ctx.strokeStyle = "rgba(99,102,241,0.5)";
        } else {
          topGrad.addColorStop(0, "rgba(34,197,94,0.18)");
          topGrad.addColorStop(1, "rgba(34,211,238,0.35)");
          botGrad.addColorStop(0, "rgba(34,197,94,0.18)");
          botGrad.addColorStop(1, "rgba(34,211,238,0.35)");
          ctx.strokeStyle = "rgba(34,211,238,0.5)";
        }

        ctx.lineWidth = 2;

        // Top Pipe
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        // Bottom Pipe
        ctx.fillStyle = botGrad;
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
        ctx.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
      });

      // Draw Bird (Neon Logo Node)
      const birdX = 80;
      const birdY = state.birdY;

      // Draw glow ring
      ctx.beginPath();
      ctx.arc(birdX, birdY, 14, 0, Math.PI * 2);
      ctx.fillStyle = isLightMode ? "rgba(99, 102, 241, 0.15)" : "rgba(34, 211, 238, 0.2)";
      ctx.fill();

      // Draw inner node
      ctx.beginPath();
      ctx.arc(birdX, birdY, 8, 0, Math.PI * 2);
      ctx.fillStyle = isLightMode ? "#4f46e5" : "#22d3ee";
      ctx.fill();

      // Draw bracket symbol text >
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(">", birdX, birdY);

      requestRef.current = requestAnimationFrame(updateAndDraw);
    };

    const triggerGameOver = () => {
      const state = stateRef.current;
      state.gameOver = true;
      setGameOver(true);
      playFail();
      trackGamePlayed("flappy-game");
    };

    requestRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            Flappy Compiler
          </h4>
          <p className="text-xs text-gray-500 mt-1">Jump to pass code obstacles!</p>
        </div>
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
            BEST COMPILATION
          </p>
          <p className="text-base font-bold text-[#eab308] mt-0.5">{highScore}</p>
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div 
        onClick={jump}
        className="relative w-full aspect-[4/4.5] rounded-2xl border border-white/10 bg-black/40 overflow-hidden cursor-pointer select-none"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full block"
        />

        {/* Start Game overlay screen */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <Gamepad2 className="w-12 h-12 text-[#6366f1] mb-4 animate-bounce" />
            <h5 className="text-sm font-bold text-white mb-1">Click or Tap to Flap</h5>
            <p className="text-[11px] text-gray-400 max-w-xs mb-6 leading-relaxed">
              Steer the node (represented as a compiler index bracket) through the glowing program tunnels. Click anywhere in the box or press Space/W/Up to flap!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Stop parent click jump trigger
                initGame();
              }}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Compiler</span>
            </button>
          </div>
        )}

        {/* Game Over overlay screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <Gamepad2 className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
            <h5 className="text-sm font-bold text-red-500 mb-1">Thread Dumped (Crashed)</h5>
            <p className="text-[11px] text-gray-400 max-w-xs mb-6">
              Critical stacktrace! You compiled <span className="font-bold text-white font-mono">{score}</span> segments successfully.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Stop parent click jump trigger
                initGame();
              }}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Thread</span>
            </button>
          </div>
        )}
      </div>

      <span className="text-[10px] text-gray-600 font-mono text-center block">
        Tip: Press W, Up Arrow, Space, or Click inside to flap.
      </span>
    </div>
  );
};

export default FlappyBird;
