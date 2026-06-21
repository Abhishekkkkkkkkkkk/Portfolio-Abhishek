import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Square, Volume2, HelpCircle } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap } from "../../../services/soundEffects";

// Piano notes definition with frequencies and keyboard mapping
const NOTES = [
  { note: "C4",  freq: 261.63, key: "a", type: "white" },
  { note: "C#4", freq: 277.18, key: "w", type: "black" },
  { note: "D4",  freq: 293.66, key: "s", type: "white" },
  { note: "D#4", freq: 311.13, key: "e", type: "black" },
  { note: "E4",  freq: 329.63, key: "d", type: "white" },
  { note: "F4",  freq: 349.23, key: "f", type: "white" },
  { note: "F#4", freq: 369.99, key: "u", type: "black" },
  { note: "G4",  freq: 392.00, key: "j", type: "white" },
  { note: "G#4", freq: 415.30, key: "i", type: "black" },
  { note: "A4",  freq: 440.00, key: "k", type: "white" },
  { note: "A#4", freq: 466.16, key: "o", type: "black" },
  { note: "B4",  freq: 493.88, key: "l", type: "white" },
  { note: "C5",  freq: 523.25, key: ";", type: "white" }
];

// Map colors based on pitch frequency for visual animations
const NOTE_COLORS = {
  "C4": "#ef4444",   // Red
  "C#4": "#f97316",  // Orange
  "D4": "#f59e0b",   // Amber
  "D#4": "#eab308",  // Yellow
  "E4": "#84cc16",   // Lime
  "F4": "#10b981",   // Emerald
  "F#4": "#06b6d4",  // Cyan
  "G4": "#3b82f6",   // Blue
  "G#4": "#6366f1",  // Indigo
  "A4": "#8b5cf6",   // Purple
  "A#4": "#d946ef",  // Fuchsia
  "B4": "#ec4899",   // Pink
  "C5": "#f43f5e"    // Rose
};

