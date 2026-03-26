import React from "react";
import { Linkedin, Github, Instagram, ExternalLink } from "lucide-react";

const socialLinks = [
  {
    name: "LinkedIn",
    displayName: "LinkedIn",
    subText: "@abhishek2k24",
    icon: Linkedin,
    url: "https://www.linkedin.com/in/abhishek2k24/",
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#0077B5]",
    glowColor: "rgba(10,102,194,0.25)",
    isPrimary: true,
  },
  {
    name: "GitHub",
    displayName: "GitHub",
    subText: "@Abhishekkkkkkkkkkk",
    icon: Github,
    url: "https://github.com/Abhishekkkkkkkkkkk",
    color: "#ffffff",
    gradient: "from-[#333] to-[#24292e]",
    glowColor: "rgba(255,255,255,0.1)",
  },
  {
    name: "Instagram",
    displayName: "Instagram",
    subText: "@ig_abhishek_2k02",
    icon: Instagram,
    url: "https://www.instagram.com/ig_abhishek_2k02/",
    color: "#E4405F",
    gradient: "from-[#833AB4] via-[#E4405F] to-[#FCAF45]",
    glowColor: "rgba(228,64,95,0.2)",
  },
  {
    name: "GeeksForGeeks",
    displayName: "GeeksForGeeks",
    subText: "@krabhishek0321",
    icon: ({ className }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
        <path fill="#43a047" d="M29.035,24C29.014,23.671,29,23.339,29,23c0-6.08,2.86-10,7-10c3.411,0,6.33,2.662,7,7l2,0l0.001-9 L43,11c0,0-0.533,1.506-1,1.16c-1.899-1.066-3.723-1.132-6.024-1.132C30.176,11.028,25,16.26,25,22.92 c0,0.364,0.021,0.723,0.049,1.08h-2.099C22.979,23.643,23,23.284,23,22.92c0-6.66-5.176-11.892-10.976-11.892 c-2.301,0-4.125,0.065-6.024,1.132C5.533,12.506,5,11,5,11l-2.001,0L3,20l2,0c0.67-4.338,3.589-7,7-7c4.14,0,7,3.92,7,10 c0,0.339-0.014,0.671-0.035,1H0v2h1.009c1.083,0,1.977,0.861,1.999,1.943C3.046,29.789,3.224,32.006,4,33 c1.269,1.625,3,3,8,3c5.022,0,9.92-4.527,11-10h2c1.08,5.473,5.978,10,11,10c5,0,6.731-1.375,8-3 c0.776-0.994,0.954-3.211,0.992-5.057C45.014,26.861,45.909,26,46.991,26H48v-2H29.035z M11.477,33.73 C9.872,33.73,7.322,33.724,7,32c-0.109-0.583-0.091-2.527-0.057-4.046C6.968,26.867,7.855,26,8.943,26H19 C18.206,30.781,15.015,33.73,11.477,33.73z M41,32c-0.322,1.724-2.872,1.73-4.477,1.73 c-3.537,0-6.729-2.949-7.523-7.73h10.057c1.088,0,1.975,0.867,2,1.954C41.091,29.473,41.109,31.417,41,32z" />
      </svg>
    ),
    url: "https://www.geeksforgeeks.org/user/krabhishek0321/",
    color: "#43a047",
    gradient: "from-[#43a047] to-[#2e7d32]",
    glowColor: "rgba(67,160,71,0.2)",
  },
  {
    name: "LeetCode",
    displayName: "LeetCode",
    subText: "@Abhi_1_2_3",
    icon: ({ className }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#f89f1b" d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
      </svg>
    ),
    url: "https://leetcode.com/u/Abhi_1_2_3/",
    color: "#f89f1b",
    gradient: "from-[#f89f1b] to-[#e68a00]",
    glowColor: "rgba(248,159,27,0.2)",
  },
];

/* ─── Single Social Card ─── */
const SocialCard = ({ link, size = "normal" }) => {
  const isLarge = size === "large";
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:scale-[1.02] hover:-translate-y-0.5"
      style={{ padding: isLarge ? "16px 20px" : "12px 16px" }}
    >
      {/* Gradient tint on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.07] bg-gradient-to-r ${link.gradient} transition-opacity duration-400`} />

      {/* Shine sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </div>

      {/* Glow border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${link.glowColor}` }}
      />

      {/* Icon + text */}
      <div className="relative flex items-center gap-3">
        <div className="relative flex items-center justify-center shrink-0">
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-all duration-400 blur-sm"
            style={{ backgroundColor: link.color }}
          />
          <div
            className="relative flex items-center justify-center rounded-xl border border-white/10 bg-white/8 group-hover:border-white/20 transition-all duration-300"
            style={{ padding: isLarge ? "10px" : "8px" }}
          >
            <link.icon
              className={`transition-transform duration-300 group-hover:scale-110 ${isLarge ? "w-6 h-6" : "w-5 h-5"}`}
              style={{ color: link.color }}
            />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`font-bold text-gray-200 group-hover:text-white transition-colors duration-300 leading-tight ${isLarge ? "text-base" : "text-sm"}`}>
            {link.displayName}
          </span>
          <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 truncate font-mono">
            {link.subText}
          </span>
        </div>
      </div>

      <ExternalLink
        className={`relative shrink-0 text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300 ${isLarge ? "w-4 h-4" : "w-3.5 h-3.5"}`}
      />
    </a>
  );
};

/* ─── Social Links Panel ─── */
const SocialLinks = ({ fullHeight = false }) => {
  const primary = socialLinks.find((l) => l.isPrimary);
  const others = socialLinks.filter((l) => !l.isPrimary);

  return (
    <div className={`relative w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden ${fullHeight ? "h-full flex flex-col" : ""}`}>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/50 to-transparent" />

      <div className={`p-5 sm:p-6 ${fullHeight ? "flex flex-col flex-1" : ""}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#6366f1]/30" />
          <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Connect</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#6366f1]/30" />
        </div>

        <div className={`flex flex-col gap-3 ${fullHeight ? "flex-1" : ""}`}>
          {/* LinkedIn full width */}
          <SocialCard link={primary} size="large" />

          {/* Others in 2x2 grid — flex-1 makes them fill remaining space */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${fullHeight ? "flex-1" : ""}`}>
            {others.map((link) => (
              <SocialCard key={link.name} link={link} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />
    </div>
  );
};

export default SocialLinks;