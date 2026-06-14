import React, { useState, useEffect, useRef } from "react";
import { Sliders, RefreshCw, Eye, Sparkles } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap } from "../../../services/soundEffects";

const FractalTree = () => {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(30);
  const [scale, setScale] = useState(0.7);
  const [depth, setDepth] = useState(8);
  const [animateWind, setAnimateWind] = useState(true);
  const [colorTheme, setColorTheme] = useState("cyan-purple");

  const requestRef = useRef(null);
  const windOffsetRef = useRef(0);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Support responsive scaling
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 320;

    const drawTree = (startX, startY, len, ang, branchWidth, currentDepth) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Calculate end coordinates
      const radians = (ang * Math.PI) / 180;
      const endX = startX - Math.sin(radians) * len;
      const endY = startY - Math.cos(radians) * len;

      ctx.lineTo(endX, endY);
      
      // Determine stroke color gradients depending on depth
      let strokeColor = "";
      if (colorTheme === "cyan-purple") {
        // Interleaved Cyan -> Purple -> Pink
        const ratio = currentDepth / depth;
        strokeColor = `hsl(${180 + (140 * (1 - ratio))}, 85%, 65%)`;
      } else if (colorTheme === "matrix-green") {
        strokeColor = `rgb(34, ${100 + (155 * (currentDepth / depth))}, 94)`;
      } else {
        strokeColor = `hsl(${20 + (40 * (currentDepth / depth))}, 90%, 60%)`; // Autumn gold/orange
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(branchWidth, 0.8);
      ctx.stroke();

      if (currentDepth <= 0) return;

      // Calculate branches
      // Add wind sway effect to the branch angle if enabled
      const windSway = animateWind ? Math.sin(windOffsetRef.current) * 4 : 0;
      const angleRadLeft = ang - angle + windSway;
      const angleRadRight = ang + angle + windSway;

      drawTree(endX, endY, len * scale, angleRadLeft, branchWidth * scale, currentDepth - 1);
      drawTree(endX, endY, len * scale, angleRadRight, branchWidth * scale, currentDepth - 1);
    };

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#02020a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (animateWind) {
        windOffsetRef.current += 0.025; // advance wind timer
      }

      // Root trunk
      const startX = canvas.width / 2;
      const startY = canvas.height - 20;
      const initialLength = 80;
      const initialBranchWidth = 8;
      
      drawTree(startX, startY, initialLength, 0, initialBranchWidth, depth);

      if (animateWind) {
        requestRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [angle, scale, depth, animateWind, colorTheme]);

  const handleSliderChange = (setter, val) => {
    setter(val);
    playTap();
    trackExperimentInteracted("fractal-tree");
  };

  const handleReset = () => {
    playTap();
    setAngle(30);
    setScale(0.7);
    setDepth(8);
    setAnimateWind(true);
    setColorTheme("cyan-purple");
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-400" />
          Recursive Fractal Tree Canvas
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Explore recursive branching logic. Tweak length scaling ratios, split angles, recursion depth levels, and toggle simulated wind gusts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sliders Control Panel */}
        <div className="md:col-span-1 rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col gap-4 text-xs">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Parameters</span>
          
          {/* Depth Level */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-gray-400">Recursion Depth</span>
              <span className="text-indigo-400 font-bold">{depth}</span>
            </div>
            <input
              type="range"
              min="2"
              max="9"
              value={depth}
              onChange={(e) => handleSliderChange(setDepth, Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Branch Angle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-gray-400">Split Angle</span>
              <span className="text-indigo-400 font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={angle}
              onChange={(e) => handleSliderChange(setAngle, Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Length scale ratio */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-gray-400">Branch Scale</span>
              <span className="text-indigo-400 font-bold">{scale}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.78"
              step="0.02"
              value={scale}
              onChange={(e) => handleSliderChange(setScale, Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          {/* Color Schemes Selection */}
          <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Palette Scheme</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  setColorTheme("cyan-purple");
                  playTap();
                }}
                className={`py-1 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                  colorTheme === "cyan-purple"
                    ? "bg-indigo-500/20 text-[#a78bfa] border-indigo-500/40"
                    : "bg-white/3 text-gray-500 border-white/5 hover:text-white"
                }`}
              >
                Neon
              </button>
              <button
                onClick={() => {
                  setColorTheme("matrix-green");
                  playTap();
                }}
                className={`py-1 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                  colorTheme === "matrix-green"
                    ? "bg-emerald-500/20 text-[#34d399] border-emerald-500/40"
                    : "bg-white/3 text-gray-500 border-white/5 hover:text-white"
                }`}
              >
                Matrix
              </button>
              <button
                onClick={() => {
                  setColorTheme("autumn-gold");
                  playTap();
                }}
                className={`py-1 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                  colorTheme === "autumn-gold"
                    ? "bg-amber-500/20 text-[#fbbf24] border-amber-500/40"
                    : "bg-white/3 text-gray-500 border-white/5 hover:text-white"
                }`}
              >
                Autumn
              </button>
            </div>
          </div>

          {/* Wind animation toggle */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-gray-400">Wind Sway</span>
            <button
              onClick={() => {
                setAnimateWind(!animateWind);
                playTap();
              }}
              className={`px-3 py-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                animateWind
                  ? "bg-indigo-500/20 text-[#a78bfa] border-[#6366f1]/40"
                  : "bg-white/3 text-gray-400 border-white/5 hover:text-white"
              }`}
            >
              {animateWind ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Right Canvas Screen */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/50 overflow-hidden relative min-h-[280px]">
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Reset to defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FractalTree;
