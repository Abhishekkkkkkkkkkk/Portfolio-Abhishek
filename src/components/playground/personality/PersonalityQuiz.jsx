import React, { useState } from "react";
import { User2, Zap, HelpCircle, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess } from "../../../services/soundEffects";

const PERSONALITY_QUESTIONS = [
  {
    question: "When starting a new project, what's the very first thing you think about?",
    options: [
      { text: "Designing the database schema and indexes.", type: "backend" },
      { text: "Picking the best color palette and micro-interactions.", type: "frontend" },
      { text: "Setting up a seamless CI/CD pipeline and load balancers.", type: "devops" },
      { text: "Fine-tuning prompt structures or loading LLM weights.", type: "ai" },
      { text: "Connecting the APIs, client, database, and just shipping it.", type: "fullstack" }
    ]
  },
  {
    question: "You see a bug in production. What's your immediate reaction?",
    options: [
      { text: "Query the logs using SQL or Grep to trace the execution path.", type: "backend" },
      { text: "Inspect elements and debug CSS layouts in Chrome DevTools.", type: "frontend" },
      { text: "Ssh into the server to check container health and CPU cores.", type: "devops" },
      { text: "Feed the stacktrace to an AI model to analyze the logical pattern.", type: "ai" },
      { text: "Quickly patch both backend controller and front interface and push.", type: "fullstack" }
    ]
  },
  {
    question: "What is your favorite development tool/IDE setting?",
    options: [
      { text: "A robust terminal emulator and Postman/curl.", type: "backend" },
      { text: "Hot reloading, browser inspector, and Figma grids.", type: "frontend" },
      { text: "Docker Desktop, Kubernetes dashboard, and bash alias keys.", type: "devops" },
      { text: "Jupyter Notebooks, Anaconda, and Copilot suggestions.", type: "ai" },
      { text: "VSCode with 50 extensions running concurrently.", type: "fullstack" }
    ]
  },
  {
    question: "Pick your ideal Friday afternoon task:",
    options: [
      { text: "Refactoring database queries to save 5ms execution time.", type: "backend" },
      { text: "Smoothing out a navbar transition using Framer Motion.", type: "frontend" },
      { text: "Setting up automated backups and log rotation scripts.", type: "devops" },
      { text: "Testing a new vector search algorithm for semantic maps.", type: "ai" },
      { text: "Writing integration tests that cover everything from UI to DB.", type: "fullstack" }
    ]
  },
  {
    question: "What does 'clean code' mean to you?",
    options: [
      { text: "Separation of concerns, design patterns, and solid encapsulation.", type: "backend" },
      { text: "Pixel-perfect spacing, fluid grids, and high accessibility ratings.", type: "frontend" },
      { text: "Infrastructure-as-Code files that compile and deploy automatically.", type: "devops" },
      { text: "Model weight configurations that do not hallucinate.", type: "ai" },
      { text: "A codebase where I can edit any layer without breaking other logic.", type: "fullstack" }
    ]
  }
];

const DEV_TYPES = {
  backend: {
    title: "Backend Wizard 🧙‍♂️",
    description: "You thrive in the shadows of the server rooms. Databases, microservices, system threads, and JSON structures are your domain. You care deeply about queries, latency, and data integrity."
  },
  frontend: {
    title: "Frontend Artist 🎨",
    description: "You see the web as a blank canvas. Color profiles, typography, CSS transition speeds, and user experiences are your paints. You ensure the interface is responsive, premium, and alive."
  },
  devops: {
    title: "DevOps Master ⚙️",
    description: "Containers, load balancers, CI/CD pipes, and servers are your playing field. You make sure the code compiles, builds, and deploys without a single minute of system downtime."
  },
  ai: {
    title: "AI Explorer 🤖",
    description: "You live on the cutting edge of tech. Machine learning, vector databases, prompt configurations, and neural loops excite you. You seek to teach machines how to think."
  },
  fullstack: {
    title: "Full Stack Ninja 🥷",
    description: "You do it all. Front, back, database, deploy—you're a software army of one. You connect the endpoints, build the views, and ship completed features with speed and efficiency."
  }
};

const SUPERPOWERS = [
  "Semicolon Sniper: Finding missing semicolons in under 2 seconds.",
  "StackOverflow Oracle: Identifying the correct answer thread on the first scroll.",
  "Merge Conflict Whisperer: Merging 50 conflicting git branches without single code loss.",
  "NPE Shield: Writing Java code that is mathematically immune to NullPointerExceptions.",
  "Framer Speedster: Creating glassmorphic CSS animations in under 5 minutes.",
  "Legacy Code translator: Reading 10-year-old COBOL code and converting it to clean Spring Boot.",
  "Coffee-to-Code Converter: Translating double espressos directly into production microservices."
];

const FORTUNES = [
  "You will fix a critical production bug 5 minutes before deployment today.",
  "A senior engineer will review your code changes and say, 'This is beautiful.'",
  "Your next git push will merge cleanly and compile instantly without warnings.",
  "You will successfully explain what a Monad is to a junior developer.",
  "A client will change their mind about a feature request, but it matches your refactoring.",
  "You will configure webpack (or vite) without looking up any documentation.",
  "You will write a complex SQL query that runs in under 1 millisecond on the first try."
];

