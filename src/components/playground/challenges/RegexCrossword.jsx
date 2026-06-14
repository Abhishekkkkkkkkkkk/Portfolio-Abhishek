import React, { useState } from "react";
import { HelpCircle, RefreshCw, CheckCircle2, XCircle, Award } from "lucide-react";
import { unlockAchievement } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const RegexCrossword = () => {
  // Solutions:
  // Row 0: A, 5, B
  // Row 1: K, X, L
  // Row 2: 9, 2, Y
  const solution = [
    ["A", "5", "B"],
    ["K", "X", "L"],
    ["9", "2", "Y"]
  ];

  const [grid, setGrid] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]);

  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(false);

  const rowRegex = ["^A[0-9]B$", "^[A-Z]X[A-Z]$", "^\\d{2}[A-Z]$"];
  const colRegex = ["^[A-Z]{2}\\d$", "^\\d[X]\\d$", "^B[A-Z]{2}$"];

  const rowHints = [
    "Starts with 'A', has any single number, ends with 'B'",
    "Starts with a capital letter, has an 'X', ends with a capital letter",
    "Starts with exactly two digits, ends with a capital letter"
  ];

  const colHints = [
    "Starts with exactly two capital letters, ends with a digit",
    "Starts with a digit, has 'X' in middle, ends with a digit",
    "Starts with 'B', followed by exactly two capital letters"
  ];

  const handleInputChange = (r, c, val) => {
    if (checked) return;
    const char = val.toUpperCase().slice(-1); // Only keep last letter
    const nextGrid = grid.map((row) => [...row]);
    nextGrid[r][c] = char;
    setGrid(nextGrid);
    playTap();
  };

  const checkSolution = () => {
    let matches = true;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[r][c] !== solution[r][c]) {
          matches = false;
        }
      }
    }

    setChecked(true);
    if (matches) {
      setSuccess(true);
      playSuccess();
      unlockAchievement("quiz-master"); // Unlock achievement
    } else {
      setSuccess(false);
      playFail();
    }
  };

  const resetGame = () => {
    setGrid([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]);
    setChecked(false);
    setSuccess(false);
    playTap();
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-pink-400" />
            Regex Crossword Solver
          </h4>
          <p className="text-xs text-gray-500 mt-1">Decrypt the 3x3 grid by matching row and column regular expressions!</p>
        </div>
        <button
          onClick={resetGame}
          aria-label="Restart puzzle"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-pink-500/15 hover:border-pink-500/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Solver Board */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <table className="border-collapse table-fixed">
          <thead>
            <tr>
              {/* Corner spacer */}
              <th className="w-12 h-12" />
              {colRegex.map((regex, idx) => (
                <th key={idx} className="w-16 text-center font-mono text-[9px] text-pink-400 font-bold px-1 select-none whitespace-normal align-middle leading-tight">
                  {regex}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rIdx) => (
              <tr key={rIdx}>
                {/* Row Header */}
                <td className="w-24 pr-3 text-right font-mono text-[9px] text-indigo-400 font-bold select-none leading-none">
                  {rowRegex[rIdx]}
                </td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="w-16 h-16 p-1">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
                      disabled={checked && success}
                      className={`w-full h-full rounded-xl border text-center font-mono text-lg font-bold uppercase focus:outline-none focus:ring-1 transition-all ${
                        checked
                          ? cell === solution[rIdx][cIdx]
                            ? "bg-green-500/10 border-green-500/40 text-green-400"
                            : "bg-red-500/10 border-red-500/40 text-red-500 animate-shake"
                          : "bg-white/4 border-white/10 text-white focus:border-pink-500/50 focus:ring-pink-500/20"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hints panel toggle */}
      <div className="flex gap-2 justify-between items-center bg-white/3 border border-white/5 rounded-xl p-3 text-xs">
        <span className="text-gray-400">Stuck? View pattern definitions:</span>
        <button
          onClick={() => {
            playTap();
            setHintsEnabled(!hintsEnabled);
          }}
          className={`px-3 py-1.5 rounded-lg font-bold border transition-all text-[10px] uppercase tracking-wider ${
            hintsEnabled 
              ? "bg-pink-500/20 text-pink-400 border-pink-500/40" 
              : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
          }`}
        >
          {hintsEnabled ? "Hide Hints" : "Show Hints"}
        </button>
      </div>

      {hintsEnabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/5 bg-black/30 rounded-xl p-4 text-[11px] leading-relaxed animate-fade-in text-gray-400">
          <div>
            <h5 className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-2">Row Regex Meanings</h5>
            <ol className="list-decimal list-inside flex flex-col gap-1 font-mono text-[10px]">
              {rowHints.map((hint, i) => <li key={i}><span className="text-gray-300 font-sans">{hint}</span></li>)}
            </ol>
          </div>
          <div>
            <h5 className="font-bold text-pink-400 uppercase tracking-widest text-[9px] mb-2">Column Regex Meanings</h5>
            <ol className="list-decimal list-inside flex flex-col gap-1 font-mono text-[10px]">
              {colHints.map((hint, i) => <li key={i}><span className="text-gray-300 font-sans">{hint}</span></li>)}
            </ol>
          </div>
        </div>
      )}

      {/* Result feedback */}
      {checked && (
        <div className={`p-4 border rounded-xl flex items-center gap-3 animate-fade-in ${
          success 
            ? "bg-green-500/10 border-green-500/20 text-green-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {success ? (
            <>
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">Regex Solved Successfully!</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Your input compiled cleanly against all row & column expressions.</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">Matching Constraints Failed</p>
                <p className="text-[10px] text-gray-400 mt-0.5">One or more character slots generated matching errors. Review patterns and retry.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Button Check */}
      <button
        onClick={checked && success ? resetGame : checkSolution}
        className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-95 text-white flex items-center justify-center gap-2 transition-all active:scale-95 text-xs shadow-lg shadow-pink-500/10"
      >
        {checked && success ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Solve Another Puzzle</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Validate Solution</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RegexCrossword;
