import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Eye, ArrowRight } from "lucide-react";

const TAG_STYLES = {
  Java: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Spring Boot": "bg-green-500/10  text-green-400  border-green-500/20",
  Spring: "bg-green-500/10  text-green-400  border-green-500/20",
  React: "bg-cyan-500/10   text-cyan-400   border-cyan-500/20",
  DSA: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "System Design": "bg-amber-500/10 text-amber-400  border-amber-500/20",
  JavaScript: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  MongoDB: "bg-green-600/10  text-green-500  border-green-600/20",
  MySQL: "bg-blue-500/10   text-blue-400   border-blue-500/20",
  Docker: "bg-sky-500/10    text-sky-400    border-sky-500/20",
  default: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export const TagBadge = memo(({ tag }) => {
  const style = TAG_STYLES[tag] || TAG_STYLES.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style}`}
    >
      {tag}
    </span>
  );
});

const BlogCard = memo(
  ({
    id,
    title,
    description,
    tags = [],
    date,
    readTime,
    views,
    coverEmoji = "📝",
    coverImg,
    bgClass = "bg1",
  }) => {
    const BG_MAP = {
      bg1: "from-[#6366f1]/10 to-[#a855f7]/6",
      bg2: "from-[#22c55e]/8 to-[#10b981]/5",
      bg3: "from-[#38bdf8]/10 to-[#6366f1]/6",
      bg4: "from-[#f59e0b]/8 to-[#f97316]/5",
      bg5: "from-[#ec4899]/8 to-[#a855f7]/5",
      bg6: "from-[#6366f1]/6 to-[#38bdf8]/6",
    };
    const bg = BG_MAP[bgClass] || BG_MAP.bg1;

    return (
      <Link to={`/blog/${id}`} className="group block h-full">
        <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 transition-all duration-300 hover:-translate-y-1">
          {/* Cover */}
          <div
            className={`h-[88px] flex items-center justify-center bg-gradient-to-br ${bg} shrink-0 overflow-hidden`}
          >
            {coverImg ? (
              <img
                src={coverImg}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="text-4xl">{coverEmoji}</span>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-4 gap-3">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 2).map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}

            {/* Title */}
            <h4 className="text-sm font-bold text-white leading-snug group-hover:text-[#a78bfa] transition-colors line-clamp-2">
              {title}
            </h4>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-white/8">
              <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono">
                {date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {date}
                  </span>
                )}
                {readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readTime}
                  </span>
                )}
                {views && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {views}
                  </span>
                )}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#a78bfa] group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

export default BlogCard;
