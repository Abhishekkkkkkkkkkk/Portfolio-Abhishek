import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Github, Globe, User, Terminal, Cpu, Braces } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

/* ─── Particle Canvas ─── */
const ParticleCanvas = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.07 * (1 - d / 110)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />;
});

/* ─── Typewriter ─── */
const TypewriterEffect = memo(({ text, speed = 80 }) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplay("");
    const t = setInterval(() => {
      if (i <= text.length) {
        setDisplay(text.slice(0, i));
        i++;
      } else {
        clearInterval(t);
      }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);

  return (
    <span>
      {display}
      <span className="inline-block w-0.5 h-[1em] bg-[#6366f1] ml-0.5 animate-pulse align-middle" />
    </span>
  );
});

/* ─── Progress Bar ─── */
const ProgressBar = memo(({ duration = 4000 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const steps = 100;
    const interval = duration / steps;
    let current = 0;
    const t = setInterval(() => {
      current++;
      setWidth(current);
      if (current >= steps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, [duration]);

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">Loading</span>
        <span className="text-[10px] font-mono text-[#6366f1]">{width}%</span>
      </div>
      <div className="h-px w-full bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full"
          style={{ width: `${width}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
    </div>
  );
});

/* ─── Glitch Text ─── */
const GlitchText = memo(({ text }) => (
  <span className="relative inline-block glitch-wrapper" data-text={text}>
    {text}
    <style>{`
      .glitch-wrapper {
        position: relative;
      }
      .glitch-wrapper::before,
      .glitch-wrapper::after {
        content: attr(data-text);
        position: absolute;
        left: 0; top: 0;
        width: 100%;
        overflow: hidden;
      }
      .glitch-wrapper::before {
        animation: glitch1 3s infinite steps(1);
        clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
        background: linear-gradient(to right, #6366f1, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 0.7;
      }
      .glitch-wrapper::after {
        animation: glitch2 3s infinite steps(1);
        clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        background: linear-gradient(to right, #22d3ee, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 0.5;
      }
      @keyframes glitch1 {
        0%,90%,100% { transform: translate(0); }
        92% { transform: translate(-2px, 1px); }
        94% { transform: translate(2px, -1px); }
        96% { transform: translate(-1px, 0); }
      }
      @keyframes glitch2 {
        0%,90%,100% { transform: translate(0); }
        93% { transform: translate(2px, 1px); }
        95% { transform: translate(-2px, -1px); }
        97% { transform: translate(1px, 0); }
      }
    `}</style>
  </span>
));

/* ─── Icon Orb ─── */
const IconOrb = memo(({ Icon, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="relative group"
  >
    <div className={`absolute -inset-3 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${color}`} />
    <div className="relative p-3 sm:p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:scale-110 transition-all duration-300">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-white transition-colors" />
    </div>
  </motion.div>
));

/* ─── Floating Badge ─── */
const FloatingBadge = memo(({ children, style }) => (
  <motion.div
    className="hidden sm:flex absolute items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-xs font-mono text-gray-500"
    style={style}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1.5, duration: 0.5 }}
  >
    {children}
  </motion.div>
));

/* ─── Welcome Screen ─── */
const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
    const t = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => onLoadingComplete?.(), 900);
    }, 4000);
    return () => clearTimeout(t);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#030014] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: "blur(12px)",
            transition: { duration: 0.9, ease: "easeInOut" },
          }}
        >
          {/* Backgrounds */}
          <ParticleCanvas />

          {/* Orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6366f1]/12 blur-[130px] animate-pulse" />
            <div
              className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#a855f7]/12 blur-[100px] animate-pulse"
              style={{ animationDelay: "1.5s" }}
            />
          </div>

          {/* Scan line */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          />

          {/* Floating corner badges */}
          <FloatingBadge style={{ top: "8%", left: "5%" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>System Online</span>
          </FloatingBadge>
          <FloatingBadge style={{ bottom: "10%", right: "5%" }}>
            <Terminal className="w-3 h-3" />
            <span>v2.0.25</span>
          </FloatingBadge>
          <FloatingBadge style={{ top: "8%", right: "5%" }}>
            <Cpu className="w-3 h-3" />
            <span>Full Stack</span>
          </FloatingBadge>

          {/* Center content */}
          <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-10">

            {/* Icon row */}
            <div className="flex items-center gap-4 sm:gap-6">
              <IconOrb Icon={Code2} delay={0.2} color="bg-[#6366f1]/50" />
              <IconOrb Icon={User} delay={0.35} color="bg-[#a855f7]/50" />
              <IconOrb Icon={Github} delay={0.5} color="bg-[#22d3ee]/50" />
              <IconOrb Icon={Braces} delay={0.65} color="bg-[#6366f1]/50" />
            </div>

            {/* Main heading */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-xs font-mono text-gray-600 tracking-[0.4em] uppercase">
                &lt; Welcome /&gt;
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none">
                <span className="block text-white">
                  <GlitchText text="Portfolio" />
                </span>
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#a855f7]">
                  Website
                </span>
              </h1>

              <motion.p
                className="text-sm text-gray-600 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                Crafted by{" "}
                <span className="text-[#a78bfa]">Abhishek Kumar</span>
              </motion.p>
            </motion.div>

            {/* URL chip */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <a
                href="https://krabhishek.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 hover:scale-105 transition-all duration-300"
              >
                <Globe className="w-3.5 h-3.5 text-[#6366f1]" />
                <span className="text-sm font-mono text-gray-400 group-hover:text-gray-200 transition-colors">
                  <TypewriterEffect text="krabhishek.vercel.app" speed={90} />
                </span>
              </a>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-full max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <ProgressBar duration={3800} />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;