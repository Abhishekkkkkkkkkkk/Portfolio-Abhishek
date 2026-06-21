import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

import BlogCard from "../components/BlogCard";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardProject from "../components/CardProject";
import TiltCard from "../components/effects/TiltCard";
import { playTap } from "../services/soundEffects";
import TechStackIcon from "../components/TechStackIcon";
import TechStackRow from "../components/TechStackRow";
import AOS from "aos";
import "aos/dist/aos.css";
import Certificate from "../components/Certificate";
import NoteCard from "../components/NoteCard";
import { Code, Award, Boxes, ChevronDown, ChevronUp, Sparkles, BookOpen, FileText, Search, X, ExternalLink } from "lucide-react";

/* ─── Toggle Button ─── */
const ToggleButton = memo(({ onClick, isShowingMore }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
      border border-white/10 bg-white/5 text-gray-400
      hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 hover:text-white
      transition-all duration-300 hover:scale-105 backdrop-blur-sm"
  >
    {isShowingMore ? (
      <>Show Less <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /></>
    ) : (
      <>Show More <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /></>
    )}
  </button>
));

/* ─── Tab Panel ─── */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

/* ─── Tech Stack Data ─── */
const techStacks = [
  { icon: "java.svg",           language: "JAVA" },
  { icon: "c++.svg",            language: "C++" },
  { icon: "javascript.svg",     language: "JavaScript" },
  { icon: "c.svg",              language: "C" },
  { icon: "html.svg",           language: "HTML" },
  { icon: "css.svg",            language: "CSS" },
  { icon: "bootstrap.svg",      language: "Bootstrap" },
  { icon: "tailwind.svg",       language: "Tailwind CSS" },
  { icon: "reactjs.svg",        language: "React JS" },
  { icon: "nextjs.svg",         language: "Next JS" },
  { icon: "MUI.svg",            language: "Material UI" },
  { icon: "spring-boot.svg",    language: "Spring Boot" },
  { icon: "spring-boot.svg",    language: "Spring MVC" },
  { icon: "spring-boot.svg",    language: "Spring Security" },
  { icon: "hibernate-icon.svg", language: "Hibernet" },
  { icon: "jpa.svg",            language: "JPA" },
  { icon: "nodejs.svg",         language: "Node JS" },
  { icon: "expressjs.svg",      language: "Express JS" },
  { icon: "rest-api.svg",       language: "Rest API" },
  { icon: "jwt.svg",            language: "JWT" },
  { icon: "mongodb.svg",        language: "MongoDB" },
  { icon: "mysql.svg",          language: "My SQL" },
  { icon: "firebase.svg",       language: "Firebase" },
  { icon: "github.svg",         language: "Github" },
  { icon: "postman.svg",        language: "Postman" },
  { icon: "maven.svg",          language: "Maven" },
  { icon: "vscode.svg",         language: "VS Code" },
  { icon: "docker.svg",         language: "Docker" },
  { icon: "ci-cd.svg",          language: "CI/CD" },
  { icon: "vite.svg",           language: "Vite" },
  { icon: "aws-logo.svg",       language: "AWS" },
  { icon: "vercel.svg",         language: "Vercel" },
  { icon: "netlify.svg",        language: "Netlify" },
  { icon: "canva.svg",          language: "Canva" },
];

const BG_CYCLE = ["bg1", "bg2", "bg3", "bg4", "bg5", "bg6"];

/* ─── Section Label ─── */
const SectionLabel = memo(({ count, label }) => (
  <div className="flex items-center gap-2 mb-6" data-aos="fade-right">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#6366f1]/30" />
    <span className="text-xs font-mono text-gray-600 tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 bg-white/5">
      {count} {label}
    </span>
    <div className="h-px w-8 bg-[#6366f1]/30" />
  </div>
));

/* ─── Filter Bar ─── */
const BLOG_CATEGORIES  = ["All", "Java", "Spring Boot", "React", "DSA", "System Design", "JavaScript"];
const NOTES_CATEGORIES = ["All", "Java", "Spring Boot", "DSA", "System Design", "React", "JavaScript", "MySQL"];

