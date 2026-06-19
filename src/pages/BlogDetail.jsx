import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Eye, Clock, Calendar, Share2, Check, Bookmark, 
  ChevronRight, ChevronDown, BookOpen, Search, Menu, X, ArrowRight, ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import blogsIndex from "../data/blogs-index.json";
import MarkdownRenderer from "../components/blog/MarkdownRenderer";

// ======================== TOPICS TO CATEGORY MAP ========================
const TOPIC_MAP = {
  "java": "Java",
  "spring-boot": "Spring Boot",
  "dsa": "DSA",
  "system-design": "System Design",
  "javascript": "JavaScript",
  "react": "React",
  "database": "Database",
  "oops": "OOPs",
  "interview-questions": "Interview Prep",
  "projects": "Projects"
};

// ======================== HELPER: CLEAN VIEWS ========================
const cleanViews = (v) => (v ? String(v).replace(/\s*views$/i, "").trim() : "0");

const BlogDetail = () => {
  const { id, topicId, blogId } = useParams();
  const navigate = useNavigate();
  const contentContainerRef = useRef(null);

  // Layout mode indicators
  const isWorkbench = !!topicId;
  const activeTopicId = topicId ? topicId.toLowerCase() : "";
  const activeTopic = topicId
    ? (TOPIC_MAP[activeTopicId] || topicId)
    : "";

  // Core state
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBlogs, setAllBlogs] = useState([]);
  const [views, setViews] = useState(0);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Layout navigation states
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const [headingsList, setHeadingsList] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [localSearch, setLocalSearch] = useState("");

  // Mobile menu states
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fontSize = 15;
  const lineNumbers = "on";

  // ======================== DATA LOADING ========================
  useEffect(() => {
    window.scrollTo(0, 0);
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo(0, 0);
    }
    loadBlogData();
  }, [id, topicId, blogId]);

  const loadBlogData = async () => {
    setLoading(true);
    setCopied(false);
    
    // Set sidebar lists immediately from imported blogsIndex
    setAllBlogs(blogsIndex || []);

    const cleanId = isWorkbench ? blogId : id;
    
    if (isWorkbench && !blogId) {
      // In workspace but no specific blog selected
      setBlog(null);
      setLoading(false);
      return;
    }

    if (!cleanId) {
      setBlog(null);
      setLoading(false);
      return;
    }

    // Find the blog metadata in the catalog
    const blogMeta = (blogsIndex || []).find(b => b.id === cleanId || b.slug === cleanId);
    if (!blogMeta) {
      console.error("Requested blog metadata not found in index:", cleanId);
      setBlog(null);
      setLoading(false);
      return;
    }

    const targetTopicId = blogMeta.topicId;
    const targetSlug = blogMeta.slug;

    try {
      // Fetch the raw markdown content dynamically from public directory
      const response = await fetch(`/blogs/${targetTopicId}/${targetSlug}.md`);
      if (!response.ok) {
        throw new Error(`Failed to fetch markdown file from /blogs/${targetTopicId}/${targetSlug}.md`);
      }
      
      const rawText = await response.text();
      
      // Parse YAML frontmatter if present (strip it out for rendering)
      let cleanContent = rawText;
      if (rawText.startsWith("---")) {
        const nextDashIndex = rawText.indexOf("---", 3);
        if (nextDashIndex !== -1) {
          cleanContent = rawText.slice(nextDashIndex + 3).trim();
        }
      }

      const mapped = {
        id: blogMeta.id,
        slug: blogMeta.slug,
        title: blogMeta.title,
        description: blogMeta.description,
        content: cleanContent,
        coverEmoji: blogMeta.coverEmoji || "📝",
        coverImg: blogMeta.coverImage,
        categories: blogMeta.categories || [blogMeta.category || "General"],
        tags: blogMeta.tags || [],
        readTime: blogMeta.readTime || "5 min read",
        date: new Date(blogMeta.publishedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        views: blogMeta.views || 0
      };
      
      setBlog(mapped);
      setViews(mapped.views + 1);
    } catch (e) {
      console.error("Failed to load blog data:", e);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  // ======================== TABLE OF CONTENTS POPULATION ========================
  useEffect(() => {
    if (loading || !blog || !contentContainerRef.current) return;

    // Grab H2 & H3 elements
    const elements = contentContainerRef.current.querySelectorAll("h2[id], h3[id]");
    const headings = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent.replace(/^#+\s*/, ""),
      level: el.tagName.toLowerCase()
    }));
    setHeadingsList(headings);

    // Setup intersection observer to track active header during scrolling
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveHeadingId(visible[0].target.id);
        }
      },
      { 
        root: contentContainerRef.current,
        rootMargin: "-20px 0px -70% 0px" 
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [blog, loading]);

  // ======================== TREE BUILDER (Left Sidebar) ========================
  // Determine active category for left directory tree
  const targetTopic = isWorkbench 
    ? activeTopic 
    : (blog && blog.categories && blog.categories[0] ? blog.categories[0] : "");

  // Filter all blogs to show only those belonging to the current main category
  const topicBlogs = allBlogs.filter(b => 
    b.categories && b.categories[0] && (
      b.categories[0].toLowerCase() === targetTopic.toLowerCase() ||
      (targetTopic.toLowerCase() === "spring boot" && b.categories[0].toLowerCase().includes("spring"))
    )
  );

  // Group these topic blogs by subtopic (categories[1] || "General")
  const subtopicGroups = {};
  topicBlogs.forEach(b => {
    const sub = b.categories[1] || "General";
    if (!subtopicGroups[sub]) {
      subtopicGroups[sub] = [];
    }
    subtopicGroups[sub].push(b);
  });

  // Pre-expand folders
  useEffect(() => {
    if (Object.keys(subtopicGroups).length > 0) {
      const defaults = {};
      Object.keys(subtopicGroups).forEach(sub => {
        defaults[sub] = true;
      });
      setExpandedFolders(prev => ({ ...defaults, ...prev }));
    }
  }, [allBlogs, blog, targetTopic]);

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Filter sidebar entries if localSearch exists
  const getFilteredSubtopicGroups = () => {
    if (!localSearch) return subtopicGroups;
    const query = localSearch.toLowerCase().trim();
    const filtered = {};
    
    Object.keys(subtopicGroups).forEach(sub => {
      const matched = subtopicGroups[sub].filter(b => 
        b.title.toLowerCase().includes(query) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(query)))
      );
      if (matched.length > 0) {
        filtered[sub] = matched;
      }
    });
    return filtered;
  };

  const filteredGroups = getFilteredSubtopicGroups();

  // ======================== RELATED / NEXT PREV NAVIGATION ========================
  // Linear order list of articles in this topic
  const flatTopicList = Object.keys(subtopicGroups).flatMap(sub => subtopicGroups[sub]);
  const currentCleanId = isWorkbench ? blogId : id;
  const currentIndex = flatTopicList.findIndex(b => b.slug === currentCleanId || b.id === currentCleanId);
  const prevBlog = currentIndex > 0 ? flatTopicList[currentIndex - 1] : null;
  const nextBlog = currentIndex !== -1 && currentIndex < flatTopicList.length - 1 ? flatTopicList[currentIndex + 1] : null;

  // Related articles (randomly selected 2 articles from same topic excluding active one)
  const relatedBlogs = topicBlogs
    .filter(b => b.id !== (blog ? blog.id : null))
    .slice(0, 2);

  // ======================== INTERACTION HANDLERS ========================
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTOCScroll = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      const offset = 90;
      const scrollContainer = contentContainerRef.current;
      if (scrollContainer) {
        const top = el.offsetTop - offset;
        scrollContainer.scrollTo({
          top,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: el.offsetTop - offset,
          behavior: "smooth"
        });
      }
      setActiveHeadingId(elementId);
    }
  };

  const getNavUrl = (targetBlog) => {
    if (!targetBlog) return "";
    return isWorkbench
      ? `/blog/topic/${topicId}/${targetBlog.slug || targetBlog.id}`
      : `/blog/${targetBlog.slug || targetBlog.id}`;
  };

  // ======================== RENDERING STATES ========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin mx-auto" />
          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">Initializing Documentation Workbench</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] font-sans flex flex-col relative h-screen overflow-hidden">
      
      {/* Background radial overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-[#6366f1]/4 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#a855f7]/4 blur-[100px]" />
      </div>

      {/* ======================== NAVBAR HEADER ======================== */}
      <header className="sticky top-0 z-40 w-full h-14 bg-[#030014]/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-4 sm:px-6 relative z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Navigation Toggle (Only in Workbench View) */}
          {isWorkbench && (
            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer mr-1"
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          <Link to="/blog" className="flex items-center gap-2 select-none group" style={{ textDecoration: "none" }}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-[10px] font-black group-hover:scale-105 transition-transform duration-300">
              KB
            </div>
            <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-white transition-colors">
              KnowledgeBase
            </span>
          </Link>

          {targetTopic && (
            <>
              <span className="text-gray-700">/</span>
              <Link 
                to={isWorkbench ? `/blog/topic/${topicId}` : "/blog"} 
                className="text-xs font-mono text-gray-500 hover:text-white uppercase transition-colors" 
                style={{ textDecoration: "none" }}
              >
                {targetTopic}
              </Link>
            </>
          )}
          
          {blog && (
            <>
              <span className="text-gray-700 hidden sm:inline">/</span>
              <span className="text-xs font-mono text-[#a855f7] hidden sm:inline max-w-[180px] truncate">
                {blog.title}
              </span>
            </>
          )}
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/4 text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all cursor-pointer uppercase"
          >
            <ArrowLeft size={11} /> Home
          </button>
          
          {blog && (
            <>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-white/5 bg-white/4 text-gray-400 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all cursor-pointer"
                title="Copy document URL"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              </button>

              <button
                onClick={() => setBookmarked(prev => !prev)}
                className="p-2 rounded-lg border border-white/5 bg-white/4 hover:bg-white/8 hover:border-white/10 transition-all cursor-pointer"
                title="Bookmark article"
                style={{ color: bookmarked ? "#a855f7" : "#9ca3af" }}
              >
                <Bookmark size={14} fill={bookmarked ? "#a855f7" : "none"} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ======================== BODY CONTAINER ======================== */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ── Left Sidebar (Topic Index Explorer) - Rendered only in Workbench Layout ── */}
        {isWorkbench && (
          <aside 
            className={`fixed md:relative top-14 md:top-0 bottom-0 left-0 w-64 border-r border-white/6 bg-[#030014]/95 md:bg-[#030014]/40 z-30 transition-transform duration-300 select-none flex flex-col ${
              mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            {/* Category overview banner */}
            <div className="p-4 border-b border-white/6 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">
                  {targetTopic === "Java" ? "☕" : targetTopic === "Spring Boot" ? "🍃" : targetTopic === "DSA" ? "🧮" : "📝"}
                </span>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  {targetTopic}
                </h2>
              </div>
              <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                Technical document hierarchy and lesson indexes.
              </p>
            </div>

            {/* Local in-topic search */}
            <div className="p-3 border-b border-white/6 relative">
              <Search size={12} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={`Search in ${targetTopic}...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-gray-300 outline-none focus:border-[#6366f1]/40 focus:bg-white/[0.01] transition-all font-mono"
              />
            </div>

            {/* Subtopic nested structure explorer */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-width-none" style={{ scrollbarWidth: "none" }}>
              {Object.keys(filteredGroups).length === 0 ? (
                <div className="py-8 text-center text-[10px] font-mono text-gray-600">
                  No articles matching query
                </div>
              ) : (
                Object.keys(filteredGroups).map((subtopic) => {
                  const isOpen = !!expandedFolders[subtopic];
                  const list = filteredGroups[subtopic];

                  return (
                    <div key={subtopic} className="space-y-1 text-left">
                      {/* Collapsible Subfolder trigger */}
                      <button
                        onClick={() => toggleFolder(subtopic)}
                        className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-white/4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <BookOpen size={10} className="text-[#a855f7]/60" /> {subtopic}
                        </span>
                        {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      </button>

                      {/* Subfolder list items */}
                      {isOpen && (
                        <div className="border-l border-white/5 ml-2.5 pl-2 space-y-0.5">
                          {list.map((item) => {
                            const isCurrent = item.slug === blogId || item.id === blogId;
                            return (
                              <Link
                                key={item.id}
                                to={`/blog/topic/${topicId}/${item.slug || item.id}`}
                                onClick={() => setMobileNavOpen(false)}
                                className={`block w-full text-left py-1.5 px-2.5 rounded text-[11.5px] font-mono leading-tight border transition-all truncate ${
                                  isCurrent
                                    ? "bg-[#6366f1]/10 border-[#6366f1]/20 text-[#22d3ee] font-semibold"
                                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.01]"
                                }`}
                                style={{ textDecoration: "none" }}
                              >
                                • {item.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* ── Middle Area (Reader Pane / Empty State Index) ── */}
        <main 
          ref={contentContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 select-text flex flex-col scrollbar-width-none"
          style={{ scrollbarWidth: "none" }}
        >
          {!blog ? (
            /* Topic Workbench landing empty-state */
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4 max-w-xl mx-auto select-none animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/10 flex items-center justify-center text-4xl shadow-xl mb-6 border border-white/5 animate-bounce">
                {topicId === "java" ? "☕" : topicId === "spring-boot" ? "🍃" : topicId === "dsa" ? "🧮" : "📝"}
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-mono">
                {targetTopic} Hub
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-mono mb-8 max-w-sm">
                Select an article from the sidebar tree explorer, or select a document from the category directory index below to begin reading.
              </p>

              {/* Grid of articles in this topic */}
              <div className="w-full space-y-4 text-left">
                <div className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1">
                  📂 Directory Folder Contents
                </div>
                {Object.keys(subtopicGroups).map((subtopic) => (
                  <div key={subtopic} className="space-y-1.5">
                    <div className="text-[10px] font-bold text-[#a855f7]/80 font-mono uppercase tracking-wider pl-1">
                      {subtopic}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {subtopicGroups[subtopic].map((item) => (
                        <Link
                          key={item.id}
                          to={`/blog/topic/${topicId}/${item.slug || item.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/12 hover:translate-x-0.5 transition-all cursor-pointer text-xs"
                          style={{ textDecoration: "none" }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#6366f1]">📄</span>
                            <span className="font-mono text-gray-300 font-semibold">{item.title}</span>
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1">Open <ChevronRight size={10} /></span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Blog Reader Pane */
            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col animate-fade-in">
              
              {/* Breadcrumbs */}
              <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-gray-500 mb-6 uppercase text-left">
                <Link to="/blog" className="hover:text-white">Blogs</Link>
                <ChevronRight size={10} />
                <span>{targetTopic}</span>
                {blog.categories[1] && (
                  <>
                    <ChevronRight size={10} />
                    <span>{blog.categories[1]}</span>
                  </>
                )}
                <ChevronRight size={10} />
                <span className="text-gray-300 truncate max-w-[200px]">{blog.title}</span>
              </div>

              {/* Article Cover Image Header */}
              {blog.coverImg && (
                <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-8 border border-white/6 shadow-xl">
                  <img src={blog.coverImg} alt={blog.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-transparent opacity-60" />
                </div>
              )}

              {/* Article Meta Header */}
              <div className="text-left mb-8 pb-6 border-b border-white/6">
                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {blog.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6366f1]/10 border border-[#6366f1]/15 text-[#818cf8] uppercase tracking-wider"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 
                  className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {blog.title}
                </h1>

                {/* Meta information row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {blog.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {cleanViews(views)} views</span>
                </div>
              </div>

              {/* Render Content Body */}
              <div className="flex-1 text-left" style={{ fontSize: `${fontSize}px` }}>
                <MarkdownRenderer content={blog.content} lineNumbers={lineNumbers} />
              </div>

              {/* ── Next / Previous Navigation Links ── */}
              {(prevBlog || nextBlog) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/6 text-left font-mono">
                  {prevBlog ? (
                    <Link 
                      to={getNavUrl(prevBlog)}
                      className="p-4 rounded-xl border border-white/5 bg-[#0a0a1a]/40 hover:bg-[#0a0a1a]/70 hover:border-[#6366f1]/30 transition-all flex flex-col gap-1.5 group select-none text-left"
                      style={{ textDecoration: "none" }}
                    >
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1"><ArrowLeftIcon size={10} /> Previous Article</span>
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors truncate">{prevBlog.title}</span>
                    </Link>
                  ) : <div />}

                  {nextBlog ? (
                    <Link 
                      to={getNavUrl(nextBlog)}
                      className="p-4 rounded-xl border border-white/5 bg-[#0a0a1a]/40 hover:bg-[#0a0a1a]/70 hover:border-[#6366f1]/30 transition-all flex flex-col gap-1.5 items-end group select-none text-right"
                      style={{ textDecoration: "none" }}
                    >
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1">Next Article <ArrowRight size={10} /></span>
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors truncate">{nextBlog.title}</span>
                    </Link>
                  ) : <div />}
                </div>
              )}

              {/* ── Related Articles Section ── */}
              {relatedBlogs.length > 0 && (
                <div className="mt-16 text-left">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-4">
                    Related Read-ups
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedBlogs.map((b) => (
                      <Link
                        key={b.id}
                        to={isWorkbench ? `/blog/topic/${topicId}/${b.slug || b.id}` : `/blog/${b.slug || b.id}`}
                        className="p-4 rounded-xl border border-white/5 bg-[#0a0a1a]/30 hover:bg-[#0a0a1a]/60 hover:border-white/12 hover:scale-[1.01] transition-all flex flex-col gap-2"
                        style={{ textDecoration: "none" }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{b.coverEmoji || b.cover_emoji || "📝"}</span>
                          <h4 className="text-xs font-bold text-white font-mono truncate">{b.title}</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {b.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky footer signature */}
              <div className="mt-20 border-t border-white/4 pt-6 pb-4 text-center text-[10px] font-mono text-gray-600">
                Abhishek Kumar | Knowledge Hub Portal • v5.0.0
              </div>

            </div>
          )}
        </main>

        {/* ── Right Sidebar (Sticky Table of Contents) - Rendered only when blog content has headers ── */}
        {blog && headingsList.length > 0 && (
          <aside className="hidden xl:block w-52 border-l border-white/5 p-6 select-none bg-[#030014]/20">
            <div className="sticky top-20 text-left space-y-4">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                On this page
              </h3>
              
              <div className="relative border-l border-white/6 pl-4 space-y-2 text-xs">
                {headingsList.map((h, i) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <button
                      key={i}
                      onClick={() => handleTOCScroll(h.id)}
                      className={`block w-full text-left py-0.5 transition-all duration-200 cursor-pointer ${
                        h.level === "h3" ? "pl-3 text-[11px]" : "font-medium"
                      } ${
                        isActive 
                          ? "text-[#a855f7] font-semibold scale-[1.02]" 
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {isActive && <span className="absolute left-[-1px] w-[2px] h-4 bg-[#a855f7] rounded-full transition-all" />}
                      {h.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

      </div>

      <style>{`
        /* Premium About Me styles */
        .about-card {
          background: linear-gradient(135deg, rgba(30, 30, 54, 0.4) 0%, rgba(15, 15, 30, 0.7) 100%);
          border: 1px solid rgba(189, 147, 249, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
        }
        .about-timeline-wrapper {
          position: relative;
          padding-left: 28px;
          margin: 32px 0;
        }
        .about-timeline-wrapper::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: linear-gradient(to bottom, #bd93f9, #8be9fd, #ff79c6, #f1fa8c, #50fa7b);
          border-radius: 1px;
        }
        .about-timeline-node {
          position: relative;
          margin-bottom: 30px;
        }
        .about-timeline-node::before {
          content: '';
          position: absolute;
          left: -28px;
          top: 6px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0d0d16;
          border: 3px solid #bd93f9;
          transition: all 0.3s ease;
          box-shadow: 0 0 8px #bd93f9;
        }
        .about-timeline-node:nth-child(2)::before { border-color: #8be9fd; box-shadow: 0 0 8px #8be9fd; }
        .about-timeline-node:nth-child(3)::before { border-color: #ff79c6; box-shadow: 0 0 8px #ff79c6; }
        .about-timeline-node:nth-child(4)::before { border-color: #f1fa8c; box-shadow: 0 0 8px #f1fa8c; }
        .about-timeline-node:nth-child(5)::before { border-color: #50fa7b; box-shadow: 0 0 8px #50fa7b; }
        
        .about-timeline-node:hover::before {
          transform: scale(1.3);
        }
        
        .about-roadmap-flow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }
        .about-roadmap-flow-step {
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 16px 12px;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
        }
        .about-roadmap-flow-step:hover {
          background: rgba(189, 147, 249, 0.05);
          border-style: solid;
          border-color: rgba(189, 147, 249, 0.3);
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  );
};

export default BlogDetail;