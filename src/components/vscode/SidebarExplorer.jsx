import React, { useState } from "react";
import { ChevronDown, ChevronRight, Search, GitBranch, Check, X } from "lucide-react";

const getFolderSegments = (blog) => {
  if (!blog.categories || blog.categories.length === 0) {
    return ["Java"];
  }
  const firstCat = blog.categories[0];
  if (typeof firstCat === "string" && firstCat.includes("/")) {
    return firstCat.split("/").map(s => s.trim()).filter(Boolean);
  }
  return blog.categories.map(s => s.trim()).filter(Boolean);
};

const buildFileTree = (blogs) => {
  const root = { name: "Root", key: "root", path: "", children: {}, files: [] };

  const defaults = ["Java", "Spring Boot", "DSA", "System Design"];
  defaults.forEach(folderName => {
    const key = folderName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    root.children[key] = {
      name: folderName,
      key: key,
      path: key,
      children: {},
      files: []
    };
  });

  blogs.forEach((blog) => {
    const segments = getFolderSegments(blog);
    let current = root;
    let currentPath = "";

    segments.forEach((seg) => {
      let key = seg.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      if (key.includes("spring")) key = "spring-boot";
      else if (key.includes("dsa") || key.includes("algorithm")) key = "dsa";
      else if (key.includes("system") || key.includes("design")) key = "system-design";
      else if (key.includes("java") && !key.includes("javascript")) key = "java";

      currentPath = currentPath ? `${currentPath}/${key}` : key;

      let displayName = seg;
      if (key === "spring-boot") displayName = "Spring Boot";
      else if (key === "dsa") displayName = "DSA";
      else if (key === "system-design") displayName = "System Design";
      else if (key === "java") displayName = "Java";

      if (!current.children[key]) {
        current.children[key] = {
          name: displayName,
          key: key,
          path: currentPath,
          children: {},
          files: [],
        };
      }
      current = current.children[key];
    });

    current.files.push(blog);
  });

  return root;
};

