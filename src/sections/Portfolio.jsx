import React, { useEffect, useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import AOS from "aos";
import "aos/dist/aos.css";
import Certificate from "../components/Certificate";
import BlogCard from "../components/BlogCard";
import FeaturedBlogCard from "../components/FeaturedBlogCard";
import NoteCard from "../components/NoteCard";
import { Code, Award, Boxes, ChevronDown, ChevronUp, Sparkles, BookOpen, FileText, Search, X, TrendingUp, Flame, Mail, Send } from "lucide-react";

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
  const [value, setValue] = useState(0);
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
  const [emailInput, setEmailInput] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    try {
      const Swal = (await import("sweetalert2")).default;
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email: emailInput }]);

      if (error) {
        if (error.code === "23505") {
          Swal.fire({
            title: "Already Subscribed!",
            text: "This email address is already subscribed to the newsletter.",
            icon: "info",
            background: "#0a0a1a",
            color: "#fff",
            confirmButtonColor: "#bd93f9",
            customClass: {
              popup: "rounded-2xl border border-white/5 backdrop-blur-2xl"
            }
          });
          setEmailInput("");
          return;
        }
        throw error;
      }

      Swal.fire({
        title: "Subscribed Successfully!",
        text: "Thank you for subscribing to my newsletter. You will receive technical updates directly in your inbox!",
        icon: "success",
        background: "#0a0a1a",
        color: "#fff",
        confirmButtonColor: "#bd93f9",
        customClass: {
          popup: "rounded-2xl border border-white/5 backdrop-blur-2xl"
        }
      });
      setEmailInput("");
    } catch (err) {
      console.error("Subscription failed:", err);
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        title: "Subscription Failed",
        text: "Could not register your email at this time. Please try again later.",
        icon: "error",
        background: "#0a0a1a",
        color: "#fff",
        confirmButtonColor: "#bd93f9",
        customClass: {
          popup: "rounded-2xl border border-white/5 backdrop-blur-2xl"
        }
      });
    }
  };

  const [expandedFolders, setExpandedFolders] = useState({
    java: true,
    "spring-boot": true,
    dsa: true,
    "system-design": true
  });

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const getFileExtension = (category) => {
    if (!category) return { val: "md", icon: "📝" };
    const cat = category.toLowerCase();
    if (cat.includes("java") && !cat.includes("javascript")) {
      return { val: "java", icon: "☕" };
    }
    if (cat.includes("cpp") || cat.includes("c++") || cat.includes("dsa") || cat.includes("algorithm")) {
      return { val: "cpp", icon: "⚡" };
    }
    if (cat.includes("spring")) {
      return { val: "java", icon: "🍃" };
    }
    if (cat.includes("js") || cat.includes("javascript") || cat.includes("react")) {
      return { val: "js", icon: "🟨" };
    }
    return { val: "md", icon: "📝" };
  };

  useEffect(() => {
    AOS.init({ once: false, duration: 700, easing: "ease-out-cubic" });
  }, []);

  /* Subscribe to realtime updates for all blogs on homepage */
  useEffect(() => {
    const channel = supabase
      .channel("blogs-realtime-list")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "blogs"
        },
        (payload) => {
          if (payload.new) {
            setBlogs((prevBlogs) =>
              prevBlogs.map((b) =>
                b.id === payload.new.id
                  ? { ...b, views: payload.new.views_count, views_count: payload.new.views_count }
                  : b
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [
        { data: projectDataRaw, error: projectErr },
        { data: certDataRaw, error: certErr },
        { data: blogDataRaw, error: blogErr },
        { data: notesDataRaw, error: notesErr }
      ] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("certificates").select("*").order("issue_date", { ascending: false }),
        supabase.from("blogs").select("*").order("published_date", { ascending: false }),
        supabase.from("notes").select("*").order("created_at", { ascending: false })
      ]);

      if (projectErr) throw projectErr;
      if (certErr) throw certErr;
      if (blogErr) throw blogErr;
      if (notesErr) throw notesErr;

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

      const blogData = (blogDataRaw || []).map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        content: doc.content,
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

  const handleChange = (event, newValue) => setValue(newValue);

  const toggleShowMore = useCallback((type) => {
    if (type === "projects")     setShowAllProjects((p) => !p);
    else if (type === "certificates") setShowAllCertificates((p) => !p);
    else if (type === "blogs")   setShowAllBlogs((p) => !p);
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

  const featuredBlog  = filteredBlogs.find((b) => b.featured);
  const regularBlogs  = filteredBlogs.filter((b) => !b.featured);
  const featuredNote  = filteredNotes.find((n) => n.featured);
  const regularNotes  = filteredNotes.filter((n) => !n.featured);

  const displayedProjects      = showAllProjects      ? projects      : projects.slice(0, initialItems);
  const displayedCertificates  = showAllCertificates  ? certificates  : certificates.slice(0, initialItems);
  const displayedRegularBlogs  = showAllBlogs         ? regularBlogs  : regularBlogs.slice(0, initialItems);
  const displayedRegularNotes  = showAllNotes         ? regularNotes  : regularNotes.slice(0, initialItems);

  const TAB_CONFIG = [
    { icon: Code,      label: "Projects",     count: projects.length },
    { icon: Award,     label: "Certificates", count: certificates.length },
    { icon: Boxes,     label: "Tech Stack",   count: techStacks.length },
    { icon: BookOpen,  label: "Blog",         count: blogs.length },
    { icon: FileText,  label: "Notes",        count: notes.length },
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
            <SectionLabel count={projects.length} label="Projects" />
            <div className="container mx-auto flex justify-center items-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {displayedProjects.map((project, index) => (
                  <div key={project.id || index}
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 1 ? "1200" : "1000"}
                    data-aos-delay={index * 50}
                  >
                    <CardProject Img={project.Img} Title={project.Title} Description={project.Description} Link={project.Link} id={project.id} />
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
            <SectionLabel count={certificates.length} label="Certificates" />
            <div className="container mx-auto flex justify-center items-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {displayedCertificates.map((certificate, index) => (
                  <div key={index}
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 1 ? "1200" : "1000"}
                    data-aos-delay={index * 50}
                  >
                    <Certificate ImgSertif={certificate.Img} />
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
            <SectionLabel count={techStacks.length} label="Technologies" />
            {[
              { label: "Languages",         range: [0, 4] },
              { label: "Frontend",          range: [4, 11] },
              { label: "Backend",           range: [11, 20] },
              { label: "Databases",         range: [20, 23] },
              { label: "Tools & Platforms", range: [23, 34] },
            ].map(({ label, range }) => (
              <div key={label} className="mb-8">
                <div className="flex items-center gap-3 mb-4" data-aos="fade-right">
                  <span className="text-[11px] font-mono text-[#6366f1]/70 uppercase tracking-[0.2em]">{label}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#6366f1]/20 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-4">
                  {techStacks.slice(range[0], range[1]).map((stack, index) => (
                    <div key={index} data-aos="fade-up" data-aos-duration="700" data-aos-delay={index * 40}>
                      <TechStackIcon TechStackIcon={stack.icon} Language={stack.language} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabPanel>

          {/* ── Blog ── */}
          <TabPanel value={value} index={3} dir={theme.direction}>
            {(() => {
              // Group blogs by category for Explorer tree
              const categoriesMap = {
                "Java": [],
                "Spring Boot": [],
                "DSA": [],
                "System Design": []
              };
              
              blogs.forEach(blog => {
                const primaryCat = blog.categories?.[0] || "Java";
                let matchedFolder = "Java";
                if (primaryCat.toLowerCase().includes("spring")) matchedFolder = "Spring Boot";
                else if (primaryCat.toLowerCase().includes("dsa") || primaryCat.toLowerCase().includes("algorithm")) matchedFolder = "DSA";
                else if (primaryCat.toLowerCase().includes("system") || primaryCat.toLowerCase().includes("design")) matchedFolder = "System Design";
                else if (primaryCat.toLowerCase().includes("java")) matchedFolder = "Java";
                else {
                  matchedFolder = primaryCat;
                }
                if (!categoriesMap[matchedFolder]) {
                  categoriesMap[matchedFolder] = [];
                }
                categoriesMap[matchedFolder].push(blog);
              });

              return (
                <div className="rounded-2xl border border-white/10 bg-[#0d0d16] overflow-hidden shadow-2xl text-gray-300 font-sans select-none" data-aos="fade-up">
                  
                  {/* ─── IDE Title Bar ─── */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0f] border-b border-white/5 text-[11px] font-mono text-gray-500">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="truncate mx-4 font-semibold text-gray-400">abhishek-portfolio &mdash; workspace/README.md</div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-600 hidden sm:inline">Markdown</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase text-[9px] tracking-wide border border-white/5">Git: main</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row min-h-[580px]">
                    
                    {/* ─── IDE Sidebar File Explorer ─── */}
                    <aside className="w-full md:w-60 bg-[#0a0a0f] border-r border-white/5 flex flex-col font-mono text-[12px] shrink-0">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#08080c] border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <span>Explorer</span>
                      </div>
                      
                      {/* File Tree */}
                      <div className="p-3 space-y-1 overflow-y-auto max-h-[220px] md:max-h-[500px]">
                        <div className="text-gray-400 font-bold flex items-center gap-1 py-1">
                          <span>📂</span>
                          <span>workspace/</span>
                        </div>
                        
                        {/* Categories and files tree */}
                        {Object.keys(categoriesMap).map((catName) => {
                          const catBlogs = categoriesMap[catName] || [];
                          const folderSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                          const isOpen = expandedFolders[folderSlug];
                          
                          return (
                            <div key={catName} className="pl-3">
                              <button 
                                onClick={() => toggleFolder(folderSlug)}
                                className="w-full text-left flex items-center gap-1.5 py-1 text-gray-400 hover:text-white hover:bg-white/5 px-1.5 rounded transition-all"
                              >
                                <span>{isOpen ? "📂" : "📁"}</span>
                                <span>{folderSlug}/</span>
                                <span className="text-[10px] text-gray-600 font-bold ml-auto">({catBlogs.length})</span>
                              </button>
                              
                              {/* Folder files */}
                              {isOpen && (
                                <div className="pl-3 border-l border-white/5 ml-1.5 space-y-0.5 mt-0.5">
                                  {catBlogs.map((b) => {
                                    const ext = getFileExtension(b.categories?.[0]);
                                    return (
                                      <Link 
                                        key={b.id} 
                                        to={`/blog/${b.slug || b.id}`}
                                        className="w-full text-left flex items-center gap-1.5 py-1 text-gray-500 hover:text-[#bd93f9] hover:bg-white/5 px-2 rounded transition-all truncate"
                                        style={{ textDecoration: "none" }}
                                      >
                                        <span className="text-[11px] text-indigo-400/80">{ext.icon}</span>
                                        <span className="truncate">{(b.slug || b.id || "").replace(/-/g, "_")}.{ext.val}</span>
                                      </Link>
                                    );
                                  })}
                                  {catBlogs.length === 0 && (
                                    <span className="text-gray-700 italic block pl-5 py-0.5">(empty)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Readme and Config file entries */}
                        <div className="pl-3 pt-2 mt-2 border-t border-white/5">
                          <button
                            onClick={() => { setBlogFilter("All"); setBlogSearch(""); }}
                            className="w-full text-left flex items-center gap-1.5 py-1 text-[#bd93f9] hover:bg-white/5 px-2 rounded font-bold"
                          >
                            <span className="text-[11px]">📝</span>
                            <span>README.md</span>
                          </button>
                          <div className="w-full text-left flex items-center gap-1.5 py-1 text-gray-600 px-2 rounded opacity-50 select-none">
                            <span className="text-[11px]">⚙️</span>
                            <span>settings.json</span>
                          </div>
                        </div>
                      </div>
                    </aside>

                    {/* ─── IDE Main Editor Pane ─── */}
                    <main className="flex-1 bg-[#12121e] flex flex-col min-w-0">
                      
                      {/* Editor File Tab Bar */}
                      <div className="flex bg-[#0a0a0f] border-b border-white/5 overflow-x-auto scrollbar-none shrink-0">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#12121e] border-r border-white/5 text-[11px] font-mono text-white font-bold border-t-2 border-[#bd93f9] shrink-0">
                          <span className="text-[#bd93f9]">📝</span>
                          <span>README.md</span>
                        </div>
                        <Link to="/blog/hashmap-internal-working" className="flex items-center gap-2 px-4 py-2 text-[11px] font-mono text-gray-500 bg-black/20 border-r border-white/5 opacity-70 hover:opacity-100 hover:text-white cursor-pointer shrink-0 select-none" style={{ textDecoration: "none" }}>
                          <span className="text-orange-400">☕</span>
                          <span>HashMap.java</span>
                        </Link>
                        <Link to="/blog/merge-sort-deep-dive" className="flex items-center gap-2 px-4 py-2 text-[11px] font-mono text-gray-500 bg-black/20 border-r border-white/5 opacity-70 hover:opacity-100 hover:text-white cursor-pointer shrink-0 select-none" style={{ textDecoration: "none" }}>
                          <span className="text-sky-400">⚡</span>
                          <span>MergeSort.cpp</span>
                        </Link>
                      </div>

                      {/* Editor Reading Frame */}
                      <div className="flex-1 flex min-h-0 relative overflow-y-auto">
                        
                        {/* Gutter Line Numbers */}
                        <div className="w-12 bg-[#0d0d14] border-r border-white/5 py-4 font-mono text-[11px] text-gray-600 text-right pr-3 select-none leading-relaxed shrink-0">
                          {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

                        {/* Code Content Container */}
                        <div className="flex-1 p-6 md:p-8 overflow-x-auto min-w-0">
                          
                          {/* Virtual Markdown Header */}
                          <div className="border-b border-white/5 pb-4 mb-6">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#bd93f9]/15 border border-[#bd93f9]/30 text-[#bd93f9] text-[10px] font-mono font-bold uppercase tracking-wide mb-3">
                              Workspace Document
                            </div>
                            <h2 className="text-2xl font-black text-white font-mono tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                              # Developer Knowledge Hub
                            </h2>
                            <p className="text-[13px] text-gray-400 mt-2 leading-relaxed">
                              Welcome to my technical workspace. Use the files list in the explorer tree to navigate blog articles, or filter search records directly inside the workspace window pane below.
                            </p>
                          </div>

                          {/* Search Bar / Filter Panel */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                            <div className="flex flex-wrap gap-1.5">
                              {BLOG_CATEGORIES.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => { setBlogFilter(cat); setShowAllBlogs(false); }}
                                  className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border transition-all duration-200
                                    ${blogFilter === cat
                                      ? "border-[#bd93f9]/50 bg-[#bd93f9]/15 text-[#bd93f9]"
                                      : "border-white/5 bg-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                                    }`}
                                >
                                  {cat.toLowerCase().replace(" ", "-")}
                                </button>
                              ))}
                            </div>
                            
                            <div className="relative w-full sm:max-w-xs shrink-0 font-mono">
                              <input
                                type="text"
                                value={blogSearch}
                                onChange={(e) => setBlogSearch(e.target.value)}
                                placeholder="Find file (Ctrl+P)..."
                                className="w-full pl-9 pr-4 py-1.5 bg-[#0a0a0f] border border-white/5 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#bd93f9]/50 focus:bg-[#0a0a0f] transition-all duration-300 font-mono"
                              />
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                              {blogSearch && (
                                <button onClick={() => setBlogSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Display Search Results */}
                          {filteredBlogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center border border-dashed border-white/5 rounded-xl font-mono text-xs text-gray-500">
                              <span>📭</span>
                              <span>No file records match your query.</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {filteredBlogs.map((blog) => {
                                const ext = getFileExtension(blog.categories?.[0]);
                                return (
                                  <div key={blog.id} className="relative group rounded-xl border border-white/5 bg-[#0a0a0f]/80 p-4 transition-all duration-300 hover:border-[#bd93f9]/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#bd93f9]/5">
                                    <Link to={`/blog/${blog.slug || blog.id}`} style={{ textDecoration: "none" }}>
                                      <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded bg-[#bd93f9]/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                                          {blog.coverEmoji || "📝"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs font-bold text-white group-hover:text-[#bd93f9] transition-colors font-mono truncate leading-snug">
                                            {blog.title}
                                          </h4>
                                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                            {blog.description}
                                          </p>
                                          <div className="flex items-center gap-3 mt-3 text-[9px] text-gray-600 font-mono">
                                            <span className="text-[#bd93f9] font-bold">{blog.readTime || "6 min read"}</span>
                                            <span>•</span>
                                            <span>{blog.views} views</span>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* ─── Mock Bash Terminal Newsletter Widget ─── */}
                          <div className="mt-8 rounded-xl border border-white/5 bg-[#07070a] overflow-hidden font-mono text-[12px] shadow-lg">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0f] border-b border-white/5 text-[10px] text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-white/5 animate-pulse" style={{ backgroundColor: "#ff5f56" }} />
                                <span>bash terminal</span>
                              </div>
                              <span>UTF-8</span>
                            </div>
                            <div className="p-4 space-y-2 text-left">
                              <div className="text-gray-500"># Run CLI tool to register email subscriptions</div>
                              <div className="text-[#50fa7b]">guest@abhishek-portfolio:~$ <span className="text-white">subscribe-newsletter --email</span></div>
                              
                              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mt-2">
                                <div className="flex-1 relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-bold">&gt;</span>
                                  <input
                                    type="email"
                                    required
                                    placeholder="developer@email.com"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    className="w-full bg-[#050508] border border-white/5 rounded px-7 py-1.5 text-xs text-white focus:outline-none focus:border-[#bd93f9]/50 transition-all font-mono"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded bg-[#bd93f9]/20 hover:bg-[#bd93f9]/30 border border-[#bd93f9]/40 text-[#bd93f9] hover:text-white font-bold transition-all text-xs font-mono flex items-center justify-center gap-1 shrink-0"
                                >
                                  <span>run</span>
                                  <span className="text-[10px] opacity-70">&crarr;</span>
                                </button>
                              </form>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Editor status bar */}
                      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0b0b12] border-t border-white/5 text-[10px] font-mono text-gray-600 select-none shrink-0">
                        <div className="flex items-center gap-3">
                          <span className="text-[#bd93f9] font-bold">NORMAL</span>
                          <span>README.md</span>
                          <span>UTF-8</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>Spaces: 4</span>
                          <span className="hidden sm:inline">Markdown</span>
                          <span>Ln 1, Col 1</span>
                        </div>
                      </div>

                    </main>
                  </div>

                </div>
              );
            })()}
          </TabPanel>

          {/* ── Notes ── */}
          <TabPanel value={value} index={4} dir={theme.direction}>
            <SectionLabel count={filteredNotes.length} label="Notes" />
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
        </SwipeableViews>
      </Box>

      <style>{`
        #Portfolio ::-webkit-scrollbar { width: 4px; }
        #Portfolio ::-webkit-scrollbar-track { background: transparent; }
        #Portfolio ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}
