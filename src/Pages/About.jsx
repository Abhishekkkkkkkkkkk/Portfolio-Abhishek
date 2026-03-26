import React, { useEffect, memo, useState, useRef } from "react";
import {
  FileText,
  Code,
  Sparkles,
  GraduationCap,
  Briefcase,
  MapPin,
  Coffee,
  Zap,
  Globe,
  ChevronDown,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

import { educationData, experienceData } from "../data/timelineData";
import EducationTimelineItem from "../components/EducationTimelineItem";
import ExperienceTimelineItem from "../components/ExperienceTimelineItem";

/* ─── Floating Orb Background ─── */
const FloatingOrbs = memo(() => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#6366f1]/10 blur-[120px] animate-pulse" />
    <div
      className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-[#a855f7]/10 blur-[100px] animate-pulse"
      style={{ animationDelay: "1.5s" }}
    />
    <div
      className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-[#22d3ee]/8 blur-[90px] animate-pulse"
      style={{ animationDelay: "3s" }}
    />
    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </div>
));

/* ─── Animated Counter ─── */
const Counter = ({ end, suffix = "", label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1800;
          const step = Math.ceil(end / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#22d3ee] to-[#6366f1] tabular-nums">
        {count}
        {suffix}
      </div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">
        {label}
      </div>
    </div>
  );
};

/* ─── Skill Tag ─── */
const SkillTag = memo(({ skill, delay = 0 }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
      border border-white/10 bg-white/5 text-gray-300
      hover:border-[#6366f1]/60 hover:bg-[#6366f1]/10 hover:text-white hover:scale-105
      transition-all duration-300 cursor-default"
    style={{ animationDelay: `${delay}ms` }}
    data-aos="fade-up"
    data-aos-delay={delay}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
    {skill}
  </span>
));

/* ─── Section Divider ─── */
const SectionDivider = memo(({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-10" data-aos="fade-right">
    <div className="relative">
      <div className="absolute inset-0 bg-[#6366f1]/30 rounded-xl blur-md" />
      <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-white/10">
        <Icon className="w-5 h-5 text-[#22d3ee]" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-[#6366f1]/40 to-transparent ml-2" />
  </div>
));

/* ─── Header ─── */
const Header = memo(() => (
  <div className="text-center mb-16 relative">
    {/* Label chip */}
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold uppercase tracking-widest mb-6"
      data-aos="fade-down"
    >
      <Sparkles className="w-3.5 h-3.5" />
      Portfolio · About
    </div>

    <h2
      className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
      data-aos="zoom-in-up"
    >
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#22d3ee]">
        About Me
      </span>
    </h2>

    <p
      className="mt-4 text-gray-500 text-sm sm:text-base font-mono tracking-wider"
      data-aos="zoom-in-up"
      data-aos-delay="100"
    >
      FULLSTACK · FRONTEND · BACKEND · DSA · PROBLEM SOLVER
    </p>

    {/* Decorative underline */}
    <div className="mt-6 flex justify-center" data-aos="zoom-in" data-aos-delay="200">
      <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
    </div>
  </div>
));

/* ─── Profile Image ─── */
const ProfileImage = memo(() => (
  <div
    className="flex justify-center lg:justify-end items-center"
    data-aos="fade-left"
  >
    <div className="relative">
      {/* Outer glow ring */}
      <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-[#6366f1]/30 via-[#a855f7]/20 to-[#22d3ee]/30 blur-xl animate-pulse" />
      {/* Spinning dashed ring */}
      <div
        className="absolute -inset-2 rounded-full border border-dashed border-[#6366f1]/30"
        style={{ animation: "spin 20s linear infinite" }}
      />
      {/* Solid accent ring */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#22d3ee] opacity-40" />
      {/* Image */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-white/10">
        <img
          src="/photo.jpg"
          alt="Abhishek Kumar"
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
      </div>
      {/* Status badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f172a] border border-white/10 shadow-xl whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-gray-300 font-medium">Open to Work</span>
      </div>
      {/* Location badge */}
      <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172a] border border-white/10 shadow-xl">
        <MapPin className="w-3 h-3 text-[#22d3ee]" />
        <span className="text-xs text-gray-400">India</span>
      </div>
    </div>
  </div>
));

/* ─── Main About ─── */
const About = () => {
  useEffect(() => {
    AOS.init({ once: false, duration: 700, easing: "ease-out-cubic" });
  }, []);

  const skills = [
    "Java", "JavaScript", "TypeScript", "React.js", "Next.js",
    "Spring Boot", "Node.js", "REST APIs", "MySQL", "MongoDB",
    "JWT", "OAuth", "Git", "Docker", "DSA",
  ];

  return (
    <section
      id="About"
      className="relative px-[5%] lg:px-[10%] py-24 text-white overflow-hidden"
    >
      <FloatingOrbs />

      {/* ── Header ── */}
      <Header />

      {/* ── Hero Intro ── */}
      <div className="relative w-full mx-auto pt-4 mb-24">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-mono text-[#22d3ee] mb-3 tracking-widest" data-aos="fade-right">
                &lt;Hello World /&gt;
              </p>
              <h3
                className="text-4xl sm:text-5xl font-black leading-tight"
                data-aos="fade-right"
                data-aos-delay="50"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                  I'm
                </span>{" "}
                <span className="text-white">Abhishek</span>
                <br />
                <span className="text-gray-400 text-3xl sm:text-4xl font-bold">Kumar</span>
              </h3>
            </div>

            <p
              className="text-gray-400 leading-relaxed text-base sm:text-lg border-l-2 border-[#6366f1]/50 pl-4"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              Software Developer with <span className="text-[#22d3ee] font-semibold">2+ years</span> of experience building clean, scalable,
              and user-centric web applications. I work as a{" "}
              <span className="text-white font-semibold">Java Full Stack Developer</span>, using Java, JavaScript,
              Spring Boot, React.js, and Next.js to deliver high-quality,
              production-ready solutions - with a strong foundation in{" "}
              <span className="text-[#a855f7] font-semibold">DSA & Problem Solving</span>.
            </p>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2" data-aos="fade-right" data-aos-delay="150">
              {skills.map((s, i) => (
                <SkillTag key={s} skill={s} delay={i * 40} />
              ))}
            </div>

            {/* Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <a href="/Abhishek_CV.pdf" target="_blank" rel="noopener noreferrer">
                <button className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center gap-2 font-semibold shadow-lg shadow-[#6366f1]/20 hover:shadow-[#6366f1]/40 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FileText className="w-4 h-4" />
                  Download CV
                </button>
              </a>
              <a href="#Portofolio">
                <button className="px-6 py-3 rounded-xl border border-[#a855f7]/40 text-[#a855f7] flex items-center gap-2 font-semibold hover:bg-[#a855f7]/10 hover:border-[#a855f7]/70 hover:scale-105 transition-all duration-300">
                  <Code className="w-4 h-4" />
                  View Projects
                </button>
              </a>
            </div>
          </div>

          {/* Right Image */}
          <ProfileImage />
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div
        className="relative mb-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-8 overflow-hidden"
        data-aos="fade-up"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/5 via-transparent to-[#a855f7]/5" />
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <Counter end={2} suffix="+" label="Years Experience" />
          <Counter end={15} suffix="+" label="Projects Built" />
          <Counter end={500} suffix="+" label="DSA Problems" />
          <Counter end={5} suffix="+" label="Technologies" />
        </div>
      </div>

      {/* ── Timeline Sections ── */}
      <div className="flex flex-col gap-20">

        {/* Experience */}
        <div data-aos="fade-up">
          <SectionDivider
            icon={Briefcase}
            title="Work Experience"
            subtitle="My professional journey and contributions so far"
          />
          <div className="relative ml-1.5">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#7c3aed]/80 via-[#7c3aed]/30 to-transparent" />
            <div className="pl-8">
              {experienceData.map((item, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <ExperienceTimelineItem {...item} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education */}
        <div data-aos="fade-up">
          <SectionDivider
            icon={GraduationCap}
            title="Education"
            subtitle="Academic background and qualifications"
          />
          <div className="relative ml-1.5">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#7c3aed]/80 via-[#7c3aed]/30 to-transparent" />
            <div className="pl-8">
              {educationData.map((item, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <EducationTimelineItem {...item} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Scroll hint ── */}
      <div className="flex justify-center mt-20 opacity-30 animate-bounce">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
};

export default memo(About);