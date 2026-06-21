import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, Eye, Github, Lock, Code2 } from "lucide-react";

const CardProject = ({ Img, Title, Description, Link: ProjectLink, id, TechStack = [], Github: GithubLink }) => {
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
    }
  };

  // Determine if GitHub is private or public
  const isPrivateRepo = !GithubLink || GithubLink.toLowerCase() === "private";

  return (
    <div className="group relative w-full h-full flex flex-col">
      {/* Outer gradient glow on hover */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#6366f1]/0 to-[#a855f7]/0 group-hover:from-[#6366f1]/30 group-hover:to-[#a855f7]/25 blur-md transition-all duration-500 pointer-events-none" />

      {/* Main Card */}
      <div className="relative flex-1 flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl overflow-hidden shadow-xl group-hover:border-[#6366f1]/40 transition-all duration-400">
        
        {/* Shine sweep effect on hover */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </div>

        {/* Subtle inner gradient highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#a855f7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* ── Image & Overlay Showcase ── */}
        <div className="relative overflow-hidden shrink-0 bg-slate-950/40" style={{ height: "185px" }}>
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-90 transition-opacity duration-400" />

          {imgError || !Img ? (
            <div className="w-full h-full bg-gradient-to-br from-[#6366f1]/15 to-[#a855f7]/10 flex items-center justify-center">
              <span className="text-5xl opacity-40">🖥️</span>
            </div>
          ) : (
            <img
              src={Img}
              alt={Title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          )}

          {/* Repository status badge - top left */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
            {isPrivateRepo ? (
              <>
                <Lock className="w-3 h-3 text-red-400" />
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Private</span>
              </>
            ) : (
              <>
                <Github className="w-3 h-3 text-indigo-400" />
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Open Source</span>
              </>
            )}
          </div>

          {/* Live badge - top right */}
          {ProjectLink && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Live</span>
            </div>
          )}

          {/* Eye Icon Hover Indicator */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              to={`/project/${id}`}
              onClick={handleDetails}
              className="p-3 rounded-full bg-indigo-500/25 border border-indigo-400/40 backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform duration-400 hover:bg-indigo-500/40 hover:border-indigo-400/60"
            >
              <Eye className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>

        {/* ── Content & Details Showcase ── */}
        <div className="relative z-10 flex flex-col flex-1 p-5 gap-3 text-left">
          {/* Title */}
          <h3 className="text-base font-black leading-tight text-[#e2e8f0] group-hover:text-white transition-colors duration-300">
            {Title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
            {Description}
          </p>

          {/* ── Tech Stack Badges (New!) ── */}
          {TechStack && TechStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 my-1">
              {TechStack.slice(0, 3).map((tech, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-[9px] font-medium font-mono"
                >
                  <Code2 className="w-2.5 h-2.5 text-indigo-400/70" />
                  {tech}
                </div>
              ))}
              {TechStack.length > 3 && (
                <span className="text-[9px] text-gray-500 font-bold px-1.5 py-0.5 font-mono">
                  +{TechStack.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent my-1" />

          {/* ── Actions Footer Bar ── */}
          <div className="flex items-center justify-between gap-3 pt-1 z-20">
            {/* Live Demo / GitHub Code Link */}
            {ProjectLink ? (
              <a
                href={ProjectLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLiveDemo}
                className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-white transition-colors duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform duration-200" />
                Live Demo
              </a>
            ) : !isPrivateRepo ? (
              <a
                href={GithubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-white transition-colors duration-200"
              >
                <Github className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform duration-200" />
                View Code
              </a>
            ) : (
              <span className="text-[10px] text-gray-600 font-medium italic">Demo Unavailable</span>
            )}

            {/* Details CTA Button */}
            {id ? (
              <Link
                to={`/project/${id}`}
                onClick={handleDetails}
                className="group/det inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold
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

        {/* Bottom accent line highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/0 group-hover:via-[#6366f1]/50 to-transparent transition-all duration-500" />
      </div>
    </div>
  );
};

export default CardProject;