import React, { useEffect, memo } from "react";
import { FileText, Code, Sparkles } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
        data-aos="zoom-in-up"
        data-aos-duration="600"
      >
        About Me
      </h2>
    </div>
    <p
      className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
      data-aos-duration="800"
    >
      <Sparkles className="w-5 h-5 text-purple-400" />
      FRONTEND DEVELOPER || MERN STACK || DSA || PROBLEM SOLVER
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
));

const ProfileImage = memo(() => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div className="relative group" data-aos="fade-up" data-aos-duration="1000">
      <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)]">
        <img
          src="/photo.jpg"
          alt="Profile"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
          loading="lazy"
        />
      </div>
    </div>
  </div>
));

const EducationSection = () => (
  <div className="flex flex-col lg:flex-row gap-8">
    {/* Left Side - Education Section */}
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full hover:shadow-2xl transition-all duration-300">
      <h3 className="text-xl font-semibold text-[#a855f7] hover:text-[#6366f1] cursor-pointer transition-all duration-300">Education</h3>
      <div className="mt-4 space-y-6">
        {/* Education Cards */}
        <div className="relative bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-500 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <p className="text-[#a855f7] font-bold inline">Collage Name:</p>
            <p className="text-gray-300 inline ml-2">Chameli Devi Group of Institutions, Indore</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Course:</p>
            <p className="text-gray-300 inline ml-2">B.Tech in Computer Science</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Marks:</p>
            <p className="text-gray-300 inline ml-2">8 CGPA</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Year:</p>
            <p className="text-gray-300 inline ml-2">2020-2024</p>
          </div>
        </div>

        <div className="relative bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-500 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <p className="text-[#a855f7] font-bold inline">Board Name:</p>
            <p className="text-gray-300 inline ml-2">Bihar School Examination Board, Patna</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Course:</p>
            <p className="text-gray-300 inline ml-2">12th</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Marks:</p>
            <p className="text-gray-300 inline ml-2">72.6%</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Year:</p>
            <p className="text-gray-300 inline ml-2">2018-2020</p>
          </div>
        </div>

        <div className="relative bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-500 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <p className="text-[#a855f7] font-bold inline">Board Name:</p>
            <p className="text-gray-300 inline ml-2">Bihar School Examination Board, Patna</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Course:</p>
            <p className="text-gray-300 inline ml-2">10th</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Marks:</p>
            <p className="text-gray-300 inline ml-2">65%</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Year:</p>
            <p className="text-gray-300 inline ml-2">2017-2018</p>
          </div>
        </div>
      </div>
    </div>

    {/* Right Side - Experience Section */}
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full hover:shadow-2xl transition-all duration-300">
      <h3 className="text-xl font-semibold text-[#a855f7] hover:text-[#6366f1] cursor-pointer transition-all duration-300">Experience</h3>
      <div className="mt-4 space-y-6">
        {/* Experience Cards */}
        <div className="relative bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-500 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <p className="text-[#a855f7] font-bold inline">Company Name:</p>
            <p className="text-gray-300 inline ml-2">Innobyte Service</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Duration:</p>
            <p className="text-gray-300 inline ml-2">1 Month || Remote</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Role:</p>
            <p className="text-gray-300 inline ml-2">Web Developer Intern</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Year:</p>
            <p className="text-gray-300 inline ml-2">2024</p>
          </div>
        </div>

        <div className="relative bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-500 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <p className="text-[#a855f7] font-bold inline">Company Name:</p>
            <p className="text-gray-300 inline ml-2">Oasis Infobyte</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Duration:</p>
            <p className="text-gray-300 inline ml-2">1 Month || Remote</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Role:</p>
            <p className="text-gray-300 inline ml-2">Web Developer</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Year:</p>
            <p className="text-gray-300 inline ml-2">2023</p>
          </div>
        </div>

        <div className="relative bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-500 hover:scale-105 transition-all duration-300 group">
          <div className="relative">
            <p className="text-[#a855f7] font-bold inline">Company Name:</p>
            <p className="text-gray-300 inline ml-2">Bharat Intern</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Duration:</p>
            <p className="text-gray-300 inline ml-2">1 Month || Remote</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Role:</p>
            <p className="text-gray-300 inline ml-2">Web Developer Intern</p>
            <br />
            <p className="text-[#a855f7] font-bold inline">Year:</p>
            <p className="text-gray-300 inline ml-2">2023</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);






const AboutPage = () => {
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: false,
      });
    };

    initAOS();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm-mt-0"
      id="About"
    >
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I'm
              </span>
              <span
                className="block mt-2 text-gray-200"
                data-aos="fade-right"
                data-aos-duration="1300"
              >
                Abhishek Kumar
              </span>
            </h2>

            <p
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify pb-4 sm:pb-0"
              data-aos="fade-right"
              data-aos-duration="1500"
            >
              I'm currently looking for a new opportunity in the Software
              Industry, leveraging my expertise in web development and
              proficiency in the MERN Stack., I'm ideally seeking a new position
              as a Frontend Developer.
            </p>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-4 lg:px-0 w-full">
              <a
                href="https://drive.google.com/file/d/16ZtqGl8lytjLsrTEw2RFto1eEIZAk1cL/view?usp=drivesdk"
                className="w-full lg:w-auto"
              >
                <button
                  data-aos="fade-up"
                  data-aos-duration="800"
                  className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl animate-bounce-slow"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Download CV
                </button>
              </a>
              <a href="#Portofolio" className="w-full lg:w-auto">
                <button
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg border border-[#a855f7]/50 text-[#a855f7] font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 hover:bg-[#a855f7]/10 animate-bounce-slow delay-200"
                >
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
                </button>
              </a>
            </div>
          </div>

          <ProfileImage />
        </div>
      </div>

      <div className="mt-16">
        <EducationSection />
      </div>
    </div>
  );
};

export default memo(AboutPage);
