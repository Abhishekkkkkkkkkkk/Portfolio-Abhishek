import React, { useState, useEffect } from "react";
import { Award, Timer, BookOpen, ChevronRight, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const QUIZZES = {
  java: {
    title: "Java & Spring Boot Quiz",
    questions: [
      {
        question: "Which collection class allows elements to be accessed in the insertion order, and does not allow duplicates?",
        options: ["HashSet", "LinkedHashSet", "TreeSet", "ArrayList"],
        answer: 1,
        explanation: "LinkedHashSet maintains a doubly-linked list running through all of its elements, maintaining insertion-order, and like Set it contains no duplicate elements."
      },
      {
        question: "In Java, which mechanism allows threads to yield execution back to the system scheduler?",
        options: ["Thread.sleep()", "Thread.yield()", "object.wait()", "Thread.join()"],
        answer: 1,
        explanation: "Thread.yield() provides a hint to the scheduler that the current thread is willing to yield its current use of a processor."
      },
      {
        question: "In Spring Boot, which annotation is used to inject configurations from properties file?",
        options: ["@Value", "@ConfigurationProperties", "@PropertySource", "Both A and B"],
        answer: 3,
        explanation: "Both @Value and @ConfigurationProperties are commonly used to inject configurations. @Value is used for field-level injection, and @ConfigurationProperties is used for hierarchical property binding."
      },
      {
        question: "What is the default scope of a Spring Bean?",
        options: ["prototype", "request", "singleton", "session"],
        answer: 2,
        explanation: "By default, Spring beans are created as singletons. Only one instance of the bean is created per Spring IoC container."
      },
      {
        question: "Which of the following classes is thread-safe in Java?",
        options: ["HashMap", "ArrayList", "ConcurrentHashMap", "StringBuilder"],
        answer: 2,
        explanation: "ConcurrentHashMap is designed for concurrent applications where multiple threads read and write to the map simultaneously without blocking."
      }
    ]
  },
  javascript: {
    title: "JavaScript & Async Quiz",
    questions: [
      {
        question: "What is the output of: console.log(typeof NaN);",
        options: ["'number'", "'NaN'", "'undefined'", "'object'"],
        answer: 0,
        explanation: "In JavaScript, NaN (Not-a-Number) is technically a numeric data type, so typeof NaN returns 'number'."
      },
      {
        question: "Which of the following is true about closures in JavaScript?",
        options: [
          "It retains access to variables from its parent scope even after the parent function has finished executing.",
          "It blocks the execution loop.",
          "It is a function that has no parameters.",
          "It causes memory leaks in all browsers."
        ],
        answer: 0,
        explanation: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), retaining outer variables."
      },
      {
        question: "Which microtask queue has the highest priority in the JavaScript Event Loop?",
        options: ["setTimeout queue", "Promise then/catch queue", "requestAnimationFrame", "click events"],
        answer: 1,
        explanation: "Promises (.then/.catch/async/await reactions) are pushed to the microtask queue, which executes immediately after the current script stack and before rendering or macrotasks like setTimeout."
      },
      {
        question: "What does the 'Temporal Dead Zone' refer to in JavaScript?",
        options: [
          "The time block when a database connection fails.",
          "The state between entering a scope and declaring 'let' or 'const' variables.",
          "The time when garbage collection occurs.",
          "A deprecated function lifecycle."
        ],
        answer: 1,
        explanation: "The Temporal Dead Zone (TDZ) is the period of time from entering the block scope until the variable is declared with let or const, where accessing it throws a ReferenceError."
      },
      {
        question: "What is the output of: console.log(0.1 + 0.2 === 0.3);",
        options: ["true", "false", "undefined", "TypeError"],
        answer: 1,
        explanation: "Due to IEEE 754 floating-point representation, 0.1 + 0.2 equals 0.30000000000000004, which is not strictly equal to 0.3, resulting in false."
      }
    ]
  },
  dsa: {
    title: "Data Structures & Algorithms Quiz",
    questions: [
      {
        question: "What is the worst-case time complexity of searching in a Balanced Binary Search Tree (like AVL tree)?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        answer: 1,
        explanation: "Since balanced BSTs guarantee that the height of the tree is logarithmic relative to the nodes, searching is always bounded by O(log N) in both average and worst cases."
      },
      {
        question: "Which algorithm is used to find the shortest path in a weighted graph with negative edge weights but no negative cycles?",
        options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Kruskal's Algorithm", "Prim's Algorithm"],
        answer: 1,
        explanation: "Bellman-Ford algorithm can handle negative edge weights, unlike Dijkstra's, and can also detect negative weight cycles in a graph."
      },
      {
        question: "What is the best data structure to implement a Least Recently Used (LRU) Cache?",
        options: ["HashMap + Doubly Linked List", "Queue + Stack", "Min-Heap", "Binary Search Tree"],
        answer: 0,
        explanation: "A HashMap provides O(1) lookups, and a Doubly Linked List provides O(1) removals and insertions at the ends to track access order, making it perfect for LRU cache."
      },
      {
        question: "Which sorting algorithm is stable and has a guaranteed worst-case time complexity of O(N log N)?",
        options: ["Quick Sort", "Merge Sort", "Heap Sort", "Selection Sort"],
        answer: 1,
        explanation: "Merge Sort is a stable sorting algorithm with O(N log N) time complexity in all cases. Heap Sort has O(N log N) but is not stable, and Quick Sort has O(N^2) worst case."
      },
      {
        question: "What is the primary concept behind Dynamic Programming?",
        options: [
          "Breaking a problem into independent subproblems.",
          "Storing solutions to overlapping subproblems to avoid recomputation (Memoization/Tabulation).",
          "Using recursion without bounds.",
          "Scanning nodes layer by layer."
        ],
        answer: 1,
        explanation: "Dynamic Programming solves complex problems by combining solutions to overlapping subproblems, cache-recording results so each subproblem is solved only once."
      }
    ]
  }
};

