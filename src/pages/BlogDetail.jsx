import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Clock, Calendar, Eye, ChevronRight,
  BookOpen, Tag, Share2, Copy, Check, List, X, ChevronUp
} from "lucide-react";
import { supabase } from "../services/supabase";
import { TagBadge } from "../components/BlogCard";

/* ── Strip trailing " views" if stored as "1.2k views" in Firestore ── */
const cleanViews = (v) => (v ? String(v).replace(/\s*views$/i, "").trim() : null);

/* ── Reading progress bar ── */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5">
      <div
        className="h-full transition-all duration-100 ease-out"
        style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#a855f7,#22d3ee)" }}
      />
    </div>
  );
};

/* ── Back-to-top ── */
const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-6 z-40 p-3 rounded-2xl bg-[#6366f1]/90 hover:bg-[#6366f1] text-white shadow-xl shadow-indigo-500/30 border border-indigo-400/30 transition-all duration-300 hover:-translate-y-0.5"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  );
};

/* ── Share button ── */
const ShareButton = ({ title }) => {
  const [shared, setShared] = useState(false);
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };
  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-200 text-xs font-medium"
    >
      {shared
        ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
        : <><Share2 className="w-3.5 h-3.5" />Share</>}
    </button>
  );
};

/* ── Estimate read time from HTML ── */
const estimateReadTime = (html = "") => {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

/* ── TOC list ── */
const TocList = ({ headings, activeId, onSelect }) => (
  <nav className="space-y-0.5 animate-fadeIn">
    {headings.map(({ id, text, level }) => (
      <a
        key={id}
        href={`#${id}`}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          onSelect?.();
        }}
        className={`block text-[12px] leading-snug py-1.5 px-2 rounded-lg transition-all duration-200 font-mono
          ${level === "H3" ? "ml-3 text-[11px]" : ""}
          ${activeId === id
            ? "text-indigo-400 bg-indigo-500/10 border-l-2 border-indigo-500 pl-3"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
      >
        {text}
      </a>
    ))}
  </nav>
);

/* ── Related Blogs Component ── */
const RelatedBlogsWidget = ({ blogs, navigate }) => {
  if (!blogs || blogs.length === 0) return null;
  
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-[#0a0a1a]/80 backdrop-blur-xl animate-fadeIn">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/6">
        <BookOpen className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Related Articles</span>
      </div>
      <div className="space-y-4">
        {blogs.map((b) => (
          <div
            key={b.id}
            onClick={() => {
              navigate(`/blog/${b.slug || b.id}`);
              window.scrollTo(0, 0);
            }}
            className="group/item flex gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 animate-slideInRight"
          >
            {/* Cover image or emoji */}
            <div className="w-12 h-12 rounded-lg border border-white/10 shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
              {b.coverImg ? (
                <img src={b.coverImg} alt={b.title} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-xl group-hover/item:scale-110 transition-transform duration-300">{b.coverEmoji}</span>
              )}
            </div>
            
            {/* Title and stats */}
            <div className="min-w-0 flex-1 flex flex-col justify-between">
              <h4 className="text-[12px] font-bold text-gray-300 line-clamp-2 leading-snug group-hover/item:text-indigo-400 transition-colors font-mono">
                {b.title}
              </h4>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-500 font-mono">
                <span>{b.date}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{b.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════
   Main BlogDetail component
   ════════════════════════════════ */
const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [views, setViews] = useState(0);
  const contentRef = useRef(null);

  const [allBlogs, setAllBlogs] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({
    java: true,
    "spring-boot": true,
    dsa: true,
    "system-design": true
  });
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef(null);

  // VS Code Interactive configurations
  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem("settings-font-size") || "13.5");
  });
  const [lineNumbers, setLineNumbers] = useState(() => {
    return localStorage.getItem("settings-line-numbers") || "on";
  });
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem("settings-theme") || "dracula";
  });

  // VS Code Multi-Tab Workspace configurations
  const [openTabs, setOpenTabs] = useState(() => {
    try {
      const saved = localStorage.getItem("workspace-open-tabs");
      const parsed = saved ? JSON.parse(saved) : ["readme"];
      return parsed.includes("readme") ? parsed : ["readme", ...parsed];
    } catch (e) {
      return ["readme"];
    }
  });

  useEffect(() => {
    localStorage.setItem("workspace-open-tabs", JSON.stringify(openTabs));
  }, [openTabs]);

  useEffect(() => {
    if (id && !openTabs.includes(id)) {
      setOpenTabs(prev => [...prev, id]);
    }
  }, [id]);

  const handleCloseTab = (tabIdToClose) => {
    const nextTabs = openTabs.filter(t => t !== tabIdToClose);
    setOpenTabs(nextTabs);
    
    if (tabIdToClose === id) {
      if (nextTabs.length > 0) {
        const lastTab = nextTabs[nextTabs.length - 1];
        navigate(`/blog/${lastTab}`);
      } else {
        navigate("/blog/readme");
      }
    }
  };

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const getFileExtension = (category) => {
    if (!category) return { val: "md", icon: "📝" };
    const cat = category.toLowerCase();
    if (cat.includes("java") && !cat.includes("javascript")) {
      return { val: "java", icon: "☕" };
    }
    if (cat.includes("cpp") || cat.includes("c++") || cat.includes("dsa") || cat.includes("algorithm")) {
      return { val: "cpp", icon: "⚡" };
    }
    if (cat.includes("spring")) {
      return { val: "java", icon: "🍃" };
    }
    if (cat.includes("js") || cat.includes("javascript") || cat.includes("react")) {
      return { val: "js", icon: "🟨" };
    }
    return { val: "md", icon: "📝" };
  };

  const THEME_MAP = {
    dracula: {
      bgMain: "bg-[#12121e]",
      bgSidebar: "bg-[#0a0a0f]",
      bgHeader: "bg-[#0a0a0f]",
      textAccent: "text-[#bd93f9]",
      bgAccentAlpha: "bg-[#bd93f9]/10",
      borderAccent: "border-[#bd93f9]",
      accentHex: "#bd93f9",
      tabActive: "border-t-[#bd93f9] text-white bg-[#12121e]",
      tabInactive: "text-gray-500 bg-black/20"
    },
    nord: {
      bgMain: "bg-[#2e3440]",
      bgSidebar: "bg-[#242933]",
      bgHeader: "bg-[#242933]",
      textAccent: "text-[#88c0d0]",
      bgAccentAlpha: "bg-[#88c0d0]/10",
      borderAccent: "border-[#88c0d0]",
      accentHex: "#88c0d0",
      tabActive: "border-t-[#88c0d0] text-white bg-[#2e3440]",
      tabInactive: "text-gray-500 bg-black/25"
    },
    monokai: {
      bgMain: "bg-[#272822]",
      bgSidebar: "bg-[#1e1f1c]",
      bgHeader: "bg-[#1e1f1c]",
      textAccent: "text-[#a6e22e]",
      bgAccentAlpha: "bg-[#a6e22e]/10",
      borderAccent: "border-[#a6e22e]",
      accentHex: "#a6e22e",
      tabActive: "border-t-[#a6e22e] text-white bg-[#272822]",
      tabInactive: "text-gray-500 bg-black/30"
    }
  };
  
  const currentTheme = THEME_MAP[themeName] || THEME_MAP.dracula;

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  /* Fetch blog & list */
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      try {
        return new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch (e) {
        return dateStr;
      }
    };

    if (id === "readme") {
      const mockReadme = {
        id: "readme",
        slug: "readme",
        title: "Developer Knowledge Hub",
        description: "Dracula IDE workspace documentation for Abhishek's developer portfolio blog.",
        coverEmoji: "📝",
        categories: ["Workspace"],
        tags: ["Docs", "Overview"],
        featured: false,
        views: 404,
        bookmarks: 0,
        readTime: "2 min read",
        date: "Jun 2, 2026",
        content: `
          <div class="prose prose-invert max-w-none font-sans text-gray-300 leading-relaxed text-[13.5px]">
            <h2 class="text-xl font-bold text-[#bd93f9] mb-4 font-mono"># Abhishek's Developer Workspace</h2>
            <p class="mb-4">Welcome to my technical knowledge hub and engineering playground. This workspace is built as an interactive developer IDE where you can explore deep dives into software engineering concepts, backend mechanics, algorithms, and system design.</p>
            
            <h3 class="text-md font-bold text-white mt-6 mb-2 font-mono">## 📂 File Directory</h3>
            <ul class="list-disc pl-5 mb-4 space-y-1">
              <li><strong class="text-[#8be9fd]">Java/</strong>: Core memory management, HashMap architecture, concurrency, and JVM internals.</li>
              <li><strong class="text-[#8be9fd]">Spring Boot/</strong>: Spring Security, JWT authentication, middleware, and backend API designs.</li>
              <li><strong class="text-[#8be9fd]">DSA/</strong>: Classic algorithm analyses, complexity benchmarks, and implementation walkthroughs.</li>
              <li><strong class="text-[#8be9fd]">System Design/</strong>: High-level architectural patterns, database replication, and scalable microservices.</li>
            </ul>

            <h3 class="text-md font-bold text-white mt-6 mb-2 font-mono">## ⚙️ Interactive IDE Features</h3>
            <ul class="list-disc pl-5 mb-4 space-y-1">
              <li><strong>Left Sidebar Explorer</strong>: Expand folders and select files to navigate through technical papers dynamically.</li>
              <li><strong>Tab bar</strong>: Track open documents and close files or return to the overview workspace.</li>
              <li><strong>Status Bar & Terminal Diagnostics</strong>: Real-time logs are printed to the compiler terminal below on actions like page loads.</li>
              <li><strong>Mac-style Code Snippets</strong>: Click copy buttons on any terminal or syntax highlighted block to copy snippets.</li>
            </ul>
            
            <p class="mt-6 border-t border-white/5 pt-4 text-gray-500 font-mono text-[11px]">
              Type <code>subscribe-newsletter --email</code> in the terminal at the bottom of the landing page to receive direct updates.
            </p>
          </div>
        `
      };
      setBlog(mockReadme);
      setViews(404);
      setLoading(false);
      
      // Fetch list for explorer tree
      (async () => {
        try {
          const { data: listData } = await supabase
            .from("blogs")
            .select("id, title, categories, slug, published_date, views_count");
          if (listData) {
            setAllBlogs(listData);
          }
        } catch (e) {
          console.error("Failed to load list in readme mode:", e);
        }
      })();
      return;
    }

    if (id === "settings") {
      const mockSettings = {
        id: "settings",
        slug: "settings",
        title: "settings.json",
        description: "Configure workspace settings dynamically.",
        coverEmoji: "⚙️",
        categories: ["Config"],
        tags: ["Settings", "Config"],
        featured: false,
        views: 25,
        bookmarks: 0,
        readTime: "1 min read",
        date: "Jun 2, 2026",
        content: `
          <div class="prose prose-invert max-w-none font-sans text-gray-300 leading-relaxed text-[13.5px]">
            <h2 class="text-xl font-bold text-[#bd93f9] mb-4 font-mono"># Workspace Configuration Settings</h2>
            <p class="mb-4">Tweak user preferences in real-time to customize your editor viewing experience.</p>
            
            <div class="rounded-xl border border-white/5 bg-[#05050a] p-5 font-mono text-[13px] text-left space-y-4 my-6">
              <div class="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <div class="text-white font-bold font-mono">editor.fontSize</div>
                  <div class="text-[11px] text-gray-500">Controls the font size in pixels.</div>
                </div>
                <div class="flex items-center gap-2">
                  <button id="btn-font-dec" class="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 font-bold">-</button>
                  <span id="val-font-size" class="text-[#bd93f9] font-bold">13.5px</span>
                  <button id="btn-font-inc" class="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 font-bold">+</button>
                </div>
              </div>

              <div class="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <div class="text-white font-bold font-mono">editor.lineNumbers</div>
                  <div class="text-[11px] text-gray-500">Toggles gutter line numbers visibility.</div>
                </div>
                <div>
                  <select id="sel-line-numbers" class="bg-[#12121e] border border-white/10 rounded px-2.5 py-1 text-[#bd93f9] focus:outline-none focus:border-[#bd93f9] font-mono text-xs">
                    <option value="on">on</option>
                    <option value="off">off</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="text-white font-bold font-mono">workbench.colorTheme</div>
                  <div class="text-[11px] text-gray-500">Choose your favorite IDE workspace theme.</div>
                </div>
                <div>
                  <select id="sel-color-theme" class="bg-[#12121e] border border-white/10 rounded px-2.5 py-1 text-[#bd93f9] focus:outline-none focus:border-[#bd93f9] font-mono text-xs">
                    <option value="dracula">Dracula (Default)</option>
                    <option value="nord">Nord Frost</option>
                    <option value="monokai">Monokai Retro</option>
                  </select>
                </div>
              </div>
            </div>

            <p class="text-gray-500 font-mono text-[11px]">
              Settings are stored locally in the browser storage workspace container.
            </p>
          </div>
        `
      };
      setBlog(mockSettings);
      setViews(25);
      setLoading(false);
      
      (async () => {
        try {
          const { data: listData } = await supabase
            .from("blogs")
            .select("id, title, categories, slug, published_date, views_count");
          if (listData) {
            setAllBlogs(listData);
          }
        } catch (e) {
          console.error("Failed to load list in settings mode:", e);
        }
      })();
      return;
    }

    (async () => {
      try {
        const [
          { data: blogData, error },
          { data: listData, error: listErr }
        ] = await Promise.all([
          supabase.from("blogs").select("*").or(`id.eq.${id},slug.eq.${id}`).single(),
          supabase.from("blogs").select("id, title, categories, slug, published_date, views_count")
        ]);

        if (listData) {
          setAllBlogs(listData);
        }

        if (error || !blogData) {
          console.error("Blog query error or not found:", error);
          setBlog(null);
          setLoading(false);
          return;
        }

        const mappedBlog = {
          id: blogData.id,
          slug: blogData.slug,
          title: blogData.title,
          description: blogData.description,
          content: blogData.content,
          coverEmoji: blogData.cover_emoji || "📝",
          coverImg: blogData.cover_img_url,
          categories: blogData.categories || [],
          tags: blogData.tags || [],
          featured: blogData.featured || false,
          views: (blogData.views_count || 0) + 1,
          bookmarks: blogData.bookmarks_count || 0,
          readTime: blogData.read_time || null,
          date: formatDate(blogData.published_date)
        };

        setBlog(mappedBlog);
        setViews(mappedBlog.views);

        // Fetch related blogs from same tags / categories
        let query = supabase
          .from("blogs")
          .select("id, title, description, cover_emoji, cover_img_url, tags, published_date, views_count, slug, read_time")
          .neq("id", blogData.id);

        if (mappedBlog.tags && mappedBlog.tags.length > 0) {
          query = query.overlaps("tags", mappedBlog.tags);
        } else if (mappedBlog.categories && mappedBlog.categories.length > 0) {
          query = query.overlaps("categories", mappedBlog.categories);
        }

        const { data: relatedRaw } = await query.limit(3);

        const relatedMapped = (relatedRaw || []).map(b => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          description: b.description,
          coverEmoji: b.cover_emoji || "📝",
          coverImg: b.cover_img_url,
          tags: b.tags || [],
          views: b.views_count || 0,
          readTime: b.read_time || null,
          date: formatDate(b.published_date)
        }));

        setRelatedBlogs(relatedMapped);

        // Call RPC view increment trigger (atomic)
        await supabase.rpc("increment_blog_views", { blog_id: blogData.id });

      } catch (err) {
        console.error("Failed to load blog:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* Subscribe to realtime updates for this blog */
  useEffect(() => {
    if (!blog || blog.id === "readme" || blog.id === "settings") return;

    const channel = supabase
      .channel(`blog-realtime-${blog.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "blogs",
          filter: `id=eq.${blog.id}`
        },
        (payload) => {
          if (payload.new && payload.new.views_count !== undefined) {
            setViews(payload.new.views_count);
            const extVal = getFileExtension(payload.new.categories?.[0]).val;
            const fName = `${payload.new.slug.replace(/-/g, "_")}.${extVal}`;
            setTerminalLogs(prev => [
              ...prev,
              `[Sys]: Realtime sync event received. views_count updated to ${payload.new.views_count} for ${fName}`
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [blog?.id]);

  // Settings page event listener bindings
  useEffect(() => {
    if (id !== "settings" || !contentRef.current) return;

    const elDec = contentRef.current.querySelector("#btn-font-dec");
    const elInc = contentRef.current.querySelector("#btn-font-inc");
    const elSelLines = contentRef.current.querySelector("#sel-line-numbers");
    const elSelTheme = contentRef.current.querySelector("#sel-color-theme");
    const elFontSize = contentRef.current.querySelector("#val-font-size");

    if (elSelLines) elSelLines.value = lineNumbers;
    if (elSelTheme) elSelTheme.value = themeName;
    if (elFontSize) elFontSize.textContent = `${fontSize}px`;

    const handleDec = () => {
      const next = Math.max(11, fontSize - 0.5);
      setFontSize(next);
      localStorage.setItem("settings-font-size", String(next));
      if (elFontSize) elFontSize.textContent = `${next}px`;
    };

    const handleInc = () => {
      const next = Math.min(18, fontSize + 0.5);
      setFontSize(next);
      localStorage.setItem("settings-font-size", String(next));
      if (elFontSize) elFontSize.textContent = `${next}px`;
    };

    const handleLinesChange = (e) => {
      const val = e.target.value;
      setLineNumbers(val);
      localStorage.setItem("settings-line-numbers", val);
    };

    const handleThemeChange = (e) => {
      const val = e.target.value;
      setThemeName(val);
      localStorage.setItem("settings-theme", val);
    };

    elDec?.addEventListener("click", handleDec);
    elInc?.addEventListener("click", handleInc);
    elSelLines?.addEventListener("change", handleLinesChange);
    elSelTheme?.addEventListener("change", handleThemeChange);

    return () => {
      elDec?.removeEventListener("click", handleDec);
      elInc?.removeEventListener("click", handleInc);
      elSelLines?.removeEventListener("change", handleLinesChange);
      elSelTheme?.removeEventListener("change", handleThemeChange);
    };
  }, [id, fontSize, lineNumbers, themeName]);

  // Terminal commands interpreter
  const handleTerminalSubmit = async (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmdLine = terminalInput.trim();
    const args = cmdLine.split(/\s+/);
    const cmd = args[0].toLowerCase();
    
    setTerminalLogs(prev => [...prev, `> ${cmdLine}`]);
    setTerminalInput("");

    switch (cmd) {
      case "help":
        setTerminalLogs(prev => [
          ...prev,
          `[Sys]: Available shell commands:`,
          `  help                 - Show list of shell commands`,
          `  clear                - Clear terminal screen`,
          `  ls                   - List files in workspace`,
          `  cat <filename>       - Print content of a file`,
          `  theme <name>         - Switch color theme (dracula, nord, monokai)`,
          `  subscribe <email>    - Register newsletter subscription`
        ]);
        break;
      case "clear":
        setTerminalLogs([]);
        break;
      case "ls":
        setTerminalLogs(prev => [
          ...prev,
          `[Sys]: Listing directory contents:`,
          `  - README.md`,
          `  - settings.json`,
          ...allBlogs.map(b => {
            const extVal = getFileExtension(b.categories?.[0]).val;
            return `  - ${b.slug.replace(/-/g, "_")}.${extVal}`;
          })
        ]);
        break;
      case "cat":
        if (!args[1]) {
          setTerminalLogs(prev => [...prev, `[Compiler]: Error: File argument required. Usage: cat <filename>`]);
          break;
        }
        const fileArg = args[1].toLowerCase();
        if (fileArg === "readme.md") {
          navigate("/blog/readme");
          setTerminalLogs(prev => [...prev, `[Sys]: Opened README.md in editor.`]);
        } else if (fileArg === "settings.json") {
          navigate("/blog/settings");
          setTerminalLogs(prev => [...prev, `[Sys]: Opened settings.json in editor.`]);
        } else {
          const nameClean = fileArg.split(".")[0].replace(/_/g, "-");
          const matched = allBlogs.find(b => b.slug === nameClean || b.id === nameClean);
          if (matched) {
            navigate(`/blog/${matched.slug}`);
            setTerminalLogs(prev => [...prev, `[Sys]: Opened ${fileArg} successfully.`]);
          } else {
            setTerminalLogs(prev => [...prev, `[Compiler]: Error: File not found: ${args[1]}`]);
          }
        }
        break;
      case "theme":
        if (!args[1]) {
          setTerminalLogs(prev => [...prev, `[Compiler]: Error: Theme name required. (dracula, nord, monokai)`]);
          break;
        }
        const tVal = args[1].toLowerCase();
        if (["dracula", "nord", "monokai"].includes(tVal)) {
          setThemeName(tVal);
          localStorage.setItem("settings-theme", tVal);
          setTerminalLogs(prev => [...prev, `[Sys]: Switched workbench.colorTheme to ${tVal}`]);
        } else {
          setTerminalLogs(prev => [...prev, `[Compiler]: Error: Theme not recognized. Try 'dracula', 'nord', or 'monokai'.`]);
        }
        break;
      case "subscribe":
        if (!args[1]) {
          setTerminalLogs(prev => [...prev, `[Compiler]: Error: Email required. Usage: subscribe <email>`]);
          break;
        }
        const email = args[1];
        setTerminalLogs(prev => [...prev, `[Sys]: Registering subscriber ${email}...`]);
        try {
          const { error } = await supabase
            .from("subscribers")
            .insert([{ email }]);
          if (error) {
            if (error.code === "23505") {
              setTerminalLogs(prev => [...prev, `[Compiler]: Info: Email is already subscribed.`]);
            } else {
              setTerminalLogs(prev => [...prev, `[Compiler]: Error: ${error.message}`]);
            }
          } else {
            setTerminalLogs(prev => [...prev, `[Compiler]: Success: Registered ${email} successfully!`]);
          }
        } catch (err) {
          setTerminalLogs(prev => [...prev, `[Compiler]: Error: Subscription registry failed.`]);
        }
        break;
      default:
        setTerminalLogs(prev => [
          ...prev,
          `[Compiler]: bash: command not found: ${cmd}. Type 'help' to see options.`
        ]);
        break;
    }
  };

  /* TOC build and observe hook dependencies */
  useEffect(() => {
    if (!contentRef.current) return;
    const els = contentRef.current.querySelectorAll("h2, h3");
    const items = [];
    els.forEach((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
      items.push({ id: el.id, text: el.textContent, level: el.tagName });
    });
    setHeadings(items);
  }, [blog]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    headings.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [headings]);

  /* Process pre blocks copy logic */
  useEffect(() => {
    if (loading || !blog || !contentRef.current) return;

    const preBlocks = contentRef.current.querySelectorAll("pre");
    preBlocks.forEach((block) => {
      if (block.querySelector(".copy-code-btn") || block.parentElement.classList.contains("code-block-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper relative group/code-block rounded-xl overflow-hidden my-6 border border-white/10 bg-[#080814]";
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      const header = document.createElement("div");
      header.className = "flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-[11px] font-mono text-gray-400";
      
      const dots = document.createElement("div");
      dots.className = "flex gap-1.5";
      dots.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>`;
      
      const lang = document.createElement("span");
      lang.className = "text-gray-500 font-semibold uppercase tracking-wider ml-2 mr-auto";
      const codeEl = block.querySelector("code");
      const langClass = codeEl ? Array.from(codeEl.classList).find(c => c.startsWith("language-")) : null;
      lang.textContent = langClass ? langClass.replace("language-", "") : "code";
      
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-code-btn flex items-center gap-1 hover:text-white transition-colors duration-200";
      copyBtn.innerHTML = `<span>Copy</span>`;
      
      copyBtn.addEventListener("click", async () => {
        const text = codeEl ? codeEl.textContent : block.textContent;
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = `<span class="text-emerald-400">Copied!</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<span>Copy</span>`;
        }, 2000);
      });

      header.appendChild(dots);
      header.appendChild(lang);
      header.appendChild(copyBtn);
      wrapper.insertBefore(header, block);
      block.className = "p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-gray-300 scrollbar-thin scrollbar-thumb-white/10";
    });
  }, [blog, loading]);

  useEffect(() => {
    if (!blog) return;
    const extVal = getFileExtension(blog.categories?.[0]).val;
    const filename = `${blog.slug.replace(/-/g, "_")}.${extVal}`;
    setTerminalLogs([
      `[Sys]: Initializing Dracula Workspace v1.0.0...`,
      `[Sys]: Loading file workspace/${blog.categories?.[0]?.toLowerCase()?.replace(/\s+/g, "-") || "general"}/${filename}...`,
      `[Sys]: Resolving Markdown & HTML templates...`,
      `[Compiler]: Compiled ${filename} successfully. (Views: ${views})`
    ]);
  }, [blog, views]);

  const computedReadTime = blog ? (blog.readTime || estimateReadTime(blog.content)) : "0 min read";

  // Group all blogs for explorer tree
  const categoriesMap = {
    "Java": [],
    "Spring Boot": [],
    "DSA": [],
    "System Design": []
  };
  
  allBlogs.forEach(b => {
    const primaryCat = b.categories?.[0] || "Java";
    let matchedFolder = "Java";
    if (primaryCat.toLowerCase().includes("spring")) matchedFolder = "Spring Boot";
    else if (primaryCat.toLowerCase().includes("dsa") || primaryCat.toLowerCase().includes("algorithm")) matchedFolder = "DSA";
    else if (primaryCat.toLowerCase().includes("system") || primaryCat.toLowerCase().includes("design")) matchedFolder = "System Design";
    else if (primaryCat.toLowerCase().includes("java")) matchedFolder = "Java";
    else {
      matchedFolder = primaryCat;
    }
    if (!categoriesMap[matchedFolder]) {
      categoriesMap[matchedFolder] = [];
    }
    categoriesMap[matchedFolder].push(b);
  });

  const ext = getFileExtension(blog?.categories?.[0] || (id === "readme" ? "Workspace" : "Java"));
  const activeFilename = id === "readme" ? "README.md" : (blog ? `${blog.slug.replace(/-/g, "_")}.${ext.val}` : `${id.replace(/-/g, "_")}.${ext.val}`);

  return (
    <>
      <ReadingProgress />
      <BackToTop />

      <div className="relative min-h-screen bg-[#030014] overflow-x-hidden md:px-[8%] py-10">
        
        {/* Background ambient glows */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#bd93f9]/5 blur-[160px]" />
          <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[#8be9fd]/5 blur-[130px]" />
        </div>

        <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-[#0d0d16] overflow-hidden shadow-2xl text-gray-300 font-sans select-none animate-fadeIn">
          
          {/* ─── IDE Title Bar ─── */}
          <div className={`flex items-center justify-between px-4 py-2.5 border-b border-b-white/5 text-[11px] font-mono text-gray-500 ${currentTheme.bgHeader}`}>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => navigate("/")}
                className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-85 transition-opacity" 
                title="Close workspace (Go to Homepage)"
              />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="truncate mx-4 font-semibold text-gray-400">abhishek-portfolio &mdash; workspace/blog/{activeFilename}</div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-600 hidden sm:inline uppercase">{ext.val} editor</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase text-[9px] tracking-wide border border-white/5">Git: main</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row min-h-[600px]">
            
            {/* ─── IDE Sidebar File Explorer ─── */}
            <aside className={`w-full md:w-60 border-r border-white/5 flex flex-col font-mono text-[12px] shrink-0 ${currentTheme.bgSidebar}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-[#08080c] border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <span>Explorer</span>
              </div>
              
              <div className="p-3 space-y-1 overflow-y-auto max-h-[220px] md:max-h-[500px]">
                <div className="text-gray-400 font-bold flex items-center gap-1 py-1">
                  <span>📂</span>
                  <span>workspace/</span>
                </div>
                
                {/* Categories and files tree */}
                {Object.keys(categoriesMap).map((catName) => {
                  const catBlogs = categoriesMap[catName] || [];
                  const folderSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const isOpen = expandedFolders[folderSlug];
                  
                  return (
                    <div key={catName} className="pl-3">
                      <button 
                        onClick={() => toggleFolder(folderSlug)}
                        className="w-full text-left flex items-center gap-1.5 py-1 text-gray-400 hover:text-white hover:bg-white/5 px-1.5 rounded transition-all"
                      >
                        <span>{isOpen ? "📂" : "📁"}</span>
                        <span>{folderSlug}/</span>
                        <span className="text-[10px] text-gray-600 font-bold ml-auto">({catBlogs.length})</span>
                      </button>
                      
                      {/* Folder files */}
                      {isOpen && (
                        <div className="pl-3 border-l border-white/5 ml-1.5 space-y-0.5 mt-0.5">
                          {catBlogs.map((b) => {
                            const itemExt = getFileExtension(b.categories?.[0]);
                            const isCurrentFile = b.id === id || b.slug === id;
                            return (
                              <Link 
                                key={b.id} 
                                to={`/blog/${b.slug || b.id}`}
                                className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded transition-all truncate
                                  ${isCurrentFile 
                                    ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}` 
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                                  }`}
                                style={{ textDecoration: "none" }}
                              >
                                <span className={`text-[11px] ${isCurrentFile ? currentTheme.textAccent : "text-indigo-400/80"}`}>{itemExt.icon}</span>
                                <span className="truncate">{b.slug.replace(/-/g, "_")}.{itemExt.val}</span>
                              </Link>
                            );
                          })}
                          {catBlogs.length === 0 && (
                            <span className="text-gray-700 italic block pl-5 py-0.5">(empty)</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Readme and Config file entries */}
                <div className="pl-3 pt-2 mt-2 border-t border-white/5">
                  <Link
                    to="/blog/readme"
                    className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded transition-all truncate
                      ${id === "readme" 
                        ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}` 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className={`text-[11px] ${id === "readme" ? currentTheme.textAccent : "text-indigo-400/80"}`}>📝</span>
                    <span>README.md</span>
                  </Link>
                  <Link
                    to="/blog/settings"
                    className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded transition-all truncate
                      ${id === "settings" 
                        ? `font-bold ${currentTheme.textAccent} ${currentTheme.bgAccentAlpha}` 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className={`text-[11px] ${id === "settings" ? currentTheme.textAccent : "text-indigo-400/80"}`}>⚙️</span>
                    <span>settings.json</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* ─── IDE Main Editor Pane ─── */}
            <main className={`flex-1 flex flex-col min-w-0 ${currentTheme.bgMain}`}>
              
              {/* Editor File Tab Bar */}
              <div className={`flex border-b border-white/5 overflow-x-auto scrollbar-none shrink-0 font-mono text-[11px] ${currentTheme.bgHeader}`}>
                {openTabs.map((tabId) => {
                  const isActive = tabId === id;
                  
                  if (tabId === "readme") {
                    return (
                      <div 
                        key="readme"
                        className={`flex items-center gap-2 px-4 py-2 border-r border-white/5 shrink-0 cursor-pointer transition-all ${
                          isActive
                            ? `font-bold border-t-2 ${currentTheme.tabActive} ${currentTheme.borderAccent}`
                            : `${currentTheme.tabInactive} opacity-60 hover:opacity-100 hover:text-white`
                        }`}
                        onClick={() => navigate("/blog/readme")}
                      >
                        <span className={isActive ? currentTheme.textAccent : ""}>📝</span>
                        <span>README.md</span>
                      </div>
                    );
                  }
                  
                  if (tabId === "settings") {
                    return (
                      <div 
                        key="settings"
                        className={`flex items-center gap-2 px-4 py-2 border-r border-white/5 shrink-0 cursor-pointer transition-all ${
                          isActive
                            ? `font-bold border-t-2 ${currentTheme.tabActive} ${currentTheme.borderAccent}`
                            : `${currentTheme.tabInactive} opacity-60 hover:opacity-100 hover:text-white`
                        }`}
                        onClick={() => navigate("/blog/settings")}
                      >
                        <span className={isActive ? currentTheme.textAccent : ""}>⚙️</span>
                        <span>settings.json</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseTab("settings");
                          }}
                          className="ml-1 text-gray-600 hover:text-white transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  }
                  
                  const blogItem = allBlogs.find(b => b.id === tabId || b.slug === tabId);
                  const tabExt = getFileExtension(blogItem?.categories?.[0] || "Java");
                  const tabName = blogItem 
                    ? `${blogItem.slug.replace(/-/g, "_")}.${tabExt.val}` 
                    : `${tabId.replace(/-/g, "_")}.md`;
                    
                  return (
                    <div 
                      key={tabId}
                      className={`flex items-center gap-2 px-4 py-2 border-r border-white/5 shrink-0 cursor-pointer transition-all ${
                        isActive
                          ? `font-bold border-t-2 ${currentTheme.tabActive} ${currentTheme.borderAccent}`
                          : `${currentTheme.tabInactive} opacity-60 hover:opacity-100 hover:text-white`
                      }`}
                      onClick={() => navigate(`/blog/${tabId}`)}
                    >
                      <span className={isActive ? currentTheme.textAccent : "text-indigo-400/80"}>{tabExt.icon}</span>
                      <span>{tabName}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tabId);
                        }}
                        className="ml-1 text-gray-600 hover:text-white transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Editor Reading Frame */}
              <div className="flex-1 flex min-h-0 relative overflow-y-auto max-h-[500px] md:max-h-[650px]">
                
                {/* Gutter Line Numbers */}
                {lineNumbers === "on" && (
                  <div className="w-12 bg-black/20 border-r border-white/5 py-6 font-mono text-[11px] text-gray-600 text-right pr-3 select-none leading-relaxed shrink-0">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                )}

                {/* Prose Text Column */}
                <div className="flex-1 p-6 md:p-8 overflow-x-auto min-w-0 text-left">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center font-mono text-xs text-gray-500">
                      <div className="relative w-8 h-8">
                        <div className={`absolute inset-0 rounded-full border-2 border-white/10 animate-spin`} style={{ borderTopColor: currentTheme.accentHex }} />
                      </div>
                      <span>Compiling workspace/{activeFilename}...</span>
                    </div>
                  ) : !blog ? (
                    <div className="text-center space-y-5 p-8">
                      <p className="text-6xl">📭</p>
                      <h2 className="text-white font-black text-2xl">Article not found</h2>
                      <p className="text-gray-500 text-sm">The article you're looking for doesn't exist or was removed.</p>
                      <button onClick={() => navigate("/")}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-white/5`} style={{ borderColor: currentTheme.accentHex, color: currentTheme.accentHex }}>
                        <ArrowLeft className="w-4 h-4" /> Exit Workspace
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Article Metadata Pane */}
                      <div className="border-b border-white/5 pb-4 mb-6">
                        {blog.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {blog.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                          </div>
                        )}
                        <h1 className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                          {blog.title}
                        </h1>
                        
                        {/* Meta interaction details bar */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 font-mono w-full">
                          <span>Date: {blog.date}</span>
                          <span>•</span>
                          <span>Read: {computedReadTime}</span>
                          <span>•</span>
                          <span>Views: {views}</span>
                          <div className="ml-auto">
                            <ShareButton title={blog.title} />
                          </div>
                        </div>
                      </div>

                      {/* Intro description block */}
                      {blog.description && (
                        <div className={`mb-6 p-4 rounded border font-mono text-[13px] text-gray-300 leading-relaxed italic border-l-4 text-left`} style={{ borderColor: `${currentTheme.accentHex}30`, backgroundColor: `${currentTheme.accentHex}08`, borderLeftColor: currentTheme.accentHex }}>
                          // {blog.description}
                        </div>
                      )}

                      {/* Article content body */}
                      <div 
                        ref={contentRef} 
                        className="blog-prose" 
                        style={{ fontSize: `${fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: blog.content }} 
                      />
                    </>
                  )}
                </div>
              </div>

              {/* ─── Bottom Terminal CLI Panel ─── */}
              <div className="rounded-none border-t border-white/5 bg-[#07070a] font-mono text-[12px] shrink-0">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0f] border-b border-white/5 text-[10px] text-gray-500 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>bash terminal</span>
                  </div>
                  <span>Console Log</span>
                </div>
                
                {/* Output log pane */}
                <div className="p-4 h-[110px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/5 text-left select-text">
                  {terminalLogs.map((log, idx) => {
                    let colorClass = "text-gray-500";
                    if (log.startsWith("[Sys]")) colorClass = `${currentTheme.textAccent}`;
                    else if (log.startsWith("[Compiler]")) colorClass = "text-[#50fa7b]";
                    else if (log.startsWith("[User]")) colorClass = "text-[#8be9fd]";
                    else if (log.startsWith(">")) colorClass = "text-white";
                    return (
                      <div key={idx} className={`${colorClass} leading-relaxed`}>{log}</div>
                    );
                  })}
                  <div ref={terminalEndRef} />
                </div>

                {/* Input command box */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center border-t border-white/5 bg-black/30 px-3 py-1.5 font-mono text-xs">
                  <span className="text-[#50fa7b] shrink-0 mr-1.5">guest@abhishek-portfolio:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type 'help' to show available shell commands..."
                    className="flex-1 bg-transparent text-white border-none outline-none focus:ring-0 font-mono text-xs p-0 m-0"
                  />
                </form>
              </div>

              {/* Editor bottom status bar */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#0b0b12] border-t border-white/5 text-[10px] font-mono text-gray-600 select-none shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[#50fa7b] font-bold">SUCCESS</span>
                  <span>workspace/{blog ? blog.slug : id}</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Line count: {headings.length} headings</span>
                  <span>Spaces: 4</span>
                  <span>Ln 1, Col 1</span>
                </div>
              </div>

            </main>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .blog-prose { font-family: 'JetBrains Mono', monospace; color: #a9b2c3; line-height: 1.8; }
        .blog-prose .hero { display: none; } /* Hide duplicate heroes */
        .blog-prose h2 { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: #f8f8f2; margin: 38px 0 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(189,147,249,0.2); display: flex; align-items: center; gap: 8px; scroll-margin-top: 90px; }
        .blog-prose h2 .num { color: ${currentTheme.accentHex}; font-weight: 700; }
        .blog-prose h3 { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #cbd5e1; margin: 24px 0 12px; }
        .blog-prose p { margin-bottom: 16px; }
        .blog-prose strong { color: #ff79c6; font-weight: 700; }
        .blog-prose em { color: #f1fa8c; font-style: italic; }
        .blog-prose a { color: #8be9fd; text-decoration: none; border-bottom: 1px dashed rgba(139,233,253,0.4); }
        .blog-prose a:hover { border-bottom-style: solid; }
        .blog-prose ul, .blog-prose ol { padding-left: 20px; margin-bottom: 16px; }
        .blog-prose li { margin-bottom: 6px; }
        .blog-prose ul li::marker { color: ${currentTheme.accentHex}; }
        .blog-prose ol li::marker { color: ${currentTheme.accentHex}; font-weight: 700; }
        .blog-prose :not(pre)>code { font-family: 'JetBrains Mono', monospace; background: rgba(189,147,249,0.1); color: ${currentTheme.accentHex}; padding: 2px 6px; border-radius: 4px; font-size: 12px; border: 1px solid rgba(189,147,249,0.25); }
        .blog-prose .code-block { margin: 20px 0; }
        .blog-prose blockquote { border-left: 3px solid ${currentTheme.accentHex}; background: rgba(189,147,249,0.05); border-radius: 0 8px 8px 0; padding: 12px 18px; margin: 20px 0; color: #6272a4; font-style: italic; }
        .blog-prose blockquote p { margin: 0; }
        .blog-prose .callout { border-radius: 8px; padding: 12px 16px; margin: 20px 0; display: flex; gap: 12px; align-items: flex-start; border: 1px solid; }
        .blog-prose .callout-icon { font-size: 16px; flex-shrink: 0; }
        .blog-prose .callout-info { bg: rgba(139,233,253,0.07); border-color: rgba(139,233,253,0.2); color: #8be9fd; }
        .blog-prose .callout-tip { bg: rgba(80,250,123,0.07); border-color: rgba(80,250,123,0.2); color: #50fa7b; }
        .blog-prose .callout-warn { bg: rgba(241,250,140,0.07); border-color: rgba(241,250,140,0.2); color: #f1fa8c; }
        .blog-prose .callout-danger { bg: rgba(255,85,85,0.07); border-color: rgba(255,85,85,0.2); color: #ff5555; }
        .blog-prose .steps { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
        .blog-prose .step { display: flex; gap: 14px; align-items: flex-start; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 14px 18px; }
        .blog-prose .step-num { width: 28px; height: 28px; border-radius: 50%; background: ${currentTheme.accentHex}; color: #12121e; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .blog-prose .step-body h4 { color: #f8f8f2; font-size: 13px; font-weight: 700; margin-bottom: 2px; }
        .blog-prose .step-body p { color: #6272a4; font-size: 12px; margin: 0; }
        .blog-prose .arch { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
        .blog-prose .arch-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(189,147,249,0.15); border-radius: 8px; padding: 14px; text-align: center; }
        .blog-prose .arch-box .icon { font-size: 24px; margin-bottom: 6px; }
        .blog-prose .arch-box .label { font-size: 12px; font-weight: 700; color: #f8f8f2; margin-bottom: 2px; }
        .blog-prose .arch-box .sub { font-size: 10px; color: #6272a4; }
        .blog-prose table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12.5px; }
        .blog-prose thead tr { background: rgba(189,147,249,0.1); }
        .blog-prose th { padding: 10px 14px; text-align: left; color: ${currentTheme.accentHex}; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(189,147,249,0.25); }
        .blog-prose td { padding: 9px 14px; color: #a9b2c3; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .blog-prose tr:last-child td { border-bottom: none; }
        .blog-prose img { width: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin: 18px 0; }
        .blog-prose .summary { background: rgba(189,147,249,0.05); border: 1px solid rgba(189,147,249,0.2); border-radius: 8px; padding: 18px 22px; margin-top: 36px; }
        .blog-prose .summary h3 { color: ${currentTheme.accentHex}; font-size: 14px; margin-bottom: 10px; }
        @media(max-width:640px){
          .blog-prose .arch { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default BlogDetail;