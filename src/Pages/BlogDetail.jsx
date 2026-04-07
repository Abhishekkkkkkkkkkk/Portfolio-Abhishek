import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Calendar, Eye, ChevronRight,
  BookOpen, Tag, Share2, Copy, Check, List, X, ChevronUp,
} from "lucide-react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";
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
  <nav className="space-y-0.5">
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
            : "text-gray-600 hover:text-gray-300 hover:bg-white/5"
          }`}
      >
        {text}
      </a>
    ))}
  </nav>
);

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
  const contentRef = useRef(null);

  /* Fetch blog */
  useEffect(() => {
    window.scrollTo(0, 0);
    const cached = JSON.parse(localStorage.getItem("blogs") || "[]");
    const found = cached.find((b) => String(b.id) === id);
    if (found) { setBlog(found); setLoading(false); return; }
    (async () => {
      try {
        const snapshot = await getDocs(collection(db, "blogs"));
        const blogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem("blogs", JSON.stringify(blogs));
        setBlog(blogs.find((b) => String(b.id) === id) || null);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  /* Build TOC from rendered headings */
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

  /* Active heading via IntersectionObserver */
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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#a855f7]/20 border-b-[#a855f7] animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
          </div>
          <p className="text-gray-600 text-sm font-mono tracking-widest">Loading article…</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!blog) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-5 p-8">
          <p className="text-6xl">📭</p>
          <h2 className="text-white font-black text-2xl">Article not found</h2>
          <p className="text-gray-500 text-sm">The article you're looking for doesn't exist or was removed.</p>
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#a78bfa] text-sm font-semibold hover:bg-[#6366f1]/25 transition-all">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  /* Clean the views value once */
  const viewCount        = cleanViews(blog.views);
  const computedReadTime = blog.readTime || estimateReadTime(blog.content);

  return (
    <>
      <ReadingProgress />
      <BackToTop />

      <div className="relative min-h-screen bg-[#030014] overflow-x-hidden">
        {/* Ambient blobs */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#6366f1]/5 blur-[160px]" />
          <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[#a855f7]/5 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-16 flex gap-10 xl:gap-16">

          {/* ════ Main column ════ */}
          <div className="flex-1 min-w-0">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-3 mb-10">
              <button onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-[#6366f1]/40 hover:bg-[#6366f1]/10 transition-all duration-300 text-sm font-medium">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
              </button>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono min-w-0">
                <span>Blog</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="text-gray-400 truncate">{blog.title}</span>
              </div>
            </nav>

            {/* Article header */}
            <header className="mb-10">
              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {blog.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}>
                {blog.title}
              </h1>

              {/* Meta — single source of truth, no duplication */}
              <div className="flex items-center flex-wrap gap-4 mb-6">
                {blog.date && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500/70" /> {blog.date}
                  </span>
                )}
                {computedReadTime && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-indigo-500/70" /> {computedReadTime}
                  </span>
                )}
                {viewCount && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    <Eye className="w-3.5 h-3.5 text-indigo-500/70" /> {viewCount} views
                  </span>
                )}
                <div className="ml-auto">
                  <ShareButton title={blog.title} />
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-[#6366f1]/50 via-[#a855f7]/30 to-transparent" />
            </header>

            {/* Cover image / emoji */}
            {(blog.coverImg || blog.coverEmoji) && (
              <div className="mb-10 rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/40">
                {blog.coverImg ? (
                  <img src={blog.coverImg} alt={blog.title} className="w-full h-[240px] sm:h-[360px] object-cover" />
                ) : (
                  <div className="bg-gradient-to-br from-[#6366f1]/12 to-[#a855f7]/8 flex items-center justify-center py-16"
                    style={{ backgroundImage: "linear-gradient(#6366f115 1px,transparent 1px),linear-gradient(90deg,#6366f115 1px,transparent 1px)", backgroundSize: "40px 40px" }}>
                    <span className="text-8xl drop-shadow-2xl">{blog.coverEmoji}</span>
                  </div>
                )}
              </div>
            )}

            {/* Intro / description */}
            {blog.description && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-[#6366f1]/20 bg-[#6366f1]/5 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#6366f1] to-[#a855f7] rounded-l-2xl" />
                <p className="text-gray-300 text-base leading-relaxed italic pl-2">{blog.description}</p>
              </div>
            )}

            {/* Mobile TOC toggle */}
            {headings.length > 2 && (
              <div className="xl:hidden mb-8">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:border-indigo-500/30 transition-all duration-200 text-sm font-semibold">
                  <span className="flex items-center gap-2"><List className="w-4 h-4 text-indigo-400" />Table of Contents</span>
                  {tocOpen ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {tocOpen && (
                  <div className="mt-2 p-4 rounded-xl border border-white/8 bg-[#0a0a1a]">
                    <TocList headings={headings} activeId={activeId} onSelect={() => setTocOpen(false)} />
                  </div>
                )}
              </div>
            )}

            {/* Article body */}
            {blog.content ? (
              <div ref={contentRef} className="blog-prose" dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <BookOpen className="w-12 h-12 text-gray-700" />
                <p className="text-gray-500 text-sm">Full article content not available yet.</p>
              </div>
            )}

            {/* Tags footer */}
            {blog.tags?.length > 0 && (
              <div className="mt-16 pt-8 border-t border-white/8">
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-600" />
                  {blog.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                </div>
              </div>
            )}

            {/* Bottom nav */}
            <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-white/6">
              <button onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-indigo-500/30 text-sm font-medium transition-all duration-200">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </button>
              <ShareButton title={blog.title} />
            </div>
          </div>

          {/* ════ Sticky sidebar — TOC only, no meta duplication ════ */}
          {headings.length > 2 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <div className="sticky top-24">
                <div className="p-5 rounded-2xl border border-white/8 bg-[#0a0a1a]/80 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/6">
                    <List className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contents</span>
                  </div>
                  <TocList headings={headings} activeId={activeId} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .blog-prose { font-family: 'Georgia','Times New Roman',serif; color:#94a3b8; line-height:1.85; font-size:16px; }
        .blog-prose .hero { background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.06)); border:1px solid rgba(99,102,241,.22); border-radius:20px; padding:36px 40px; margin-bottom:40px; }
        .blog-prose .hero h1 { font-family:'Sora',sans-serif; font-size:clamp(22px,4vw,32px); font-weight:900; background:linear-gradient(90deg,#6366f1,#a855f7,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.2; margin-bottom:14px; }
        .blog-prose .hero-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; border:1px solid rgba(99,102,241,.35); background:rgba(99,102,241,.1); color:#a78bfa; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:16px; font-family:'JetBrains Mono',monospace; }
        .blog-prose .hero-desc { color:#94a3b8; font-size:15px; margin-bottom:20px; line-height:1.75; }
        .blog-prose h2 { font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:#f1f5f9; margin:52px 0 16px; padding-bottom:12px; border-bottom:1px solid rgba(99,102,241,.18); display:flex; align-items:center; gap:10px; scroll-margin-top:90px; }
        .blog-prose h2 .num { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:rgba(99,102,241,.18); border:1px solid rgba(99,102,241,.3); color:#a78bfa; font-size:12px; font-weight:700; flex-shrink:0; font-family:'JetBrains Mono',monospace; }
        .blog-prose h3 { font-family:'Sora',sans-serif; font-size:17px; font-weight:700; color:#cbd5e1; margin:32px 0 12px; scroll-margin-top:90px; }
        .blog-prose h4 { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:#94a3b8; margin:24px 0 8px; }
        .blog-prose p { color:#94a3b8; margin-bottom:18px; line-height:1.85; }
        .blog-prose strong { color:#e2e8f0; font-weight:700; }
        .blog-prose em { color:#a5b4fc; font-style:italic; }
        .blog-prose a { color:#a78bfa; text-decoration:none; border-bottom:1px solid rgba(167,139,250,.3); transition:border-color .2s; }
        .blog-prose a:hover { border-color:#a78bfa; }
        .blog-prose ul,.blog-prose ol { padding-left:22px; margin-bottom:18px; color:#94a3b8; }
        .blog-prose li { margin-bottom:8px; line-height:1.75; }
        .blog-prose ul li::marker { color:#6366f1; }
        .blog-prose ol li::marker { color:#6366f1; font-weight:700; font-family:'JetBrains Mono',monospace; font-size:13px; }
        .blog-prose :not(pre)>code { font-family:'JetBrains Mono',monospace; background:rgba(99,102,241,.1); color:#a78bfa; padding:2px 8px; border-radius:5px; font-size:13.5px; border:1px solid rgba(99,102,241,.2); }
        .blog-prose .code-block { background:#080814; border:1px solid rgba(99,102,241,.18); border-radius:16px; margin:24px 0 32px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.04); }
        .blog-prose .code-header { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:rgba(255,255,255,.03); border-bottom:1px solid rgba(99,102,241,.12); }
        .blog-prose .code-dots { display:flex; gap:6px; }
        .blog-prose .code-dots span { width:11px; height:11px; border-radius:50%; }
        .blog-prose .dot-r { background:#ff5f57; } .blog-prose .dot-y { background:#febc2e; } .blog-prose .dot-g { background:#28c840; }
        .blog-prose .code-lang { font-size:11px; color:#4b5563; font-family:'JetBrains Mono',monospace; font-weight:600; text-transform:uppercase; letter-spacing:.1em; }
        .blog-prose pre { padding:20px 24px; overflow-x:auto; font-family:'JetBrains Mono',monospace; font-size:13.5px; line-height:1.75; scrollbar-width:thin; scrollbar-color:rgba(99,102,241,.3) transparent; }
        .blog-prose pre::-webkit-scrollbar { height:5px; }
        .blog-prose pre::-webkit-scrollbar-thumb { background:rgba(99,102,241,.3); border-radius:2px; }
        .blog-prose pre code { font-family:inherit; color:#e2e8f0; background:transparent !important; padding:0; border:none; font-size:inherit; }
        .blog-prose .kw{color:#c792ea} .blog-prose .cl{color:#82aaff} .blog-prose .fn{color:#82aaff} .blog-prose .an{color:#c3e88d} .blog-prose .st{color:#c3e88d} .blog-prose .cm{color:#4b5563;font-style:italic} .blog-prose .tp{color:#ffcb6b} .blog-prose .nu{color:#f78c6c} .blog-prose .op{color:#89ddff}
        .blog-prose blockquote { border-left:3px solid #6366f1; background:rgba(99,102,241,.05); border-radius:0 12px 12px 0; padding:14px 20px; margin:20px 0; color:#94a3b8; font-style:italic; }
        .blog-prose blockquote p { color:inherit; margin:0; }
        .blog-prose .toc { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-left:3px solid #6366f1; border-radius:14px; padding:20px 24px; margin-bottom:40px; }
        .blog-prose .toc-title { font-size:11px; font-weight:700; color:#a78bfa; text-transform:uppercase; letter-spacing:.12em; margin-bottom:12px; font-family:'JetBrains Mono',monospace; }
        .blog-prose .toc ol { padding-left:18px; margin-bottom:0; }
        .blog-prose .toc li { margin-bottom:6px; }
        .blog-prose .toc a { color:#94a3b8; font-size:14px; border-bottom:none; }
        .blog-prose .toc a:hover { color:#a78bfa; }
        .blog-prose .tags { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:36px; }
        .blog-prose .tag { padding:4px 11px; border-radius:7px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; border:1px solid; font-family:'JetBrains Mono',monospace; }
        .blog-prose .tag-java { background:rgba(249,115,22,.1); color:#f97316; border-color:rgba(249,115,22,.25); }
        .blog-prose .tag-spring { background:rgba(34,197,94,.1); color:#22c55e; border-color:rgba(34,197,94,.25); }
        .blog-prose .tag-rest { background:rgba(56,189,248,.1); color:#38bdf8; border-color:rgba(56,189,248,.25); }
        .blog-prose .tag-jwt { background:rgba(168,85,247,.1); color:#a855f7; border-color:rgba(168,85,247,.25); }
        .blog-prose .callout { border-radius:14px; padding:14px 18px; margin:22px 0; display:flex; gap:12px; align-items:flex-start; font-size:14px; line-height:1.7; }
        .blog-prose .callout-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
        .blog-prose .callout-info  { background:rgba(56,189,248,.07);  border:1px solid rgba(56,189,248,.2);  color:#7dd3fc; }
        .blog-prose .callout-tip   { background:rgba(34,197,94,.07);   border:1px solid rgba(34,197,94,.2);   color:#86efac; }
        .blog-prose .callout-warn  { background:rgba(245,158,11,.07);  border:1px solid rgba(245,158,11,.2);  color:#fcd34d; }
        .blog-prose .callout-danger{ background:rgba(239,68,68,.07);   border:1px solid rgba(239,68,68,.2);   color:#fca5a5; }
        .blog-prose .steps { display:flex; flex-direction:column; gap:12px; margin:22px 0; }
        .blog-prose .step { display:flex; gap:16px; align-items:flex-start; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:16px 20px; }
        .blog-prose .step-num { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#a855f7); color:white; font-weight:900; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'JetBrains Mono',monospace; box-shadow:0 4px 12px rgba(99,102,241,.35); }
        .blog-prose .step-body h4 { color:#e2e8f0; font-size:14px; font-weight:700; margin-bottom:4px; font-family:'Sora',sans-serif; }
        .blog-prose .step-body p { color:#64748b; font-size:13px; margin:0; line-height:1.6; }
        .blog-prose .arch { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:24px 0; }
        .blog-prose .arch-box { background:rgba(255,255,255,.04); border:1px solid rgba(99,102,241,.18); border-radius:14px; padding:16px; text-align:center; transition:border-color .2s; }
        .blog-prose .arch-box:hover { border-color:rgba(99,102,241,.4); }
        .blog-prose .arch-box .icon { font-size:28px; margin-bottom:8px; }
        .blog-prose .arch-box .label { font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:4px; font-family:'Sora',sans-serif; }
        .blog-prose .arch-box .sub { font-size:11px; color:#64748b; }
        .blog-prose table { width:100%; border-collapse:collapse; margin:24px 0; font-size:13.5px; }
        .blog-prose thead tr { background:rgba(99,102,241,.1); }
        .blog-prose th { padding:12px 16px; text-align:left; color:#a78bfa; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; border-bottom:1px solid rgba(99,102,241,.2); font-family:'JetBrains Mono',monospace; }
        .blog-prose td { padding:11px 16px; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,.05); }
        .blog-prose tr:last-child td { border-bottom:none; }
        .blog-prose tbody tr:hover td { background:rgba(255,255,255,.02); }
        .blog-prose img { width:100%; border-radius:16px; border:1px solid rgba(255,255,255,.08); margin:20px 0; box-shadow:0 8px 40px rgba(0,0,0,.4); }
        .blog-prose .divider { height:1px; background:linear-gradient(90deg,transparent,rgba(99,102,241,.3),transparent); margin:48px 0; }
        .blog-prose .summary { background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(168,85,247,.05)); border:1px solid rgba(99,102,241,.22); border-radius:18px; padding:26px 30px; margin-top:48px; }
        .blog-prose .summary h3 { font-family:'Sora',sans-serif; color:#a78bfa; font-size:15px; margin-bottom:14px; font-weight:800; }
        .blog-prose .summary ul { color:#94a3b8; font-size:14px; }
        .blog-prose .meta-row { display:flex; flex-wrap:wrap; gap:14px; font-size:12px; color:#64748b; font-family:'JetBrains Mono',monospace; }
        @media(max-width:640px){
          .blog-prose{font-size:15px}
          .blog-prose h2{font-size:19px}
          .blog-prose h3{font-size:16px}
          .blog-prose .hero{padding:20px 18px}
          .blog-prose .arch{grid-template-columns:1fr}
          .blog-prose pre{font-size:12px;padding:14px 16px}
        }
      `}</style>
    </>
  );
};

export default BlogDetail;