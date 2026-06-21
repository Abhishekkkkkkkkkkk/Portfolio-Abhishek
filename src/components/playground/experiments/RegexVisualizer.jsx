import React, { useState, useEffect } from "react";
import { Terminal, Play, HelpCircle, CheckCircle2, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

// Standard preset options for users to click and test
const PRESETS = [
  {
    name: "Email Address",
    pattern: "^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$",
    flags: "i",
    testString: "test.user_123@google-gmail.com, invalid-email@company, support@abhishek.dev",
    description: "Matches common email patterns with username, domain, and TLD groups."
  },
  {
    name: "Phone Number (US)",
    pattern: "^\\+?1?\\s*\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})$",
    flags: "m",
    testString: "+1 (555) 019-2834\n999-888-7777\n1234567",
    description: "Matches standard US formats with optional country code and group area codes."
  },
  {
    name: "Strong Password",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "",
    testString: "AdminPassword123!\nshort\nNoSpecial12",
    description: "Requires at least 8 characters, one uppercase, one lowercase, one digit, and one special symbol."
  },
  {
    name: "URL Path",
    pattern: "^(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9\\-]+)\\.([a-z]{2,6})(\\/[a-zA-Z0-9_\\-\\.\\/]*)*$",
    flags: "i",
    testString: "https://www.abhishek.dev/playground/games\nhttp://local-host:3000\nwww.google.com",
    description: "Matches web URL schemas, domains, extensions, and recursive directory subfolders."
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$",
    flags: "",
    testString: "2026-06-16\n2025-13-45\n99-12-05",
    description: "Matches standard calendar dates validating month bounds (01-12) and days (01-31)."
  }
];

const RegexVisualizer = () => {
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState(PRESETS[0].flags);
  const [testString, setTestString] = useState(PRESETS[0].testString);
  const [syntaxTree, setSyntaxTree] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  // Parse regex and matches on input change
  useEffect(() => {
    parseRegex();
  }, [pattern, flags, testString]);

  const parseRegex = () => {
    setError(null);
    if (!pattern) {
      setSyntaxTree([]);
      setMatches([]);
      return;
    }

    try {
      // 1. Compile regex safely
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g"); // Force global for matches
      
      // 2. Perform test highlights
      const matchesList = [];
      let match;
      
      // Reset lastIndex for regexes with global/sticky flags
      regex.lastIndex = 0;
      
      // Avoid infinite loop on empty matches (like .*)
      let safetyCounter = 0;
      while ((match = regex.exec(testString)) !== null && safetyCounter < 1000) {
        safetyCounter++;
        const groups = match.slice(1).map((val, idx) => ({
          index: idx + 1,
          value: val || ""
        }));
        
        matchesList.push({
          fullMatch: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          groups: groups
        });

        if (match[0].length === 0) {
          regex.lastIndex++; // Avoid infinite loop
        }
      }
      setMatches(matchesList);

      // 3. Build token explanations (Syntax Tree)
      const parsedTokens = tokenizeRegex(pattern);
      setSyntaxTree(parsedTokens);
    } catch (e) {
      setError(e.message || "Invalid Regular Expression syntax.");
      setSyntaxTree([]);
      setMatches([]);
    }
  };

  // Custom regex tokenizer to explain regex syntax elements
  const tokenizeRegex = (regexStr) => {
    const tokens = [];
    let i = 0;
    let groupCounter = 0;

    while (i < regexStr.length) {
      const char = regexStr[i];

      // Match anchors
      if (char === "^") {
        tokens.push({ type: "anchor", title: "Start Anchor (^)", desc: "Asserts that the match must begin at the start of the line or string." });
        i++;
        continue;
      }
      if (char === "$") {
        tokens.push({ type: "anchor", title: "End Anchor ($)", desc: "Asserts that the match must end at the end of the line or string." });
        i++;
        continue;
      }

      // Match escaped characters
      if (char === "\\") {
        if (i + 1 < regexStr.length) {
          const next = regexStr[i + 1];
          let desc = `Matches a literal '${next}' character.`;
          let title = `Literal: ${next}`;
          let type = "literal";

          if (next === "d") {
            title = "Digit (\\d)";
            desc = "Matches any numeric digit [0-9].";
            type = "class";
          } else if (next === "D") {
            title = "Non-Digit (\\D)";
            desc = "Matches any character that is not a numeric digit.";
            type = "class";
          } else if (next === "w") {
            title = "Word Character (\\w)";
            desc = "Matches any alphanumeric character including underscores [a-zA-Z0-9_].";
            type = "class";
          } else if (next === "W") {
            title = "Non-Word (\\W)";
            desc = "Matches any character that is not a word character.";
            type = "class";
          } else if (next === "s") {
            title = "Whitespace (\\s)";
            desc = "Matches any whitespace character (spaces, tabs, newlines).";
            type = "class";
          } else if (next === "S") {
            title = "Non-Whitespace (\\S)";
            desc = "Matches any character that is not whitespace.";
            type = "class";
          } else if (next === "b") {
            title = "Word Boundary (\\b)";
            desc = "Asserts a position where a word character is adjacent to a non-word character.";
            type = "anchor";
          }

          tokens.push({ type, title, desc });
          i += 2;
        } else {
          tokens.push({ type: "error", title: "Trailing Backslash", desc: "Escape symbol at the end of pattern." });
          i++;
        }
        continue;
      }

      // Match Groups
      if (char === "(") {
        groupCounter++;
        let type = "group";
        let title = `Capture Group #${groupCounter}`;
        let desc = `Groups matches together and captures the output as group reference #${groupCounter}.`;
        let skipLength = 1;

        if (regexStr.startsWith("?:", i + 1)) {
          type = "non-group";
          title = "Non-Capturing Group (?:...)";
          desc = "Groups match criteria together without capturing or storing output in memory.";
          skipLength = 3;
        } else if (regexStr.startsWith("?=", i + 1)) {
          type = "lookahead";
          title = "Positive Lookahead (?=...)";
          desc = "Asserts that the upcoming character pattern matches, without consuming characters.";
          skipLength = 3;
        } else if (regexStr.startsWith("?!", i + 1)) {
          type = "lookahead-neg";
          title = "Negative Lookahead (?!...)";
          desc = "Asserts that the upcoming character pattern does NOT match, without consuming characters.";
          skipLength = 3;
        }

        tokens.push({ type, title, desc });
        i += skipLength;
        continue;
      }
      if (char === ")") {
        tokens.push({ type: "group-end", title: "End Group", desc: "Closes the current grouping block scope." });
        i++;
        continue;
      }

      // Match Character sets [a-z]
      if (char === "[") {
        let content = "";
        let endIdx = regexStr.indexOf("]", i);
        if (endIdx !== -1) {
          content = regexStr.substring(i + 1, endIdx);
          const negated = content.startsWith("^");
          const title = negated ? "Excluded Character Set ([^...])" : "Character Set ([...])";
          const desc = negated 
            ? `Matches any character except those defined inside the brackets: [${content.substring(1)}].`
            : `Matches any single character in the set: [${content}].`;
          
          tokens.push({ type: "set", title, desc });
          i = endIdx + 1;
        } else {
          tokens.push({ type: "error", title: "Unclosed Set", desc: "Character bracket set lacks a closing bracket ]." });
          i++;
        }
        continue;
      }

      // Match Quantifiers
      if (char === "+") {
        tokens.push({ type: "quantifier", title: "One or More (+)", desc: "Matches the preceding item 1 or more times (greedy)." });
        i++;
        continue;
      }
      if (char === "*") {
        tokens.push({ type: "quantifier", title: "Zero or More (*)", desc: "Matches the preceding item 0 or more times (greedy)." });
        i++;
        continue;
      }
      if (char === "?") {
        tokens.push({ type: "quantifier", title: "Zero or One (?)", desc: "Matches the preceding item 0 or 1 time (optional)." });
        i++;
        continue;
      }
      if (char === "{") {
        let endIdx = regexStr.indexOf("}", i);
        if (endIdx !== -1) {
          const content = regexStr.substring(i + 1, endIdx);
          tokens.push({ 
            type: "quantifier", 
            title: `Quantifier: {${content}}`, 
            desc: `Matches the preceding item exactly ${content.replace(",", " to ")} times.` 
          });
          i = endIdx + 1;
        } else {
          tokens.push({ type: "error", title: "Unclosed Quantifier", desc: "Curly braces quantifier lacks a closing brace }." });
          i++;
        }
        continue;
      }

      // Match alternation OR
      if (char === "|") {
        tokens.push({ type: "alternation", title: "Alternation (OR)", desc: "Acts like a boolean OR, matching either preceding or succeeding patterns." });
        i++;
        continue;
      }

      // Dot operator
      if (char === ".") {
        tokens.push({ type: "class", title: "Wildcard Dot (.)", desc: "Matches any single character except newline separators." });
        i++;
        continue;
      }

      // Literal sequences
      let literal = char;
      let nextI = i + 1;
      const special = ["^", "$", "\\", "(", ")", "[", "]", "{", "}", "+", "*", "?", "|", "."];
      while (nextI < regexStr.length && !special.includes(regexStr[nextI])) {
        literal += regexStr[nextI];
        nextI++;
      }
      tokens.push({ 
        type: "literal", 
        title: `Literal: "${literal}"`, 
        desc: `Matches the literal string characters exactly in sequence: '${literal}' (case-sensitive).` 
      });
      i = nextI;
    }

    return tokens;
  };

  const handleLoadPreset = (preset) => {
    playTap();
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.testString);
    trackExperimentInteracted("regex-visualizer");
  };

  const renderHighlightedString = () => {
    if (matches.length === 0) return testString;

    let result = [];
    let lastIdx = 0;

    // Sort matches by index to render left-to-right
    const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

    sortedMatches.forEach((m, idx) => {
      // 1. Text before match
      if (m.startIndex > lastIdx) {
        result.push(testString.substring(lastIdx, m.startIndex));
      }

      // 2. The highlighted match
      result.push(
        <span 
          key={`match-${idx}`}
          className="relative inline-block px-1 rounded bg-indigo-500/25 border border-indigo-500/50 group text-white cursor-help font-bold font-mono transition-colors hover:bg-pink-500/20 hover:border-pink-500/50"
        >
          {m.fullMatch}
          {/* Tooltip on hover showing groups */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-[#0e0a2d] border border-white/10 rounded-lg p-2 shadow-xl text-[10px] text-gray-300 font-mono text-left z-50">
            <span className="text-pink-400 font-bold">Match #{idx+1}</span>
            <div className="mt-1 space-y-0.5">
              <div>Full: "{m.fullMatch}"</div>
              {m.groups.map(g => (
                <div key={g.index} className="pl-1.5 border-l border-white/10">
                  Group {g.index}: <span className="text-[#a78bfa]">"{g.value}"</span>
                </div>
              ))}
            </div>
          </span>
        </span>
      );

      lastIdx = m.endIndex;
    });

    // 3. Remaining text
    if (lastIdx < testString.length) {
      result.push(testString.substring(lastIdx));
    }

    return result;
  };

  // Helper colors for visual syntax tree tokens
  const getTokenColor = (type) => {
    switch (type) {
      case "anchor":
        return "border-rose-500/30 bg-rose-500/5 text-rose-400";
      case "group":
      case "group-end":
        return "border-indigo-500/30 bg-indigo-500/5 text-indigo-400";
      case "lookahead":
      case "lookahead-neg":
        return "border-purple-500/30 bg-purple-500/5 text-purple-400";
      case "class":
        return "border-cyan-500/30 bg-cyan-500/5 text-cyan-400";
      case "set":
        return "border-teal-500/30 bg-teal-500/5 text-teal-400";
      case "quantifier":
        return "border-amber-500/30 bg-amber-500/5 text-amber-400";
      case "literal":
        return "border-emerald-500/25 bg-emerald-500/5 text-emerald-400";
      default:
        return "border-white/10 bg-white/2 text-gray-400";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#06001a]/90 backdrop-blur-xl p-5 md:p-6 flex flex-col gap-6 shadow-[0_8px_32px_rgba(167,139,250,0.1)]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Terminal className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              Regex Visualizer & Test Bench
            </h4>
            <p className="text-xs text-gray-400">Design patterns, visually map regex syntax nodes, and highlight matches in real-time.</p>
          </div>
        </div>
      </div>

      {/* Preset selection bar */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider text-left">Quick Load Preset Templates</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleLoadPreset(p)}
              className="text-[11px] font-semibold py-1.5 px-3 rounded-lg border border-white/10 bg-white/3 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
        
        {/* Pattern Input (Col 9) */}
        <div className="md:col-span-9 space-y-1.5">
          <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider">Regular Expression Pattern</label>
          <div className="relative flex items-center bg-[#030014] border border-white/10 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 overflow-hidden">
            <span className="px-3 text-purple-400 font-bold font-mono border-r border-white/5">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => { setPattern(e.target.value); trackExperimentInteracted("regex-visualizer"); }}
              placeholder="e.g. ^[a-z]+$"
              className="flex-1 bg-transparent py-3 px-3 text-sm text-white font-mono placeholder-gray-600 outline-none"
            />
            <span className="px-3 text-purple-400 font-bold font-mono border-l border-white/5">/</span>
          </div>
        </div>

        {/* Flags Input (Col 3) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider">Flags</label>
          <input
            type="text"
            value={flags}
            onChange={(e) => { setFlags(e.target.value.replace(/[^gimsuy]/g, "")); }}
            placeholder="gim"
            className="w-full bg-[#030014] border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          />
        </div>

      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-rose-400 font-mono">Compilation Error:</span>
            <p className="text-xs text-rose-300 font-mono mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Visual Syntax Tree Timeline */}
      {!error && syntaxTree.length > 0 && (
        <div className="flex flex-col gap-3 text-left">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Visual Syntax Tree Timeline (Left to Right Evaluation)
          </span>
          <div className="border border-white/5 bg-white/2 rounded-2xl p-4 overflow-x-auto flex items-center gap-3 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {syntaxTree.map((token, idx) => (
              <React.Fragment key={idx}>
                {/* Visual node capsule */}
                <div 
                  className={`shrink-0 border rounded-xl p-3 max-w-[200px] transition-all duration-300 relative group cursor-help select-none ${getTokenColor(token.type)}`}
                >
                  <div className="text-[10px] font-black font-mono tracking-wider uppercase opacity-80">{token.type}</div>
                  <h6 className="text-[11px] font-bold mt-1 truncate">{token.title}</h6>
                  
                  {/* Tooltip detail description on hover */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 hidden group-hover:block bg-[#0e0a2d] border border-white/10 rounded-lg p-2.5 shadow-2xl text-[10px] text-gray-300 font-mono leading-relaxed z-50">
                    <div className="font-bold text-white mb-1">{token.title}</div>
                    {token.desc}
                  </div>
                </div>

                {/* Connection arrows between nodes */}
                {idx < syntaxTree.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Tester Strings Highlighting panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
        
        {/* Test Strings input panel */}
        <div className="flex flex-col gap-2">
          <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider">Test Sandbox Input Strings</label>
          <textarea
            rows={5}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type standard strings to test regex compilation..."
            className="w-full bg-[#030014] border border-white/10 rounded-xl p-4 text-xs text-white font-mono placeholder-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none"
          />
        </div>

        {/* Highlight Output display */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider">Real-Time Highlights ({matches.length} matches)</label>
            {matches.length > 0 && <span className="text-[9px] font-mono text-gray-500">Hover highlighting to inspect capture groups</span>}
          </div>
          <div className="w-full h-full bg-[#030014]/60 border border-white/10 rounded-xl p-4 text-xs text-gray-400 font-mono overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
            {renderHighlightedString()}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RegexVisualizer;
