import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Home, User, Code, MessageSquare, Mail, Terminal, 
  Gamepad2, Cpu, Moon, Sun, ShieldAlert, Copy, Check, Keyboard,
  Award, BookOpen, FileText, HelpCircle
} from "lucide-react";
import { playTap, playSuccess } from "../services/soundEffects";

const CommandPalette = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dynamicItems, setDynamicItems] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // 1. Define command actions
  const scrollToSection = (id) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const triggerPlaygroundStage = (stageId, category) => {
    setIsOpen(false);
    if (location.pathname === "/playground") {
      window.dispatchEvent(new CustomEvent("trigger-stage", { detail: { stageId, category } }));
    } else {
      navigate("/playground");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("trigger-stage", { detail: { stageId, category } }));
      }, 100);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("krabhishek0321@gmail.com");
    setCopied(true);
    playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTheme = (mode) => {
    localStorage.setItem("global-theme", mode);
    if (mode === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
    window.dispatchEvent(new CustomEvent("global-theme-changed", { detail: mode }));
    setIsOpen(false);
    playSuccess();
  };

  const toggleMatrix = () => {
    const current = localStorage.getItem("global-matrix") === "true";
    localStorage.setItem("global-matrix", (!current).toString());
    window.dispatchEvent(new CustomEvent("global-matrix-changed", { detail: !current }));
    setIsOpen(false);
    playSuccess();
  };

  const COMMANDS = [
    // Navigation
    { id: "nav-home", title: "Go to Homepage", category: "Navigation", icon: Home, action: () => {
        setIsOpen(false);
        if (location.pathname !== "/") {
          navigate("/");
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },
    { id: "nav-about", title: "Scroll to About Section", category: "Navigation", icon: User, action: () => scrollToSection("About") },
    { id: "nav-portfolio", title: "Scroll to Portfolio Work", category: "Navigation", icon: Code, action: () => scrollToSection("Portfolio") },
    { id: "nav-guestbook", title: "Scroll to Guestbook Feed", category: "Navigation", icon: MessageSquare, action: () => scrollToSection("Guestbook") },
    { id: "nav-contact", title: "Scroll to Contact Form", category: "Navigation", icon: Mail, action: () => scrollToSection("Contact") },
    { id: "nav-playground", title: "Open Interactive Playground", category: "Navigation", icon: Terminal, action: () => { navigate("/playground"); setIsOpen(false); } },

    // Mini Games
    { id: "game-escape", title: "Play Git Merge Escape Room", category: "Mini Games", icon: Gamepad2, action: () => triggerPlaygroundStage("git-escape", "games") },
    { id: "game-snake", title: "Play Bug Resolver (Snake)", category: "Mini Games", icon: Gamepad2, action: () => triggerPlaygroundStage("snake", "games") },
    { id: "game-memory", title: "Play Stack Matcher (Memory)", category: "Mini Games", icon: Gamepad2, action: () => triggerPlaygroundStage("memory", "games") },
    { id: "game-tetris", title: "Play Tetris Blocks", category: "Mini Games", icon: Gamepad2, action: () => triggerPlaygroundStage("tetris", "games") },

    // Developer Tools
    { id: "exp-regex", title: "Open Regex Visualizer", category: "Developer Tools", icon: Cpu, action: () => triggerPlaygroundStage("regex-vis", "experiments") },
    { id: "exp-sql", title: "Open SQL Sandbox Shell", category: "Developer Tools", icon: Cpu, action: () => triggerPlaygroundStage("sql-sandbox", "experiments") },
    { id: "exp-git", title: "Open Git Branch Visualizer", category: "Developer Tools", icon: Cpu, action: () => triggerPlaygroundStage("git-sim", "experiments") },
    { id: "exp-synth-piano", title: "Open Interactive Synth Piano", category: "Developer Tools", icon: Cpu, action: () => triggerPlaygroundStage("synth-piano", "experiments") },

    // Settings & Utilities
    { id: "action-dark", title: "Switch to Dark Mode", category: "System Settings", icon: Moon, action: () => toggleTheme("dark") },
    { id: "action-light", title: "Switch to Light Mode", category: "System Settings", icon: Sun, action: () => toggleTheme("light") },
    { id: "action-matrix", title: "Toggle Matrix Code Rain Effect", category: "System Settings", icon: ShieldAlert, action: () => toggleMatrix() },
    { id: "action-email", title: "Copy Developer Email", category: "Actions", icon: Copy, action: () => copyEmail() }
  ];

  // 2. Fetch projects, blogs, certificates, and notes dynamically when opened
  useEffect(() => {
    if (isOpen) {
      const loadDynamicItems = () => {
        const items = [];
        
        try {
          const cachedProj = localStorage.getItem("projects");
          const cachedCert = localStorage.getItem("certificates");
          const cachedBlog = localStorage.getItem("blogs");
          const cachedQuestions = localStorage.getItem("interview_questions");
          
          if (cachedProj) {
            const list = JSON.parse(cachedProj);
            list.forEach(p => {
              items.push({
                id: `proj-${p.id || p.slug}`,
                title: `${p.Title || p.title}`,
                category: "Projects",
                icon: Code,
                action: () => {
                  setIsOpen(false);
                  navigate(`/project/${p.slug || p.id}`);
                }
              });
            });
          }
          
          if (cachedCert) {
            const list = JSON.parse(cachedCert);
            list.forEach(c => {
              items.push({
                id: `cert-${c.id}`,
                title: `${c.Name || c.name} (Credential issued by ${c.Issuer || c.issuer})`,
                category: "Certificates",
                icon: Award,
                action: () => {
                  setIsOpen(false);
                  if (location.pathname === "/") {
                    const el = document.getElementById("Portfolio");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    window.dispatchEvent(new CustomEvent("trigger-portfolio-tab", { detail: 1 }));
                  } else {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById("Portfolio");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                      window.dispatchEvent(new CustomEvent("trigger-portfolio-tab", { detail: 1 }));
                    }, 100);
                  }
                }
              });
            });
          }

          if (cachedBlog) {
            const list = JSON.parse(cachedBlog);
            list.forEach(b => {
              const isNote = b.contentType === 'note' || b.content_type === 'note';
              items.push({
                id: `blog-${b.id || b.slug}`,
                title: isNote ? `${b.title} (Study Note)` : `${b.title || b.Title}`,
                category: isNote ? "Study Notes" : "Blogs",
                icon: isNote ? FileText : BookOpen,
                action: () => {
                  setIsOpen(false);
                  if (isNote) {
                    const primaryCat = b.categories && b.categories[0] ? b.categories[0].toLowerCase() : 'java';
                    const topicId = primaryCat.includes('spring') ? 'spring-boot' : primaryCat.replace(/\s+/g, '-');
                    navigate(`/blog/topic/${topicId}/${b.slug || b.id}`);
                  } else {
                    navigate(`/blog/${b.slug || b.id}`);
                  }
                }
              });
            });
          }

          if (cachedQuestions) {
            const list = JSON.parse(cachedQuestions);
            list.forEach(q => {
              items.push({
                id: `iq-${q.id}`,
                title: `${q.question} (Category: ${q.category} - ${q.subcategory})`,
                category: "Interview Prep",
                icon: HelpCircle,
                action: () => {
                  setIsOpen(false);
                  navigate(`/interview-prep/topic/${q.category.toLowerCase()}?q=${q.id}`);
                }
              });
            });
          }
        } catch (e) {
          console.warn("Could not load CommandPalette dynamic items:", e);
        }
        
        setDynamicItems(items);
      };
      
      loadDynamicItems();
    }
  }, [isOpen, navigate, location.pathname]);

  // 3. Keyboard shortcut triggers (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcut if typing inside input or textarea
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        playTap();
        setIsOpen(prev => !prev);
      } else if (e.key === "/") {
        e.preventDefault();
        playTap();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setActiveIndex(0);
      setSearch("");
    }
  }, [isOpen]);

  // Handle keyboard navigation inside the open palette
  const handlePanelKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      playTap();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      playTap();
      setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      playTap();
      setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
      }
    }
  };

  // Adjust scroll inside results list as selection moves
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const allCommands = [...COMMANDS, ...dynamicItems];

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Visual Floating Trigger Button in Corner */}
      <button
        onClick={() => { playTap(); setIsOpen(true); }}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full border border-white/10 bg-[#06001a]/80 hover:bg-[#6366f1]/20 hover:border-[#6366f1]/40 text-gray-400 hover:text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
        title="Open Command Palette (Ctrl+K or /)"
      >
        <Keyboard className="w-5 h-5 text-[#a78bfa] animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest hidden sm:inline uppercase text-gray-400">Ctrl+K</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#06001a]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden flex flex-col font-sans"
              onKeyDown={handlePanelKeyDown}
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/3">
                <Search className="w-5 h-5 text-gray-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
                  placeholder="Search commands, pages, or games... (e.g. /theme)"
                  className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 font-sans"
                />
                <span className="text-[10px] font-mono tracking-wider bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase shrink-0">ESC</span>
              </div>

              {/* Commands List Container */}
              <div className="max-h-[300px] overflow-y-auto p-2.5">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500 font-mono">
                    No matching commands found.
                  </div>
                ) : (
                  <div ref={listRef} className="space-y-1">
                    {filteredCommands.map((cmd, idx) => {
                      const isSelected = idx === activeIndex;
                      const CmdIcon = cmd.icon;
                      
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => { playTap(); cmd.action(); }}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`w-full text-left rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/10 border border-white/10 text-white" 
                              : "border border-transparent text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                              isSelected
                                ? "border-[#a78bfa]/40 bg-[#a78bfa]/15 text-[#a78bfa]"
                                : "border-white/5 bg-white/2 text-gray-500"
                            }`}>
                              <CmdIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{cmd.title}</p>
                              <p className="text-[9px] font-mono text-gray-500 mt-0.5 tracking-wider uppercase">{cmd.category}</p>
                            </div>
                          </div>
                          
                          {/* Helper badges */}
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              {cmd.id === "action-email" && copied && (
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Copied!
                                </span>
                              )}
                              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase select-none">
                                ↵ Enter
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer navigation cues */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/2 text-[10px] font-mono text-gray-500 select-none">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="bg-white/10 px-1 py-0.5 rounded text-gray-400">↑↓</span> Navigate</span>
                  <span className="flex items-center gap-1"><span className="bg-white/10 px-1 py-0.5 rounded text-gray-400">↵</span> Select</span>
                </div>
                <span>Shortcut: Press <code className="bg-white/10 px-1 py-0.5 rounded text-gray-400">/</code> anywhere</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandPalette;
