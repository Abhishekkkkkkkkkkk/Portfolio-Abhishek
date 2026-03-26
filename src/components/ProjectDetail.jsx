import React, { useEffect, useState, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ExternalLink, Github, Code2, Star,
  ChevronRight, Layers, Globe, Package, Cpu, Code,
  Layout, Sparkles, CheckCircle2, Lock,
} from "lucide-react";
import Swal from "sweetalert2";

/* ─── Tech icon map ─── */
const TECH_ICONS = {
  React: Globe, Tailwind: Layout, Express: Cpu,
  Python: Code, Javascript: Code, HTML: Code,
  CSS: Code, default: Package,
};

/* ─── Tech Badge ─── */
const TechBadge = memo(({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS.default;
  return (
    <div className="group relative overflow-hidden px-3 py-2 rounded-xl border border-[#6366f1]/15 bg-[#6366f1]/8 hover:border-[#6366f1]/40 hover:bg-[#6366f1]/15 hover:scale-105 transition-all duration-300 cursor-default">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/4 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 pointer-events-none" />
      <div className="relative flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#818cf8] group-hover:text-[#a78bfa] transition-colors" />
        <span className="text-xs font-semibold text-[#818cf8] group-hover:text-white transition-colors whitespace-nowrap">
          {tech}
        </span>
      </div>
    </div>
  );
});

/* ─── Feature Item ─── */
const FeatureItem = memo(({ feature, index }) => (
  <li
    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/4 transition-all duration-300 border border-transparent hover:border-white/8"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="shrink-0 mt-0.5">
      <CheckCircle2 className="w-4 h-4 text-[#6366f1]/60 group-hover:text-[#a78bfa] transition-colors duration-300" />
    </div>
    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
      {feature}
    </span>
  </li>
));

/* ─── Stats Card ─── */
const StatCard = memo(({ icon: Icon, value, label, color }) => (
  <div className={`group relative flex items-center gap-3 p-4 rounded-2xl border bg-white/4 hover:scale-105 transition-all duration-300 overflow-hidden ${color}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative p-2.5 rounded-xl bg-white/8">
      <Icon className="w-5 h-5" strokeWidth={1.5} />
    </div>
    <div className="relative">
      <div className="text-2xl font-black text-white leading-none">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest font-mono">{label}</div>
    </div>
  </div>
));

/* ─── Github handler ─── */
const handleGithubClick = (githubLink) => {
  if (githubLink === "Private") {
    Swal.fire({
      icon: "info",
      title: "Source Code Private",
      text: "This repository is private and not publicly accessible.",
      confirmButtonText: "Got it",
      confirmButtonColor: "#6366f1",
      background: "#0a0a1a",
      color: "#e2e8f0",
    });
    return false;
  }
  return true;
};

/* ─── Main Component ─── */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = JSON.parse(localStorage.getItem("projects")) || [];
    const found = stored.find((p) => String(p.id) === id);
    if (found) {
      setProject({
        ...found,
        Features: found.Features || [],
        TechStack: found.TechStack || [],
        Github: found.Github || "https://github.com/Abhishekkkkkkkkkkk",
      });
    }
  }, [id]);

  /* Loading state */
  if (!project) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-[#6366f1]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#6366f1] animate-spin" />
            <div className="absolute inset-3 rounded-full bg-[#6366f1]/10" />
          </div>
          <p className="text-gray-500 text-sm font-mono tracking-widest uppercase">Loading project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">

      {/* ── Fixed background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#6366f1]/8 blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#a855f7]/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#22d3ee]/4 blur-[80px]" />
        {/* Animated blobs */}
        <div className="absolute top-0 -left-4 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-80 h-80 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-500/8 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-16">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-3 mb-10 animate-fadeIn">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-gray-400 hover:text-white hover:border-[#6366f1]/40 hover:bg-[#6366f1]/10 transition-all duration-300 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
            <span className="text-gray-500">Projects</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300 truncate max-w-[200px]">{project.Title}</span>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-8 animate-slideInLeft">

            {/* Title block */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Project
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                {project.Title}
              </h1>
              {/* Animated underline */}
              <div className="relative h-1 w-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-sm" />
              </div>
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm border-l-2 border-l-[#6366f1]/50">
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                {project.Description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Code2}
                value={project.TechStack.length}
                label="Technologies"
                color="border-[#6366f1]/20 text-[#818cf8]"
              />
              <StatCard
                icon={Layers}
                value={project.Features.length}
                label="Features"
                color="border-[#a855f7]/20 text-[#c084fc]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={project.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden bg-gradient-to-r from-[#6366f1] to-[#a855f7] shadow-lg shadow-[#6366f1]/20 hover:shadow-[#6366f1]/40 hover:scale-105 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <ExternalLink className="relative w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="relative">Live Demo</span>
              </a>

              <a
                href={project.Github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => !handleGithubClick(project.Github) && e.preventDefault()}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-white/10 bg-white/5 text-gray-300 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 hover:text-white hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {project.Github === "Private"
                  ? <Lock className="relative w-4 h-4" />
                  : <Github className="relative w-4 h-4 group-hover:rotate-12 transition-transform" />
                }
                <span className="relative">
                  {project.Github === "Private" ? "Private Repo" : "GitHub"}
                </span>
              </a>
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Code2 className="w-4 h-4 text-[#6366f1]" />
                <h3 className="text-base font-bold text-white">Tech Stack</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-[#6366f1]/30 to-transparent" />
              </div>
              {project.TechStack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.TechStack.map((tech, i) => (
                    <TechBadge key={i} tech={tech} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 font-mono">No technologies listed.</p>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6 animate-slideInRight">

            {/* Project image */}
            <div className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Glow ring */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Image skeleton */}
              {!imgLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/6 animate-pulse flex items-center justify-center">
                  <span className="text-5xl opacity-20">🖥️</span>
                </div>
              )}

              <img
                src={project.Img}
                alt={project.Title}
                onLoad={() => setImgLoaded(true)}
                className={`w-full object-cover transform transition-all duration-700 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030014]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              {/* Corner border effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-[#6366f1]/20 transition-colors duration-300" />
            </div>

            {/* Key Features */}
            <div className="relative rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Key Features</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/20 to-transparent" />
                </div>

                {project.Features.length > 0 ? (
                  <ul className="space-y-1">
                    {project.Features.map((feature, i) => (
                      <FeatureItem key={i} feature={feature} index={i} />
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <Star className="w-8 h-8 text-gray-700" />
                    <p className="text-gray-600 text-sm">No features listed yet.</p>
                  </div>
                )}
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn      { animation: fadeIn 0.6s ease-out; }
        .animate-slideInLeft  { animation: slideInLeft 0.7s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.7s ease-out; }
      `}</style>
    </div>
  );
};

export default ProjectDetails;