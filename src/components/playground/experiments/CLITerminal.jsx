import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, HelpCircle, Power } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail, playPower } from "../../../services/soundEffects";

const FILE_SYSTEM = {
  "skills.txt": "Core Technologies:\n- Frontend: React, Next.js, HTML5, CSS3, TailwindCSS\n- Backend: Java, Node.js, Spring Boot, Express\n- Databases: PostgreSQL, MongoDB, Redis\n- Tooling: Git, Docker, AWS, Linux Shells",
  "contact.json": "{\n  \"email\": \"abhishek@example.com\",\n  \"github\": \"https://github.com/abhishek\",\n  \"linkedin\": \"https://linkedin.com/in/abhishek\",\n  \"status\": \"Available for projects\"\n}",
  "about_me.md": "# Abhishek\n\nFull Stack Developer dedicated to building highly efficient, interactive web interfaces.\nLove working on canvas physics, graphics, systems programming and optimization.\nType 'skills.txt' or 'contact.json' to see more details.",
};

const CLITerminal = () => {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([
    { type: "sys", text: "Abhishek OS v5.2.1-lts-amd64" },
    { type: "sys", text: "Welcome to the interactive portfolio terminal." },
    { type: "sys", text: "Type 'help' to see list of available commands." },
  ]);

  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [matrixTimer, setMatrixTimer] = useState(0);
  
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on console click
  const focusConsole = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  // Matrix Screen Rain effect
  useEffect(() => {
    if (!isMatrixMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    const katakana = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphabet = katakana.split("");

    const fontSize = 11;
    const columns = canvas.width / fontSize;

    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0f0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 30);
    return () => clearInterval(interval);
  }, [isMatrixMode]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;

    playTap();
    setHistory((prev) => [...prev, { type: "input", text: `guest@abhishek-portfolio:~$ ${cmd}` }]);
    setCommand("");

    const args = cmd.toLowerCase().split(/\s+/);
    const primary = args[0];

    switch (primary) {
      case "help":
        showHelp();
        break;
      case "clear":
        setHistory([]);
        break;
      case "ls":
        addLog("sys", "Current directory contents:\nabout_me.md    contact.json    skills.txt");
        playSuccess();
        break;
      case "cat":
        handleCat(args);
        break;
      case "sudo":
        handleSudo(args);
        break;
      case "curl":
        handleCurl(args);
        break;
      default:
        addLog("error", `bash: command not found: ${primary}. Type 'help' for usage.`);
        playFail();
    }

    trackExperimentInteracted("cli-term");
  };

  const addLog = (type, text) => {
    setHistory((prev) => [...prev, { type, text }]);
  };

  const showHelp = () => {
    addLog("sys", "Available Shell Commands:");
    addLog("sys", "  ls           - List available files");
    addLog("sys", "  cat <file>   - Read the contents of a file (e.g. cat skills.txt)");
    addLog("sys", "  curl <url>   - Make a mock URL request (e.g. curl abhishek.dev)");
    addLog("sys", "  clear        - Clear console history");
    addLog("sys", "  help         - Show commands details");
    addLog("sys", "  sudo <cmd>   - Execute a command with superuser privileges");
  };

  const handleCat = (args) => {
    const filename = args[1];
    if (!filename) {
      addLog("error", "cat: filename argument required. E.g. 'cat skills.txt'");
      playFail();
      return;
    }

    if (FILE_SYSTEM[filename]) {
      addLog("success", FILE_SYSTEM[filename]);
      playSuccess();
    } else {
      addLog("error", `cat: ${filename}: No such file or directory. Try 'ls' to see files.`);
      playFail();
    }
  };

  const handleCurl = (args) => {
    const url = args[1];
    if (!url) {
      addLog("error", "curl: URL parameter missing. E.g. 'curl abhishek.dev'");
      playFail();
      return;
    }

    const host = url.replace(/(^\w+:|^)\/\//, "");
    if (host.includes("abhishek.dev") || host.includes("portfolio")) {
      addLog("success", "HTTP/1.1 200 OK\nContent-Type: text/plain\n\n" +
        "   ___  __    _     _     _              \n" +
        "  / _ \\/ /_  | |__ | |__ (_)___  ___  ___\n" +
        " / /_\\/ '_ \\ | '_ \\| '_ \\| / __|/ _ \\/ __|\n" +
        "/ /_\\\\| (_) || | | | | | | \\__ \\  __/ (__ \n" +
        "\\____/ \\___/ |_| |_|_| |_|_|___/\\___|\\___|\n" +
        "\nDeveloper bio, skills, and coding animations online."
      );
      playSuccess();
    } else {
      addLog("sys", `curl: (6) Could not resolve host: ${url}. Try 'curl abhishek.dev'`);
      playFail();
    }
  };

  const handleSudo = (args) => {
    const target = args.slice(1).join(" ");
    if (target === "rm -rf /") {
      playPower();
      setIsMatrixMode(true);
      addLog("error", "WARNING: ROOT HARD DRIVE REMOVAL INITIATED!");
      addLog("error", "Executing 'rm -rf /' as ROOT. Core sectors corrupted.");
      
      // Perform sequence down
      setTimeout(() => {
        setIsMatrixMode(false);
        setHistory([
          { type: "sys", text: "Abhishek OS v5.2.1-lts-amd64" },
          { type: "sys", text: "System successfully rebooted. RAM sectors clean." },
          { type: "sys", text: "Type 'help' to see list of available commands." },
        ]);
        playSuccess();
      }, 3500);
    } else {
      addLog("error", "guest is not in the sudoers file. This incident will be reported.");
      playFail();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-indigo-400" />
          Retro Linux CLI Shell
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Explore the directory files using standard Linux shell actions. Warning: Executing root commands might cause instabilities!
        </p>
      </div>

      {/* Terminal Board wrapper */}
      <div 
        onClick={focusConsole}
        className="rounded-xl border border-emerald-500/20 bg-[#030704] p-4 font-mono text-[11px] text-emerald-400 min-h-[260px] flex flex-col justify-between cursor-text relative overflow-hidden shadow-2xl shadow-emerald-950/10"
      >
        {isMatrixMode ? (
          <div className="absolute inset-0 bg-black flex flex-col justify-between">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-4 left-4 text-rose-500 font-bold bg-black/80 px-3 py-1 rounded border border-rose-500/30 animate-pulse flex items-center gap-1.5">
              <Power className="w-3 h-3" />
              <span>SYSTEM REBOOTING IN 3 SECONDS...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto max-h-56 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-emerald-900/35">
              {history.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    log.type === "input"
                      ? "text-white font-bold"
                      : log.type === "success"
                      ? "text-emerald-300"
                      : log.type === "error"
                      ? "text-rose-500 font-bold animate-shake"
                      : "text-emerald-500/80"
                  }`}
                >
                  {log.text}
                </div>
              ))}
            </div>

            {/* Input field */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-1.5 border-t border-emerald-950 pt-2 mt-2">
              <span className="text-emerald-500/60 select-none">guest@abhishek-portfolio:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="type 'help' to start..."
                className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-emerald-900/50"
                autoComplete="off"
                spellCheck="false"
              />
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CLITerminal;
