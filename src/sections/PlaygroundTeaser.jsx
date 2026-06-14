import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Sparkles, Code2, Trophy } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const PlaygroundTeaser = () => {
  useEffect(() => {
    AOS.init({ once: false, duration: 700 });
  }, []);

  return (
    <section 
      id="PlaygroundTeaser"
      className="relative py-24 px-4 sm:px-6 lg:px-[10%] overflow-hidden animate-fade-in"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 blur-[120px] pointer-events-none" />

      <div 
        className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-[#0a0a1a]/60 backdrop-blur-xl p-8 md:p-16 overflow-hidden group"
        data-aos="fade-up"
      >
        {/* Animated grid lines pattern inside the box */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f08_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f08_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Decorative corner glows */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#6366f1]/20 rounded-full blur-2xl group-hover:bg-[#6366f1]/30 transition-colors duration-700" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#a855f7]/20 rounded-full blur-2xl group-hover:bg-[#a855f7]/30 transition-colors duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Column: Copy */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTERACTIVE PLAYGROUND</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
              Need a break <br />
              <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
                from scrolling?
              </span>
            </h2>
            
            <p className="text-base text-gray-400 font-medium leading-relaxed max-w-lg mb-8">
              Most portfolios end here. Mine doesn't. Explore mini games, coding challenges, fun developer experiments, and hidden surprises built entirely with code.
            </p>

            <Link 
              to="/playground"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white hover:from-[#4f46e5] hover:to-[#9333ea] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5 animate-pulse" />
              <span>Explore Interactive Playground</span>
            </Link>
          </div>

          {/* Right Column: Visual Teaser Element */}
          <div className="w-full md:w-2/5 flex justify-center items-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer rotating dashboard */}
              <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-double border-[#6366f1]/20 animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute inset-10 rounded-full border border-[#a855f7]/10" />

              {/* Floating elements representing categories */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl border border-[#6366f1]/30 bg-[#0a0a1a]/90 backdrop-blur-xl flex items-center justify-center text-[#22d3ee] shadow-lg animate-bounce duration-1000">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl border border-[#a855f7]/30 bg-[#0a0a1a]/90 backdrop-blur-xl flex items-center justify-center text-[#a855f7] shadow-lg animate-bounce duration-1000 delay-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl border border-white/15 bg-[#0a0a1a]/90 backdrop-blur-xl flex items-center justify-center text-[#22c55e] shadow-lg animate-pulse">
                <Code2 className="w-6 h-6" />
              </div>
              
              {/* Center Retro Arcade Icon */}
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-[#6366f1]/20 to-[#a855f7]/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-2 rounded-full bg-black/40 blur-xs" />
                <Gamepad2 className="w-16 h-16 text-[#e2d3fd] filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] group-hover:text-white group-hover:rotate-12 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaygroundTeaser;
