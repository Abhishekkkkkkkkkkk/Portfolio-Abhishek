import React, { useState } from "react";

const TechStackRow = ({ label, children, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full max-w-4xl mx-auto mb-8 rounded-2xl border transition-all duration-300 backdrop-blur-xl bg-slate-900/50 overflow-hidden shadow-xl
        ${isHovered 
          ? "border-[#6366f1]/35 shadow-[0_10px_30px_rgba(99,102,241,0.08)] scale-[1.01]" 
          : "border-white/10"
        } ${className}`}
    >
      {/* Glow highlight */}
      <div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isHovered 
            ? "radial-gradient(400px circle at 50% 120px, rgba(99, 102, 241, 0.1), transparent 80%)"
            : undefined
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-stretch p-6 gap-6">
        {/* Category Label (Left) */}
        <div className="flex md:flex-col justify-between md:justify-center items-center md:items-start w-full md:w-[180px] shrink-0 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-[10px] font-bold tracking-wider text-gray-500 uppercase select-none">
              Category
            </span>
            <h4 
              className="font-sans text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 font-black text-lg tracking-wide uppercase select-none transition-all duration-300"
              style={{
                textShadow: isHovered 
                  ? "0 0 15px rgba(99,102,241,0.35)" 
                  : "none"
              }}
            >
              {label}
            </h4>
          </div>
        </div>

        {/* Icons Grid (Right) */}
        <div className="flex-1 flex flex-wrap gap-4 items-center justify-start py-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TechStackRow;
