import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Sparkles,
  ArrowDown,
  Code2,
  Cpu,
  Terminal,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

/* ─── Constants ─── */
const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 2000;
const WORDS = [
  "Problem Solver",
  "Tech Enthusiast",
  "Full Stack Dev",
  "DSA Practitioner",
];
const TECH_STACK = [
  "Java",
  "Spring Boot",
  "JavaScript",
  "React.js",
  "MySQL",
  "MongoDB",
];
const SOCIAL_LINKS = [
  {
    icon: Github,
    link: "https://github.com/Abhishekkkkkkkkkkk",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    link: "https://www.linkedin.com/in/abhishek2k24/",
    label: "LinkedIn",
  },
];

/* ─── Particle Canvas ─── */
const ParticleField = memo(() => {
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

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
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
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
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

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
});

/* ─── Orbs ─── */
const Orbs = memo(() => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#6366f1]/10 blur-[140px]" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#a855f7]/10 blur-[120px]" />
    <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#22d3ee]/6 blur-[80px]" />
  </div>
));

/* ─── Status Badge ─── */
const StatusBadge = memo(() => (
  <div
    className="w-fit flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 backdrop-blur-sm"
    data-aos="fade-down"
    data-aos-delay="200"
  >
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
    </span>
    <span className="text-[11px] font-semibold text-[#a78bfa] tracking-wider uppercase whitespace-nowrap">
      Ready to Innovate
    </span>
    <Sparkles className="w-3 h-3 text-[#a78bfa] shrink-0" />
  </div>
));

/* ─── Tech Tag ─── */
const TechTag = memo(({ tech, index }) => (
  <div
    className="group relative px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 backdrop-blur-sm
      hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 transition-all duration-300 cursor-default"
    data-aos="fade-up"
    data-aos-delay={index * 60}
  >
    <span className="text-xs font-mono text-gray-400 group-hover:text-gray-200 transition-colors">
      {tech}
    </span>
  </div>
));

/* ─── CTA Button ─── */
const CTAButton = memo(({ href, text, icon: Icon, primary = false }) => (
  <a href={href}>
    <button
      className={`group relative px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
        primary
          ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white shadow-lg shadow-[#6366f1]/20 hover:shadow-[#6366f1]/40"
          : "border border-white/10 bg-white/5 text-gray-300 hover:border-[#6366f1]/50 hover:text-white hover:bg-[#6366f1]/10"
      }`}
    >
      {text}
      <Icon
        className={`w-4 h-4 transition-transform duration-300 ${
          primary ? "group-hover:rotate-45" : "group-hover:translate-x-1"
        }`}
      />
    </button>
  </a>
));

/* ─── Social Link ─── */
const SocialLink = memo(({ icon: Icon, link, label }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" aria-label={label}>
    <div className="group relative p-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5">
      <Icon className="w-4 h-4 text-gray-500 group-hover:text-[#a78bfa] transition-colors" />
    </div>
  </a>
));

/* ─── Floating Code Snippet ─── */
const FloatingSnippet = memo(({ code, top, right, delay }) => (
  <div
    className="hidden xl:block absolute font-mono text-[11px] leading-relaxed px-4 py-3 rounded-xl border border-white/8 bg-black/40 backdrop-blur-md text-gray-500 pointer-events-none"
    style={{ top, right, animationDelay: `${delay}s` }}
    data-aos="fade-left"
    data-aos-delay={delay * 200}
  >
    {code.map((line, i) => (
      <div key={i}>
        <span className="text-[#6366f1]/60">{line.prefix}</span>
        <span className="text-gray-500">{line.text}</span>
      </div>
    ))}
  </div>
));

