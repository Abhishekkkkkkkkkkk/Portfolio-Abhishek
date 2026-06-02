import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import "./index.css";
import Home from "./sections/Home";
import About from "./sections/About";
import AnimatedBackground from "./layouts/Background";
import Navbar from "./layouts/Navbar";
import Portfolio from "./sections/Portfolio";
import ContactPage from "./sections/Contact";
import ProjectDetails from "./pages/ProjectDetail";
import BlogDetail from "./pages/BlogDetail";
import WelcomeScreen from "./pages/WelcomeScreen";
import Footer from "./layouts/Footer";
import { AnimatePresence } from "framer-motion";

/* ─── Landing Page ─── */
const LandingPage = ({ showWelcome, setShowWelcome }) => (
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
        <ContactPage />
        <Footer />
      </>
    )}
  </>
);

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

/* ─── App ─── */
function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
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
        <Route path="/project/:id" element={<ProjectPageLayout />} />
        <Route path="/blog/:id" element={<BlogPageLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
