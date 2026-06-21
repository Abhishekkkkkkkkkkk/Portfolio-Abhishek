import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Gamepad2, Trophy, BrainCircuit, Sparkles, 
  Terminal, Sun, Moon
} from "lucide-react";
import TiltCard from "../components/effects/TiltCard";
import { playTap } from "../services/soundEffects";

// Achievements import
import AchievementToast from "../components/playground/achievements/AchievementToast";
import AchievementsPanel from "../components/playground/achievements/AchievementsPanel";
import { unlockAchievement } from "../components/playground/achievements/achievementHelper";

// Games imports
import MemoryGame from "../components/playground/games/MemoryGame";
import TicTacToe from "../components/playground/games/TicTacToe";
import ReactionTest from "../components/playground/games/ReactionTest";
import SnakeGame from "../components/playground/games/SnakeGame";
import TypingTest from "../components/playground/games/TypingTest";
import RockPaperScissors from "../components/playground/games/RockPaperScissors";
import Game2048 from "../components/playground/games/Game2048";
import Tetris from "../components/playground/games/Tetris";
import FlappyBird from "../components/playground/games/FlappyBird";
import GitEscapeRoom from "../components/playground/games/GitEscapeRoom";

// Challenges imports
import DevQuiz from "../components/playground/challenges/DevQuiz";
import DebugChallenge from "../components/playground/challenges/DebugChallenge";
import RegexCrossword from "../components/playground/challenges/RegexCrossword";

// Personality imports
import PersonalityQuiz from "../components/playground/personality/PersonalityQuiz";

// Experiments imports
import ColorPlayground from "../components/playground/experiments/ColorPlayground";
import ParticleSimulator from "../components/playground/experiments/ParticleSimulator";
import AlgoVisualizer from "../components/playground/experiments/AlgoVisualizer";
import PathfindingVisualizer from "../components/playground/experiments/PathfindingVisualizer";
import PixelArtEditor from "../components/playground/experiments/PixelArtEditor";
import GitSimulator from "../components/playground/experiments/GitSimulator";
import SQLSandbox from "../components/playground/experiments/SQLSandbox";
import StepSequencer from "../components/playground/experiments/StepSequencer";
import APISimulator from "../components/playground/experiments/APISimulator";
import CLITerminal from "../components/playground/experiments/CLITerminal";
import JWTSandbox from "../components/playground/experiments/JWTSandbox";
import SortingBenchmark from "../components/playground/experiments/SortingBenchmark";
import FractalTree from "../components/playground/experiments/FractalTree";
import MorseCode from "../components/playground/experiments/MorseCode";
import PhysicsSandbox from "../components/playground/experiments/PhysicsSandbox";
import RegexVisualizer from "../components/playground/experiments/RegexVisualizer";
import SynthPiano from "../components/playground/experiments/SynthPiano";
// Easter Eggs import
import EasterEggs from "../components/playground/EasterEggs";

