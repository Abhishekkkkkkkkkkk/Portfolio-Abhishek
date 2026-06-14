import React, { useState } from "react";
import { Sliders, RefreshCw, Copy, CheckCircle2, Award } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess } from "../../../services/soundEffects";

const PALETTE = [
  { name: "Eraser", color: "transparent" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Purple", color: "#a855f7" },
  { name: "Cyan", color: "#22d3ee" },
  { name: "Green", color: "#22c55e" },
  { name: "Yellow", color: "#eab308" },
  { name: "Orange", color: "#f97316" },
  { name: "Red", color: "#ef4444" },
  { name: "Pink", color: "#ec4899" },
  { name: "White", color: "#ffffff" },
];

const PixelArtEditor = () => {
  const [grid, setGrid] = useState(
    Array(16).fill(null).map(() => Array(16).fill("transparent"))
  );
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePixelPaint = (r, c) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      newGrid[r][c] = activeColor;
      return newGrid;
    });
    playTap();
  };

  const handleMouseEnter = (r, c) => {
    if (isMouseDown) {
      handlePixelPaint(r, c);
    }
  };

  const clearCanvas = () => {
    setGrid(Array(16).fill(null).map(() => Array(16).fill("transparent")));
    setCopied(false);
    playTap();
  };

  const generateCSSCode = () => {
    const pixelSize = 12; // px per pixel
    const shadowParts = [];

    grid.forEach((row, r) => {
      row.forEach((color, c) => {
        if (color !== "transparent") {
          shadowParts.push(`${c * pixelSize}px ${r * pixelSize}px 0 ${color}`);
        }
      });
    });

    if (shadowParts.length === 0) {
      return "/* Canvas is empty. Draw something to generate CSS! */";
    }

    return `.pixel-art {\n  width: ${pixelSize}px;\n  height: ${pixelSize}px;\n  background: transparent;\n  box-shadow:\n    ${shadowParts.join(",\n    ")};\n}`;
  };

  const copyToClipboard = () => {
    const code = generateCSSCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    playSuccess();
    trackExperimentInteracted("pixel-art");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col md:flex-row gap-6 text-left">
      {/* Left Column: Drawing canvas board */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            CSS Pixel Art Editor
          </h4>
          <p className="text-xs text-gray-500 mt-1">Click/Drag to draw, then export your art as a single-div CSS style!</p>
        </div>

        {/* 16x16 Canvas Board */}
        <div 
          className="aspect-square w-full rounded-xl border border-white/10 bg-black/40 p-2 overflow-hidden select-none"
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          <div className="grid grid-cols-16 grid-rows-16 h-full w-full gap-[1px]">
            {grid.map((row, rIdx) =>
              row.map((color, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onMouseDown={() => handlePixelPaint(rIdx, cIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                  className={`w-full h-full border border-white/[0.015] rounded-[2px] transition-colors duration-100 cursor-crosshair`}
                  style={{
                    backgroundColor: color === "transparent" ? "rgba(255, 255, 255, 0.01)" : color
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Palette & Export Code controls */}
      <div className="w-full md:w-56 flex flex-col justify-between gap-4">
        {/* Colors Palette grid */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Palette Colors</span>
          <div className="grid grid-cols-5 gap-2.5">
            {PALETTE.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveColor(item.color);
                  playTap();
                }}
                title={item.name}
                className={`w-7 h-7 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  activeColor === item.color
                    ? "border-white scale-110 shadow-md shadow-white/10"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={{
                  backgroundColor: item.color === "transparent" ? "rgba(255,255,255,0.05)" : item.color,
                  backgroundImage: item.color === "transparent" ? "linear-gradient(45deg, #ef4444 25%, transparent 25%, transparent 75%, #ef4444 75%, #ef4444)" : "none",
                  backgroundSize: "6px 6px"
                }}
              />
            ))}
          </div>
        </div>

        {/* CSS Code Snippet Preview */}
        <div className="rounded-xl border border-white/8 bg-black/50 p-4 flex-1 flex flex-col justify-between min-h-[140px]">
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-2">CSS Output Preview</span>
          <div className="font-mono text-[9px] text-gray-400 overflow-y-auto max-h-32 flex-1 leading-normal whitespace-pre">
            {generateCSSCode().slice(0, 150)}
            {generateCSSCode().length > 150 ? "\n  /* ... compiled data truncated ... */\n}" : ""}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 py-3 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-lg shadow-[#6366f1]/10"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy CSS"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PixelArtEditor;
