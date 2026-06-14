import React, { useState } from "react";
import { Copy, RefreshCw, Palette, Sliders, CheckCircle2 } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";

const ColorPlayground = () => {
  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#a855f7");
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);
  const [activeTool, setActiveTool] = useState("gradient"); // gradient, palette
  const [palette, setPalette] = useState(["#6366f1", "#a855f7", "#22d3ee", "#10b981", "#ef4444"]);

  const gradientCSS = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  const generateHex = () => {
    const chars = "0123456789abcdef";
    let hex = "#";
    for (let i = 0; i < 6; i++) {
      hex += chars[Math.floor(Math.random() * 16)];
    }
    return hex;
  };

  const randomizeColors = () => {
    setColor1(generateHex());
    setColor2(generateHex());
    setAngle(Math.floor(Math.random() * 360));
    trackExperimentInteracted("color");
  };

  const randomizePalette = () => {
    const newPalette = Array.from({ length: 5 }, () => generateHex());
    setPalette(newPalette);
    trackExperimentInteracted("color");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Header */}
      <div className="flex border-b border-white/8 pb-3 justify-between items-center flex-wrap gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            CSS Color Sandbox
          </h4>
        </div>
        <div className="flex gap-1 p-1 bg-white/4 border border-white/10 rounded-xl">
          {[
            { id: "gradient", label: "Gradient Builder" },
            { id: "palette", label: "Palette Gen" }
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeTool === tool.id
                  ? "bg-[#6366f1]/20 text-[#a78bfa] border border-[#6366f1]/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRADIENT BUILDER */}
      {activeTool === "gradient" && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Controls */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Color 1</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => {
                    setColor1(e.target.value);
                    trackExperimentInteracted("color");
                  }}
                  className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Color 2</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => {
                    setColor2(e.target.value);
                    trackExperimentInteracted("color");
                  }}
                  className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                <span>Angle</span>
                <span className="text-white font-bold">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => {
                  setAngle(Number(e.target.value));
                  trackExperimentInteracted("color");
                }}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
              />
            </div>

            <button
              onClick={randomizeColors}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>
          </div>

          {/* Preview Window */}
          <div className="flex-1 flex flex-col gap-4">
            <div
              className="w-full aspect-[4/3] rounded-2xl border border-white/10 shadow-lg relative overflow-hidden"
              style={{ background: gradientCSS }}
            >
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />
            </div>
            
            {/* CSS Display Code block */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 flex items-center justify-between font-mono text-[10px] gap-2">
              <code className="text-gray-300 select-all truncate">
                background: {gradientCSS};
              </code>
              <button
                onClick={() => copyToClipboard(`background: ${gradientCSS};`)}
                className={`p-2 rounded-lg shrink-0 transition-all cursor-pointer ${
                  copied 
                    ? "bg-green-500/20 border border-green-500/30 text-green-400" 
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PALETTE GENERATOR */}
      {activeTool === "palette" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-5 gap-2.5 sm:gap-4 w-full aspect-[4/1.5]">
            {palette.map((color, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/10 overflow-hidden flex flex-col"
              >
                <div 
                  className="flex-1 w-full"
                  style={{ backgroundColor: color }}
                />
                <button
                  onClick={() => copyToClipboard(color)}
                  className="bg-black/80 hover:bg-black p-2 border-t border-white/5 text-center font-mono text-[10px] text-gray-300 hover:text-white transition-colors cursor-pointer select-all"
                >
                  {color}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={randomizePalette}
              className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Palette</span>
            </button>
            <button
              onClick={() => copyToClipboard(`const palette = [${palette.map(c => `"${c}"`).join(", ")}];`)}
              className="px-6 py-3 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-lg"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Array</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPlayground;
