import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Eye,
  ChevronRight,
  BookOpen,
  Tag,
} from "lucide-react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";
import { TagBadge } from "../components/BlogCard";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Try localStorage cache first
    const cached = JSON.parse(localStorage.getItem("blogs") || "[]");
    const found = cached.find((b) => String(b.id) === id);
    if (found) {
      setBlog(found);
      setLoading(false);
      return;
    }

    // Fallback: fetch from Firestore
    const fetchBlog = async () => {
      try {
        const snapshot = await getDocs(collection(db, "blogs"));
        const blogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        localStorage.setItem("blogs", JSON.stringify(blogs));
        const selected = blogs.find((b) => String(b.id) === id);
        setBlog(selected || null);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-mono">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-4xl">📭</p>
          <p className="text-white font-bold text-xl">Article not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/30 text-[#a78bfa] text-sm font-medium hover:bg-[#6366f1]/30 transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#6366f1]/6 blur-[130px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[#a855f7]/6 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-[#6366f1]/40 hover:bg-[#6366f1]/10 transition-all duration-300 text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
            <span>Blog</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400 truncate max-w-[200px]">
              {blog.title}
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {blog.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-5 text-xs text-gray-500 font-mono flex-wrap">
            {blog.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6366f1]" /> {blog.date}
              </span>
            )}
            {blog.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6366f1]" /> {blog.readTime}
              </span>
            )}
            {blog.views && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#6366f1]" /> {blog.views}{" "}
                views
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-[#6366f1]/40 via-[#a855f7]/20 to-transparent" />
        </div>

        {/* Cover emoji banner */}
        {(blog.coverImg || blog.coverEmoji) && (
          <div className="mb-10 rounded-2xl border border-white/10 overflow-hidden">
            {blog.coverImg ? (
              <img
                src={blog.coverImg}
                alt={blog.title}
                className="w-full h-[280px] sm:h-[360px] object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/6 flex items-center justify-center py-14 text-7xl">
                {blog.coverEmoji}
              </div>
            )}
          </div>
        )}

        {/* Description / intro */}
        {blog.description && (
          <div className="mb-8 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-2 border-l-[#6366f1]/60">
            <p className="text-gray-300 text-base leading-relaxed italic">
              {blog.description}
            </p>
          </div>
        )}

        {/* Main content */}
        {blog.content ? (
          <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:text-white prose-headings:font-black
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-400 prose-p:leading-relaxed
              prose-a:text-[#a78bfa] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-code:text-[#a78bfa] prose-code:bg-white/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
              prose-blockquote:border-l-[#6366f1] prose-blockquote:bg-white/4 prose-blockquote:rounded-r-xl prose-blockquote:py-1
              prose-li:text-gray-400
              prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <BookOpen className="w-10 h-10 text-gray-600" />
            <p className="text-gray-500 text-sm">
              Full article content not available yet.
            </p>
          </div>
        )}

        {/* Tags footer */}
        {blog.tags?.length > 0 && (
          <div className="mt-14 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="w-4 h-4 text-gray-600" />
              {blog.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
  .prose pre code { background: transparent !important; padding: 0 !important; }

  /* Hero */
  .hero { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08)); border: 1px solid rgba(99,102,241,0.25); border-radius: 20px; padding: 40px; margin-bottom: 40px; }
  .hero-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(99,102,241,0.35); background: rgba(99,102,241,0.1); color: #a78bfa; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
  .hero h1 { font-size: clamp(22px, 4vw, 34px); font-weight: 900; background: linear-gradient(90deg, #6366f1, #a855f7, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; margin-bottom: 16px; }
  .hero-desc { color: #94a3b8; font-size: 15px; margin-bottom: 20px; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: #64748b; font-family: monospace; }

  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
  .tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid; }
  .tag-java    { background: rgba(249,115,22,0.1);  color: #f97316; border-color: rgba(249,115,22,0.2); }
  .tag-spring  { background: rgba(34,197,94,0.1);   color: #22c55e; border-color: rgba(34,197,94,0.2); }
  .tag-rest    { background: rgba(56,189,248,0.1);  color: #38bdf8; border-color: rgba(56,189,248,0.2); }
  .tag-jwt     { background: rgba(168,85,247,0.1);  color: #a855f7; border-color: rgba(168,85,247,0.2); }

  /* TOC */
  .toc { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #6366f1; border-radius: 12px; padding: 20px 24px; margin-bottom: 40px; }
  .toc-title { font-size: 12px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
  .toc ol { padding-left: 18px; }
  .toc li { margin-bottom: 6px; }
  .toc a { color: #94a3b8; text-decoration: none; font-size: 14px; }
  .toc a:hover { color: #a78bfa; }

  /* Headings */
  h2 { font-size: 20px; font-weight: 800; color: #f1f5f9; margin: 48px 0 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(99,102,241,0.2); display: flex; align-items: center; gap: 10px; }
  h2 .num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 7px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  h3 { font-size: 16px; font-weight: 700; color: #cbd5e1; margin: 28px 0 10px; }

  /* Paragraphs & lists */
  p { color: #94a3b8; margin-bottom: 14px; line-height: 1.8; }
  strong { color: #e2e8f0; font-weight: 600; }
  ul, ol { padding-left: 20px; margin-bottom: 14px; color: #94a3b8; }
  li { margin-bottom: 6px; line-height: 1.7; }
  li::marker { color: #6366f1; }

  /* Code blocks */
  .code-block { background: #0d0d1a; border: 1px solid rgba(99,102,241,0.2); border-radius: 14px; margin: 18px 0 26px; overflow: hidden; }
  .code-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgba(99,102,241,0.08); border-bottom: 1px solid rgba(99,102,241,0.15); }
  .code-dots { display: flex; gap: 6px; }
  .code-dots span { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff5f57; } .dot-y { background: #ffbd2e; } .dot-g { background: #28ca41; }
  .code-lang { font-size: 11px; color: #64748b; font-family: monospace; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
  pre { padding: 18px 22px; overflow-x: auto; font-size: 13px; line-height: 1.7; }
  code { font-family: 'Courier New', monospace; color: #e2e8f0; }
  p code, li code { background: rgba(99,102,241,0.12); color: #a78bfa; padding: 2px 7px; border-radius: 5px; font-size: 13px; font-family: monospace; border: 1px solid rgba(99,102,241,0.2); }

  /* Syntax highlight */
  .kw { color: #c792ea; } .cl { color: #82aaff; } .fn { color: #82aaff; }
  .an { color: #c3e88d; } .st { color: #c3e88d; } .cm { color: #546e7a; font-style: italic; }
  .tp { color: #ffcb6b; }

  /* Callouts */
  .callout { border-radius: 12px; padding: 14px 18px; margin: 20px 0; display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.6; }
  .callout-icon { font-size: 17px; flex-shrink: 0; margin-top: 1px; }
  .callout-info  { background: rgba(56,189,248,0.07);  border: 1px solid rgba(56,189,248,0.2);  color: #7dd3fc; }
  .callout-tip   { background: rgba(34,197,94,0.07);   border: 1px solid rgba(34,197,94,0.2);   color: #86efac; }
  .callout-warn  { background: rgba(245,158,11,0.07);  border: 1px solid rgba(245,158,11,0.2);  color: #fcd34d; }

  /* Steps */
  .steps { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
  .step { display: flex; gap: 14px; align-items: flex-start; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; }
  .step-num { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .step-body h4 { color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .step-body p { color: #64748b; font-size: 13px; margin: 0; }

  /* Arch grid */
  .arch { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
  .arch-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 14px; text-align: center; }
  .arch-box .icon { font-size: 26px; margin-bottom: 6px; }
  .arch-box .label { font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 3px; }
  .arch-box .sub { font-size: 11px; color: #64748b; }

  /* Divider & summary */
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent); margin: 40px 0; }
  .summary { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.06)); border: 1px solid rgba(99,102,241,0.25); border-radius: 16px; padding: 24px 28px; margin-top: 40px; }
  .summary h3 { color: #a78bfa; font-size: 15px; margin-bottom: 12px; }
  .summary ul { color: #94a3b8; font-size: 14px; }

  @media (max-width: 640px) {
    .hero { padding: 22px 18px; }
    .arch { grid-template-columns: 1fr; }
    pre { font-size: 12px; padding: 12px 14px; }
  }
`}</style>
    </div>
  );
};

export default BlogDetail;