const SynthPiano = () => {
  const [waveType, setWaveType] = useState("sine"); // sine, square, sawtooth, triangle
  const [volume, setVolume] = useState(0.3); // 0 to 1
  const [activeNotes, setActiveNotes] = useState({}); // Track currently active notes: { noteName: boolean }
  
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef({}); // Active oscillator nodes: { noteName: { osc, gain } }
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef(null);

  // 1. Initialize Web Audio Context on first interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // 2. Play note
  const startNote = (note) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Prevent duplicate triggers if key is held down
    if (oscillatorsRef.current[note.note]) return;

    // Create oscillator and gain envelope
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

    // Fade-in envelope to prevent click artifacts
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();

    // Store references
    oscillatorsRef.current[note.note] = { osc, gain: gainNode };
    setActiveNotes(prev => ({ ...prev, [note.note]: true }));

    // Spawn visual particles on note play
    spawnParticles(note);
    trackExperimentInteracted("synth-piano");
  };

  // 3. Stop note
  const stopNote = (noteName) => {
    const active = oscillatorsRef.current[noteName];
    if (!active) return;

    const ctx = audioCtxRef.current;
    if (ctx) {
      // Smooth fade-out release envelope
      const { osc, gain } = active;
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      }, 300);
    }

    delete oscillatorsRef.current[noteName];
    setActiveNotes(prev => ({ ...prev, [noteName]: false }));
  };

  // 4. Keyboard binding handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keypress if user is inside an input box
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const matched = NOTES.find(n => n.key === key);
      if (matched) {
        startNote(matched);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      const matched = NOTES.find(n => n.key === key);
      if (matched) {
        stopNote(matched.note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      
      // Stop any remaining sound on unmount
      Object.keys(oscillatorsRef.current).forEach(n => stopNote(n));
    };
  }, [waveType, volume]);

  // 5. Spawn visualizer particles
  const spawnParticles = (note) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Estimate horizontal coordinate on canvas based on note frequency
    const idx = NOTES.findIndex(n => n.note === note.note);
    const xPos = (canvas.width / NOTES.length) * (idx + 0.5);

    const color = NOTE_COLORS[note.note] || "#6366f1";
    
    // Spawn 10 glowing bubbles
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: xPos,
        y: canvas.height - 20,
        r: Math.random() * 8 + 4,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 2,
        opacity: 1,
        color: color
      });
    }
  };

  // 6. Visualizer Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 600;
      canvas.height = 150;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      // Faded background clear for neon trail effect
      ctx.fillStyle = "rgba(3, 0, 20, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid matrix lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw active sine waves syncing with playing notes
      const activeKeys = Object.keys(oscillatorsRef.current);
      if (activeKeys.length > 0) {
        activeKeys.forEach((noteName) => {
          const matched = NOTES.find(n => n.note === noteName);
          if (!matched) return;
          const color = NOTE_COLORS[noteName] || "#6366f1";

          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;

          const amplitude = 30 + Math.random() * 10;
          const frequency = matched.freq / 1000;
          const time = Date.now() * 0.008;

          for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / 2 + Math.sin(x * frequency + time) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        });
      } else {
        // Draw resting flat line
        ctx.beginPath();
        ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      // Update and draw particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.015;
        p.r *= 0.98;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // reset
        ctx.shadowBlur = 0;

        // Remove dead particles
        if (p.opacity <= 0 || p.r <= 0.5) {
          particlesRef.current.splice(idx, 1);
        }
      });

      requestRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#06001a]/95 backdrop-blur-xl p-5 md:p-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(99,102,241,0.15)]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Interactive Synth Piano</h4>
            <p className="text-xs text-gray-400">Play notes using keyboard shortcuts and watch the reactive canvas visualizer.</p>
          </div>
        </div>
      </div>

      {/* Synth Controllers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/3 border border-white/5 rounded-xl p-4 text-left text-xs font-mono select-none">
        
        {/* Wave Selection */}
        <div className="space-y-2">
          <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Synth Wave Oscillator</span>
          <div className="grid grid-cols-4 gap-1">
            {["sine", "square", "sawtooth", "triangle"].map((type) => (
              <button
                key={type}
                onClick={() => { playTap(); setWaveType(type); }}
                className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  waveType === type
                    ? "border-pink-500 bg-pink-500/15 text-pink-400"
                    : "border-white/5 bg-white/2 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Volume controls */}
        <div className="space-y-2 flex flex-col justify-center">
          <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Output Volume</span>
            <span className="text-white font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 border-none outline-none rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

      </div>

      {/* Reactive Visualizer Canvas */}
      <div className="relative border border-white/10 rounded-xl bg-[#030014] overflow-hidden">
        <canvas ref={canvasRef} className="w-full block h-[150px]" />
        <div className="absolute top-2.5 right-3 bg-black/60 px-2 py-0.5 rounded border border-white/5 text-[9px] font-mono text-gray-500 select-none">
          Live Wave Visualizer
        </div>
      </div>

      {/* The Keyboard */}
      <div className="relative w-full aspect-[4/1] flex select-none mt-2 border border-white/10 rounded-xl overflow-hidden bg-white">
        
        {/* Render White Keys first */}
        {NOTES.filter(n => n.type === "white").map((note) => {
          const isActive = activeNotes[note.note];
          const color = NOTE_COLORS[note.note];
          
          return (
            <button
              key={note.note}
              onMouseDown={() => startNote(note)}
              onMouseUp={() => stopNote(note.note)}
              onMouseLeave={() => stopNote(note.note)}
              onTouchStart={(e) => { e.preventDefault(); startNote(note); }}
              onTouchEnd={() => stopNote(note.note)}
              className={`flex-1 border-r border-gray-300 relative flex flex-col justify-end pb-3 items-center transition-all cursor-pointer ${
                isActive 
                  ? "bg-slate-100 shadow-[inset_0_-8px_0_rgba(0,0,0,0.1)]" 
                  : "bg-white active:bg-slate-100"
              }`}
              style={isActive ? { borderBottom: `4px solid ${color}` } : {}}
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase select-none">{note.key}</span>
              <span className="text-[8px] font-mono text-gray-300 select-none mt-0.5">{note.note}</span>
            </button>
          );
        })}

        {/* Render Black Keys Absolutely positioned */}
        {/* We hardcode left offsets for black keys based on white key indexes (8 white keys total) */}
        {(() => {
          // Offsets representing horizontal percentages to align black keys between white keys
          const leftOffsets = [9.5, 22.5, 47.8, 60.5, 73.2];
          const blackNotes = NOTES.filter(n => n.type === "black");

          return blackNotes.map((note, idx) => {
            const isActive = activeNotes[note.note];
            const color = NOTE_COLORS[note.note];
            const offset = leftOffsets[idx] || 0;

            return (
              <button
                key={note.note}
                onMouseDown={() => startNote(note)}
                onMouseUp={() => stopNote(note.note)}
                onMouseLeave={() => stopNote(note.note)}
                onTouchStart={(e) => { e.preventDefault(); startNote(note); }}
                onTouchEnd={() => stopNote(note.note)}
                className={`absolute w-[8%] h-[60%] bg-[#121217] rounded-b-md border-x border-b border-white/10 z-10 transition-all cursor-pointer flex flex-col justify-end pb-2 items-center ${
                  isActive 
                    ? "bg-[#252530]" 
                    : "hover:bg-[#1f1f26]"
                }`}
                style={{ 
                  left: `${offset}%`,
                  borderBottom: isActive ? `3px solid ${color}` : "none"
                }}
              >
                <span className="text-[9px] font-bold text-gray-500 uppercase select-none">{note.key}</span>
                <span className="text-[6px] font-mono text-gray-600 select-none mt-0.5">{note.note}</span>
              </button>
            );
          });
        })()}

      </div>

      {/* Keyboard map helper panel */}
      <div className="flex justify-center items-center gap-1.5 p-3 rounded-xl border border-white/5 bg-white/2 text-[10px] font-mono text-gray-500 select-none text-center">
        <span>Keyboard:</span>
        <span className="text-gray-300 font-bold bg-white/10 px-1.5 py-0.5 rounded">A W S E D F U J I K O L ;</span>
      </div>

    </div>
  );
};

export default SynthPiano;