const FilterBar = memo(({ categories, active, onChange }) => (
  <div className="flex flex-wrap gap-2 mb-6" data-aos="fade-up">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border
          ${active === cat
            ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-[#a78bfa]"
            : "border-white/10 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
          }`}
      >
        {cat}
      </button>
    ))}
  </div>
));

/* ─── Main Component ─── */
export default function FullWidthTabs() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(() => {
    const savedTab = localStorage.getItem("portfolio-active-tab");
    return savedTab !== null ? parseInt(savedTab, 10) : 0;
  });

  // Listen to tab triggers from Command Palette
  useEffect(() => {
    const handleTriggerTab = (e) => {
      if (typeof e.detail === "number") {
        setValue(e.detail);
      }
    };
    window.addEventListener("trigger-portfolio-tab", handleTriggerTab);
    return () => window.removeEventListener("trigger-portfolio-tab", handleTriggerTab);
  }, []);

  // Scroll to Portfolio section if navigated from back link
  useEffect(() => {
    const scrollTo = sessionStorage.getItem("scrollToSection");
    if (scrollTo === "Portfolio") {
      sessionStorage.removeItem("scrollToSection");
      setTimeout(() => {
        const element = document.getElementById("Portfolio");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 700); // 700ms handles welcome screens or transition lags perfectly
    }
  }, []);

  const formatIndexDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [blogFilter, setBlogFilter] = useState("All");
  const [notesFilter, setNotesFilter] = useState("All");
  const [blogSearch, setBlogSearch] = useState("");
  const isMobile = window.innerWidth < 768;
  const initialItems = isMobile ? 4 : 6;

  useEffect(() => {
    AOS.init({ once: false, duration: 700, easing: "ease-out-cubic" });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [
        { data: projectDataRaw, error: projectErr },
        { data: certDataRaw, error: certErr },
        { data: notesDataRaw, error: notesErr },
        { data: blogDataRaw, error: blogErr }
      ] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("certificates").select("*").order("issue_date", { ascending: false }),
        supabase.from("notes").select("*").order("created_at", { ascending: false }),
        supabase.from("blogs").select("*").order("published_date", { ascending: false })
      ]);

      if (projectErr) throw projectErr;
      if (certErr) throw certErr;
      if (notesErr) throw notesErr;
      if (blogErr) throw blogErr;

      const projectData = (projectDataRaw || []).map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        Title: doc.title,
        Description: doc.description,
        Img: doc.img_url,
        Link: doc.demo_url,
        Github: doc.github_url,
        TechStack: doc.tech_stack || [],
        Features: doc.features || [],
        CaseStudy: doc.case_study
      }));

      const certData = (certDataRaw || []).map((doc) => ({
        id: doc.id,
        Name: doc.name,
        Issuer: doc.issuer,
        IssueDate: doc.issue_date,
        Img: doc.img_url,
        CredentialUrl: doc.credential_url
      }));

      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch (e) {
          return dateStr;
        }
      };

      const notesData = (notesDataRaw || []).map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        subject: doc.subject,
        tags: doc.tags || [],
        pdfUrl: doc.pdf_url,
        coverEmoji: doc.cover_emoji || "📚",
        pages: doc.page_count || 0,
        featured: doc.featured || false,
        date: doc.publish_date || formatDate(doc.created_at)
      }));

      const blogData = (blogDataRaw || []).map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        content: doc.content || "",
        coverEmoji: doc.cover_emoji || "📝",
        coverImg: doc.cover_img_url,
        categories: doc.categories || [],
        tags: doc.tags || [],
        featured: doc.featured || false,
        views: doc.views_count || 0,
        likes: doc.likes_count || 0,
        bookmarks: doc.bookmarks_count || 0,
        readTime: doc.read_time || null,
        date: formatDate(doc.published_date)
      }));

      setProjects(projectData);
      setCertificates(certData);
      setBlogs(blogData);
      setNotes(notesData);

      localStorage.setItem("projects",     JSON.stringify(projectData));
      localStorage.setItem("certificates", JSON.stringify(certData));
      localStorage.setItem("blogs",        JSON.stringify(blogData));
      localStorage.setItem("notes",        JSON.stringify(notesData));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    // 1. Try to load cached data from localStorage first for instantaneous render
    try {
      const cachedProjects = localStorage.getItem("projects");
      const cachedCerts    = localStorage.getItem("certificates");
      const cachedBlogs    = localStorage.getItem("blogs");
      const cachedNotes    = localStorage.getItem("notes");

      if (cachedProjects) setProjects(JSON.parse(cachedProjects));
      if (cachedCerts)    setCertificates(JSON.parse(cachedCerts));
      if (cachedBlogs)    setBlogs(JSON.parse(cachedBlogs));
      if (cachedNotes)    setNotes(JSON.parse(cachedNotes));
    } catch (e) {
      console.warn("Failed to load portfolio cache from localStorage:", e);
    }

    // 2. Fetch fresh data from Supabase in the background
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    playTap();
    setValue(newValue);
    localStorage.setItem("portfolio-active-tab", newValue);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "blog") {
      setValue(4);
      localStorage.setItem("portfolio-active-tab", "4");
      setTimeout(() => {
        const el = document.getElementById("Portfolio");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, [location]);

  const toggleShowMore = useCallback((type) => {
    if (type === "projects")     setShowAllProjects((p) => !p);
    else if (type === "certificates") setShowAllCertificates((p) => !p);
    else if (type === "blogs")        setShowAllBlogs((p) => !p);
    else                         setShowAllNotes((p) => !p);
  }, []);

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory = blogFilter === "All" || 
      b.categories?.some((c) => c.toLowerCase().includes(blogFilter.toLowerCase())) || 
      b.tags?.some((t) => t.toLowerCase().includes(blogFilter.toLowerCase()));
    const matchesSearch = !blogSearch || 
      b.title?.toLowerCase().includes(blogSearch.toLowerCase()) || 
      b.description?.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.categories?.some((c) => c.toLowerCase().includes(blogSearch.toLowerCase())) ||
      b.tags?.some((t) => t.toLowerCase().includes(blogSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredNotes = notesFilter === "All"
    ? notes
    : notes.filter((n) => n.subject === notesFilter || n.tags?.some((t) => t.toLowerCase().includes(notesFilter.toLowerCase())));

  const featuredNote  = filteredNotes.find((n) => n.featured);
  const regularNotes  = filteredNotes.filter((n) => !n.featured);

  const displayedProjects      = showAllProjects      ? projects      : projects.slice(0, initialItems);
  const displayedCertificates  = showAllCertificates  ? certificates  : certificates.slice(0, initialItems);
  const displayedRegularNotes  = showAllNotes         ? regularNotes  : regularNotes.slice(0, initialItems);

  const TAB_CONFIG = [
    { icon: Code,      label: "Projects",     count: projects.length },
    { icon: Award,     label: "Certificates", count: certificates.length },
    { icon: Boxes,     label: "Tech Stack",   count: techStacks.length },
    { icon: FileText,  label: "Notes",        count: notes.length },
    { icon: BookOpen,  label: "Blogs",         count: blogs.length },
  ];

  return (
    <div className="relative md:px-[10%] px-[5%] w-full sm:mt-0 mt-[3rem] bg-[#030014] overflow-hidden" id="Portfolio">

      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#6366f1]/6 blur-[130px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[#a855f7]/6 blur-[100px]" />
      </div>

      {/* ── Header ── */}
      <div className="relative text-center pb-14" data-aos="fade-up" data-aos-duration="800">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a78bfa] text-xs font-semibold uppercase tracking-widest mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          My Work
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#a855f7]">
          Portfolio Showcase
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base mt-4 leading-relaxed">
          Projects, certifications, tech stack, blog articles and notes —
          each a milestone in my continuous learning journey.
        </p>
        <div className="flex justify-center mt-6">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#6366f1]/60 to-transparent" />
        </div>
      </div>

      <Box sx={{ width: "100%" }}>
        {/* ── Tab Bar ── */}
        <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl overflow-hidden mb-2" data-aos="fade-up" data-aos-delay="100">
          <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/4 to-transparent pointer-events-none" />
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="fullWidth"
            sx={{
              minHeight: "72px",
              position: "relative",
              zIndex: 1,
              "& .MuiTab-root": {
                fontSize: { xs: "0.65rem", md: "0.85rem" },
                fontWeight: "700",
                color: "#64748b",
                textTransform: "none",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: "16px 0",
                margin: "8px 3px",
                borderRadius: "14px",
                letterSpacing: "0.01em",
                minWidth: 0,
                "&:hover": {
                  color: "#e2e8f0",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-selected": {
                  color: "#fff",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))",
                  boxShadow: "0 4px 20px -4px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                  "& .tab-icon": { color: "#a78bfa" },
                },
              },
              "& .MuiTabs-indicator": { height: 0 },
              "& .MuiTabs-flexContainer": { gap: "2px" },
            }}
          >
            {TAB_CONFIG.map((tab, i) => (
              <Tab
                key={tab.label}
                icon={
                  <div className="flex flex-col items-center gap-0.5">
                    <tab.icon className="tab-icon w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" />
                    {tab.count > 0 && (
                      <span className="text-[9px] font-mono text-gray-600 tabular-nums">{tab.count}</span>
                    )}
                  </div>
                }
                label={tab.label}
                {...a11yProps(i)}
              />
            ))}
          </Tabs>
        </div>

        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={setValue}
        >
          {/* ── Projects ── */}
          <TabPanel value={value} index={0} dir={theme.direction}>
            {/* Centered Title */}
            <div className="text-center mb-10 relative">
              <h3 
                className="text-3xl md:text-4xl font-extrabold tracking-[0.18em] text-[#e2e8f0] uppercase select-none font-sans"
                style={{ textShadow: "0 0 15px rgba(226, 232, 240, 0.35), 0 0 30px rgba(16, 185, 129, 0.15)" }}
              >
                MY PROJECTS
              </h3>
              <div className="mt-3 flex justify-center">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div className="container mx-auto flex justify-center items-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {displayedProjects.map((project, index) => (
                  <div key={project.id || index}
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 1 ? "1200" : "1000"}
                    data-aos-delay={index * 50}
                  >
                    <TiltCard>
                      <CardProject 
                        Img={project.Img} 
                        Title={project.Title} 
                        Description={project.Description} 
                        Link={project.Link} 
                        id={project.id} 
                        TechStack={project.TechStack}
                        Github={project.Github}
                      />
                    </TiltCard>
                  </div>
                ))}
              </div>
            </div>
            {projects.length > initialItems && (
              <div className="mt-8 w-full flex justify-center">
                <ToggleButton onClick={() => toggleShowMore("projects")} isShowingMore={showAllProjects} />
              </div>
            )}
          </TabPanel>

          {/* ── Certificates ── */}
          <TabPanel value={value} index={1} dir={theme.direction}>
            {/* Centered Title */}
            <div className="text-center mb-10 relative">
              <h3 
                className="text-3xl md:text-4xl font-extrabold tracking-[0.18em] text-[#e2e8f0] uppercase select-none font-sans"
                style={{ textShadow: "0 0 15px rgba(226, 232, 240, 0.35), 0 0 30px rgba(16, 185, 129, 0.15)" }}
              >
                MY CERTIFICATES
              </h3>
              <div className="mt-3 flex justify-center">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div className="container mx-auto flex justify-center items-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {displayedCertificates.map((certificate, index) => (
                  <div key={index}
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 1 ? "1200" : "1000"}
                    data-aos-delay={index * 50}
                  >
                    <Certificate 
                      ImgSertif={certificate.Img} 
                      Name={certificate.Name}
                      Issuer={certificate.Issuer}
                      IssueDate={certificate.IssueDate}
                      CredentialUrl={certificate.CredentialUrl}
                    />
                  </div>
                ))}
              </div>
            </div>
            {certificates.length > initialItems && (
              <div className="mt-8 w-full flex justify-center">
                <ToggleButton onClick={() => toggleShowMore("certificates")} isShowingMore={showAllCertificates} />
              </div>
            )}
          </TabPanel>

          {/* ── Tech Stack ── */}
          <TabPanel value={value} index={2} dir={theme.direction}>
            {/* Centered Mockup Title */}
            <div className="text-center mb-10 relative">
              <h3 
                className="text-3xl md:text-4xl font-extrabold tracking-[0.18em] text-[#e2e8f0] uppercase select-none font-sans"
                style={{ textShadow: "0 0 15px rgba(226, 232, 240, 0.35), 0 0 30px rgba(16, 185, 129, 0.15)" }}
              >
                MY TECH STACK
              </h3>
              <div className="mt-3 flex justify-center">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { label: "Languages",         range: [0, 4] },
                { label: "Frontend",          range: [4, 11] },
                { label: "Backend",           range: [11, 20] },
                { label: "Databases",         range: [20, 23] },
                { label: "Tools",             range: [23, 34] },
              ].map(({ label, range }) => (
                <div key={label}>
                  <TechStackRow label={label}>
                    {techStacks.slice(range[0], range[1]).map((stack, index) => (
                      <div key={index} className="hover:scale-105 transition-transform duration-200">
                        <TechStackIcon TechStackIcon={stack.icon} Language={stack.language} />
                      </div>
                    ))}
                  </TechStackRow>
                </div>
              ))}
            </div>
          </TabPanel>

          {/* ── Notes ── */}
          <TabPanel value={value} index={3} dir={theme.direction}>
            {/* Centered Title */}
            <div className="text-center mb-10 relative">
              <h3 
                className="text-3xl md:text-4xl font-extrabold tracking-[0.18em] text-[#e2e8f0] uppercase select-none font-sans"
                style={{ textShadow: "0 0 15px rgba(226, 232, 240, 0.35), 0 0 30px rgba(16, 185, 129, 0.15)" }}
              >
                MY NOTES
              </h3>
              <div className="mt-3 flex justify-center">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <FilterBar categories={NOTES_CATEGORIES} active={notesFilter} onChange={(cat) => { setNotesFilter(cat); setShowAllNotes(false); }} />

            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <span className="text-5xl">📂</span>
                <p className="text-gray-500 text-sm">No notes found for this subject.</p>
              </div>
            ) : (
              <>
                {/* Featured note */}
                {featuredNote && (
                  <div className="mb-6" data-aos="fade-up">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#6366f1]/20" />
                      <span className="text-[11px] font-mono text-gray-600 uppercase tracking-widest">Featured</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#6366f1]/20" />
                    </div>
                    <div className="max-w-sm">
                      <NoteCard
                        id={featuredNote.id}
                        title={featuredNote.title}
                        description={featuredNote.description}
                        subject={featuredNote.subject}
                        tags={featuredNote.tags}
                        pdfUrl={featuredNote.pdfUrl}
                        coverEmoji={featuredNote.coverEmoji}
                        pages={featuredNote.pages}
                        date={featuredNote.date}
                        featured={true}
                      />
                    </div>
                  </div>
                )}

                {/* Notes grid */}
                {regularNotes.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-5" data-aos="fade-right">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#6366f1]/20" />
                      <span className="text-[11px] font-mono text-gray-600 uppercase tracking-widest">{regularNotes.length} Notes</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#6366f1]/20" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {displayedRegularNotes.map((note, index) => (
                        <div key={note.id}
                          data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                          data-aos-duration="900"
                          data-aos-delay={index * 60}
                        >
                          <NoteCard
                            id={note.id}
                            title={note.title}
                            description={note.description}
                            subject={note.subject}
                            tags={note.tags}
                            pdfUrl={note.pdfUrl}
                            coverEmoji={note.coverEmoji}
                            pages={note.pages}
                            date={note.date}
                            featured={false}
                          />
                        </div>
                      ))}
                    </div>

                    {regularNotes.length > initialItems && (
                      <div className="mt-8 w-full flex justify-center">
                        <ToggleButton onClick={() => toggleShowMore("notes")} isShowingMore={showAllNotes} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </TabPanel>

          {/* ── Blog ── */}
          <TabPanel value={value} index={4} dir={theme.direction}>
            {/* Centered Title */}
            <div className="text-center mb-10 relative">
              <h3 
                className="text-3xl md:text-4xl font-extrabold tracking-[0.18em] text-[#e2e8f0] uppercase select-none font-sans"
                style={{ textShadow: "0 0 15px rgba(226, 232, 240, 0.35), 0 0 30px rgba(99, 102, 241, 0.15)" }}
              >
                MY BLOGS
              </h3>
              <div className="mt-3 flex justify-center">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              </div>
            </div>

            {/* Intro text + Open full hub button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/[0.02] border border-white/5 rounded-2xl p-6" data-aos="fade-up">
              <div className="text-left">
                <h4 className="text-base font-bold text-white font-sans">Technical Documentation Hub</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xl">
                  Deep-dive articles, interview preparation guides, DSA notes, Java ecosystem write-ups, and Spring Boot tutorials. Explore them in a premium interactive documentation workspace.
                </p>
              </div>
              <button
                onClick={() => navigate("/blog")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#6366f1] text-white text-xs font-bold hover:bg-[#5356df] transition-all duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer shrink-0 font-sans"
              >
                Open Full Documentation Hub
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Bar / Filter Panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8" data-aos="fade-up">
              <div className="flex flex-wrap gap-1.5">
                {["All", "DSA", "Java", "Spring Boot", "System Design", "JavaScript", "React"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setBlogFilter(cat); }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all duration-200 cursor-pointer
                      ${blogFilter === cat
                        ? "border-[#6366f1] bg-[#6366f1]/10 text-[#818cf8]"
                        : "border-white/5 bg-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:max-w-xs shrink-0 font-mono">
                <input
                  type="text"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/8 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#6366f1]/40 focus:bg-white/[0.01] transition-all duration-300 font-sans"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                {blogSearch && (
                  <button onClick={() => setBlogSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Display Articles Grid */}
            {filteredBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01] font-mono text-xs text-gray-500" data-aos="fade-up">
                <span>📭</span>
                <span>No blog records match your query.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.slice(0, showAllBlogs ? filteredBlogs.length : initialItems).map((blog, index) => (
                    <div 
                      key={blog.id} 
                      data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                      data-aos-duration="900"
                      data-aos-delay={index * 50}
                    >
                      <BlogCard
                        id={blog.slug || blog.id}
                        title={blog.title}
                        description={blog.description}
                        tags={blog.tags}
                        date={new Date(blog.published_date || blog.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                        readTime={blog.read_time || blog.readTime}
                        views={blog.views_count || blog.views || 0}
                        coverEmoji={blog.cover_emoji || blog.coverEmoji}
                        coverImg={blog.cover_img_url || blog.coverImg}
                        bgClass={blog.bgClass || `bg${(index % 6) + 1}`}
                      />
                    </div>
                  ))}
                </div>

                {filteredBlogs.length > initialItems && (
                  <div className="mt-8 w-full flex justify-center" data-aos="fade-up">
                    <ToggleButton onClick={() => toggleShowMore("blogs")} isShowingMore={showAllBlogs} />
                  </div>
                )}
              </>
            )}
          </TabPanel>
        </SwipeableViews>
      </Box>

      <style>{`
        /* Hide all scrollbars completely */
        #Portfolio ::-webkit-scrollbar { display: none !important; width: 0px !important; height: 0px !important; }
        #Portfolio { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .scrollbar-none::-webkit-scrollbar { display: none !important; width: 0px !important; height: 0px !important; }
        .scrollbar-none { scrollbar-width: none !important; -ms-overflow-style: none !important; overflow: hidden !important; }
        ::-webkit-scrollbar { display: none !important; width: 0px !important; height: 0px !important; }
        body, html { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}
