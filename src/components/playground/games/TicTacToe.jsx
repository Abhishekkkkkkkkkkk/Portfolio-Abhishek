import React, { useState, useEffect, useCallback } from "react";
import { Code, Braces, RefreshCw, User, Cpu } from "lucide-react";
import { trackGamePlayed, unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [vsAI, setVsAI] = useState(true);
  const [difficulty, setDifficulty] = useState("unbeatable"); // easy, medium, unbeatable
  const [aiMessage, setAiMessage] = useState("Your move, human!");
  const [scores, setScores] = useState({ player: 0, ai: 0, ties: 0 });

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  const checkWinner = (squares) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : "Tie";
  };

  const getEmptyIndices = (squares) => {
    return squares.map((s, i) => (s === null ? i : null)).filter((val) => val !== null);
  };

  // Minimax algorithm for unbeatable AI
  const minimax = useCallback((squares, depth, isMaximizing) => {
    const winner = checkWinner(squares);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (winner === "Tie") return 0;

    const availSpots = getEmptyIndices(squares);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let spot of availSpots) {
        squares[spot] = "O";
        let score = minimax(squares, depth + 1, false);
        squares[spot] = null;
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let spot of availSpots) {
        squares[spot] = "X";
        let score = minimax(squares, depth + 1, true);
        squares[spot] = null;
        bestScore = Math.min(score, bestScore);
      }
      return bestScore;
    }
  }, []);

  const getBestMove = useCallback((squares) => {
    let bestScore = -Infinity;
    let move = null;
    const availSpots = getEmptyIndices(squares);

    for (let spot of availSpots) {
      squares[spot] = "O";
      let score = minimax(squares, 0, false);
      squares[spot] = null;
      if (score > bestScore) {
        bestScore = score;
        move = spot;
      }
    }
    return move;
  }, [minimax]);

  const makeAIMove = useCallback(() => {
    const emptySpots = getEmptyIndices(board);
    if (emptySpots.length === 0) return;

    let selectedMove;

    if (difficulty === "easy") {
      // 100% random moves
      selectedMove = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    } else if (difficulty === "medium") {
      // 50% best move, 50% random move
      if (Math.random() > 0.5) {
        selectedMove = getBestMove(board);
      } else {
        selectedMove = emptySpots[Math.floor(Math.random() * emptySpots.length)];
      }
    } else {
      // Unbeatable minimax moves
      selectedMove = getBestMove(board);
    }

    if (selectedMove !== null && selectedMove !== undefined) {
      const newBoard = [...board];
      newBoard[selectedMove] = "O";
      setBoard(newBoard);
      setIsXNext(true);

      // Random cheeky AI commentary
      const messages = [
        "Analyzing your style... inefficient.",
        "Expected that move. Standard algorithm.",
        "Compiling my counter-strategy...",
        "Are you using ChatGPT for TicTacToe?",
        "Is that your final logic branch?",
        "Calculating optimal win paths...",
      ];
      setAiMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [board, difficulty, getBestMove]);

  // Check for winner
  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      if (winner === "X") {
        playSuccess();
        setScores((s) => ({ ...s, player: s.player + 1 }));
        setAiMessage("Error 404: AI lost! Unbelievable!");
        trackGamePlayed("tictactoe");
        if (vsAI && difficulty === "unbeatable") {
          unlockAchievement("quiz-master"); // Unlock special code for defeating unbeatable AI
        }
      } else if (winner === "O") {
        if (vsAI) {
          playFail();
        } else {
          playSuccess();
        }
        setScores((s) => ({ ...s, ai: s.ai + 1 }));
        setAiMessage("Standard outcome. AI wins!");
        trackGamePlayed("tictactoe");
      } else {
        playTap();
        setScores((s) => ({ ...s, ties: s.ties + 1 }));
        setAiMessage("Draw. Loop terminated.");
        trackGamePlayed("tictactoe");
      }
    } else if (vsAI && !isXNext) {
      setAiMessage("Thinking...");
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, vsAI, makeAIMove, difficulty]);

  const handleCellClick = (index) => {
    if (board[index] || checkWinner(board)) return;
    if (vsAI && !isXNext) return;

    playTap();

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    playTap();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setAiMessage(vsAI ? "System rebooted. Let's code!" : "Player X goes first!");
  };

  const toggleMode = () => {
    playTap();
    setVsAI(!vsAI);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setAiMessage(!vsAI ? "System rebooted. Let's code!" : "Player X goes first!");
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-[#6366f1]" />
            Tic-Tac-Toe
          </h4>
          <p className="text-xs text-gray-500 mt-1">Player vs AI or Local PvP</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleMode}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
          >
            {vsAI ? "Local PvP" : "Vs AI"}
          </button>
          <button
            onClick={resetGame}
            aria-label="Restart Game"
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Controls */}
      {vsAI && (
        <div className="flex items-center justify-between gap-4 bg-white/3 rounded-xl p-2.5 border border-white/5">
          <span className="text-xs text-gray-400 font-bold ml-1 font-mono uppercase">AI Difficulty:</span>
          <div className="flex gap-1">
            {["easy", "medium", "unbeatable"].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setDifficulty(diff);
                  resetGame();
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                  difficulty === diff
                    ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/30"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Commentary Terminal */}
      <div className="bg-black/45 border border-white/5 rounded-xl p-3 font-mono text-xs text-left min-h-[64px] flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 animate-ping" />
        <span className="text-green-400">{vsAI ? `[AI_COM]:` : `[SYS_LOG]:`}</span>
        <span className="text-gray-300 ml-1 leading-relaxed">{aiMessage}</span>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white/3 rounded-xl p-3 border border-white/5">
        <div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center justify-center gap-1">
            <User className="w-3 h-3 text-[#6366f1]" />
            {vsAI ? "You (X)" : "Player X"}
          </p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{scores.player}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Ties</p>
          <p className="text-lg font-bold text-gray-400 font-mono mt-0.5">{scores.ties}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center justify-center gap-1">
            <Cpu className="w-3 h-3 text-[#a855f7]" />
            {vsAI ? "Bot (O)" : "Player O"}
          </p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{scores.ai}</p>
        </div>
      </div>

      {/* TicTacToe Grid Board */}
      <div className="grid grid-cols-3 gap-3 aspect-square w-full">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className={`rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 ${
              cell 
                ? cell === "X"
                  ? "border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1]"
                  : "border-[#a855f7]/40 bg-[#a855f7]/10 text-[#a855f7]"
                : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            {cell === "X" && <Code className="w-10 h-10 animate-[spin_0.3s_ease]" />}
            {cell === "O" && <Braces className="w-10 h-10 animate-[pulse_0.3s_ease]" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToe;
