import React, { useEffect, useState, useCallback, memo } from "react";
import { db, collection } from "../firebase";
import { getDocs } from "firebase/firestore";
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
import { Code, Award, Boxes, ChevronDown, ChevronUp, Sparkles, BookOpen, FileText } from "lucide-react";

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
  const isMobile = window.innerWidth < 768;
  const initialItems = isMobile ? 4 : 6;

  useEffect(() => {
    AOS.init({ once: false, duration: 700, easing: "ease-out-cubic" });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [projectSnap, certSnap, blogSnap, notesSnap] = await Promise.all([
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "certificates")),
        getDocs(collection(db, "blogs")),
        getDocs(collection(db, "notes")),
      ]);

      const projectData  = projectSnap.docs.map((doc) => ({ id: doc.id, ...doc.data(), TechStack: doc.data().TechStack || [] }));
      const certData     = certSnap.docs.map((doc) => doc.data());
      const blogData     = blogSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const notesData    = notesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (event, newValue) => setValue(newValue);

  const toggleShowMore = useCallback((type) => {
    if (type === "projects")     setShowAllProjects((p) => !p);
    else if (type === "certificates") setShowAllCertificates((p) => !p);
    else if (type === "blogs")   setShowAllBlogs((p) => !p);
    else                         setShowAllNotes((p) => !p);
  }, []);

  /* Filtered data */
  const filteredBlogs = blogFilter === "All"
    ? blogs
    : blogs.filter((b) => b.tags?.some((t) => t.toLowerCase().includes(blogFilter.toLowerCase())));

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
    <div className="relative md:px-[10%] px-[5%] w-full sm:mt-0 mt-[3rem] bg-[#030014] overflow-hidden" id="Portofolio">

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
            <SectionLabel count={filteredBlogs.length} label="Articles" />
            <FilterBar categories={BLOG_CATEGORIES} active={blogFilter} onChange={(cat) => { setBlogFilter(cat); setShowAllBlogs(false); }} />

            {filteredBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <span className="text-5xl">📭</span>
                <p className="text-gray-500 text-sm">No articles found for this category.</p>
              </div>
            ) : (
              <>
                {featuredBlog && (
                  <div className="mb-6" data-aos="fade-up">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#6366f1]/20" />
                      <span className="text-[11px] font-mono text-gray-600 uppercase tracking-widest">Featured</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#6366f1]/20" />
                    </div>
                    <FeaturedBlogCard id={featuredBlog.id} title={featuredBlog.title} description={featuredBlog.description} tags={featuredBlog.tags} date={featuredBlog.date} readTime={featuredBlog.readTime} views={featuredBlog.views} coverEmoji={featuredBlog.coverEmoji} coverImg={featuredBlog.coverImg} />
                  </div>
                )}

                {regularBlogs.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-5" data-aos="fade-right">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#6366f1]/20" />
                      <span className="text-[11px] font-mono text-gray-600 uppercase tracking-widest">{regularBlogs.length} Articles</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#6366f1]/20" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {displayedRegularBlogs.map((blog, index) => (
                        <div key={blog.id}
                          data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                          data-aos-duration="900" data-aos-delay={index * 60}
                        >
                          <BlogCard id={blog.id} title={blog.title} description={blog.description} tags={blog.tags} date={blog.date} readTime={blog.readTime} views={blog.views} coverEmoji={blog.coverEmoji} coverImg={blog.coverImg} bgClass={BG_CYCLE[index % 6]} />
                        </div>
                      ))}
                    </div>
                    {regularBlogs.length > initialItems && (
                      <div className="mt-8 w-full flex justify-center">
                        <ToggleButton onClick={() => toggleShowMore("blogs")} isShowingMore={showAllBlogs} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
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
                    {/* Featured note uses same grid slot but full-width card */}
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
        #Portofolio ::-webkit-scrollbar { width: 4px; }
        #Portofolio ::-webkit-scrollbar-track { background: transparent; }
        #Portofolio ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}