const Playground = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("games"); // games, challenges, experiments, personality, achievements
  const [activeStage, setActiveStage] = useState(null); // specific tool/game active
  const [theme, setTheme] = useState(() => localStorage.getItem("global-theme") || "dark");

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail);
    };
    window.addEventListener("global-theme-changed", handleThemeChange);
    return () => window.removeEventListener("global-theme-changed", handleThemeChange);
  }, []);

  // Unlock First Visitor Achievement on load
  useEffect(() => {
    window.scrollTo(0, 0);
    // Short delay to make sure the toast listens to the event
    setTimeout(() => {
      unlockAchievement("first-visitor");
    }, 1000);
  }, []);

  // Listen to stage commands from global Command Palette
  useEffect(() => {
    const handleTriggerStage = (e) => {
      if (e.detail && e.detail.stageId && e.detail.category) {
        setActiveCategory(e.detail.category);
        setActiveStage(e.detail.stageId);
        window.scrollTo({ top: 350, behavior: "smooth" });
      }
    };
    window.addEventListener("trigger-stage", handleTriggerStage);
    return () => window.removeEventListener("trigger-stage", handleTriggerStage);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("global-theme", nextTheme);
    if (nextTheme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
    window.dispatchEvent(new CustomEvent("global-theme-changed", { detail: nextTheme }));
  };

  const categories = [
    { id: "games", label: "Mini Games", icon: Gamepad2 },
    { id: "challenges", label: "Dev Challenges", icon: BrainCircuit },
    { id: "experiments", label: "Experiments", icon: Terminal },
    { id: "personality", label: "Fun Personality", icon: Sparkles },
    { id: "achievements", label: "Achievements", icon: Trophy }
  ];

  const items = {
    games: [
      { id: "memory", title: "Stack Matcher", desc: "Test your memory and match the developer technology cards.", component: MemoryGame, icon: Gamepad2, label: "Memory" },
      { id: "snake", title: "Bug Resolver (Snake)", desc: "Navigate the compiler compiler to eat errors and compile successfully.", component: SnakeGame, icon: Gamepad2, label: "Snake" },
      { id: "tictactoe", title: "Minimax Tic-Tac-Toe", desc: "Face off against a unbeatable minimax algorithm AI.", component: TicTacToe, icon: Gamepad2, label: "Tic-Tac-Toe" },
      { id: "reaction", title: "Reaction Tester", desc: "Measure your click response rate in milliseconds.", component: ReactionTest, icon: Gamepad2, label: "Reaction" },
      { id: "typing", title: "Syntax Speed Typer", desc: "Type coding statements in Java & JS as fast as you can.", component: TypingTest, icon: Gamepad2, label: "Typing" },
      { id: "rps", title: "Code Stack Compiler", desc: "Play classic Rock Paper Scissors themed around software stacks.", component: RockPaperScissors, icon: Gamepad2, label: "RPS" },
      { id: "2048", title: "2048 Classic", desc: "Manage grid layouts and merge matching tiles to reach 2048.", component: Game2048, icon: Gamepad2, label: "2048" },
      { id: "tetris", title: "Tetris Blocks", desc: "Manage piece fall, rotation, and alignment to clear rows.", component: Tetris, icon: Gamepad2, label: "Tetris" },
      { id: "flappy", title: "Flappy Compiler", desc: "Steer the syntax cursor node to dodge code compilation obstacles.", component: FlappyBird, icon: Gamepad2, label: "Flappy" },
      { id: "git-escape", title: "Git Merge Escape", desc: "Resolve branch merge conflicts across files under pressure to escape code locks.", component: GitEscapeRoom, icon: Gamepad2, label: "Git Escape" }
    ],
    challenges: [
      { id: "quiz", title: "Developer Quiz Hub", desc: "Test your skills in Java, JavaScript, and DSA structures.", component: DevQuiz, icon: BrainCircuit, label: "Quizzes" },
      { id: "debug", title: "Sandbox Debugger", desc: "Detect syntax errors or predict snippet outputs.", component: DebugChallenge, icon: BrainCircuit, label: "Debugging" },
      { id: "regex", title: "Regex Crossword Solver", desc: "Solve matching constraints in a 3x3 character grid crossword.", component: RegexCrossword, icon: BrainCircuit, label: "Regex" }
    ],
    experiments: [
      { id: "color", title: "CSS Color Sandbox", desc: "Build CSS linear gradients and generate color palettes.", component: ColorPlayground, icon: Terminal, label: "Colors" },
      { id: "particles", title: "Particle Vector Simulator", desc: "Configure parameters of floating canvas particles.", component: ParticleSimulator, icon: Terminal, label: "Particles" },
      { id: "sorting", title: "Sorting Visualizer", desc: "Animate Bubble Sort, Selection Sort, and Insertion Sort.", component: AlgoVisualizer, icon: Terminal, label: "Sorting" },
      { id: "pathfinding", title: "Pathfinding Visualizer", desc: "Draw walls and watch BFS, DFS, or Dijkstra/A* expand paths.", component: PathfindingVisualizer, icon: Terminal, label: "Pathfinding" },
      { id: "pixel-art", title: "CSS Pixel Art Editor", desc: "Draw on a 16x16 canvas and export the drawing as CSS shadow code.", component: PixelArtEditor, icon: Terminal, label: "Pixel Art" },
      { id: "git-sim", title: "Git Branch Visualizer", desc: "Simulate and visualize commits, branch checkouts, and merges.", component: GitSimulator, icon: Terminal, label: "Git Sim" },
      { id: "sql-sandbox", title: "SQL Sandbox Shell", desc: "Execute relational SELECT queries on a stateful mock server.", component: SQLSandbox, icon: Terminal, label: "SQL Sandbox" },
      { id: "step-sequencer", title: "Synth Beat Sequencer", desc: "Configure wave beat loops using browser synthesized oscillators.", component: StepSequencer, icon: Terminal, label: "Sequencer" },
      { id: "api-sim", title: "Rest API Simulator", desc: "Connect requests and test responses on stateful API endpoints.", component: APISimulator, icon: Terminal, label: "API Client" },
      { id: "cli-term", title: "Retro Linux Console", desc: "Explore OS files and systems in a retro green bash shell.", component: CLITerminal, icon: Terminal, label: "CLI Terminal" },
      { id: "jwt-sandbox", title: "JWT Claims Decoder", desc: "Decode headers/payloads and sign customized auth tokens.", component: JWTSandbox, icon: Terminal, label: "JWT Dec" },
      { id: "sort-bench", title: "Sorting Speed Benchmark", desc: "Run side-by-side performance tests on sorting complexity.", component: SortingBenchmark, icon: Terminal, label: "Sort Bench" },
      { id: "fractal-tree", title: "Fractal Tree Canvas", desc: "Compute recursive tree structures with wind animations.", component: FractalTree, icon: Terminal, label: "Fractals" },
      { id: "morse-code", title: "Morse Code player", desc: "Synthesize telegraph beeps and flashes from message inputs.", component: MorseCode, icon: Terminal, label: "Morse Code" },
      { id: "physics-sandbox", title: "2D Vector Physics Box", desc: "Spawn and throw elastic shapes under adjustable gravity.", component: PhysicsSandbox, icon: Terminal, label: "Physics Box" },
      { id: "regex-vis", title: "Regex Visualizer", desc: "Break down regex patterns into visual syntax trees and test strings.", component: RegexVisualizer, icon: Terminal, label: "Regex Vis" },
      { id: "synth-piano", title: "Interactive Synth Piano", desc: "Play piano keys with shortcuts and watch the reactive canvas visualizer.", component: SynthPiano, icon: Terminal, label: "Synth Piano" }
    ]
  };

  const handleItemSelect = (id) => {
    playTap();
    setActiveStage(id);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 relative pb-24 overflow-hidden ${
      theme === "dark" ? "bg-[#030014] text-white" : "bg-[#f4f3ff] text-slate-800"
    }`}>
      {/* Dynamic Background Glow circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme === "dark" ? (
          <>
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#6366f1]/10 blur-[120px] animate-pulse" />
            <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#a855f7]/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#6366f1]/15 blur-[120px]" />
            <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#a855f7]/15 blur-[120px]" />
          </>
        )}
        <div className={`absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f04_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f04_1px,transparent_1px)] bg-[size:24px_24px] ${
          theme === "dark" ? "opacity-100" : "opacity-30"
        }`} />
      </div>

      {/* TOP FLOATING NAV BAR */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl px-4 py-4 sm:px-[10%] flex justify-between items-center transition-all ${
        theme === "dark" ? "bg-[#030014]/70 border-white/10" : "bg-[#f4f3ff]/70 border-[#6366f1]/25"
      }`}>
        <button
          onClick={() => navigate("/")}
          className={`group flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-xl border cursor-pointer hover:scale-105 active:scale-95 ${
            theme === "dark" 
              ? "border-white/10 text-[#e2d3fd] hover:text-white bg-white/5 hover:border-white/20" 
              : "border-[#6366f1]/30 text-[#6366f1] hover:text-[#4f46e5] bg-white hover:border-[#6366f1]/50"
          }`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Portfolio</span>
        </button>

        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-mono tracking-widest uppercase hidden sm:block ${
            theme === "dark" ? "text-gray-500" : "text-[#818cf8]"
          }`}>
            INTERACTIVE_SANDBOX_V1.0
          </span>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all active:scale-90 cursor-pointer ${
              theme === "dark"
                ? "border-white/10 bg-white/5 text-yellow-400 hover:text-yellow-300"
                : "border-[#6366f1]/25 bg-white text-indigo-600 hover:bg-slate-50"
            }`}
            title="Toggle theme (Press 'L')"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-[10%] text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEVELOPER PLAYGROUND</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
          Interactive{" "}
          <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
            Fun Zone
          </span>
        </h1>
        <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
          theme === "dark" ? "text-gray-400" : "text-slate-600"
        }`}>
          Need a break from compiling code? Jump into retro games, test your Java & JS core knowledge, check your typing speed, or run mathematical canvas experiments.
        </p>

        {/* Categories Tab Selector */}
        <div className="flex justify-center flex-wrap gap-2 mt-12 max-w-3xl mx-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playTap();
                  setActiveCategory(cat.id);
                  setActiveStage(null);
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all duration-300 transform active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white border-transparent shadow-[0_0_20px_rgba(99,102,241,0.25)] scale-105"
                    : theme === "dark"
                    ? "border-white/10 bg-[#0a0a1a]/60 text-gray-400 hover:text-white hover:border-white/20"
                    : "border-[#6366f1]/20 bg-white text-slate-500 hover:text-[#6366f1] hover:border-[#6366f1]/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* DASHBOARD GRID CONTENT */}
      <main className="px-4 sm:px-6 lg:px-[10%] max-w-7xl mx-auto relative z-10 mt-4">
        {/* Render Stage if selected, else grid items */}
        <AnimatePresence mode="wait">
          {activeStage ? (
            <motion.div
              key="stage"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Back to category menu */}
              <button
                onClick={() => {
                  playTap();
                  setActiveStage(null);
                }}
                className={`self-start flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-xl border transition-all cursor-pointer ${
                  theme === "dark"
                    ? "border-white/10 text-gray-400 hover:text-white bg-white/5 hover:border-white/20"
                    : "border-[#6366f1]/30 text-indigo-600 hover:text-[#4f46e5] bg-white hover:border-[#6366f1]/50"
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Menu</span>
              </button>

              {/* Dynamic render of active component */}
              <div className="w-full">
                {(() => {
                  const StageComponent = [...(items.games || []), ...(items.challenges || []), ...(items.experiments || [])]
                    .find((i) => i.id === activeStage)?.component || (() => null);
                  return <StageComponent />;
                })()}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {/* MINI GAMES / CHALLENGES / EXPERIMENTS CARD GRID */}
              {["games", "challenges", "experiments"].includes(activeCategory) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items[activeCategory].map((item) => {
                    const Icon = item.icon;
                    return (
                      <TiltCard key={item.id}>
                        <div
                          onClick={() => handleItemSelect(item.id)}
                          className={`group relative rounded-3xl border p-6 flex flex-col justify-between min-h-[200px] cursor-pointer transition-all duration-500 overflow-hidden ${
                            theme === "dark"
                              ? "border-white/10 bg-[#0a0a1a]/60 hover:border-[#6366f1]/40 hover:bg-[#0a0a1a]/80"
                              : "border-[#6366f1]/15 bg-white hover:border-[#6366f1]/40 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)]"
                          }`}
                        >
                          {/* Glow indicator on hover */}
                          <div className="absolute -inset-1 bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                          <div className="relative">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 transition-all duration-300 ${
                              theme === "dark"
                                ? "border-white/10 bg-white/5 text-[#a78bfa] group-hover:bg-[#6366f1]/15 group-hover:text-white"
                                : "border-[#6366f1]/20 bg-indigo-50 text-[#6366f1] group-hover:bg-[#6366f1] group-hover:text-white"
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className={`text-base font-bold transition-colors ${
                              theme === "dark" ? "text-white group-hover:text-[#a78bfa]" : "text-slate-800 group-hover:text-[#6366f1]"
                            }`}>
                              {item.title}
                            </h3>
                            <p className={`text-xs mt-2 leading-relaxed ${
                              theme === "dark" ? "text-gray-500 group-hover:text-gray-400" : "text-slate-500"
                            }`}>
                              {item.desc}
                            </p>
                          </div>

                          <div className="flex items-center text-[10px] font-black uppercase tracking-widest mt-6 gap-1 group-hover:translate-x-1 transition-transform text-[#6366f1] dark:text-[#a78bfa]">
                            <span>Launch Sandbox</span>
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                          </div>
                        </div>
                      </TiltCard>
                    );
                  })}
                </div>
              )}

              {/* PERSONALITY TAB */}
              {activeCategory === "personality" && (
                <div className="w-full">
                  <PersonalityQuiz />
                </div>
              )}

              {/* ACHIEVEMENTS TAB */}
              {activeCategory === "achievements" && (
                <div className="w-full">
                  <AchievementsPanel />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* EASTER EGGS LISTENERS */}
      <EasterEggs toggleTheme={toggleTheme} />

      {/* GLOBAL ACHIEVEMENT NOTIFICATION TOAST */}
      <AchievementToast />
    </div>
  );
};

export default Playground;
