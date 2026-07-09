import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Eye, ArrowUpRight, Bookmark } from "lucide-react";

/* ─── Tag color map ─── */
const TAG_STYLES = {
  Java:             "bg-orange-500/12 text-orange-400   border-orange-500/25  shadow-orange-500/10",
  "Spring Boot":    "bg-emerald-500/12 text-emerald-400 border-emerald-500/25 shadow-emerald-500/10",
  Spring:           "bg-emerald-500/12 text-emerald-400 border-emerald-500/25 shadow-emerald-500/10",
  React:            "bg-cyan-500/12   text-cyan-400     border-cyan-500/25    shadow-cyan-500/10",
  DSA:              "bg-violet-500/12 text-violet-400   border-violet-500/25  shadow-violet-500/10",
  "System Design":  "bg-amber-500/12  text-amber-400    border-amber-500/25   shadow-amber-500/10",
  JavaScript:       "bg-yellow-500/12 text-yellow-400   border-yellow-500/25  shadow-yellow-500/10",
  MongoDB:          "bg-green-600/12  text-green-500    border-green-600/25   shadow-green-600/10",
  MySQL:            "bg-blue-500/12   text-blue-400     border-blue-500/25    shadow-blue-500/10",
  Docker:           "bg-sky-500/12    text-sky-400      border-sky-500/25     shadow-sky-500/10",
  default:          "bg-indigo-500/12 text-indigo-400   border-indigo-500/25  shadow-indigo-500/10",
};

export const TagBadge = memo(({ tag }) => {
  const style = TAG_STYLES[tag] || TAG_STYLES.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${style}`}>
      {tag}
    </span>
  );
});

/* ─── Cover gradient map ─── */
const COVER_GRADIENTS = {
  bg1: { from: "from-indigo-600/20", to: "to-purple-600/10",  ring: "#6366f1" },
  bg2: { from: "from-emerald-600/20",to: "to-teal-600/10",    ring: "#10b981" },
  bg3: { from: "from-cyan-600/20",   to: "to-indigo-600/10",  ring: "#22d3ee" },
  bg4: { from: "from-amber-600/20",  to: "to-orange-600/10",  ring: "#f59e0b" },
  bg5: { from: "from-pink-600/20",   to: "to-purple-600/10",  ring: "#ec4899" },
  bg6: { from: "from-indigo-600/15", to: "to-cyan-600/10",    ring: "#6366f1" },
};

/* ─── BlogCard ─── */
const BlogCard = memo(({ id, title, description, tags = [], date, readTime, views, coverEmoji = "📝", coverImg, bgClass = "bg1", featured }) => {
  const grad = COVER_GRADIENTS[bgClass] || COVER_GRADIENTS.bg1;

  return (
    <Link to={`/blog/${id}`} className="group block h-full" style={{ textDecoration: "none" }}>
      <article className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-white/8 bg-[#0a0a1a] transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl"
        style={{ "--ring": grad.ring }}>

        {/* Hover glow overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{ background: `radial-gradient(400px circle at 50% 0%, ${grad.ring}18, transparent 70%)` }} />

        {/* Cover */}
        <div className={`relative h-[110px] flex items-center justify-center bg-gradient-to-br ${grad.from} ${grad.to} overflow-hidden shrink-0`}>
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `linear-gradient(${grad.ring}30 1px, transparent 1px), linear-gradient(90deg, ${grad.ring}30 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

          {coverImg ? (
            <img src={coverImg} alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="relative flex flex-col items-center gap-1">
              <span className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{coverEmoji}</span>
            </div>
          )}

          {/* Reading time pill */}
          {readTime && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-mono text-white/70 border border-white/10">
              <Clock className="w-2.5 h-2.5" />
              {readTime}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}

          {/* Title */}
          <h3 className="text-[15px] font-bold text-white/90 leading-snug group-hover:text-white transition-colors line-clamp-2"
            style={{ fontFamily: "'Sora', sans-serif" }}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/6">
            <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono">
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {date}
                </span>
              )}
              {views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {views}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 group-hover:text-white transition-all duration-300">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Read</span>
              <ArrowUpRight className="w-4 h-4 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${grad.ring}, transparent)` }} />
      </article>
    </Link>
  );
});

export default BlogCard;