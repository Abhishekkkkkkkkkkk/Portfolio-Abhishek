import React, { useState, useEffect, useRef } from "react";
import { Move, RefreshCw, Circle, Square as SquareIcon, Layers } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap } from "../../../services/soundEffects";

const COLORS = ["#ec4899", "#a855f7", "#22d3ee", "#6366f1", "#22c55e", "#f97316"];

const PhysicsSandbox = () => {
  const canvasRef = useRef(null);
  
  const [gravity, setGravity] = useState(0.4);
  const [elasticity, setElasticity] = useState(0.75);
  const [shapeType, setShapeType] = useState("circle"); // circle, box
  
  const shapesRef = useRef([]);
  const isMouseDownRef = useRef(false);
  const grabbedShapeRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseVelRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const requestRef = useRef(null);

  // Initialize canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 300;

    // Spawn 8 initial shapes
    if (shapesRef.current.length === 0) {
      for (let i = 0; i < 8; i++) {
        shapesRef.current.push({
          id: i,
          x: 50 + Math.random() * (canvas.width - 100),
          y: 30 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 4,
          radius: 12 + Math.random() * 12,
          color: COLORS[i % COLORS.length],
          type: i % 2 === 0 ? "circle" : "box",
        });
      }
    }

    const updatePhysics = () => {
      const width = canvas.width;
      const height = canvas.height;

      shapesRef.current.forEach((shape) => {
        if (grabbedShapeRef.current === shape) {
          // Grabbing is governed directly by mouse position, calculate velocity
          shape.vx = mouseVelRef.current.x;
          shape.vy = mouseVelRef.current.y;
          shape.x = mousePosRef.current.x;
          shape.y = mousePosRef.current.y;
          return;
        }

        // Apply gravity
        shape.vy += gravity;

        // Move shape
        shape.x += shape.vx;
        shape.y += shape.vy;

        // Apply friction
        shape.vx *= 0.99;
        shape.vy *= 0.99;

        // Boundaries collisions
        const size = shape.type === "circle" ? shape.radius : shape.radius * 1.5;
        
        // Floor collision
        if (shape.y + size > height) {
          shape.y = height - size;
          shape.vy = -shape.vy * elasticity;
          shape.vx *= 0.95; // floor friction
        }
        // Ceiling collision
        if (shape.y - size < 0) {
          shape.y = size;
          shape.vy = -shape.vy * elasticity;
        }
        // Walls collision
        if (shape.x + size > width) {
          shape.x = width - size;
          shape.vx = -shape.vx * elasticity;
        }
        if (shape.x - size < 0) {
          shape.x = size;
          shape.vx = -shape.vx * elasticity;
        }
      });

      // Handle simple particle-to-particle collisions (circle approximation for simplicity and fun)
      for (let i = 0; i < shapesRef.current.length; i++) {
        for (let j = i + 1; j < shapesRef.current.length; j++) {
          const s1 = shapesRef.current[i];
          const s2 = shapesRef.current[j];

          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist) {
            // Overlap resolution
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // push apart
            if (grabbedShapeRef.current !== s1) {
              s1.x -= nx * overlap * 0.5;
              s1.y -= ny * overlap * 0.5;
            }
            if (grabbedShapeRef.current !== s2) {
              s2.x += nx * overlap * 0.5;
              s2.y += ny * overlap * 0.5;
            }

            // Elastic bounce impulse
            const kx = s1.vx - s2.vx;
            const ky = s1.vy - s2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            if (grabbedShapeRef.current !== s1) {
              s1.vx -= nx * p * elasticity;
              s1.vy -= ny * p * elasticity;
            }
            if (grabbedShapeRef.current !== s2) {
              s2.vx += nx * p * elasticity;
              s2.vy += ny * p * elasticity;
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapesRef.current.forEach((shape) => {
        ctx.beginPath();
        ctx.fillStyle = shape.color;
        
        // Shadow/glow properties
        ctx.shadowColor = shape.color + "55";
        ctx.shadowBlur = 10;

        if (shape.type === "circle") {
          ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Box
          const w = shape.radius * 2;
          ctx.rect(shape.x - shape.radius, shape.y - shape.radius, w, w);
          ctx.fill();
        }

        ctx.shadowBlur = 0; // reset shadow
      });

      // Draw vector throwing line
      if (isMouseDownRef.current && grabbedShapeRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(grabbedShapeRef.current.x, grabbedShapeRef.current.y);
        ctx.lineTo(grabbedShapeRef.current.x - mouseVelRef.current.x * 5, grabbedShapeRef.current.y - mouseVelRef.current.y * 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const loop = () => {
      updatePhysics();
      draw();
      requestRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gravity, elasticity]);

  // Handle spawn shape on click (if not grabbing)
  const getMouseCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    isMouseDownRef.current = true;
    const coords = getMouseCoords(e);
    lastMousePosRef.current = coords;

    // Check if clicked inside a shape to grab
    let found = null;
    for (let shape of shapesRef.current) {
      const dx = coords.x - shape.x;
      const dy = coords.y - shape.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < shape.radius + 10) {
        found = shape;
        break;
      }
    }

    if (found) {
      grabbedShapeRef.current = found;
      playTap();
    } else {
      // Spawn new shape
      const newShape = {
        id: Date.now(),
        x: coords.x,
        y: coords.y,
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 4,
        radius: 12 + Math.random() * 12,
        color: COLORS[shapesRef.current.length % COLORS.length],
        type: shapeType,
      };

      shapesRef.current.push(newShape);
      playTap();
      trackExperimentInteracted("physics-sandbox");
    }
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    const coords = getMouseCoords(e);

    // Calculate mouse speed velocity
    mouseVelRef.current = {
      x: coords.x - lastMousePosRef.current.x,
      y: coords.y - lastMousePosRef.current.y,
    };

    mousePosRef.current = coords;
    lastMousePosRef.current = coords;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    grabbedShapeRef.current = null;
    mouseVelRef.current = { x: 0, y: 0 };
  };

  const handleClear = () => {
    playTap();
    shapesRef.current = [];
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Move className="w-5 h-5 text-indigo-400" />
          Interactive Physics Vector Box
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Click inside the screen to spawn elastic particles. Drag and throw shapes to test momentum vectors!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Parameters Slider */}
        <div className="md:col-span-1 rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col gap-4 text-xs">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Environment Variables</span>
          
          {/* Gravity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-gray-400">Gravity strength</span>
              <span className="text-indigo-400 font-bold">{gravity}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Elasticity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-gray-400">Elasticity ratio</span>
              <span className="text-indigo-400 font-bold">{elasticity}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.98"
              step="0.02"
              value={elasticity}
              onChange={(e) => setElasticity(Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Spawn Shape Selector */}
          <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Spawn Shape</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setShapeType("circle");
                  playTap();
                }}
                className={`py-2 text-[10px] font-mono rounded-lg border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  shapeType === "circle"
                    ? "bg-indigo-500/20 text-[#a78bfa] border-indigo-500/40"
                    : "bg-white/3 text-gray-500 border-white/5 hover:text-white"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Circle</span>
              </button>
              <button
                onClick={() => {
                  setShapeType("box");
                  playTap();
                }}
                className={`py-2 text-[10px] font-mono rounded-lg border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  shapeType === "box"
                    ? "bg-indigo-500/20 text-[#a78bfa] border-indigo-500/40"
                    : "bg-white/3 text-gray-500 border-white/5 hover:text-white"
                }`}
              >
                <SquareIcon className="w-3.5 h-3.5" />
                <span>Box</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Canvas Box */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/50 overflow-hidden relative select-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className="w-full h-full block cursor-pointer"
          />

          <button
            onClick={handleClear}
            className="absolute top-4 right-4 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/15 hover:border-red-500/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Clear canvas"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhysicsSandbox;
