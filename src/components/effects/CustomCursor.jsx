import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isMobile, setIsMobile] = useState(true);

  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Detect mobile touch interface
    const checkMobile = () => {
      const mobile = 
        window.innerWidth < 768 || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      setPosition({ x, y });

      // Spawn a binary particle if mouse moved significantly
      const distance = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
      if (distance > 15) {
        const char = Math.random() > 0.5 ? "1" : "0";
        const id = `${Date.now()}-${Math.random()}`;
        
        // Spawn particle coordinates with random drift offsets
        const newParticle = {
          id,
          char,
          x,
          y,
          dx: (Math.random() - 0.5) * 25,
          dy: (Math.random() - 0.5) * 25 - 15, // float upwards slightly
          rotate: (Math.random() - 0.5) * 90
        };

        setParticles((prev) => [...prev.slice(-15), newParticle]); // keep max 15 particles
        lastPos.current = { x, y };

        // Clean up particle after animation
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 1000);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Global CSS to hide default cursor on desktop */}
      <style>{`
        body {
          cursor: none !important;
        }
        a, button, select, input, textarea, [role="button"] {
          cursor: none !important;
        }
      `}</style>

      {/* Main cursor dot */}
      <div
        className="fixed w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] border border-white/40 pointer-events-none z-[100000] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: "left 0.04s ease-out, top 0.04s ease-out"
        }}
      />

      {/* Outer cursor glow ring */}
      <div
        className="fixed w-8 h-8 rounded-full border border-[#6366f1]/30 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 shadow-inner transition-all duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: "left 0.12s ease-out, top 0.12s ease-out"
        }}
      />

      {/* Binary trails particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0.8, scale: 1, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: 0.5, 
              x: p.x + p.dx, 
              y: p.y + p.dy,
              rotate: p.rotate
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed pointer-events-none z-[99998] font-mono text-[9px] font-bold text-[#6366f1]/40 dark:text-[#a78bfa]/50 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]"
          >
            {p.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </>
  );
};

export default CustomCursor;
