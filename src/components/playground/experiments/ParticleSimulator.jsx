import React, { useState, useEffect, useRef } from "react";
import { Sliders, RefreshCw, LayoutTemplate } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";

const ParticleSimulator = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Particle configuration states
  const [density, setDensity] = useState(80); // number of particles
  const [speed, setSpeed] = useState(15); // scaled speed
  const [colorMode, setColorMode] = useState("indigo"); // indigo, cyan, rainbow, mix
  const [particleSize, setParticleSize] = useState(2);
  const [connectionDist, setConnectionDist] = useState(100);
  const [mouseMode, setMouseMode] = useState("repel"); // repel, attract, none

  const densityRef = useRef(density);
  const speedRef = useRef(speed);
  const colorModeRef = useRef(colorMode);
  const particleSizeRef = useRef(particleSize);
  const connectionDistRef = useRef(connectionDist);
  const mouseModeRef = useRef(mouseMode);

  // Update refs to avoid rebuilding canvas loops
  useEffect(() => {
    densityRef.current = density;
    speedRef.current = speed;
    colorModeRef.current = colorMode;
    particleSizeRef.current = particleSize;
    connectionDistRef.current = connectionDist;
    mouseModeRef.current = mouseMode;
  }, [density, speed, colorMode, particleSize, connectionDist, mouseMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];
    const mouse = { x: null, y: null };

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Particle class constructor
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * particleSizeRef.current + 0.5;
        this.dx = (Math.random() - 0.5) * (speedRef.current / 10);
        this.dy = (Math.random() - 0.5) * (speedRef.current / 10);
        
        // Colors
        if (colorModeRef.current === "indigo") {
          this.color = `rgba(99, 102, 241, ${Math.random() * 0.4 + 0.2})`;
        } else if (colorModeRef.current === "cyan") {
          this.color = `rgba(34, 211, 238, ${Math.random() * 0.4 + 0.2})`;
        } else if (colorModeRef.current === "rainbow") {
          const hue = Math.floor(Math.random() * 360);
          this.color = `hsla(${hue}, 80%, 60%, ${Math.random() * 0.4 + 0.2})`;
        } else {
          // mix
          this.color = Math.random() > 0.5 
            ? `rgba(99, 102, 241, ${Math.random() * 0.4 + 0.2})`
            : `rgba(168, 85, 247, ${Math.random() * 0.4 + 0.2})`;
        }
      }

      update() {
        // Update velocity if configuration changed
        const maxV = speedRef.current / 10;
        const currentSpeedVal = Math.hypot(this.dx, this.dy);
        if (currentSpeedVal > maxV) {
          this.dx = (this.dx / currentSpeedVal) * maxV;
          this.dy = (this.dy / currentSpeedVal) * maxV;
        }

        this.x += this.dx;
        this.y += this.dy;

        // Boundaries checks
        if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.dy *= -1;

        // Mouse interaction logic
        if (mouse.x !== null && mouseModeRef.current !== "none") {
          const dxMouse = this.x - mouse.x;
          const dyMouse = this.y - mouse.y;
          const dist = Math.hypot(dxMouse, dyMouse);

          if (dist < 120) {
            const force = (120 - dist) / 120;
            if (mouseModeRef.current === "repel") {
              // push away
              this.x += (dxMouse / dist) * force * 4;
              this.y += (dyMouse / dist) * force * 4;
            } else if (mouseModeRef.current === "attract") {
              // pull closer
              this.x -= (dxMouse / dist) * force * 3;
              this.y -= (dyMouse / dist) * force * 3;
            }
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Set up particles list
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < densityRef.current; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Adjust particle count dynamically
      if (particles.length !== densityRef.current) {
        initParticles();
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Connections lines drawing logic
      const maxConn = connectionDistRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );

          if (dist < maxConn) {
            const alpha = (1 - dist / maxConn) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = colorModeRef.current === "rainbow"
              ? `rgba(255,255,255,${alpha})`
              : colorModeRef.current === "cyan"
              ? `rgba(34, 211, 238, ${alpha})`
              : `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleControlChange = (type) => {
    trackExperimentInteracted("particles");
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col md:flex-row gap-6 text-left">
      {/* Simulation Screen Window */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-[300px] aspect-video md:aspect-auto rounded-2xl border border-white/10 bg-black/50 relative overflow-hidden select-none cursor-crosshair"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-mono text-gray-400 tracking-wider">
          PARTICLE_RENDER_ACTIVE
        </div>
      </div>

      {/* Control sliders */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-400" />
            Particle simulator
          </h4>
          <p className="text-xs text-gray-500 mt-1">Adjust vector parameters of the particle matrix.</p>
        </div>

        <div className="h-px bg-white/10" />

        {/* Sliders list */}
        <div className="flex flex-col gap-3.5">
          {/* Density */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase">
              <span>Density</span>
              <span className="text-white font-bold">{density}</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={density}
              onChange={(e) => {
                setDensity(Number(e.target.value));
                handleControlChange();
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
            />
          </div>

          {/* Speed */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase">
              <span>Speed</span>
              <span className="text-white font-bold">{speed}</span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              value={speed}
              onChange={(e) => {
                setSpeed(Number(e.target.value));
                handleControlChange();
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
            />
          </div>

          {/* Connection distance */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase">
              <span>Link distance</span>
              <span className="text-white font-bold">{connectionDist}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="180"
              value={connectionDist}
              onChange={(e) => {
                setConnectionDist(Number(e.target.value));
                handleControlChange();
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
            />
          </div>

          {/* Particle Size */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase">
              <span>Particle Size</span>
              <span className="text-white font-bold">{particleSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={particleSize}
              onChange={(e) => {
                setParticleSize(Number(e.target.value));
                handleControlChange();
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
            />
          </div>
        </div>

        {/* Color selectors */}
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-[10px] text-gray-500 font-mono uppercase">Color Theme</span>
          <div className="grid grid-cols-4 gap-1.5">
            {["indigo", "cyan", "rainbow", "mix"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColorMode(c);
                  handleControlChange();
                }}
                className={`py-1 rounded-lg text-[9px] font-black tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                  colorMode === c
                    ? "border-[#6366f1]/40 bg-[#6366f1]/15 text-white"
                    : "border-white/5 bg-white/3 text-gray-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Interaction mode selectors */}
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-[10px] text-gray-500 font-mono uppercase">Hover Interaction</span>
          <div className="grid grid-cols-3 gap-1.5">
            {["repel", "attract", "none"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMouseMode(m);
                  handleControlChange();
                }}
                className={`py-1 rounded-lg text-[9px] font-black tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                  mouseMode === m
                    ? "border-[#6366f1]/40 bg-[#6366f1]/15 text-white"
                    : "border-white/5 bg-white/3 text-gray-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleSimulator;
