import React, { useState, useEffect, useRef } from "react";
import {
  User, Mail, MessageSquare, Send, Sparkles,
  Coffee, Zap, Code2, Music, Moon, Sun,
} from "lucide-react";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import SocialLinks from "../components/SocialLinks";

/* ─── Animated Code Rain ─── */
const CodeRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const chars = "01アイウエオカキクケコ{}[]<>/=+*&%$#@!";
    const fontSize = 11;
    let drops = [];
    const initDrops = () => {
      const cols = Math.floor(canvas.width / fontSize);
      drops = Array(cols).fill(1);
    };
    initDrops();
    const draw = () => {
      ctx.fillStyle = "rgba(3,0,20,0.07)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cols = Math.floor(canvas.width / fontSize);
      if (drops.length !== cols) initDrops();
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = `rgba(99,102,241,${Math.random() * 0.45 + 0.1})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 80);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 rounded-2xl" />;
};

/* ─── Typing Status ─── */
const STATUSES = [
  { icon: Coffee, text: "Brewing chai & coding",   color: "#f59e0b" },
  { icon: Code2,  text: "Building something cool",   color: "#6366f1" },
  { icon: Music,  text: "fast flow, faster logic",   color: "#ec4899" },
  { icon: Zap,    text: "In the zone right now",     color: "#22d3ee" },
  { icon: Moon,   text: "Late night debugging",      color: "#a855f7" },
  { icon: Sun,    text: "Morning productivity mode", color: "#f97316" },
];

const TypingStatus = () => {
  const [statusIdx, setStatusIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = STATUSES[statusIdx].text;
    if (typing) {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 55);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2200);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
        return () => clearTimeout(t);
      } else {
        setStatusIdx((p) => (p + 1) % STATUSES.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, statusIdx]);

  const { icon: Icon, color } = STATUSES[statusIdx];
  return (
    <div className="flex items-center gap-2">
      <Icon style={{ width: 14, height: 14, color, flexShrink: 0 }} />
      <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>
        {displayed}
        <span className="inline-block w-0.5 h-3 bg-[#6366f1] ml-0.5 align-middle animate-pulse" />
      </span>
    </div>
  );
};

/* ─── Fun Stats ─── */
const FUN_STATS = [
  { label: "Cups of Chai", value: "∞",    icon: "☕", color: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.25)",  glow: "rgba(245,158,11,0.08)"  },
  { label: "Lines of code",  value: "50k+", icon: "💻", color: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.25)",  glow: "rgba(99,102,241,0.08)"  },
  { label: "Bugs fixed",     value: "199+", icon: "🐛", color: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.25)",  glow: "rgba(236,72,153,0.08)"  },
  { label: "Hours coding",   value: "2k+",  icon: "⏱️", color: "rgba(34,211,238,0.15)",  border: "rgba(34,211,238,0.25)",  glow: "rgba(34,211,238,0.08)"  },
];

/* ─── Fun Section ─── */
const FunSection = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative rounded-2xl border border-white/10 overflow-hidden" data-aos="fade-up" data-aos-delay="150">
      <CodeRain />

      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(3,0,20,0.75) 0%, rgba(10,8,30,0.65) 50%, rgba(3,0,20,0.8) 100%)" }}
      />
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(168,85,247,0.4), transparent)" }}
      />

      <div className="relative z-10 p-6 sm:p-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          {/* Availability */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="absolute w-5 h-5 rounded-full bg-green-400/20 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/40" />
            </div>
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Currently Available
            </span>
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
            >
              Open to Work
            </div>
          </div>

          {/* Typing status — right side */}
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl sm:ml-auto sm:max-w-xs"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}
          >
            <TypingStatus />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {FUN_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl cursor-default transition-all duration-300 text-center overflow-hidden"
              style={{
                background: hovered === i ? stat.color : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === i ? stat.border : "rgba(255,255,255,0.08)"}`,
                transform: hovered === i ? "translateY(-3px) scale(1.03)" : "translateY(0) scale(1)",
                boxShadow: hovered === i ? `0 8px 24px ${stat.glow}` : "none",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Shine on hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent transition-transform duration-700"
                  style={{ transform: hovered === i ? "translateX(100%)" : "translateX(-100%)" }}
                />
              </div>
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <div className="text-xl font-black text-white leading-none">{stat.value}</div>
                <div className="text-[10px] font-mono mt-1 leading-tight" style={{ color: "#6b7280" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom divider + tagline */}
        <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        <div className="flex items-center justify-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#6366f1] animate-pulse" />
          <span className="text-[11px] font-mono text-center" style={{ color: "#4b5563" }}>
            Response time &lt; 24hrs · Let's build something great together 🚀
          </span>
          <span className="w-1 h-1 rounded-full bg-[#a855f7] animate-pulse" />
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), rgba(99,102,241,0.3), transparent)" }}
      />
    </div>
  );
};

