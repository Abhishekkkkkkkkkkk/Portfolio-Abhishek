import React from "react";

const TechStackIcon = ({ TechStackIcon, Language }) => {
  return (
    <div 
      className="group w-[85px] h-[85px] md:w-[90px] md:h-[90px] rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-900/60 hover:border-[#6366f1]/35 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-2 hover:scale-105 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0 select-none"
    >
      <div className="relative flex items-center justify-center">
        {/* Neon Glow Back-ring on Hover */}
        <div className="absolute -inset-1.5 bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-all duration-300" />
        <img
          src={TechStackIcon}
          alt={`${Language} icon`}
          className="relative h-8 w-8 object-contain transform transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <span className="font-mono text-gray-500 text-[9px] md:text-[10px] tracking-wide group-hover:text-white transition-colors duration-300 text-center leading-tight px-1 line-clamp-2 w-full">
        {Language}
      </span>
    </div>
  );
};

export default TechStackIcon;