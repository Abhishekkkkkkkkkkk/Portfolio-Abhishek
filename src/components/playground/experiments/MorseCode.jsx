import React, { useState, useRef } from "react";
import { Radio, Play, Square, Volume2, HelpCircle } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap } from "../../../services/soundEffects";

const MORSE_DICTIONARY = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....",
  i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.",
  q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-",
  y: "-.--", z: "--..",
  1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...",
  8: "---..", 9: "----.", 0: "-----",
  " ": "/"
};

const MorseCode = () => {
  const [text, setText] = useState("SOS");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const [activeSignal, setActiveSignal] = useState(false); // Controls visual light bulb flash state

  const audioCtxRef = useRef(null);
  const playbackTimersRef = useRef([]);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Convert text input to morse representation
  const textToMorse = (str) => {
    return str
      .toLowerCase()
      .split("")
      .map((char) => MORSE_DICTIONARY[char] || "")
      .join(" ");
  };

  const stopPlayback = () => {
    playbackTimersRef.current.forEach((t) => clearTimeout(t));
    playbackTimersRef.current = [];
    setIsPlaying(false);
    setActiveCharIndex(-1);
    setActiveSignal(false);
  };

  const playMorseBeeps = () => {
    playTap();
    stopPlayback();
    setIsPlaying(true);

    const ctx = getAudioContext();
    const morseStr = textToMorse(text);
    const words = text.toLowerCase().split("");

    const DOT_MS = 100;
    const DASH_MS = 300;
    const GAP_MS = 100; // gap between elements inside a char

    let currentTimeDelay = 0;

    words.forEach((char, charIdx) => {
      const code = MORSE_DICTIONARY[char];
      if (!code) {
        // Space gap
        currentTimeDelay += 400;
        return;
      }

      // Schedule char start
      const startTimer = setTimeout(() => {
        setActiveCharIndex(charIdx);
      }, currentTimeDelay);
      playbackTimersRef.current.push(startTimer);

      code.split("").forEach((symbol) => {
        const duration = symbol === "." ? DOT_MS : DASH_MS;

        // Schedule Beep Sound ON
        const soundOnTimer = setTimeout(() => {
          triggerOscillatorBeep(ctx, duration);
          setActiveSignal(true);
        }, currentTimeDelay);
        playbackTimersRef.current.push(soundOnTimer);

        // Schedule visual light indicator OFF
        const lightOffTimer = setTimeout(() => {
          setActiveSignal(false);
        }, currentTimeDelay + duration);
        playbackTimersRef.current.push(lightOffTimer);

        currentTimeDelay += duration + GAP_MS;
      });

      // Gap between characters
      currentTimeDelay += 200;
    });

    // Reset when done
    const endTimer = setTimeout(() => {
      stopPlayback();
    }, currentTimeDelay);
    playbackTimersRef.current.push(endTimer);
    
    trackExperimentInteracted("morse-code");
  };

  const triggerOscillatorBeep = (ctx, durationMs) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(650, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + durationMs / 1000 - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn("Oscillator block:", e);
    }
  };

  const handleTextChange = (val) => {
    // Only allow alphanumeric & spaces
    const clean = val.replace(/[^a-zA-Z0-9 ]/g, "");
    setText(clean);
    stopPlayback();
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-indigo-400" />
          Morse Code Audio Player
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Input your coding handles or name to compile dots & dashes. Plays retro oscillator audio beeps matching the signal!
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Text Input & Indicators */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            maxLength={30}
            className="flex-1 bg-[#040410] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500/50 w-full"
            placeholder="Type code message (e.g. SOS)..."
          />

          {/* Player controls */}
          <div className="flex gap-2 w-full sm:w-auto">
            {isPlaying ? (
              <button
                onClick={stopPlayback}
                className="flex-1 sm:flex-initial py-3 px-5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-lg shadow-rose-600/10"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={playMorseBeeps}
                disabled={!text.trim()}
                className="flex-1 sm:flex-initial py-3 px-5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-600/15 disabled:bg-indigo-600/50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Sound</span>
              </button>
            )}

            {/* Fleshing Bulbs */}
            <div className="flex items-center justify-center border border-white/8 bg-white/3 rounded-xl p-3 shrink-0">
              <div
                className={`w-5 h-5 rounded-full transition-all duration-75 ${
                  activeSignal
                    ? "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-110"
                    : "bg-gray-800"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Characters highlights preview */}
        <div className="rounded-xl border border-white/8 bg-black/40 p-4 min-h-[90px] flex flex-wrap gap-2.5 items-center">
          {text.split("").map((char, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center w-8 h-10 rounded-lg border font-mono text-xs transition-all ${
                activeCharIndex === idx
                  ? "bg-[#6366f1]/25 text-[#a78bfa] border-[#6366f1]/50 scale-110 shadow-md"
                  : "bg-white/3 text-gray-400 border-white/5"
              }`}
            >
              <span className="font-bold text-[10px]">{char.toUpperCase()}</span>
              <span className="text-[7px] text-gray-500 leading-none mt-1">{MORSE_DICTIONARY[char.toLowerCase()] || "/"}</span>
            </div>
          ))}
        </div>

        {/* Large Morse Output Display */}
        <div className="rounded-xl border border-white/8 bg-[#040410] p-4 flex flex-col gap-2 font-mono">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block select-none">Morse Output String</span>
          <div className="text-xl text-[#a78bfa] leading-relaxed whitespace-pre-wrap select-all max-h-24 overflow-y-auto">
            {textToMorse(text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorseCode;