/* ─── Contact Page ─── */
const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    AOS.init({ once: false, duration: 700, easing: "ease-out-cubic" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    Swal.fire({
      title: "Sending Message...",
      html: "Please wait while we send your message",
      allowOutsideClick: false,
      background: "#0f0f1a",
      color: "#e2e8f0",
      didOpen: () => Swal.showLoading(),
    });
    try {
      await e.target.submit();
      Swal.fire({
        title: "Message Sent!",
        text: "Thanks for reaching out. I'll get back to you soon!",
        icon: "success",
        confirmButtonColor: "#6366f1",
        background: "#0f0f1a",
        color: "#e2e8f0",
        timer: 2500,
        timerProgressBar: true,
      });
      setFormData({ name: "", email: "", message: "" });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#6366f1",
        background: "#0f0f1a",
        color: "#e2e8f0",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (name) =>
    `w-full p-4 pl-12 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300 bg-white/5 border ${
      focused === name
        ? "border-[#6366f1]/70 bg-[#6366f1]/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
        : "border-white/10 hover:border-white/20"
    }`;

  return (
    <div className="relative bg-[#030014] overflow-hidden" id="Contact">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-[-10%] w-[400px] h-[400px] rounded-full bg-[#6366f1]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-[-5%] w-[350px] h-[350px] rounded-full bg-[#a855f7]/8 blur-[100px]" />
      </div>

      <div className="relative px-[5%] lg:px-[10%] py-24">

        {/* ── Header ── */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold uppercase tracking-widest mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#a855f7]">
            Contact Me
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base mt-4 leading-relaxed">
            Feel free to reach out with any questions — I'll respond as soon as possible.
          </p>
          <div className="flex justify-center mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#6366f1]/60 to-transparent" />
          </div>
        </div>

        {/* ── Two column grid — equal height ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">

          {/* ── Left: Social (full height) ── */}
          <div className="flex flex-col" data-aos="fade-right" data-aos-delay="100">
            <div className="flex-1">
              <SocialLinks fullHeight />
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="relative flex flex-col" data-aos="fade-left" data-aos-delay="100">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-[#6366f1]/20 via-transparent to-[#a855f7]/20 blur-sm opacity-60" />
            <div className="relative flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 flex flex-col">
              {/* Form header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-white/10">
                  <Send className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Send a Message</h3>
                  <p className="text-gray-600 text-xs font-mono">All fields required</p>
                </div>
              </div>

              <form
                action="https://formsubmit.co/krabhishek0321@gmail.com"
                method="POST"
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 gap-5"
              >
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />

                <div className="relative group">
                  <User className={`absolute left-4 top-4 w-4 h-4 transition-colors duration-300 ${focused === "name" ? "text-[#6366f1]" : "text-gray-600"}`} />
                  <input type="text" name="name" placeholder="Your Name" value={formData.name}
                    onChange={handleChange} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                    disabled={isSubmitting} className={inputClass("name")} required />
                </div>

                <div className="relative group">
                  <Mail className={`absolute left-4 top-4 w-4 h-4 transition-colors duration-300 ${focused === "email" ? "text-[#6366f1]" : "text-gray-600"}`} />
                  <input type="email" name="email" placeholder="Your Email" value={formData.email}
                    onChange={handleChange} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    disabled={isSubmitting} className={inputClass("email")} required />
                </div>

                <div className="relative group flex-1">
                  <MessageSquare className={`absolute left-4 top-4 w-4 h-4 transition-colors duration-300 ${focused === "message" ? "text-[#6366f1]" : "text-gray-600"}`} />
                  <textarea name="message" placeholder="Your Message" value={formData.message}
                    onChange={handleChange} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                    disabled={isSubmitting}
                    className={`${inputClass("message")} resize-none h-full min-h-[120px]`}
                    required />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full py-4 rounded-xl font-bold text-sm text-white overflow-hidden
                    bg-gradient-to-r from-[#6366f1] to-[#a855f7]
                    shadow-lg shadow-[#6366f1]/20 hover:shadow-[#6366f1]/40 hover:scale-[1.02]
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                    transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        Send Message
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Full width Fun Section ── */}
        <div className="max-w-6xl mx-auto mt-8">
          <FunSection />
        </div>

      </div>
    </div>
  );
};

export default ContactPage;