import React from "react";
import Navbar from "../components/layout/Navbar";
import AnimatedBackground from "../components/layout/Background";
import HomeHeroSection from "../features/home/widgets/HomeHeroSection";
import AboutSection from "../features/about/widgets/AboutSection";
import PortfolioSection from "../features/portfolio/widgets/PortfolioSection";
import PlaygroundTeaser from "../features/playground/widgets/PlaygroundTeaser";
import GuestbookSection from "../features/contact/widgets/GuestbookSection";
import ContactSection from "../features/contact/widgets/ContactSection";
import Footer from "../components/layout/Footer";
import WelcomeScreen from "./WelcomeScreen";
import { AnimatePresence } from "framer-motion";

export default function Home({ showWelcome, setShowWelcome }) {
  React.useEffect(() => {
    document.title = "Abhishek Kumar | Java Full Stack Developer";
    const updateMeta = (selector, name, property, value) => {
      let el = document.querySelector(selector);
      if (el) el.setAttribute("content", value);
    };
    updateMeta('meta[name="description"]', 'description', null, "Portfolio of Abhishek Kumar, a Java Full Stack Developer in Pune with 3 years of experience engineering secure, scalable microservices and interactive user interfaces.");
    updateMeta('meta[property="og:title"]', null, 'og:title', "Abhishek Kumar | Java Full Stack Developer");
    updateMeta('meta[property="og:description"]', null, 'og:description', "3 years of experience engineering scalable Spring Boot microservices, securing APIs with OAuth/JWT, and building responsive React interfaces.");
    updateMeta('meta[name="twitter:title"]', 'twitter:title', null, "Abhishek Kumar | Java Full Stack Developer");
    updateMeta('meta[name="twitter:description"]', 'twitter:description', null, "Full-stack engineer specializing in Spring Boot, MySQL, MongoDB, React, and REST APIs.");
    updateMeta('meta[name="keywords"]', 'keywords', null, "Abhishek Kumar, Java Full Stack Developer, Software Engineer Pune, Spring Boot Developer, React Developer Pune, Abhishek Sofrego, krabhishek");
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <Navbar />
          <AnimatedBackground />
          <HomeHeroSection />
          <AboutSection />
          <PortfolioSection />
          <PlaygroundTeaser />
          <GuestbookSection />
          <ContactSection />
          <Footer />
        </>
      )}
    </>
  );
}