const SidebarExplorer = ({
  allBlogs,
  activeFileId,
  expandedFolders,
  toggleFolder,
  getFileExtension,
  currentTheme,
  headings,
  activeHeadingId,
  onFileSelect,
  activeView = "explorer",
  onGitCommit,
  onSidebarClose
}) => {
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(true);

  // Search Sidebar panel states
  const [sidebarSearchText, setSidebarSearchText] = useState("");
  
  // Git commit states
  const [commitMsg, setCommitMsg] = useState("");
  const [gitStatus, setGitStatus] = useState("modified"); // "modified" or "committed"

  const renderFolderNode = (node) => {
    return Object.keys(node.children).map((key) => {
      const child = node.children[key];
      const isFolderOpen = !!expandedFolders[child.path];
      
      const countFiles = (n) => {
        let count = n.files.length;
        Object.keys(n.children).forEach(k => {
          count += countFiles(n.children[k]);
        });
        return count;
      };
      
      const totalFilesCount = countFiles(child);

      return (
        <div key={child.path} className="pl-3">
          <button
            onClick={() => toggleFolder(child.path)}
            className="w-full text-left flex items-center gap-1.5 py-0.5 text-gray-400 hover:text-white hover:bg-white/5 px-1.5 rounded transition-all font-mono"
          >
            {isFolderOpen ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
            <span>{isFolderOpen ? "📂" : "📁"}</span>
            <span className="truncate">{child.name}</span>
            <span className="text-[10px] text-gray-600 font-bold ml-auto shrink-0">
              ({totalFilesCount})
            </span>
          </button>

          {isFolderOpen && (
            <div className="pl-3 border-l border-white/5 ml-2.5 space-y-0.5 mt-0.5">
              {renderFolderNode(child)}
              
              {child.files.map((b) => {
                const itemExt = getFileExtension(b.categories?.[0]);
                const isCurrentFile = b.id === activeFileId || b.slug === activeFileId;
                
                return (
                  <button
                    key={b.id}
                    onClick={() => onFileSelect(b.slug || b.id)}
                    className={`w-full text-left flex items-center gap-1.5 py-0.5 px-2 rounded transition-all truncate
                      ${isCurrentFile
                        ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}`
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <span className={`text-[11px] shrink-0 ${isCurrentFile ? currentTheme.textAccent : "text-indigo-400/80"}`}>
                      {itemExt.icon}
                    </span>
                    <span className="truncate font-mono">
                      {(b.slug || b.id || "").replace(/-/g, "_")}.{itemExt.val}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const handleOutlineHeadingClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCommitSubmit = (e) => {
    e.preventDefault();
    if (!commitMsg.trim()) return;
    setGitStatus("committed");
    if (onGitCommit) {
      onGitCommit(commitMsg.trim());
    }
    setCommitMsg("");
  };

  // ────────────────────────────────────────────────────────
  // Render search panel view
  // ────────────────────────────────────────────────────────
  if (activeView === "search") {
    const searchFiltered = allBlogs.filter(b => 
      b.title.toLowerCase().includes(sidebarSearchText.toLowerCase()) ||
      b.categories?.some(c => c.toLowerCase().includes(sidebarSearchText.toLowerCase()))
    );

    return (
      <aside className={`absolute md:static left-12 md:left-auto top-0 bottom-0 z-20 md:z-auto w-[calc(100%-48px)] md:w-60 border-r border-white/5 flex flex-col font-mono text-[12px] shrink-0 select-none bg-[#0b0b14]/98 md:${currentTheme.bgSidebar} h-full shadow-2xl md:shadow-none backdrop-blur-md md:backdrop-blur-none`}>
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
          <span>Search: workspace</span>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onSidebarClose?.(); }} 
            className="md:hidden p-0.5 hover:bg-white/10 hover:text-white rounded transition-colors"
            title="Close Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-3 flex-1 overflow-y-auto">
          <div className="relative font-mono">
            <input
              type="text"
              value={sidebarSearchText}
              onChange={(e) => setSidebarSearchText(e.target.value)}
              placeholder="Search words..."
              className="w-full pl-8 pr-3 py-1 bg-black/30 border border-white/10 rounded text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-[#bd93f9]/50 transition-all font-mono"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          </div>
          <div className="text-[10px] text-gray-600 uppercase font-bold border-b border-white/5 pb-1">
            Search Results ({searchFiltered.length})
          </div>
          <div className="space-y-1">
            {searchFiltered.length > 0 ? (
              searchFiltered.map(b => {
                const ext = getFileExtension(b.categories?.[0]);
                return (
                  <button
                    key={b.id}
                    onClick={() => onFileSelect(b.slug || b.id)}
                    className="w-full text-left py-1 hover:bg-white/5 px-2 rounded text-gray-400 hover:text-white transition-colors truncate block font-mono"
                  >
                    <span className="mr-1">{ext.icon}</span>
                    <span className="truncate">{(b.slug || b.id || "").replace(/-/g, "_")}.{ext.val}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-gray-700 italic block py-2">No matching files</span>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // ────────────────────────────────────────────────────────
  // Render Source Control (Git) panel view
  // ────────────────────────────────────────────────────────
  if (activeView === "git") {
    return (
      <aside className={`absolute md:static left-12 md:left-auto top-0 bottom-0 z-20 md:z-auto w-[calc(100%-48px)] md:w-60 border-r border-white/5 flex flex-col font-mono text-[12px] shrink-0 select-none bg-[#0b0b14]/98 md:${currentTheme.bgSidebar} h-full shadow-2xl md:shadow-none backdrop-blur-md md:backdrop-blur-none`}>
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
          <span>Source Control</span>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onSidebarClose?.(); }} 
            className="md:hidden p-0.5 hover:bg-white/10 hover:text-white rounded transition-colors"
            title="Close Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-3 flex-1 flex flex-col min-h-0">
          <form onSubmit={handleCommitSubmit} className="space-y-2 shrink-0">
            <textarea
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="Commit message (Ctrl+Enter to commit)"
              disabled={gitStatus === "committed"}
              className="w-full bg-black/30 border border-white/10 rounded p-2 text-[11px] text-white focus:outline-none focus:border-[#bd93f9]/50 placeholder-gray-700 font-mono resize-none h-16 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!commitMsg.trim() || gitStatus === "committed"}
              className="w-full py-1 rounded font-bold text-xs transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: gitStatus === "committed" ? "rgba(80,250,123,0.15)" : currentTheme.accentHex,
                color: gitStatus === "committed" ? "#50fa7b" : "#12121e"
              }}
            >
              {gitStatus === "committed" ? (
                <><Check className="w-3.5 h-3.5" /> Committed</>
              ) : (
                <><GitBranch className="w-3.5 h-3.5" /> Commit to main</>
              )}
            </button>
          </form>

          <div className="text-[10px] text-gray-600 uppercase font-bold border-b border-white/5 pb-1 mt-4 shrink-0">
            Changes ({gitStatus === "committed" ? 0 : 3})
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 text-[11px]">
            {gitStatus === "committed" ? (
              <span className="text-gray-700 italic block py-2 text-center">No uncommitted changes</span>
            ) : (
              <>
                <div className="flex items-center justify-between py-0.5 px-1 bg-white/5 rounded text-gray-400 font-mono">
                  <span className="truncate">📂 src/Pages/ABOUT_ME.md</span>
                  <span className="text-emerald-500 font-black text-[9px] px-1 bg-emerald-500/10 border border-emerald-500/30 rounded shrink-0">U</span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 bg-white/5 rounded text-gray-400 font-mono">
                  <span className="truncate">📂 src/services/supabase.js</span>
                  <span className="text-amber-500 font-black text-[9px] px-1 bg-amber-500/10 border border-amber-500/30 rounded shrink-0">M</span>
                </div>
                <div className="flex items-center justify-between py-0.5 px-1 bg-white/5 rounded text-gray-400 font-mono">
                  <span className="truncate">📂 src/sections/Portfolio.jsx</span>
                  <span className="text-amber-500 font-black text-[9px] px-1 bg-amber-500/10 border border-amber-500/30 rounded shrink-0">M</span>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // ────────────────────────────────────────────────────────
  // Render Extensions panel view
  // ────────────────────────────────────────────────────────
  if (activeView === "extensions") {
    const extList = [
      { name: "Dracula Official", desc: "Dracula color scheme for workbench.", ver: "v2.24", rating: "★★★★★", aut: "dracula-theme" },
      { name: "Spring Boot Tools", desc: "Spring Boot configuration tool support.", ver: "v1.45", rating: "★★★★☆", aut: "Pivotal" },
      { name: "C/C++ Extension", desc: "IntelliSense and debugging wrappers.", ver: "v1.8.0", rating: "★★★★★", aut: "Microsoft" },
      { name: "Markdown All in One", desc: "Markdown formatting compiler assets.", ver: "v3.5.2", rating: "★★★★☆", aut: "yzhang" }
    ];

    return (
      <aside className={`absolute md:static left-12 md:left-auto top-0 bottom-0 z-20 md:z-auto w-[calc(100%-48px)] md:w-60 border-r border-white/5 flex flex-col font-mono text-[12px] shrink-0 select-none bg-[#0b0b14]/98 md:${currentTheme.bgSidebar} h-full shadow-2xl md:shadow-none backdrop-blur-md md:backdrop-blur-none`}>
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
          <span>Extensions: Marketplace</span>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onSidebarClose?.(); }} 
            className="md:hidden p-0.5 hover:bg-white/10 hover:text-white rounded transition-colors"
            title="Close Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-3 flex-1 overflow-y-auto">
          <div className="relative font-mono">
            <input
              type="text"
              placeholder="Search extensions..."
              className="w-full pl-8 pr-3 py-1 bg-black/30 border border-white/10 rounded text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-[#bd93f9]/50 transition-all font-mono"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          </div>
          <div className="text-[10px] text-gray-600 uppercase font-bold border-b border-white/5 pb-1">
            Installed Extensions ({extList.length})
          </div>
          <div className="space-y-3">
            {extList.map(ext => (
              <div key={ext.name} className="border-b border-white/5 pb-2 last:border-b-0">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-300">{ext.name}</span>
                  <span className="text-[9px] text-[#50fa7b] bg-[#50fa7b]/10 border border-[#50fa7b]/20 px-1 rounded shrink-0">Installed</span>
                </div>
                <div className="text-[10px] text-gray-500 leading-snug mt-0.5">{ext.desc}</div>
                <div className="flex items-center justify-between text-[9px] text-gray-600 mt-1">
                  <span>Author: {ext.aut}</span>
                  <span>{ext.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // ────────────────────────────────────────────────────────
  // Default View: Explorer Panel (Explorer & Profile active)
  // ────────────────────────────────────────────────────────
  return (
    <aside className={`absolute md:static left-12 md:left-auto top-0 bottom-0 z-20 md:z-auto w-[calc(100%-48px)] md:w-60 border-r border-white/5 flex flex-col font-mono text-[12px] shrink-0 select-none bg-[#0b0b14]/98 md:${currentTheme.bgSidebar} h-full shadow-2xl md:shadow-none backdrop-blur-md md:backdrop-blur-none`}>
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
        <span>Explorer: abhishek-portfolio</span>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onSidebarClose?.(); }} 
          className="md:hidden p-0.5 hover:bg-white/10 hover:text-white rounded transition-colors"
          title="Close Sidebar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* ── Section 1: Files Explorer ── */}
        <div className="flex flex-col">
          <button
            onClick={() => setExplorerOpen(!explorerOpen)}
            className="w-full text-left px-3 py-1.5 bg-white/5 hover:bg-white/10 flex items-center gap-1 text-[10.5px] font-bold text-gray-400 tracking-wide uppercase border-b border-white/5"
          >
            {explorerOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>Abhishek-Portfolio [Workspace]</span>
          </button>

          {explorerOpen && (
            <div className="p-2 space-y-1 pl-4">
              <div className="text-gray-400 font-bold flex items-center gap-1.5 py-0.5">
                <ChevronDown className="w-3 h-3 text-gray-500" />
                <span>📂 workspace</span>
              </div>

              {/* Collapsible Categories Folders */}
              {renderFolderNode(buildFileTree(allBlogs))}

              {/* README.md, ABOUT_ME.md, and settings.json root configurations */}
              <div className="pl-3 pt-2 mt-2 border-t border-white/5 space-y-0.5">
                <button
                  onClick={() => onFileSelect("readme")}
                  className={`w-full text-left flex items-center gap-1.5 py-0.5 px-2 rounded transition-all truncate
                    ${activeFileId === "readme"
                      ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}`
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <ChevronRight className="w-3 h-3 text-transparent" />
                  <span className={`text-[11px] shrink-0 ${activeFileId === "readme" ? currentTheme.textAccent : "text-indigo-400/80"}`}>
                    📝
                  </span>
                  <span className="font-mono">README.md</span>
                </button>

                <button
                  onClick={() => onFileSelect("about_me")}
                  className={`w-full text-left flex items-center gap-1.5 py-0.5 px-2 rounded transition-all truncate
                    ${activeFileId === "about_me"
                      ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}`
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <ChevronRight className="w-3 h-3 text-transparent" />
                  <span className={`text-[11px] shrink-0 ${activeFileId === "about_me" ? currentTheme.textAccent : "text-indigo-400/80"}`}>
                    👨‍💻
                  </span>
                  <span className="font-mono">ABOUT_ME.md</span>
                </button>
                
                <button
                  onClick={() => onFileSelect("settings")}
                  className={`w-full text-left flex items-center gap-1.5 py-0.5 px-2 rounded transition-all truncate
                    ${activeFileId === "settings"
                      ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}`
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <ChevronRight className="w-3 h-3 text-transparent" />
                  <span className={`text-[11px] shrink-0 ${activeFileId === "settings" ? currentTheme.textAccent : "text-indigo-400/80"}`}>
                    ⚙️
                  </span>
                  <span className="font-mono">settings.json</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Outline (TOC) ── */}
        <div className="flex flex-col border-t border-white/5 mt-2 shrink-0">
          <button
            onClick={() => setOutlineOpen(!outlineOpen)}
            className="w-full text-left px-3 py-1.5 bg-white/5 hover:bg-white/10 flex items-center gap-1 text-[10.5px] font-bold text-gray-400 tracking-wide uppercase border-b border-white/5"
          >
            {outlineOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>Outline</span>
          </button>

          {outlineOpen && (
            <div className="p-2 space-y-1.5 pl-4 max-h-[220px] overflow-y-auto font-mono text-[11px]">
              {headings.length > 0 ? (
                headings.map(({ id, text, level }) => {
                  const isHeadingActive = activeHeadingId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleOutlineHeadingClick(id)}
                      className={`w-full text-left flex items-center gap-1 py-0.5 px-1.5 rounded transition-all truncate
                        ${level === "H3" ? "pl-4 text-[10px]" : ""}
                        ${isHeadingActive
                          ? `${currentTheme.textAccent} ${currentTheme.bgAccentAlpha} font-bold`
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                    >
                      <span className="text-[10px] text-gray-600 font-bold shrink-0">
                        {level === "H3" ? "└" : "#"}
                      </span>
                      <span className="truncate leading-snug">{text}</span>
                    </button>
                  );
                })
              ) : (
                <span className="text-gray-700 italic block pl-2 py-0.5">
                  No symbols found
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarExplorer;