const PersonalityQuiz = () => {
  const [activeTab, setActiveTab] = useState("dev-type"); // dev-type, superpower, fortune
  
  // Dev Type state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);

  // Superpower & Fortune state
  const [superpower, setSuperpower] = useState("");
  const [fortune, setFortune] = useState("");

  const handleAnswerSelect = (type) => {
    const nextAnswers = [...answers, type];
    setAnswers(nextAnswers);

    if (currentQ + 1 < PERSONALITY_QUESTIONS.length) {
      playTap();
      setCurrentQ((q) => q + 1);
    } else {
      playSuccess();
      // Calculate dominant dev type
      const counts = nextAnswers.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});
      
      let dominantType = "fullstack";
      let maxCount = 0;
      Object.entries(counts).forEach(([k, v]) => {
        if (v > maxCount) {
          maxCount = v;
          dominantType = k;
        }
      });

      setQuizResult(DEV_TYPES[dominantType]);
      unlockAchievement("secret-hunter"); // Unlock a personality quiz completion badge
    }
  };

  const resetQuiz = () => {
    playTap();
    setCurrentQ(0);
    setAnswers([]);
    setQuizResult(null);
  };

  const generateSuperpower = () => {
    playTap();
    const randomPower = SUPERPOWERS[Math.floor(Math.random() * SUPERPOWERS.length)];
    setSuperpower(randomPower);
    unlockAchievement("secret-hunter");
  };

  const generateFortune = () => {
    playTap();
    const randomFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setFortune(randomFortune);
    unlockAchievement("secret-hunter");
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Tabs */}
      <div className="flex border-b border-white/8 pb-3 justify-between items-center flex-wrap gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <User2 className="w-5 h-5 text-pink-400" />
            Dev Personality Hub
          </h4>
        </div>
        <div className="flex gap-1 p-1 bg-white/4 border border-white/10 rounded-xl">
          {[
            { id: "dev-type", label: "Dev Quiz" },
            { id: "superpower", label: "Power Gen" },
            { id: "fortune", label: "Fortune" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playTap();
                setActiveTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#6366f1]/20 text-[#a78bfa] border border-[#6366f1]/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DEV TYPE QUIZ TAB */}
      {activeTab === "dev-type" && (
        <div className="flex flex-col gap-4">
          {!quizResult ? (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                <span>Developer Personality test</span>
                <span>Question {currentQ + 1} of {PERSONALITY_QUESTIONS.length}</span>
              </div>
              
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 min-h-[72px] flex items-center">
                <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                  {PERSONALITY_QUESTIONS[currentQ].question}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {PERSONALITY_QUESTIONS[currentQ].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(opt.type)}
                    className="w-full p-4 rounded-xl border border-white/8 bg-white/3 hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 transition-all text-left text-xs text-gray-300 hover:text-white cursor-pointer"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-tr from-[#6366f1]/5 to-[#a855f7]/5 rounded-2xl border border-white/10 animate-fade-in">
              <Sparkles className="w-12 h-12 text-yellow-500 fill-yellow-500/10 mb-4 animate-bounce" />
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">YOUR PROFILE IS</span>
              <h5 className="text-xl font-black text-white mt-1 mb-3">
                {quizResult.title}
              </h5>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                {quizResult.description}
              </p>
              <button
                onClick={resetQuiz}
                className="px-5 py-2.5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center gap-1.5 text-xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUPERPOWER TAB */}
      {activeTab === "superpower" && (
        <div className="flex flex-col items-center justify-center text-center py-6 gap-6">
          <div className="w-16 h-16 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center shadow-lg text-[#22d3ee]">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider">Coding Superpower Generator</h5>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Find out your humorous developer superpower. What makes you unique in the code trenches?
            </p>
          </div>

          {superpower && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 max-w-md w-full animate-fade-in relative overflow-hidden text-center">
              <div className="absolute top-2 right-2 text-yellow-500/10"><Sparkles className="w-8 h-8" /></div>
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider font-mono">SUPERPOWER UNLOCKED</span>
              <p className="text-sm font-bold text-white mt-2 leading-relaxed">
                {superpower}
              </p>
            </div>
          )}

          <button
            onClick={generateSuperpower}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Generate Superpower</span>
          </button>
        </div>
      )}

      {/* FORTUNE TELLER TAB */}
      {activeTab === "fortune" && (
        <div className="flex flex-col items-center justify-center text-center py-6 gap-6">
          <div className="w-16 h-16 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center shadow-lg text-[#a855f7]">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider">Developer Fortune Teller</h5>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Unlock a funny compilation prediction about your coding career.
            </p>
          </div>

          {fortune && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 max-w-md w-full animate-fade-in text-center">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">YOUR DEPLOYMENT FORTUNE</span>
              <p className="text-sm font-bold text-white mt-2 leading-relaxed italic">
                "{fortune}"
              </p>
            </div>
          )}

          <button
            onClick={generateFortune}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cast Prediction</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalityQuiz;
