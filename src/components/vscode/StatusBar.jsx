import React from "react";
import { GitBranch, Radio, Check, Terminal } from "lucide-react";

const StatusBar = ({
  activeTabId,
  blog,
  headingsCount,
  onTerminalToggle,
  isTerminalOpen
}) => {
  let language = "Markdown";
  if (activeTabId === "settings") {
    language = "JSON";
  } else if (blog) {
    const primaryCat = blog.categories?.[0] || "Java";
    if (primaryCat.toLowerCase().includes("spring")) {
      language = "Spring/Java";
    } else if (primaryCat.toLowerCase().includes("java")) {
      language = "Java";
    } else if (primaryCat.toLowerCase().includes("cpp") || primaryCat.toLowerCase().includes("c++") || primaryCat.toLowerCase().includes("dsa")) {
      language = "C++";
    }
  }

  // Determine a status bar background depending on theme
  const bgThemeClass = activeTabId === "settings" ? "bg-amber-700 text-white" : "bg-[#0b0b12] text-gray-500";

  return (
    <div className={`flex items-center justify-between px-4 py-1 border-t border-white/5 text-[10px] font-mono select-none shrink-0 h-6 ${bgThemeClass}`}>
      {/* Left side items */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors text-indigo-400">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main</span>
        </div>
        
        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors text-emerald-500">
          <Check className="w-3 h-3" />
          <span>Sync</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-600">
          <span>⊗ 0</span>
          <span>⚠ 0</span>
        </div>

        {onTerminalToggle && (
          <button 
            type="button"
            onClick={onTerminalToggle}
            className={`flex items-center gap-1 hover:text-white cursor-pointer transition-colors px-1.5 py-0.5 rounded hover:bg-white/5 font-mono text-[10px]
              ${isTerminalOpen ? "text-[#50fa7b]" : "text-gray-500"}`}
            title="Toggle Terminal Panel"
          >
            <Terminal className="w-3.5 h-3.5 text-inherit" />
            <span>Terminal</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1 text-[#bd93f9]">
          <Radio className="w-3.5 h-3.5" />
          <span>Live Share</span>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        {headingsCount > 0 && (
          <span className="hidden md:inline">Outline: {headingsCount} symbols</span>
        )}
        <span>Spaces: 4</span>
        <span>UTF-8</span>
        <span className="hidden sm:inline">LF</span>
        <span className="px-1 py-0.5 rounded bg-white/5 text-gray-400 font-bold uppercase text-[9px] hover:text-white cursor-pointer select-none">
          {language}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
