import React, { useRef, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp, Terminal, AlertTriangle, Monitor, Info } from "lucide-react";

const BottomPanel = ({
  terminalLogs,
  terminalInput,
  setTerminalInput,
  onSubmit,
  currentTheme,
  terminalEndRef,
  activePanelTab,
  setActivePanelTab,
  panelHeight = "normal", // "normal", "maximized", "collapsed"
  setPanelHeight
}) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Programmatic scroll of the container only, avoiding window scroll jumps
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  if (panelHeight === "collapsed") return null;

  const tabs = [
    { id: "problems", label: "Problems", count: 0, icon: AlertTriangle },
    { id: "output", label: "Output", icon: Info },
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "ports", label: "Ports", count: 1, icon: Monitor }
  ];

  const handleClear = () => {
    if (activePanelTab === "terminal") {
      // Clear logs by submitting 'clear' command
      const mockEvent = { preventDefault: () => {} };
      setTerminalInput("clear");
      setTimeout(() => onSubmit(mockEvent), 50);
    }
  };

  const toggleSize = () => {
    if (panelHeight === "normal") {
      setPanelHeight("maximized");
    } else {
      setPanelHeight("normal");
    }
  };

  const heightClass = panelHeight === "maximized" ? "h-[350px]" : "h-[160px]";

  return (
    <div className={`rounded-none border-t border-white/5 bg-[#07070a] font-mono text-[12px] shrink-0 flex flex-col ${heightClass} transition-all duration-300`}>
      {/* Panel Headers */}
      <div className="flex items-center justify-between px-3 bg-[#0a0a0f] border-b border-white/5 text-[10px] text-gray-500 select-none shrink-0 h-8">
        <div className="flex items-center gap-3">
          {tabs.map((tab) => {
            const isActive = activePanelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanelTab(tab.id)}
                className={`relative py-2 px-1 flex items-center gap-1.5 transition-colors font-mono uppercase tracking-wide font-bold focus:outline-none
                  ${isActive ? "text-white border-b-2 border-indigo-500" : "text-gray-500 hover:text-gray-300"}`}
                style={{ borderBottomColor: isActive ? currentTheme.accentHex : undefined }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[8px] font-sans font-bold px-1 rounded-full shrink-0
                    ${tab.count > 0 ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-600"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {activePanelTab === "terminal" && (
            <button 
              onClick={handleClear}
              className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              title="Clear Terminal Console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={toggleSize}
            className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            title={panelHeight === "maximized" ? "Minimize Panel Height" : "Maximize Panel Height"}
          >
            {panelHeight === "maximized" ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Panel Scroll Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/5 min-h-0 text-left select-text"
      >
        {activePanelTab === "terminal" && (
          <div className="space-y-1">
            {terminalLogs.map((log, idx) => {
              let colorClass = "text-gray-500";
              if (log.startsWith("[Sys]")) colorClass = `${currentTheme.textAccent}`;
              else if (log.startsWith("[Compiler]")) colorClass = "text-[#50fa7b]";
              else if (log.startsWith("[User]")) colorClass = "text-[#8be9fd]";
              else if (log.startsWith(">")) colorClass = "text-white";
              return (
                <div key={idx} className={`${colorClass} leading-relaxed whitespace-pre-wrap`}>{log}</div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        )}

        {activePanelTab === "problems" && (
          <div className="text-gray-500 flex flex-col items-center justify-center py-6 gap-1.5 h-full">
            <span>No problems have been detected in the workspace.</span>
          </div>
        )}

        {activePanelTab === "output" && (
          <div className="text-gray-400 space-y-1 leading-relaxed">
            <div className="text-gray-600">[info - 20:09:24] [Vite] dev server running...</div>
            <div>[info] Port 5173 initialized.</div>
            <div>[success] HMR client connected to websocket gateway.</div>
            <div className="text-emerald-500">[success] Compiled production bundle dynamically in 42ms.</div>
            <div className="text-[#bd93f9]">[debug] Row Level Security (RLS) policies validated successfully on blogs table update channel.</div>
          </div>
        )}

        {activePanelTab === "ports" && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse border border-white/5 text-gray-400 text-[11px]">
              <thead>
                <tr className="bg-white/5 text-gray-500">
                  <th className="p-2 border border-white/5">Port</th>
                  <th className="p-2 border border-white/5">Process</th>
                  <th className="p-2 border border-white/5">Protocol</th>
                  <th className="p-2 border border-white/5">Forwarded Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-white/5 text-emerald-400 font-bold">5173</td>
                  <td className="p-2 border border-white/5">Vite Dev Server</td>
                  <td className="p-2 border border-white/5 font-bold text-[#bd93f9]">TCP/WS</td>
                  <td className="p-2 border border-white/5 text-sky-400 underline cursor-pointer">http://localhost:5173</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Terminal Input Box (Only shown in Terminal mode) */}
      {activePanelTab === "terminal" && (
        <form onSubmit={onSubmit} className="flex items-center border-t border-white/5 bg-black/30 px-3 py-1.5 font-mono text-[11px] shrink-0 h-8">
          <span className="text-[#50fa7b] shrink-0 mr-1.5">guest@abhishek-portfolio:~$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="Type 'help' to show available shell commands..."
            className="flex-1 bg-transparent text-white border-none outline-none focus:ring-0 font-mono text-[11px] p-0 m-0"
          />
        </form>
      )}
    </div>
  );
};

export default BottomPanel;
