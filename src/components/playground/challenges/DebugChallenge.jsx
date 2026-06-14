import React, { useState } from "react";
import { Bug, Eye, RefreshCw, ChevronRight, CheckCircle2, XCircle, Award } from "lucide-react";
import { unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const CHALLENGES = [
  {
    type: "debug",
    title: "Java: Concurrent Modification",
    language: "java",
    code: `List<String> list = new ArrayList<>(List.of("A", "B", "C"));\nfor (String s : list) {\n    if (s.equals("B")) {\n        list.remove(s);\n    }\n}`,
    question: "What happens when this code is executed?",
    options: [
      "The list becomes [\"A\", \"C\"] successfully.",
      "Throws ConcurrentModificationException.",
      "Throws NullPointerException.",
      "Compiles with a syntax warning."
    ],
    answer: 1,
    explanation: "Modifying a collection directly while iterating over it using a Java enhanced for-loop throws a ConcurrentModificationException. Instead, an Iterator should be used."
  },
  {
    type: "predict",
    title: "JS: Array Equality Comparison",
    language: "javascript",
    code: `const a = [1, 2, 3];\nconst b = [1, 2, 3];\nconsole.log(a == b);\nconsole.log(a === b);`,
    question: "What is printed in the console?",
    options: [
      "true, true",
      "true, false",
      "false, false",
      "TypeError"
    ],
    answer: 2,
    explanation: "In JavaScript, arrays are objects. Comparisons with '==' or '===' verify whether the references to the objects are the same. Since 'a' and 'b' refer to different memory allocations, both return false."
  },
  {
    type: "debug",
    title: "Java: Static Null Method call",
    language: "java",
    code: `public class Test {\n    public static void display() {\n        System.out.println("Static call");\n    }\n    public static void main(String[] args) {\n        Test t = null;\n        t.display();\n    }\n}`,
    question: "What happens when the main method runs?",
    options: [
      "Throws NullPointerException.",
      "Prints \"Static call\" successfully.",
      "Does not compile.",
      "Locks the thread."
    ],
    answer: 1,
    explanation: "In Java, static methods belong to the class, not object instances. Calling t.display() evaluates to Test.display(), which compiles and executes without generating a NullPointerException."
  },
  {
    type: "predict",
    title: "JS: Closures in Loop scoping",
    language: "javascript",
    code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1000);\n}`,
    question: "What is printed in the console after 1 second?",
    options: [
      "0, 1, 2",
      "3, 3, 3",
      "2, 2, 2",
      "0, 0, 0"
    ],
    answer: 1,
    explanation: "Variables declared with 'var' are function-scoped (or global), not block-scoped. By the time the async setTimeout callbacks trigger, the loop has completed and the shared 'i' variable equals 3."
  },
  {
    type: "predict",
    title: "Java: String Pool references",
    language: "java",
    code: `String s1 = "Java";\nString s2 = new String("Java");\nSystem.out.println(s1 == s2);\nSystem.out.println(s1.equals(s2));`,
    question: "What is printed by this code?",
    options: [
      "true, true",
      "false, false",
      "false, true",
      "true, false"
    ],
    answer: 2,
    explanation: "s1 is stored in the String Constant Pool. s2 is created as a new object instance in heap memory. '==' compares reference addresses, resulting in false, while '.equals()' compares value equality, resulting in true."
  }
];

const DebugChallenge = () => {
  const [activeTab, setActiveTab] = useState("all"); // all, debug, predict
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]); // tracks correct indices

  const filtered = CHALLENGES.filter((c) => activeTab === "all" || c.type === activeTab);
  const challenge = filtered[currentIdx];

  const handleSubmit = (idx) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
    setIsSubmitted(true);

    if (idx === challenge.answer) {
      playSuccess();
      setScore((s) => s + 1);
      const newCorrects = [...correctAnswers, challenge.title];
      setCorrectAnswers(newCorrects);

      // Check if they completed all successfully
      if (newCorrects.length >= CHALLENGES.length) {
        unlockAchievement("debugging-expert");
      }
    } else {
      playFail();
    }
  };

  const handleNext = () => {
    playTap();
    if (currentIdx + 1 < filtered.length) {
      setCurrentIdx((idx) => idx + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      // Completed current view list loop back or reset
      setCurrentIdx(0);
      setSelectedOpt(null);
      setIsSubmitted(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-400" />
            Sandbox Debugger & Predictor
          </h4>
          <p className="text-xs text-gray-500 mt-1">Review source code clips to detect logical bugs or predict behavior.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 p-1 bg-white/4 border border-white/10 rounded-xl max-w-max self-start sm:self-center">
          {[
            { id: "all", label: "All Clips" },
            { id: "debug", label: "Debug" },
            { id: "predict", label: "Predict" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playTap();
                setActiveTab(tab.id);
                setCurrentIdx(0);
                setSelectedOpt(null);
                setIsSubmitted(false);
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

      {/* Progress Status Bar */}
      <div className="flex justify-between items-center text-xs font-mono bg-white/3 border border-white/5 px-4 py-2.5 rounded-lg">
        <span className="text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          {challenge.type === "debug" ? (
            <>
              <Bug className="w-3.5 h-3.5 text-red-400" />
              Debug challenge
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Predict output
            </>
          )}
        </span>
        <span className="text-gray-500">
          Snippet: {currentIdx + 1} / {filtered.length}
        </span>
      </div>

      {/* Title */}
      <h5 className="text-sm font-bold text-white tracking-wide">
        {challenge.title}
      </h5>

      {/* Interactive Code Editor Pane */}
      <div className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
        <pre className="text-gray-300">
          <code>{challenge.code}</code>
        </pre>
      </div>

      {/* Question */}
      <p className="text-xs text-gray-300 font-semibold mb-1">
        {challenge.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {challenge.options.map((opt, idx) => {
          let optClass = "border-white/8 bg-white/3 text-gray-300 hover:border-white/20 hover:bg-white/5";
          let icon = null;

          if (isSubmitted) {
            if (idx === challenge.answer) {
              optClass = "border-green-500/40 bg-green-500/10 text-green-400 font-bold";
              icon = <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />;
            } else if (idx === selectedOpt) {
              optClass = "border-red-500/40 bg-red-500/10 text-red-400 font-bold";
              icon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
            } else {
              optClass = "border-white/5 bg-white/2 text-gray-600 cursor-not-allowed";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSubmit(idx)}
              disabled={isSubmitted}
              className={`w-full p-4 rounded-xl border flex items-center justify-between text-xs transition-all text-left duration-300 cursor-pointer ${optClass}`}
            >
              <span className="leading-normal">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Explanation output terminal */}
      {isSubmitted && (
        <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4 animate-fade-in text-xs leading-relaxed text-gray-400">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">
            EXPLANATION
          </span>
          {challenge.explanation}
        </div>
      )}

      {/* Actions */}
      {isSubmitted && (
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
        >
          <span>Next Challenge</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Final check progress warning */}
      {correctAnswers.length === CHALLENGES.length && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2.5">
          <Award className="w-5 h-5 text-yellow-500 shrink-0" />
          <span className="text-xs text-yellow-500 font-semibold leading-relaxed">
            All code sandbox challenges solved successfully! Debugging Expert badge achieved!
          </span>
        </div>
      )}
    </div>
  );
};

export default DebugChallenge;
