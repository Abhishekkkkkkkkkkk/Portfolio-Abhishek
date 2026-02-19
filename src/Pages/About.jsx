import React, { useEffect, memo } from "react";
import {
  FileText,
  Code,
  Sparkles,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

import Timeline from "../components/Timeline";
import { educationData, experienceData } from "../data/timelineData";

/* ---------------- Header ---------------- */

const Header = memo(() => (
  <div className="text-center mb-12">
    <h2
      className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
      data-aos="zoom-in-up"
    >
      About Me
    </h2>

    <p
      className="mt-3 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
    >
      <Sparkles className="w-5 h-5 text-purple-400" />
      FULLSTACK || FRONTEND || BACKEND || DSA || PROBLEM SOLVER
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
));

/* ---------------- Profile Image ---------------- */

const ProfileImage = memo(() => (
  <div
    className="flex justify-center lg:justify-end items-center p-4"
    data-aos="fade-up"
  >
    <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)]">
      <img
        src="/photo.jpg"
        alt="Profile"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  </div>
));

/* ---------------- Main About Page ---------------- */

const About = () => {
  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <section
      id="About"
      className="px-[5%] lg:px-[10%] py-24 text-white overflow-hidden"
    >
      {/* ===== About Header ===== */}
      <Header />

      {/* ===== Intro Section ===== */}
      <div className="w-full mx-auto pt-12 mb-32">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              data-aos="fade-right"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I'm
              </span>
              <span className="block mt-2 text-gray-200">Abhishek Kumar</span>
            </h3>

            <p
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed lg:w-[45rem]"
              data-aos="fade-right"
            >
              I’m a Software Developer with 2+ years of experience building clean, scalable, and user-centric web applications. I primarily work as a Java Full Stack Developer, using Java, JavaScript, Spring Boot, React.js, and Next.js to deliver high-quality, production-ready solutions. I have hands-on experience across the full stack, including developing RESTful APIs, integrating MySQL and MongoDB, and implementing secure authentication and authorization using JWT and OAuth. With a strong foundation in Data Structures & Algorithms and a commitment to continuous learning, I enjoy solving complex problems, collaborating with teams, and building software that creates real impact.
            </p>

            {/* Buttons */}
            <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
              {/* Download CV */}
              <a
                href="/Abhishek_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-20 inline-block"
              >
                <button className="relative z-20 cursor-pointer px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center gap-2 shadow-lg hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                  Download CV
                </button>
              </a>

              {/* View Projects */}
              <a href="#Portofolio" className="relative z-20 inline-block">
                <button className="relative z-20 cursor-pointer px-6 py-3 rounded-lg border border-[#a855f7]/50 text-[#a855f7] flex items-center gap-2 hover:bg-[#a855f7]/10 transition">
                  <Code className="w-5 h-5" />
                  View Projects
                </button>
              </a>
            </div>
          </div>

          {/* Right Image */}
          <ProfileImage />
        </div>
      </div>

      {/* ===== Education & Experience Section ===== */}
      {/* <h2 className="text-4xl font-bold text-center mb-20">
        Education & Experience
      </h2> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <Timeline
          title="Education"
          icon={GraduationCap}
          data={educationData}
          type="education"
        />

        <Timeline
          title="Experience"
          icon={Briefcase}
          data={experienceData}
          type="experience"
        />
      </div>
    </section>
  );
};

export default memo(About);
