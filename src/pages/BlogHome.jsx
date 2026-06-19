import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Clock, Calendar, ChevronRight, BookOpen, ArrowLeft, RefreshCw } from "lucide-react";
import BlogCard from "../components/BlogCard";
import FeaturedBlogCard from "../components/FeaturedBlogCard";
import blogsIndex from "../data/blogs-index.json";

// ======================== TOPICS METADATA ========================

const TOPICS = [
  { id: "java", name: "Java", emoji: "☕", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20 text-orange-400" },
  { id: "spring-boot", name: "Spring Boot", emoji: "🍃", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20 text-emerald-400" },
  { id: "dsa", name: "DSA", emoji: "🧮", color: "from-violet-500/20 to-indigo-500/10", border: "border-violet-500/20 text-violet-400" },
  { id: "system-design", name: "System Design", emoji: "🏛️", color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/20 text-amber-400" },
  { id: "javascript", name: "JavaScript", emoji: "🟨", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20 text-yellow-400" },
  { id: "react", name: "React", emoji: "⚛️", color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20 text-cyan-400" },
  { id: "database", name: "Database", emoji: "💾", color: "from-blue-600/20 to-indigo-600/10", border: "border-blue-500/20 text-blue-400" },
  { id: "oops", name: "OOPs", emoji: "🧩", color: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20 text-pink-400" },
  { id: "interview-questions", name: "Interview Prep", emoji: "🎯", color: "from-purple-500/20 to-fuchsia-500/10", border: "border-purple-500/20 text-purple-400" },
  { id: "projects", name: "Projects", emoji: "🚀", color: "from-rose-500/20 to-red-500/10", border: "border-rose-500/20 text-rose-400" }
];

// ======================== FALLBACK DETAILED MOCK DATA ========================

const FALLBACK_BLOGS = [];

const BlogHome = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(blogsIndex);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Popular searches suggestions
  const popularTags = ["DSA", "Java", "Security", "Scalability", "JWT"];

  useEffect(() => {
    setBlogs(blogsIndex);
    setLoading(false);
  }, []);

  const getCleanDate = (dateStr) => {
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

  // Filter logic based only on global search query
  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      blog.title.toLowerCase().includes(query) ||
      (blog.description && blog.description.toLowerCase().includes(query)) ||
      (blog.tags && blog.tags.some(t => t.toLowerCase().includes(query))) ||
      (blog.categories && blog.categories.some(c => c.toLowerCase().includes(query)))
    );
  });

  const featuredBlog = filteredBlogs.find(b => b.featured) || filteredBlogs[0];
  const standardBlogs = filteredBlogs.filter(b => b.id !== (featuredBlog ? featuredBlog.id : null));

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#6366f1]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#a855f7]/5 blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors duration-200 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Portfolio
        </button>

        {/* Hero Header */}
        <div className="text-left mb-12 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#818cf8] uppercase">
              Technical Documentation Hub
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Technical Blogs
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Deep-dive articles, interview experiences, DSA notes, Java ecosystem guides, and modern web development tutorials. Formatted like professional developer documentation.
          </p>
        </div>

        {/* Topic chips Navigation */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
              Browse by Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {TOPICS.map((topic) => {
              // Count matching blogs for this category
              const count = blogs.filter(b => b.categories && b.categories.some(c => 
                c.toLowerCase().replace(/[^a-z0-9]+/g, "-") === topic.id ||
                (topic.id === "spring-boot" && c.toLowerCase().includes("spring"))
              )).length;

              return (
                <button
                  key={topic.id}
                  onClick={() => navigate(`/blog/topic/${topic.id}`)}
                  className="group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-left overflow-hidden bg-[#0a0a1a]/60 border-white/6 hover:border-[#6366f1]/50 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {topic.emoji}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#818cf8] transition-colors font-mono">
                        {topic.name}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {count} {count === 1 ? "article" : "articles"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Search Section */}
        <div className="mb-10">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, keyword, or tags..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0a0a1a]/60 border border-white/8 outline-none text-sm text-gray-200 focus:border-[#6366f1]/50 focus:bg-white/[0.02] transition-all font-sans"
            />
          </div>
          
          {/* Quick tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="font-mono text-gray-500">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/4 text-gray-400 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all cursor-pointer font-mono text-[10px] uppercase"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#6366f1] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Loading Knowledge Base</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-24 text-center rounded-2xl border border-dashed border-white/8 bg-[#0a0a1a]/20">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-400 mb-1">No blogs matching filter</h3>
            <p className="text-xs text-gray-500 font-mono">Try a different query or search tag</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 text-xs font-semibold cursor-pointer text-white"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Section */}
            {!searchQuery && featuredBlog && (
              <div className="animate-fade-in">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-4 text-left">
                  ⭐ Featured Write-up
                </div>
                <FeaturedBlogCard
                  id={featuredBlog.slug || featuredBlog.id}
                  title={featuredBlog.title}
                  description={featuredBlog.description}
                  tags={featuredBlog.tags}
                  date={getCleanDate(featuredBlog.publishedDate)}
                  readTime={featuredBlog.readTime}
                  views={featuredBlog.views}
                  coverEmoji={featuredBlog.coverEmoji}
                  coverImg={featuredBlog.coverImage}
                />
              </div>
            )}

            {/* Standard Blogs Grid */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 text-left">
                {searchQuery ? `Found ${filteredBlogs.length} Articles` : "Recent Technical Publications"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchQuery ? filteredBlogs : standardBlogs).map((blog) => (
                  <BlogCard
                    key={blog.id}
                    id={blog.slug || blog.id}
                    title={blog.title}
                    description={blog.description}
                    tags={blog.tags}
                    date={getCleanDate(blog.publishedDate)}
                    readTime={blog.readTime}
                    views={blog.views}
                    coverEmoji={blog.coverEmoji}
                    coverImg={blog.coverImage}
                    bgClass={blog.bgClass || "bg1"}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogHome;
