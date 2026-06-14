import React, { useState, useEffect, useRef } from "react";
import { GitBranch, Terminal as TerminalIcon, HelpCircle, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

// Predefined colors for different branches
const BRANCH_COLORS = {
  main: "#6366f1", // Indigo
  master: "#6366f1",
  develop: "#22d3ee", // Cyan
  feature: "#ec4899", // Pink
  bugfix: "#f97316", // Orange
  release: "#22c55e", // Green
};

const DEFAULT_COLORS = ["#ec4899", "#22d3ee", "#22c55e", "#f97316", "#eab308", "#a855f7"];

const GitSimulator = () => {
  const canvasRef = useRef(null);
  const [command, setCommand] = useState("");
  const [activeBranch, setActiveBranch] = useState("main");
  
  // Terminal history logs
  const [history, setHistory] = useState([
    { type: "sys", text: "Git Visualizer Terminal v1.0.0" },
    { type: "sys", text: "Type 'help' to see list of available git commands." },
    { type: "sys", text: "Initialized empty Git repository in /workspace" },
  ]);

  // Git state
  const [commits, setCommits] = useState([
    { id: "c1", hash: "a3f2b1c", message: "Initial commit", branch: "main", parents: [] },
  ]);
  const [branches, setBranches] = useState({
    main: "c1",
  });
  
  const [branchColors, setBranchColors] = useState({
    main: BRANCH_COLORS.main,
  });

  const [inputFocused, setInputFocused] = useState(false);

  // Focus terminal input
  const focusInput = () => {
    const el = document.getElementById("git-input");
    if (el) el.focus();
  };

  useEffect(() => {
    drawGitGraph();
  }, [commits, branches, activeBranch]);

  // Helper to draw the git graph
  const drawGitGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Determine spacing
    // We want to layout branches on y-axis, and commits sequentially on x-axis
    const branchNames = Object.keys(branches);
    const branchY = {};
    branchNames.forEach((b, idx) => {
      branchY[b] = 60 + idx * 50; // Spacing of 50px per branch line
    });

    // We can compute the level/depth of each commit for x-axis positioning
    // Let's build a map of commit details
    const commitMap = {};
    commits.forEach((c) => {
      commitMap[c.id] = { ...c, children: [], x: 0, y: 0 };
    });

    // Hook up children & parents
    commits.forEach((c) => {
      c.parents.forEach((pId) => {
        if (commitMap[pId]) {
          commitMap[pId].children.push(c.id);
        }
      });
    });

    // To position commits on X axis, we can do a topological order or simple chronological level
    const xPosMap = {};
    commits.forEach((c, idx) => {
      xPosMap[c.id] = 50 + idx * 75; // Sequence spacing of 75px
    });

    // Draw branch lines first
    branchNames.forEach((bName) => {
      const color = branchColors[bName] || "#a855f7";
      const y = branchY[bName];
      
      ctx.strokeStyle = color + "22"; // very faint track
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash
      
      // Draw branch label at start of track
      ctx.fillStyle = color;
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(bName, 10, y - 8);
    });

    // Draw connections between commits
    commits.forEach((c) => {
      const startX = xPosMap[c.id];
      const startY = branchY[c.branch] || 60;

      c.parents.forEach((pId) => {
        const parent = commitMap[pId];
        if (!parent) return;
        const endX = xPosMap[pId];
        const endY = branchY[parent.branch] || 60;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Draw bezier curves for cleaner branches merge/splits
        const controlX = (startX + endX) / 2;
        ctx.bezierCurveTo(controlX, startY, controlX, endY, endX, endY);

        ctx.strokeStyle = branchColors[c.branch] || "#94a3b8";
        ctx.lineWidth = 3;
        ctx.stroke();
      });
    });

    // Draw commit nodes
    commits.forEach((c) => {
      const x = xPosMap[c.id];
      const y = branchY[c.branch] || 60;
      const color = branchColors[c.branch] || "#94a3b8";
      const isActive = branches[activeBranch] === c.id;

      // Outer glow for active commit
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = color + "44";
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Inner node circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? "#ffffff" : color;
      ctx.fill();
      ctx.strokeStyle = "#0d0d1e";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Commit hash text below
      ctx.fillStyle = "#94a3b8";
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.hash, x, y + 18);

      // Short msg preview above
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(c.message.length > 10 ? c.message.substring(0, 10) + ".." : c.message, x, y - 12);
    });

    // Draw Heads / branch tags pointing to their current commits
    Object.entries(branches).forEach(([bName, cId]) => {
      const commitX = xPosMap[cId];
      const commitY = branchY[bName] || 60;
      const color = branchColors[bName] || "#94a3b8";
      
      // Draw small branch tag flag
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(commitX - 25, commitY + 25, 50, 14, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(bName, commitX, commitY + 35);
    });
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;

    playTap();
    setHistory((prev) => [...prev, { type: "input", text: `$ ${cmd}` }]);
    setCommand("");

    // Command parser
    const args = cmd.split(" ");
    if (args[0] !== "git") {
      if (cmd === "clear") {
        setHistory([]);
        return;
      }
      if (cmd === "help") {
        showHelp();
        return;
      }
      addLog("error", `Command not found: ${args[0]}. Did you mean 'git ...'?`);
      playFail();
      return;
    }

    const sub = args[1];
    switch (sub) {
      case "commit":
        handleCommit(args);
        break;
      case "checkout":
        handleCheckout(args);
        break;
      case "branch":
        handleBranch(args);
        break;
      case "merge":
        handleMerge(args);
        break;
      case "rebase":
        handleRebase(args);
        break;
      case "log":
        handleLog();
        break;
      case "status":
        handleStatus();
        break;
      default:
        addLog("error", `git command not recognized: '${sub}'. Type 'help' for usage.`);
        playFail();
    }
  };

  const addLog = (type, text) => {
    setHistory((prev) => [...prev, { type, text }]);
  };

  const showHelp = () => {
    addLog("sys", "Available git commands:");
    addLog("sys", "  git commit -m \"<message>\" - Create a new commit on active branch");
    addLog("sys", "  git branch <branch-name>  - Create a new branch pointing to current HEAD");
    addLog("sys", "  git checkout <branch>     - Checkout an existing branch");
    addLog("sys", "  git checkout -b <branch>  - Create and checkout a new branch");
    addLog("sys", "  git merge <branch>        - Merge specified branch into active branch");
    addLog("sys", "  git rebase <branch>       - Rebase active branch onto specified branch");
    addLog("sys", "  git log                   - Display commits history");
    addLog("sys", "  git status                - Show repository status and active branch");
    addLog("sys", "  clear                     - Clear terminal history");
  };

  // Implement Git actions
  const getRandomHash = () => Math.random().toString(16).substring(2, 9);

  const handleCommit = (args) => {
    // Check for msg flag
    const mIdx = args.indexOf("-m");
    let msg = "";
    if (mIdx !== -1 && args[mIdx + 1]) {
      // Re-join remaining args as commit message
      msg = args.slice(mIdx + 1).join(" ").replace(/"/g, "");
    } else {
      msg = `Commit at ${new Date().toLocaleTimeString()}`;
    }

    const currentCommitId = branches[activeBranch];
    const newId = `c${commits.length + 1}`;
    const newCommit = {
      id: newId,
      hash: getRandomHash(),
      message: msg,
      branch: activeBranch,
      parents: currentCommitId ? [currentCommitId] : [],
    };

    setCommits((prev) => [...prev, newCommit]);
    setBranches((prev) => ({ ...prev, [activeBranch]: newId }));
    
    addLog("success", `[${activeBranch} ${newCommit.hash}] ${msg}`);
    playSuccess();
    trackExperimentInteracted("git-sim");
  };

  const handleCheckout = (args) => {
    if (args.length < 3) {
      addLog("error", "Branch name required. E.g. 'git checkout <branch-name>'");
      playFail();
      return;
    }

    if (args[2] === "-b" && args[3]) {
      const bName = args[3];
      if (branches[bName]) {
        addLog("error", `Branch '${bName}' already exists.`);
        playFail();
        return;
      }

      // Create & checkout
      const currentCommitId = branches[activeBranch];
      const colorKeys = Object.keys(BRANCH_COLORS);
      const nextColor = BRANCH_COLORS[bName] || DEFAULT_COLORS[Object.keys(branches).length % DEFAULT_COLORS.length];

      setBranches((prev) => ({ ...prev, [bName]: currentCommitId }));
      setBranchColors((prev) => ({ ...prev, [bName]: nextColor }));
      setActiveBranch(bName);
      addLog("success", `Switched to a new branch '${bName}'`);
      playSuccess();
      trackExperimentInteracted("git-sim");
    } else {
      const bName = args[2];
      if (!branches[bName]) {
        addLog("error", `Branch '${bName}' not found. Use 'git checkout -b ${bName}' to create it.`);
        playFail();
        return;
      }
      setActiveBranch(bName);
      addLog("success", `Switched to branch '${bName}'`);
      playSuccess();
    }
  };

  const handleBranch = (args) => {
    if (args.length < 3) {
      // List branches
      addLog("sys", "Local branches:");
      Object.keys(branches).forEach((b) => {
        const prefix = b === activeBranch ? "* " : "  ";
        addLog("sys", `${prefix}${b}`);
      });
      return;
    }

    const bName = args[2];
    if (branches[bName]) {
      addLog("error", `Branch '${bName}' already exists.`);
      playFail();
      return;
    }

    const currentCommitId = branches[activeBranch];
    const nextColor = BRANCH_COLORS[bName] || DEFAULT_COLORS[Object.keys(branches).length % DEFAULT_COLORS.length];

    setBranches((prev) => ({ ...prev, [bName]: currentCommitId }));
    setBranchColors((prev) => ({ ...prev, [bName]: nextColor }));
    addLog("success", `Created branch '${bName}' pointing to HEAD`);
    playSuccess();
  };

  const handleMerge = (args) => {
    const targetBranch = args[2];
    if (!targetBranch || !branches[targetBranch]) {
      addLog("error", `Branch '${targetBranch}' not found.`);
      playFail();
      return;
    }

    if (targetBranch === activeBranch) {
      addLog("sys", "Already up to date.");
      return;
    }

    const currentHeadId = branches[activeBranch];
    const targetHeadId = branches[targetBranch];

    // Create merge commit
    const newId = `c${commits.length + 1}`;
    const newCommit = {
      id: newId,
      hash: getRandomHash(),
      message: `Merge branch '${targetBranch}' into ${activeBranch}`,
      branch: activeBranch,
      parents: [currentHeadId, targetHeadId],
    };

    setCommits((prev) => [...prev, newCommit]);
    setBranches((prev) => ({ ...prev, [activeBranch]: newId }));
    
    addLog("success", `Merge made by the 'recursive' strategy.`);
    addLog("success", `[${activeBranch} ${newCommit.hash}] Merge branch '${targetBranch}'`);
    playSuccess();
    trackExperimentInteracted("git-sim");
  };

  const handleRebase = (args) => {
    const targetBranch = args[2];
    if (!targetBranch || !branches[targetBranch]) {
      addLog("error", `Branch '${targetBranch}' not found.`);
      playFail();
      return;
    }

    if (targetBranch === activeBranch) {
      addLog("sys", "Already up to date.");
      return;
    }

    // A simplified visual rebase: moves the head of the current branch to parented onto the target branch's head.
    const currentHeadId = branches[activeBranch];
    const targetHeadId = branches[targetBranch];

    // Find all commits belonging exclusively to activeBranch since divergence
    // Let's create a new rebased commit chain starting from targetHeadId
    const activeCommits = commits.filter(c => c.branch === activeBranch);
    
    if (activeCommits.length === 0) {
      // Fast forward
      setBranches(prev => ({ ...prev, [activeBranch]: targetHeadId }));
      addLog("success", `Fast-forwarded active branch to '${targetBranch}' HEAD`);
      playSuccess();
      return;
    }

    let lastParent = targetHeadId;
    const newCommitsToAdd = [];

    activeCommits.forEach((oldC) => {
      const newId = `c${commits.length + newCommitsToAdd.length + 1}`;
      newCommitsToAdd.push({
        id: newId,
        hash: getRandomHash(),
        message: `${oldC.message} (rebased)`,
        branch: activeBranch,
        parents: [lastParent],
      });
      lastParent = newId;
    });

    setCommits((prev) => [...prev, ...newCommitsToAdd]);
    setBranches((prev) => ({ ...prev, [activeBranch]: lastParent }));

    addLog("success", `Successfully rebased and updated refs/heads/${activeBranch}`);
    playSuccess();
    trackExperimentInteracted("git-sim");
  };

  const handleLog = () => {
    addLog("sys", `Commits history on branch ${activeBranch}:`);
    const historyList = [];
    
    // Simple topological walk backwards from active branch head
    let currentId = branches[activeBranch];
    const visited = new Set();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const commit = commits.find((c) => c.id === currentId);
      if (!commit) break;

      historyList.push(commit);
      // follow first parent for log listing
      currentId = commit.parents[0];
    }

    historyList.forEach((c) => {
      addLog("sys", `* commit ${c.hash} - ${c.message} (${c.branch})`);
    });
  };

  const handleStatus = () => {
    addLog("sys", `On branch ${activeBranch}`);
    addLog("sys", "Your branch is up to date with origin/remote.");
    addLog("sys", "nothing to commit, working tree clean");
  };

  const handleResetRepo = () => {
    playTap();
    setCommits([
      { id: "c1", hash: "a3f2b1c", message: "Initial commit", branch: "main", parents: [] },
    ]);
    setBranches({
      main: "c1",
    });
    setBranchColors({
      main: BRANCH_COLORS.main,
    });
    setActiveBranch("main");
    setHistory([
      { type: "sys", text: "Repository reset." },
      { type: "sys", text: "Initialized empty Git repository in /workspace" },
    ]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          Git Branch Visualizer Simulator
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Simulate standard Git commit sequences, branching and merging. Watch the commit nodes redraw on the live graphic panel!
        </p>
      </div>

      {/* Visual Canvas Panel */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 relative overflow-x-auto select-none">
        <canvas
          ref={canvasRef}
          width={650}
          height={280}
          className="block mx-auto max-w-full"
        />
        <button
          onClick={handleResetRepo}
          title="Reset Repository"
          className="absolute top-4 right-4 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/15 hover:border-red-500/40 text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal panel */}
      <div 
        onClick={focusInput}
        className="rounded-xl border border-white/8 bg-[#040410] p-4 font-mono text-xs flex flex-col gap-2 min-h-[160px] cursor-text"
      >
        <div className="flex-1 overflow-y-auto max-h-48 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {history.map((log, idx) => (
            <div
              key={idx}
              className={`leading-relaxed whitespace-pre-wrap ${
                log.type === "input"
                  ? "text-white font-bold"
                  : log.type === "success"
                  ? "text-emerald-400"
                  : log.type === "error"
                  ? "text-rose-500"
                  : "text-gray-400"
              }`}
            >
              {log.text}
            </div>
          ))}
        </div>

        {/* Input prompt line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 border-t border-white/5 pt-2 mt-2">
          <span className="text-indigo-400 flex items-center gap-1 shrink-0 select-none">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>workspace git:({activeBranch})</span>
            <span className="text-gray-500 font-normal">$</span>
          </span>
          <input
            id="git-input"
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="git commit -m 'Your message'..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-indigo-400"
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
};

export default GitSimulator;
