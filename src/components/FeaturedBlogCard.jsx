import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Eye, ArrowRight } from "lucide-react";
import { TagBadge } from "./BlogCard";

const FeaturedBlogCard = memo(
  ({
    id,
    title,
    description,
    tags = [],
    date,
    readTime,
    views,
    coverEmoji = "🚀",
    coverImg,
  }) => {
    return (
      <Link to={`/blog/${id}`} className="group block">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-0.5">
          {/* Outer glow */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#6366f1]/15 via-transparent to-[#a855f7]/15 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative grid grid-cols-1 sm:grid-cols-2">
            {/* Cover panel */}
            <div className="relative min-h-[160px] sm:min-h-[200px] bg-gradient-to-br from-[#6366f1]/15 to-[#a855f7]/10 flex items-center justify-center overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-[#6366f1]/20 blur-xl" />
              <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-[#a855f7]/15 blur-xl" />
              {coverImg ? (
                <img
                  src={coverImg}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <span className="relative text-6xl">{coverEmoji}</span>
              )}
              {/* Featured badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6366f1]/90 backdrop-blur-sm border border-[#6366f1]/50">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Featured
                </span>
              </div>
            </div>

            {/* Content panel */}
            <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 3).map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-[#a78bfa] transition-colors">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {description}
                </p>
              </div>

              {/* Meta + CTA */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-gray-600 font-mono flex-wrap">
                  {date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {date}
                    </span>
                  )}
                  {readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {readTime}
                    </span>
                  )}
                  {views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {views}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-bold shadow-lg shadow-[#6366f1]/20 group-hover:shadow-[#6366f1]/40 transition-all duration-300">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

export default FeaturedBlogCard;
