import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCcw, Trophy, Zap, Shield, Sparkles } from "lucide-react";

const SyntaxInvaders = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Game UI States
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem("invaders_highScore")) || 0;
    } catch {
      return 0;
    }
  });
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // References for game loop state (avoids React state render lag in 60fps canvas)
  const gameStateRef = useRef({
    player: { x: 150, y: 260, width: 30, height: 16 },
    bullets: [],
    enemies: [],
    particles: [],
    stars: [],
    keys: { ArrowLeft: false, ArrowRight: false, Space: false },
    score: 0,
    level: 1,
    lives: 3,
    enemyDirection: 1,
    enemySpeed: 1,
    lastShotTime: 0,
    isMuted: false
  });

  // Synthesize sound effects using Web Audio API
  const playSound = useCallback((type) => {
    if (gameStateRef.current.isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "shoot") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === "explosion") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "gameover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else if (type === "levelup") {
        // Double-beep arpeggio
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      // Autoplay blocker bypass
    }
  }, []);

  // Initialize Matrix-style falling code background
  const initBackground = (width, height) => {
    const stars = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.5,
        char: Math.random() > 0.5 ? "1" : "0",
        opacity: 0.05 + Math.random() * 0.12
      });
    }
    return stars;
  };

  // Generate a grid of developer-themed bugs
  const spawnEnemies = (lvl) => {
    const enemies = [];
    const rows = 3;
    const cols = 5;
    const startX = 40;
    const startY = 40;
    const spacingX = 42;
    const spacingY = 32;
    const bugEmojis = ["👾", "🐛", "🐞"];

    for (let r = 0; r < rows; r++) {
      const emoji = bugEmojis[r % bugEmojis.length];
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: 18,
          height: 18,
          emoji: emoji,
          scoreVal: (3 - r) * 10,
          alive: true
        });
      }
    }
    gameStateRef.current.enemyDirection = 1;
    gameStateRef.current.enemySpeed = 0.6 + lvl * 0.25;
    return enemies;
  };

  // Trigger mini particle explosions
  const createExplosion = (x, y, color) => {
    const particles = gameStateRef.current.particles;
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
        alpha: 1,
        color: color,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  };

  // Start / Restart trigger
  const startGame = () => {
    const state = gameStateRef.current;
    state.score = 0;
    state.level = 1;
    state.lives = 3;
    state.bullets = [];
    state.particles = [];
    state.enemies = spawnEnemies(1);
    
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    setVictory(false);
    setGameStarted(true);
    playSound("levelup");
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = gameStateRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        state.keys.ArrowLeft = true;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        state.keys.ArrowRight = true;
      }
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        state.keys.Space = true;
      }
    };

    const handleKeyUp = (e) => {
      const state = gameStateRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.ArrowLeft = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.ArrowRight = false;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") state.keys.Space = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Shoot bullet helper
  const shootBullet = useCallback(() => {
    const state = gameStateRef.current;
    const now = Date.now();
    // Throttle shoots (250ms delay)
    if (now - state.lastShotTime > 250) {
      state.bullets.push({
        x: state.player.x,
        y: state.player.y - 8,
        width: 2,
        height: 6,
        speed: 5
      });
      state.lastShotTime = now;
      playSound("shoot");
    }
  }, [playSound]);

  // Main Canvas game engine loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const width = canvas.width;
    const height = canvas.height;

    // Build background entities once
    if (gameStateRef.current.stars.length === 0) {
      gameStateRef.current.stars = initBackground(width, height);
    }

    const updateGame = () => {
      const state = gameStateRef.current;

      if (!gameStarted || gameOver || victory) return;

      // 1. Move Player
      if (state.keys.ArrowLeft) {
        state.player.x = Math.max(15, state.player.x - 3.5);
      }
      if (state.keys.ArrowRight) {
        state.player.x = Math.min(width - 15, state.player.x + 3.5);
      }
      if (state.keys.Space) {
        shootBullet();
      }

      // 2. Move Bullets
      state.bullets.forEach((bullet, bIdx) => {
        bullet.y -= bullet.speed;
        // Clean out screen boundaries
        if (bullet.y < 0) {
          state.bullets.splice(bIdx, 1);
        }
      });

      // 3. Move Matrix falling background characters
      state.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      });

      // 4. Move Enemies (horizontal waves that step down)
      let touchBorder = false;
      const aliveEnemies = state.enemies.filter(e => e.alive);

      if (aliveEnemies.length === 0) {
        // Level cleared!
        if (state.level >= 3) {
          setVictory(true);
          playSound("levelup");
        } else {
          state.level += 1;
          setLevel(state.level);
          state.enemies = spawnEnemies(state.level);
          playSound("levelup");
        }
        return;
      }

      aliveEnemies.forEach((enemy) => {
        enemy.x += state.enemyDirection * state.enemySpeed;
        if (enemy.x > width - 20 || enemy.x < 10) {
          touchBorder = true;
        }

        // Check if bugs reached player height (Game Over condition)
        if (enemy.y + 8 >= state.player.y) {
          state.lives = 0;
          setLives(0);
          setGameOver(true);
          playSound("gameover");
        }
      });

      if (touchBorder) {
        state.enemyDirection *= -1;
        state.enemies.forEach((enemy) => {
          if (enemy.alive) enemy.y += 10;
        });
      }

      // 5. Collision Checks: Semicolon laser hitting bugs
      state.bullets.forEach((bullet, bIdx) => {
        state.enemies.forEach((enemy) => {
          if (enemy.alive) {
            // Check bounding box overlap
            if (
              bullet.x >= enemy.x - 8 &&
              bullet.x <= enemy.x + 8 &&
              bullet.y >= enemy.y - 8 &&
              bullet.y <= enemy.y + 8
            ) {
              // Destroy bug
              enemy.alive = false;
              state.bullets.splice(bIdx, 1);
              state.score += enemy.scoreVal;
              setScore(state.score);

              // Burst of neon particles
              createExplosion(enemy.x, enemy.y, "#22d3ee");
              playSound("explosion");

              // Sync high score
              if (state.score > highScore) {
                setHighScore(state.score);
                try {
                  localStorage.setItem("invaders_highScore", String(state.score));
                } catch {}
              }
            }
          }
        });
      });

      // 6. Update Particle systems (explosions)
      state.particles.forEach((p, pIdx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          state.particles.splice(pIdx, 1);
        }
      });
    };

    const drawGame = () => {
      const state = gameStateRef.current;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Space Background / Matrix stream
      ctx.fillStyle = "#010107";
      ctx.fillRect(0, 0, width, height);

      state.stars.forEach((star) => {
        ctx.fillStyle = `rgba(34, 211, 238, ${star.opacity})`;
        ctx.font = "8px monospace";
        ctx.fillText(star.char, star.x, star.y);
      });

      // 2. Draw Particles (neon debris)
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Draw Semicolon Bullets
      ctx.fillStyle = "#22d3ee";
      state.bullets.forEach((bullet) => {
        ctx.font = "bold 9px monospace";
        ctx.fillText(";", bullet.x - 2, bullet.y);
      });

      // 4. Draw Bugs (Emojis)
      state.enemies.forEach((enemy) => {
        if (enemy.alive) {
          ctx.font = "13px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(enemy.emoji, enemy.x, enemy.y);
        }
      });

      // 5. Draw Player (styled as terminal prompt compiler `</>`)
      ctx.save();
      // Glowing aura
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#6366f1";
      ctx.fillStyle = "#6366f1";
      
      // Text representation
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("</>", state.player.x, state.player.y);
      ctx.restore();
    };

    const renderLoop = () => {
      updateGame();
      drawGame();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Kick off animation cycle
    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, gameOver, victory, highScore, shootBullet, playSound]);

  return (
    <div 
      ref={containerRef}
      className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border border-white/10 bg-[#02010c]/90 backdrop-blur-xl p-4 flex flex-col justify-between font-mono select-none"
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between shrink-0 mb-1 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            Syntax Invaders
          </span>
          <span className="text-[7px] text-gray-500 font-mono uppercase">Blast the bugs!</span>
        </div>
        <div className="flex gap-1.5 items-center">
          {/* Score */}
          <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/8 text-center min-w-[36px]">
            <div className="text-[6px] text-gray-500 uppercase leading-none">Score</div>
            <div className="text-[9px] font-bold text-white leading-none mt-0.5">{score}</div>
          </div>
          {/* High Score */}
          <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/8 text-center min-w-[36px] flex items-center justify-center gap-0.5">
            <Trophy className="w-2 h-2 text-yellow-400" />
            <div className="text-[9px] font-bold text-[#fbcfe8] leading-none">{highScore}</div>
          </div>
          {/* Lives */}
          <div className="flex gap-0.5 text-red-500 text-[9px] font-bold px-1 ml-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < lives ? "opacity-100" : "opacity-20"}>❤️</span>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Canvas Area */}
      <div className="relative flex-1 w-full bg-[#010107] border border-white/5 rounded-2xl overflow-hidden aspect-square">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300}
          className="w-full h-full block"
        />

        {/* Start / Intro Overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-[#030014]/95 flex flex-col items-center justify-center p-3 text-center z-20">
            <Shield className="w-9 h-9 text-indigo-400 mb-2 animate-bounce" />
            <h5 className="text-[12px] font-bold text-white uppercase tracking-wider">Bug Defense Protocol</h5>
            <p className="text-[8px] text-gray-400 max-w-[200px] leading-relaxed mt-1 mb-3.5">
              Blast descending bugs using compiler semicolons. Avoid letting bugs bypass your terminal!
            </p>
            <button 
              onClick={startGame}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#6366f1] text-white text-[9px] font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              Compile & Start
            </button>
            <div className="text-[7px] text-gray-500 mt-2 font-mono uppercase tracking-widest leading-none">
              Press AD/Arrows + Space to Shoot
            </div>
          </div>
        )}

        {/* Game Over Layer */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#030014]/95 flex flex-col items-center justify-center p-3 text-center z-20 animate-fadeIn">
            <span className="text-3xl mb-1.5 animate-bounce">💀</span>
            <h5 className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Stack Overflow!</h5>
            <p className="text-[8px] text-gray-400 max-w-[200px] mt-1 mb-3">
              Your terminal was breached. Dev score: <span className="text-[#22d3ee] font-bold">{score}</span> points.
            </p>
            <button 
              onClick={startGame} 
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white text-[9px] font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Debug Stack
            </button>
          </div>
        )}

        {/* Victory Layer */}
        {victory && (
          <div className="absolute inset-0 bg-[#030014]/95 flex flex-col items-center justify-center p-3 text-center z-20 animate-fadeIn">
            <Sparkles className="w-9 h-9 text-yellow-400 mb-1.5 animate-pulse" />
            <h5 className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Stack Compiled!</h5>
            <p className="text-[8px] text-gray-400 max-w-[200px] mt-1 mb-3">
              All bugs successfully patched. You score: <span className="text-[#a855f7] font-bold">{score}</span> points.
            </p>
            <div className="flex gap-1.5">
              <a 
                href="#Contact" 
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#6366f1] text-white text-[9px] font-bold shadow-md hover:scale-105 transition-transform"
              >
                Hire Tester
              </a>
              <button 
                onClick={startGame} 
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-[9px] font-bold cursor-pointer"
              >
                Replay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile control keys underneath the board */}
      <div className="flex items-center justify-between px-1 py-1 mt-1.5 shrink-0 gap-3 z-10">
        <div className="flex gap-2">
          <button 
            onTouchStart={() => { gameStateRef.current.keys.ArrowLeft = true; }}
            onTouchEnd={() => { gameStateRef.current.keys.ArrowLeft = false; }}
            onMouseDown={() => { gameStateRef.current.keys.ArrowLeft = true; }}
            onMouseUp={() => { gameStateRef.current.keys.ArrowLeft = false; }}
            className="p-2 rounded-xl border border-white/5 bg-white/4 active:bg-[#6366f1]/20 active:border-[#6366f1]/40 text-gray-400 active:text-white transition-colors cursor-pointer select-none"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onTouchStart={() => { gameStateRef.current.keys.ArrowRight = true; }}
            onTouchEnd={() => { gameStateRef.current.keys.ArrowRight = false; }}
            onMouseDown={() => { gameStateRef.current.keys.ArrowRight = true; }}
            onMouseUp={() => { gameStateRef.current.keys.ArrowRight = false; }}
            className="p-2 rounded-xl border border-white/5 bg-white/4 active:bg-[#6366f1]/20 active:border-[#6366f1]/40 text-gray-400 active:text-white transition-colors cursor-pointer select-none"
            aria-label="Move Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button 
          onTouchStart={() => { shootBullet(); }}
          onMouseDown={() => { shootBullet(); }}
          className="flex-1 py-2 px-3 rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/10 text-[#22d3ee] active:bg-[#22d3ee]/35 active:text-white text-[8px] font-black uppercase tracking-wider transition-colors cursor-pointer select-none"
          aria-label="Shoot Code Semicolon"
        >
          COMPILE (Shoot ;)
        </button>
      </div>
    </div>
  );
};

export default memo(SyntaxInvaders);
