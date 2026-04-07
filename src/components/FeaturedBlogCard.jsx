import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Eye, ArrowUpRight } from "lucide-react";
import { TagBadge } from "./BlogCard";

/* Strip trailing " views" if it's baked into the Firestore value e.g. "1.2k views" → "1.2k" */
const cleanViews = (v) => (v ? String(v).replace(/\s*views$/i, "").trim() : null);

const FeaturedBlogCard = memo(({ id, title, description, tags = [], date, readTime, views, coverEmoji, coverImg }) => {
  const viewCount = cleanViews(views);

  return (
    <Link to={`/blog/${id}`} className="group block" style={{ textDecoration: "none" }}>
      <article className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#07071a] transition-all duration-500 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">

        {/* Top gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee] z-10" />

        <div className="flex flex-col md:flex-row min-h-[260px]">

          {/* ── Left: Cover ── */}
          <div className="relative md:w-[38%] h-[200px] md:h-auto shrink-0 overflow-hidden">
            {coverImg ? (
              <img
                src={coverImg}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-purple-900/40">
                <span className="text-7xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  {coverEmoji || "📝"}
                </span>
              </div>
            )}

            {/* Blend edge so image flows into card body */}
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-[#07071a] hidden md:block" />

            {/* Featured pill */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide shadow-lg shadow-indigo-500/40">
              ⚡ Featured
            </div>

            {/* Read time pill */}
            {readTime && (
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white/70 border border-white/10">
                <Clock className="w-3 h-3" /> {readTime}
              </div>
            )}
          </div>

          {/* ── Right: Content ── */}
          <div className="flex flex-col justify-between flex-1 p-7 md:p-9 gap-5">

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
              </div>
            )}

            {/* Title + description */}
            <div className="space-y-3">
              <h2
                className="text-2xl md:text-3xl font-black text-white leading-tight group-hover:text-indigo-200 transition-colors duration-300"
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
              >
                {title}
              </h2>
              {description && (
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            {/* Footer: meta + CTA */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/6">
              <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono flex-wrap">
                {date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400/70" /> {date}
                  </span>
                )}
                {viewCount && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-400/70" /> {viewCount} views
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/10">
                Read article
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
});

export default FeaturedBlogCard;