const DevQuiz = () => {
  const [activeQuiz, setActiveQuiz] = useState(null); // java, javascript, dsa
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let timer;
    if (activeQuiz && !showResults && !isAnswered && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      // Auto submit as wrong answer
      handleOptionSelect(-1);
    }

    return () => clearTimeout(timer);
  }, [timeLeft, activeQuiz, isAnswered, showResults]);

  const startQuiz = (key) => {
    playTap();
    setActiveQuiz(key);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(15);
    setShowResults(false);
  };

  const handleOptionSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const quizData = QUIZZES[activeQuiz];
    const question = quizData.questions[currentQuestion];
    if (idx === question.answer) {
      playSuccess();
      setScore((s) => s + 1);
    } else {
      playFail();
    }
  };

  const handleNext = () => {
    playTap();
    const quizData = QUIZZES[activeQuiz];
    if (currentQuestion + 1 < quizData.questions.length) {
      setCurrentQuestion((q) => q + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      setShowResults(true);
      
      // Calculate final accuracy and trigger achievements
      const finalScore = score;
      const totalQuestions = quizData.questions.length;
      if (finalScore === totalQuestions) {
        unlockAchievement("quiz-master");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {!activeQuiz && (
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Developer Quiz Hub
            </h4>
            <p className="text-xs text-gray-500 mt-1">Select a category to test your knowledge.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(QUIZZES).map(([key, quiz]) => (
              <button
                key={key}
                onClick={() => startQuiz(key)}
                className="group p-5 rounded-2xl border border-white/8 bg-white/3 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-300 text-left flex flex-col justify-between min-h-[140px] cursor-pointer"
              >
                <div>
                  <h5 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors uppercase tracking-wider">
                    {key}
                  </h5>
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                    {quiz.title}
                  </p>
                </div>
                <div className="flex items-center text-[10px] text-purple-400 font-bold mt-4 uppercase tracking-widest gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>Start Quiz</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeQuiz && !showResults && (
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              {QUIZZES[activeQuiz].title}
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-gray-500">
                Q: {currentQuestion + 1} / {QUIZZES[activeQuiz].questions.length}
              </span>
              <span className="text-yellow-400 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-4 min-h-[80px] flex items-center">
            <h5 className="text-sm font-semibold text-white leading-relaxed">
              {QUIZZES[activeQuiz].questions[currentQuestion].question}
            </h5>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-2.5">
            {QUIZZES[activeQuiz].questions[currentQuestion].options.map((opt, idx) => {
              const correctAnswer = QUIZZES[activeQuiz].questions[currentQuestion].answer;
              let btnClass = "border-white/8 bg-white/3 text-gray-300 hover:border-white/20 hover:bg-white/5";
              let statusIcon = null;

              if (isAnswered) {
                if (idx === correctAnswer) {
                  btnClass = "border-green-500/40 bg-green-500/10 text-green-400 font-bold";
                  statusIcon = <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />;
                } else if (idx === selectedOption) {
                  btnClass = "border-red-500/40 bg-red-500/10 text-red-400 font-bold";
                  statusIcon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
                } else {
                  btnClass = "border-white/5 bg-white/2 text-gray-600 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between text-xs transition-all text-left duration-300 cursor-pointer ${btnClass}`}
                >
                  <span className="leading-normal">{opt}</span>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {/* Explanation block */}
          {isAnswered && (
            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4 animate-fade-in">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                EXPLANATION
              </span>
              <p className="text-xs text-gray-400 leading-relaxed">
                {QUIZZES[activeQuiz].questions[currentQuestion].explanation}
              </p>
            </div>
          )}

          {/* Actions */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-center flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>
                {currentQuestion + 1 < QUIZZES[activeQuiz].questions.length ? "Next Question" : "View Results"}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {showResults && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Award className="w-16 h-16 text-yellow-500 fill-yellow-500/10 mb-4 animate-bounce" />
          <h5 className="text-xl font-bold text-white mb-2">Quiz Finished!</h5>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
            You scored <span className="text-purple-400 font-bold font-mono">{score}</span> out of <span className="text-white font-mono">{QUIZZES[activeQuiz].questions.length}</span> questions.
            {score === QUIZZES[activeQuiz].questions.length && (
              <span className="block mt-2 text-yellow-500 font-bold">🏆 Perfect score! Achievement unlocked!</span>
            )}
          </p>

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={() => startQuiz(activeQuiz)}
              className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => {
                playTap();
                setActiveQuiz(null);
              }}
              className="flex-1 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white text-xs transition-all cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevQuiz;
