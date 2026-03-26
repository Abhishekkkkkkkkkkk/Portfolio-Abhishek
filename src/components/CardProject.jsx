import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, Eye } from "lucide-react";

const CardProject = ({ Img, Title, Description, Link: ProjectLink, id }) => {
  const [imgError, setImgError] = useState(false);

  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      e.preventDefault();
      alert("Live demo link is not available");
    }
  };

  const handleDetails = (e) => {
    if (!id) {
      e.preventDefault();
      alert("Project details are not available");
    }
  };

  return (
    <div className="group relative w-full h-full">

      {/* Outer glow on hover */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#6366f1]/0 to-[#a855f7]/0 group-hover:from-[#6366f1]/30 group-hover:to-[#a855f7]/20 blur-sm transition-all duration-500 pointer-events-none" />

      {/* Card */}
      <div className="relative h-full flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl overflow-hidden shadow-xl group-hover:border-[#6366f1]/40 transition-all duration-400">

        {/* Shine sweep on hover */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </div>

        {/* Subtle inner gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#a855f7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* ── Image ── */}
        <div className="relative overflow-hidden shrink-0" style={{ height: "185px" }}>
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          {imgError || !Img ? (
            <div className="w-full h-full bg-gradient-to-br from-[#6366f1]/15 to-[#a855f7]/10 flex items-center justify-center">
              <span className="text-5xl opacity-40">🖥️</span>
            </div>
          ) : (
            <img
              src={Img}
              alt={Title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          )}

          {/* Live badge — top right */}
          {ProjectLink && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Live</span>
            </div>
          )}

          {/* Eye icon overlay center */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
              <Eye className="w-5 h-5 text-white/70" />
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col flex-1 p-5 gap-3">

          {/* Title */}
          <h3 className="text-base font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 group-hover:from-white group-hover:via-[#a78bfa] group-hover:to-[#a855f7] transition-all duration-400">
            {Title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">
            {Description}
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          {/* ── Actions ── */}
          <div className="flex items-center justify-between gap-3 pt-1">

            {/* Live Demo */}
            {ProjectLink ? (
              <a
                href={ProjectLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLiveDemo}
                className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] hover:text-white transition-colors duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform duration-200" />
                Live Demo
              </a>
            ) : (
              <span className="text-xs text-gray-600 font-mono">Demo Unavailable</span>
            )}

            {/* Details button */}
            {id ? (
              <Link
                to={`/project/${id}`}
                onClick={handleDetails}
                className="group/det inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                  bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/15
                  border border-[#6366f1]/30
                  text-[#a78bfa]
                  hover:from-[#6366f1]/35 hover:to-[#a855f7]/25
                  hover:border-[#6366f1]/60
                  hover:text-white
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  shadow-sm shadow-[#6366f1]/10
                  hover:shadow-[#6366f1]/25"
              >
                Details
                <ArrowRight className="w-3.5 h-3.5 group-hover/det:translate-x-0.5 transition-transform duration-200" />
              </Link>
            ) : (
              <span className="text-xs text-gray-600 font-mono">Details Unavailable</span>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/0 group-hover:via-[#6366f1]/50 to-transparent transition-all duration-500" />
      </div>
    </div>
  );
};

export default CardProject;