/* ─── LeetCode Card ─── */
const LeetCodeCard = memo(() => (
  <div
    className="relative group w-full max-w-sm mx-auto"
    data-aos="fade-left"
    data-aos-delay="400"
  >
    {/* Glow */}
    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#6366f1]/30 via-[#a855f7]/20 to-[#22d3ee]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

    {/* Card */}
    <div className="relative rounded-2xl border border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/8 bg-white/3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Terminal className="w-3 h-3 text-gray-600" />
          <span className="text-xs text-gray-600 font-mono">
            leetcode_stats.json
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-[#f89f1b]/10 border border-[#f89f1b]/20">
            <Code2 className="w-4 h-4 text-[#f89f1b]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">LeetCode Profile</p>
            <p className="text-xs text-gray-500 font-mono">@Abhi_1_2_3</p>
          </div>
        </div>

        <a
          href="https://leetcode.com/Abhi_1_2_3"
          target="_blank"
          rel="noopener noreferrer"
          className="block group/img"
        >
          <div className="rounded-xl overflow-hidden border border-white/8 group-hover/img:border-[#f89f1b]/30 transition-colors duration-300">
            <img
              src="https://leetcard.jacoblin.cool/Abhi_1_2_3?theme=wtf&extension=heatmap&font=montserrat"
              alt="LeetCode Stats"
              className="w-full group-hover/img:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </a>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-600 font-mono">
            500+ problems solved
          </span>
          <span className="text-xs text-[#f89f1b]/70 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f89f1b]/70 animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </div>
  </div>
));

/* ─── Home ─── */
const Home = () => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: "ease-out-cubic",
      offset: 10,
    });
    setIsLoaded(true);
  }, []);

  const handleTyping = useCallback(() => {
    if (isTyping) {
      if (charIndex < WORDS[wordIndex].length) {
        setText((prev) => prev + WORDS[wordIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else {
        setWordIndex((prev) => (prev + 1) % WORDS.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex]);

  useEffect(() => {
    const t = setTimeout(handleTyping, isTyping ? TYPING_SPEED : ERASING_SPEED);
    return () => clearTimeout(t);
  }, [handleTyping]);

  return (
    <div
      className="relative min-h-screen bg-[#030014] overflow-x-hidden"
      id="Home"
    >
      {/* Backgrounds */}
      <Orbs />
      <ParticleField />

      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating code snippets */}
      <FloatingSnippet
        top="18%"
        right="2%"
        delay={1}
        code={[
          { prefix: "const ", text: "dev = {" },
          { prefix: "  ", text: 'name: "Abhishek",' },
          { prefix: "  ", text: 'stack: "Full Stack",' },
          { prefix: "  ", text: 'status: "Working"' },
          { prefix: "", text: "};" },
        ]}
      />

      {/* Main content */}
      <div
        className={`relative z-10 transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* CHANGE 2: pt-28 on mobile so content starts below fixed navbar,
            lg:py-20 restores original desktop spacing */}
        <div className="container mx-auto px-[6%] lg:px-[8%] min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-16 pt-42 pb-20 lg:py-20">

          {/* ── Left Column ── */}
          <div className="w-full lg:w-1/2 space-y-8 text-left">

            {/* CHANGE 1: hidden on mobile/tablet, visible on lg+ */}
            <div className="hidden lg:block">
              <StatusBadge />
            </div>

            {/* Name & Title */}
            <div
              className="space-y-3"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-none">
                <span className="block text-white pt-10">Software</span>
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#a855f7]">
                  Developer
                </span>
              </h1>

              {/* Typing effect */}
              <div
                className="flex items-center gap-1.5 h-8 mt-2"
                data-aos="fade-right"
                data-aos-delay="400"
              >
                <span className="text-lg sm:text-xl font-light text-gray-400">
                  {text}
                </span>
                <span className="inline-block w-0.5 h-5 bg-gradient-to-b from-[#6366f1] to-[#a855f7] animate-pulse rounded-full" />
              </div>
            </div>

            {/* Description */}
            <p
              className="text-gray-500 leading-relaxed max-w-lg text-sm sm:text-base border-l-2 border-[#6366f1]/30 pl-4"
              data-aos="fade-right"
              data-aos-delay="500"
            >
              Turning ideas into{" "}
              <span className="text-gray-300 font-medium">
                reliable, scalable
              </span>
              , and{" "}
              <span className="text-gray-300 font-medium">user-focused</span>{" "}
              digital products through end-to-end software development.
            </p>

            {/* Tech Stack */}
            <div
              className="flex flex-wrap gap-2"
              data-aos="fade-right"
              data-aos-delay="600"
            >
              {TECH_STACK.map((tech, i) => (
                <TechTag key={tech} tech={tech} index={i} />
              ))}
            </div>

            {/* CTAs */}
            <div
              className="flex flex-row gap-3"
              data-aos="fade-right"
              data-aos-delay="700"
            >
              <CTAButton
                href="#Portofolio"
                text="Projects"
                icon={ExternalLink}
                primary
              />
              <CTAButton href="#Contact" text="Contact" icon={Mail} />
            </div>

            {/* Social + divider */}
            <div
              className="flex items-center gap-4"
              data-aos="fade-right"
              data-aos-delay="800"
            >
              <div className="h-px w-8 bg-white/10" />
              {SOCIAL_LINKS.map((s) => (
                <SocialLink key={s.label} {...s} />
              ))}
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end">
            <LeetCodeCard />
          </div>
        </div>

        {/* CHANGE 3: hidden on mobile so it doesn't overlap content */}
        <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-30 animate-bounce">
          <span className="text-xs font-mono text-gray-600 tracking-widest">
            SCROLL
          </span>
          <ArrowDown className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .animate-blink { animation: blink 1s step-end infinite; }
      `}</style>
    </div>
  );
};

export default memo(Home);