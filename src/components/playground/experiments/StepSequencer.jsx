import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap } from "../../../services/soundEffects";

const PITCHES = [
  { note: "C5", freq: 523.25, wave: "sine", color: "#ec4899" }, // Pink
  { note: "G4", freq: 392.00, wave: "triangle", color: "#a855f7" }, // Purple
  { note: "E4", freq: 329.63, wave: "sawtooth", color: "#22d3ee" }, // Cyan
  { note: "C4", freq: 261.63, wave: "square", color: "#6366f1" }, // Indigo
];

const StepSequencer = () => {
  const [grid, setGrid] = useState(
    Array(4).fill(null).map(() => Array(8).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [activeStep, setActiveStep] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play step note sound
  const playSynthNote = (freq, waveType) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  // Sequencer loop tick
  useEffect(() => {
    if (!isPlaying) {
      setActiveStep(-1);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = (60 / bpm / 2) * 1000; // Eighth notes loop

    timerRef.current = setInterval(() => {
      setActiveStep((prevStep) => {
        const nextStep = (prevStep + 1) % 8;
        
        // Play sounds in the next active column
        PITCHES.forEach((pitch, rowIdx) => {
          if (grid[rowIdx][nextStep]) {
            playSynthNote(pitch.freq, pitch.wave);
          }
        });

        return nextStep;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, grid, isMuted]);

  // Handle cell click
  const handleCellClick = (r, c) => {
    playTap();
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((row) => [...row]);
      nextGrid[r][c] = !nextGrid[r][c];
      return nextGrid;
    });
    trackExperimentInteracted("step-sequencer");
  };

  const handleClear = () => {
    playTap();
    setGrid(Array(4).fill(null).map(() => Array(8).fill(false)));
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    playTap();
    if (!isPlaying) {
      // Resume AudioContext context on interaction
      getAudioContext();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-400" />
            Synthesizer Step Sequencer
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Build simple musical beats! Click squares to schedule sounds, adjust tempo, and press play.
          </p>
        </div>
      </div>

      {/* Grid Controller board */}
      <div className="grid grid-cols-9 gap-2 items-center bg-black/30 p-4 rounded-xl border border-white/5 select-none overflow-x-auto">
        {/* Row labels & cells */}
        {PITCHES.map((pitch, rIdx) => (
          <React.Fragment key={pitch.note}>
            {/* Note label */}
            <div className="text-[10px] font-mono font-bold text-gray-400 flex items-center justify-between pr-2 border-r border-white/5 h-10">
              <span style={{ color: pitch.color }}>{pitch.note}</span>
              <span className="text-[8px] text-gray-600 uppercase font-normal">{pitch.wave}</span>
            </div>

            {/* Step blocks */}
            {grid[rIdx].map((isActive, cIdx) => (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => handleCellClick(rIdx, cIdx)}
                className={`w-full aspect-square min-w-[32px] max-w-[48px] rounded-lg border transition-all duration-75 cursor-pointer relative ${
                  isActive
                    ? `border-transparent shadow-lg`
                    : `border-white/5 bg-white/2 hover:bg-white/5`
                } ${
                  activeStep === cIdx 
                    ? "ring-2 ring-white scale-95" 
                    : "hover:scale-105 active:scale-95"
                }`}
                style={{
                  backgroundColor: isActive ? pitch.color : undefined,
                  boxShadow: isActive ? `${pitch.color}33 0px 4px 12px` : undefined,
                }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Playhead indicator footer row */}
        <div className="border-r border-transparent h-4" />
        {Array(8).fill(null).map((_, cIdx) => (
          <div key={cIdx} className="flex justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-100 ${
              activeStep === cIdx ? "bg-white animate-ping" : "bg-transparent"
            }`} />
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/3 p-4 rounded-xl border border-white/5 text-xs">
        {/* Play / Pause / Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            className={`py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 text-white ${
              isPlaying 
                ? "bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/10" 
                : "bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/10"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Loop</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleClear}
            className="py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Grid</span>
          </button>
        </div>

        {/* Tempo BPM Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 justify-end max-w-xs">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Tempo</span>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="flex-1 accent-pink-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
          />
          <span className="font-mono text-white text-[11px] min-w-[50px] text-right font-bold">{bpm} BPM</span>
        </div>

        {/* Volume / Mute button */}
        <button
          onClick={() => {
            playTap();
            setIsMuted(!isMuted);
          }}
          className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default StepSequencer;
