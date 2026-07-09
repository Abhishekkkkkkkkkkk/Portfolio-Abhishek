import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./index.css";

// Global Shared Components
import MatrixRain from "./components/effects/MatrixRain";
import CommandPalette from "./components/common/CommandPalette";
import Footer from "./components/layout/Footer";

// Route Page Wrappers
import Home from "./pages/Home";
import ProjectDetails from "./pages/ProjectDetail";
import BlogDetail from "./pages/BlogDetail";
import UnsubscribePage from "./pages/Unsubscribe";
import Playground from "./pages/Playground";
import BlogHome from "./pages/BlogHome";
import InterviewPrep from "./pages/InterviewPrep";
import InterviewCategoryDetail from "./pages/InterviewCategoryDetail";
import CompanyDetail from "./pages/CompanyDetail";
import PortfolioAdminHub from "./pages/PortfolioAdminHub";

/* ─── Project Page Layout ─── */
const ProjectPageLayout = () => (
  <>
    <ProjectDetails />
    <Footer />
  </>
);

/* ─── Blog Page Layout ─── */
const BlogPageLayout = () => <BlogDetail />;

/* ─── Redirect Helper for Dynamic Params ─── */
const RedirectWithParams = ({ to }) => {
  const params = useParams();
  let target = to;
  Object.entries(params).forEach(([key, val]) => {
    target = target.replace(`:${key}`, val);
  });
  return <Navigate to={target} replace />;
};

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {matrixEnabled && <MatrixRain />}
      <CommandPalette />
      <Routes>
        <Route
          path="/"
          element={
            <Home
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
          path="/blog" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <BlogHome />
            </React.Suspense>
          } 
        />
        <Route 
          path="/blog/topic/:topicId" 
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
          path="/blog/topic/:topicId/:blogId" 
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
        <Route 
          path="/interview-questions" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <InterviewPrep />
            </React.Suspense>
          } 
        />
        <Route 
          path="/interview-questions/topic/:categoryId" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <InterviewCategoryDetail />
            </React.Suspense>
          } 
        />
        <Route 
          path="/interview-questions/company/:companyName" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <CompanyDetail />
            </React.Suspense>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <React.Suspense fallback={
              <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
              </div>
            }>
              <PortfolioAdminHub />
            </React.Suspense>
          } 
        />
        {/* Fallbacks / redirects for backward compatibility */}
        <Route path="/admin/interview-editor" element={<Navigate to="/admin?tab=interview" replace />} />
        <Route path="/interview-prep" element={<Navigate to="/interview-questions" replace />} />
        <Route path="/interview-prep/topic/:categoryId" element={<RedirectWithParams to="/interview-questions/topic/:categoryId" />} />
        <Route path="/interview-prep/company/:companyName" element={<RedirectWithParams to="/interview-questions/company/:companyName" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
