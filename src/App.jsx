import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./index.css";
import Home from "./sections/Home";
import About from "./sections/About";
import AnimatedBackground from "./layouts/Background";
import Navbar from "./layouts/Navbar";
import Portfolio from "./sections/Portfolio";
import ContactPage from "./sections/Contact";
import WelcomeScreen from "./pages/WelcomeScreen";
import Footer from "./layouts/Footer";
import { AnimatePresence } from "framer-motion";
import PlaygroundTeaser from "./sections/PlaygroundTeaser";
import MatrixRain from "./components/effects/MatrixRain";

const ProjectDetails = React.lazy(() => import("./pages/ProjectDetail"));
const BlogDetail = React.lazy(() => import("./pages/BlogDetail"));
const UnsubscribePage = React.lazy(() => import("./pages/Unsubscribe"));
const Playground = React.lazy(() => import("./pages/Playground"));

/* ─── Landing Page ─── */
const LandingPage = ({ showWelcome, setShowWelcome }) => {
  React.useEffect(() => {
    document.title = "Abhishek Kumar | Java Full Stack Developer";
    
    const updateMeta = (selector, name, property, value) => {
      let el = document.querySelector(selector);
      if (el) {
        el.setAttribute("content", value);
      }
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
          <Home />
          <About />
          <Portfolio />
          <PlaygroundTeaser />
          <ContactPage />
          <Footer />
        </>
      )}
    </>
  );
};

/* ─── Project Page Layout ─── */
const ProjectPageLayout = () => (
  <>
    <ProjectDetails />
    <Footer />
  </>
);

/* ─── Blog Page Layout ─── */
const BlogPageLayout = () => (
  <>
    <BlogDetail />
    <Footer />
  </>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [matrixEnabled, setMatrixEnabled] = useState(() => localStorage.getItem("global-matrix") === "true");

  useEffect(() => {
    const handleMatrixChange = (e) => {
      setMatrixEnabled(e.detail);
    };
    window.addEventListener("global-matrix-changed", handleMatrixChange);
    return () => window.removeEventListener("global-matrix-changed", handleMatrixChange);
  }, []);

  return (
    <BrowserRouter>
      {matrixEnabled && <MatrixRain />}
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              showWelcome={showWelcome}
              setShowWelcome={setShowWelcome}
            />
          }
        />
        <Route 
          path="/project/:id" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <ProjectPageLayout />
            </React.Suspense>
          } 
        />
        <Route 
          path="/blog/:id" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <BlogPageLayout />
            </React.Suspense>
          } 
        />
        <Route 
          path="/unsubscribe" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <UnsubscribePage />
            </React.Suspense>
          } 
        />
        <Route 
          path="/playground" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <Playground />
            </React.Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
