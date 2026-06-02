import React from "react";
import { Heart, ArrowUp } from "lucide-react";
import { NAV_LINKS, SOCIAL_LINKS } from "../constants/navigation";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-[#030014] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-[#6366f1]/6 blur-[80px]" />

      <div className="relative px-[5%] lg:px-[10%] py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
              Abhishek
            </span>
            <span className="text-xs font-mono text-gray-600 tracking-widest uppercase">
              Full Stack Developer
            </span>
          </div>

          <nav className="flex items-center gap-1 flex-wrap justify-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-white rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group p-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 hover:scale-110 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-[#a78bfa] transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 font-mono flex items-center gap-1.5">
            © 2025 Abhishek Kumar. Built with
            <Heart className="w-3 h-3 text-[#e879f9] fill-[#e879f9] animate-pulse" />
            All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-500 hover:text-white hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 transition-all duration-300 hover:scale-105"
          >
            Back to top
            <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />
    </footer>
  );
};

export default Footer;
