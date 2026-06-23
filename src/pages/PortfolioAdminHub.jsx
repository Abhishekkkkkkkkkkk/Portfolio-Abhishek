import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  ArrowLeft, Save, Eye, Edit, Trash2, Check, AlertCircle, Plus, 
  Lock, Search, FileText, Award, FolderGit2, HelpCircle, ExternalLink 
} from "lucide-react";
import { supabase } from "../services/supabase";

// Import existing visual display components for rendering in the live preview panel
import CardProject from "../components/CardProject";
import Certificate from "../components/Certificate";
import BlogCard from "../components/BlogCard";
import BlogRenderer from "../components/blog/BlogRenderer";

// Category configurations mapped exactly to your 15 folders (for Interview Q&As)
const INTERVIEW_CATEGORIES = [
  { id: "Java", name: "Java" },
  { id: "Spring Boot", name: "Spring Boot" },
  { id: "Microservices", name: "Microservices" },
  { id: "DBMS", name: "DBMS" },
  { id: "DSA", name: "DSA" },
  { id: "Design Patterns", name: "Design Patterns" },
  { id: "Docker", name: "Docker" },
  { id: "Hibernate_JPA", name: "Hibernate & JPA" },
  { id: "JMS", name: "JMS" },
  { id: "Kafka", name: "Kafka" },
  { id: "OOPs", name: "OOPs" },
  { id: "Redis", name: "Redis" },
  { id: "SQL", name: "SQL" },
  { id: "Spring Security", name: "Spring Security" },
  { id: "System Design", name: "System Design" }
];

// Helper: Custom simple markdown parser to render interview Q&A preview
const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((paragraph, idx) => {
    if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
      const code = paragraph.replace(/^```[a-z]*\n|```$/g, '');
      return (
        <pre key={idx} className="bg-[#050510] border border-white/8 rounded-xl p-4 overflow-x-auto text-[11.5px] font-mono text-[#a5d6ff] text-left my-4">
          <code>{code}</code>
        </pre>
      );
    }

    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split(/\n[-*]\s+/);
      return (
        <ul key={idx} className="list-disc pl-5 space-y-1 my-3 text-left">
          {items.map((item, i) => {
            const cleanItem = item.replace(/^[-*]\s+/, '');
            return <li key={i}>{parseInlineMarkdown(cleanItem)}</li>;
          })}
        </ul>
      );
    }

    return (
      <p key={idx} className="mb-4 text-left leading-relaxed">
        {parseInlineMarkdown(paragraph)}
      </p>
    );
  });
};

const parseInlineMarkdown = (text) => {
  const parts = text.split('**');
  if (parts.length > 1) {
    return parts.map((p, i) => i % 2 === 1 ? <strong className="text-white font-bold" key={i}>{p}</strong> : p);
  }
  return text;
};

const PortfolioAdminHub = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "blogs";
  
  // Passcode verification gate state
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Global actions status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionError, setActionError] = useState("");

  // Editor mode states: "create" or "edit"
  const [blogsMode, setBlogsMode] = useState("create");
  const [projectsMode, setProjectsMode] = useState("create");
  const [certsMode, setCertsMode] = useState("create");
  const [interviewMode, setInterviewMode] = useState("create");

  // Selection list states (for edit selectors)
  const [blogsList, setBlogsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [certsList, setCertsList] = useState([]);
  const [interviewList, setInterviewList] = useState([]);

  // Selected item IDs
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCertId, setSelectedCertId] = useState("");
  const [selectedInterviewId, setSelectedInterviewId] = useState("");

  // ==================== FORM STATES ====================

  // 1. Blogs & Notes Form States
  const [bId, setBId] = useState("");
  const [bSlug, setBSlug] = useState("");
  const [bTitle, setBTitle] = useState("");
  const [bDescription, setBDescription] = useState("");
  const [bContent, setBContent] = useState("");
  const [bCoverEmoji, setBCoverEmoji] = useState("📝");
  const [bCoverImgUrl, setBCoverImgUrl] = useState("");
  const [bCategories, setBCategories] = useState("");
  const [bTags, setBTags] = useState("");
  const [bFeatured, setBFeatured] = useState(false);
  const [bReadTime, setBReadTime] = useState("5 min read");
  const [bContentType, setBContentType] = useState("article");
  const [bPdfUrl, setBPdfUrl] = useState("");
  const [bPageCount, setBPageCount] = useState("");

  // 2. Projects Form States
  const [pId, setPId] = useState("");
  const [pSlug, setPSlug] = useState("");
  const [pTitle, setPTitle] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pImgUrl, setPImgUrl] = useState("");
  const [pDemoUrl, setPDemoUrl] = useState("");
  const [pGithubUrl, setPGithubUrl] = useState("");
  const [pTechStack, setPTechStack] = useState("");
  const [pFeatures, setPFeatures] = useState("");
  const [pCaseStudy, setPCaseStudy] = useState("");

  // 3. Certificates Form States
  const [cId, setCId] = useState("");
  const [cName, setCName] = useState("");
  const [cIssuer, setCIssuer] = useState("");
  const [cIssueDate, setCIssueDate] = useState("");
  const [cCredentialUrl, setCCredentialUrl] = useState("");
  const [cImgUrl, setCImgUrl] = useState("");

  // 4. Interview Questions Form States
  const [iCategory, setICategory] = useState("Java");
  const [iSubcategory, setISubcategory] = useState("");
  const [iQuestionId, setIQuestionId] = useState("");
  const [iQuestionText, setIQuestionText] = useState("");
  const [iShortAnswer, setIShortAnswer] = useState("");
  const [iDetailedAnswer, setIDetailedAnswer] = useState("");
  const [iExampleText, setIExampleText] = useState("");
  const [iCodeExample, setICodeExample] = useState("");
  const [iCompanyTags, setICompanyTags] = useState("");
  const [iDifficultyLevel, setIDifficultyLevel] = useState("Beginner");
  const [iInterviewFrequency, setIInterviewFrequency] = useState("Medium");
  const [iTagsInput, setITagsInput] = useState("");
  const [iReferencesInput, setIReferencesInput] = useState("");
  const [iSortOrder, setISortOrder] = useState(0);

  // ==================== SECURITY AUTHENTICATION ====================
  const handleAuth = (e) => {
    e.preventDefault();
    if (passcode === "Abhishek@123") {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("cms-authenticated", "true");
    } else {
      setAuthError("Invalid Admin Passcode.");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("cms-authenticated") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch list options for selection when tab or editor mode changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchListOptions = async () => {
      try {
        if (currentTab === "blogs") {
          const { data, error } = await supabase.from("blogs").select("id, title").order("title");
          if (error) throw error;
          setBlogsList(data || []);
        } else if (currentTab === "projects") {
          const { data, error } = await supabase.from("projects").select("id, title").order("title");
          if (error) throw error;
          setProjectsList(data || []);
        } else if (currentTab === "certificates") {
          const { data, error } = await supabase.from("certificates").select("id, name").order("name");
          if (error) throw error;
          setCertsList(data || []);
        } else if (currentTab === "interview") {
          const { data, error } = await supabase.from("interview_questions").select("id, question").eq("category", iCategory).order("question");
          if (error) throw error;
          setInterviewList(data || []);
        }
      } catch (err) {
        console.error("Failed to load records list for edit dropdown:", err);
      }
    };

    fetchListOptions();
    setActionError("");
    setSaveSuccess(false);
  }, [currentTab, isAuthenticated, blogsMode, projectsMode, certsMode, interviewMode, iCategory]);

  const selectTab = (tabId) => {
    setSearchParams({ tab: tabId });
    setActionError("");
    setSaveSuccess(false);
  };

  // ==================== LOAD DETAILS FOR EDIT ====================

  // Load Blog Details
  const handleLoadBlog = async (id) => {
    setSelectedBlogId(id);
    if (!id) {
      clearBlogForm();
      return;
    }
    try {
      const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
      if (error) throw error;
      if (data) {
        setBId(data.id);
        setBSlug(data.slug || "");
        setBTitle(data.title || "");
        setBDescription(data.description || "");
        setBContent(data.content || "");
        setBCoverEmoji(data.cover_emoji || "📝");
        setBCoverImgUrl(data.cover_img_url || "");
        setBCategories(data.categories ? data.categories.join(", ") : "");
        setBTags(data.tags ? data.tags.join(", ") : "");
        setBFeatured(data.featured || false);
        setBReadTime(data.read_time || "5 min read");
        setBContentType(data.content_type || "article");
        setBPdfUrl(data.pdf_url || "");
        setBPageCount(data.page_count || "");
      }
    } catch (err) {
      console.error(err);
      setActionError("Failed to fetch blog details.");
    }
  };

  // Load Project Details
  const handleLoadProject = async (id) => {
    setSelectedProjectId(id);
    if (!id) {
      clearProjectForm();
      return;
    }
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) throw error;
      if (data) {
        setPId(data.id);
        setPSlug(data.slug || "");
        setPTitle(data.title || "");
        setPDescription(data.description || "");
        setPImgUrl(data.img_url || "");
        setPDemoUrl(data.demo_url || "");
        setPGithubUrl(data.github_url || "");
        setPTechStack(data.tech_stack ? data.tech_stack.join(", ") : "");
        setPFeatures(data.features ? data.features.join("\n") : "");
        setPCaseStudy(data.case_study || "");
      }
    } catch (err) {
      console.error(err);
      setActionError("Failed to fetch project details.");
    }
  };

  // Load Certificate Details
  const handleLoadCert = async (id) => {
    setSelectedCertId(id);
    if (!id) {
      clearCertForm();
      return;
    }
    try {
      const { data, error } = await supabase.from("certificates").select("*").eq("id", id).single();
      if (error) throw error;
      if (data) {
        setCId(data.id);
        setCName(data.name || "");
        setCIssuer(data.issuer || "");
        setCIssueDate(data.issue_date || "");
        setCCredentialUrl(data.credential_url || "");
        setCImgUrl(data.img_url || "");
      }
    } catch (err) {
      console.error(err);
      setActionError("Failed to fetch certificate details.");
    }
  };

  // Load Interview Question Details
  const handleLoadInterview = async (id) => {
    setSelectedInterviewId(id);
    if (!id) {
      clearInterviewForm();
      return;
    }
    try {
      const { data, error } = await supabase.from("interview_questions").select("*").eq("id", id).single();
      if (error) throw error;
      if (data) {
        setIQuestionId(data.id);
        setICategory(data.category);
        setISubcategory(data.subcategory || "");
        setIQuestionText(data.question || "");
        setIShortAnswer(data.short_answer || "");
        setIDetailedAnswer(data.detailed_answer || "");
        setIExampleText(data.example || "");
        setICodeExample(data.code_example || "");
        setIDifficultyLevel(data.difficulty_level || "Beginner");
        setIInterviewFrequency(data.interview_frequency || "Medium");
        setISortOrder(data.sort_order || 0);

        setICompanyTags(data.company_tags ? data.company_tags.join(", ") : "");
        setITagsInput(data.tags ? data.tags.join(", ") : "");
        setIReferencesInput(data.references_links ? data.references_links.join(", ") : "");
      }
    } catch (err) {
      console.error(err);
      setActionError("Failed to fetch interview question details.");
    }
  };

  // ==================== CLEAR FORM FUNCTIONS ====================
  const clearBlogForm = () => {
    setBId("");
    setBSlug("");
    setBTitle("");
    setBDescription("");
    setBContent("");
    setBCoverEmoji("📝");
    setBCoverImgUrl("");
    setBCategories("");
    setBTags("");
    setBFeatured(false);
    setBReadTime("5 min read");
    setBContentType("article");
    setBPdfUrl("");
    setBPageCount("");
    setSelectedBlogId("");
  };

  const clearProjectForm = () => {
    setPId("");
    setPSlug("");
    setPTitle("");
    setPDescription("");
    setPImgUrl("");
    setPDemoUrl("");
    setPGithubUrl("");
    setPTechStack("");
    setPFeatures("");
    setPCaseStudy("");
    setSelectedProjectId("");
  };

  const clearCertForm = () => {
    setCId("");
    setCName("");
    setCIssuer("");
    setCIssueDate("");
    setCCredentialUrl("");
    setCImgUrl("");
    setSelectedCertId("");
  };

  const clearInterviewForm = () => {
    setIQuestionId("");
    setISubcategory("");
    setIQuestionText("");
    setIShortAnswer("");
    setIDetailedAnswer("");
    setIExampleText("");
    setICodeExample("");
    setICompanyTags("");
    setITagsInput("");
    setIReferencesInput("");
    setISortOrder(0);
    setSelectedInterviewId("");
  };

  // ==================== ID GENERATORS ====================
  const generateBlogId = () => {
    if (!bTitle) return;
    const clean = bTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setBId(clean);
    setBSlug(clean);
  };

  const generateProjectId = () => {
    if (!pTitle) return;
    const clean = pTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setPId(clean);
    setPSlug(clean);
  };

  const generateCertId = () => {
    if (!cName) return;
    const clean = cName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setCId(clean);
  };

  const generateInterviewId = () => {
    if (!iQuestionText) return;
    const clean = iQuestionText.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const catSlug = iCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setIQuestionId(`${catSlug}-${clean.substring(0, 45)}`);
  };

  // ==================== SAVE ACTIONS ====================

  // Save Blog
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!bId || !bTitle) {
      setActionError("Blog ID and Title are required.");
      return;
    }
    setIsSaving(true);
    setActionError("");
    setSaveSuccess(false);

    const categoriesArr = bCategories ? bCategories.split(",").map(c => c.trim()).filter(Boolean) : [];
    const tagsArr = bTags ? bTags.split(",").map(t => t.trim()).filter(Boolean) : [];

    const payload = {
      id: bId,
      slug: bSlug || bId,
      title: bTitle,
      description: bDescription,
      content: bContent || "",
      cover_emoji: bCoverEmoji || "📝",
      cover_img_url: bCoverImgUrl || null,
      categories: categoriesArr,
      tags: tagsArr,
      featured: bFeatured,
      read_time: bReadTime,
      content_type: bContentType,
      pdf_url: bContentType === "note" ? bPdfUrl || null : null,
      page_count: bContentType === "note" ? (parseInt(bPageCount) || null) : null,
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from("blogs").upsert(payload);
      if (error) throw error;
      setSaveSuccess(true);
      if (blogsMode === "create") clearBlogForm();
    } catch (err) {
      console.error(err);
      setActionError(`Database Save Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Project
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!pId || !pTitle) {
      setActionError("Project ID and Title are required.");
      return;
    }
    setIsSaving(true);
    setActionError("");
    setSaveSuccess(false);

    const techArr = pTechStack ? pTechStack.split(",").map(t => t.trim()).filter(Boolean) : [];
    const featArr = pFeatures ? pFeatures.split("\n").map(f => f.trim()).filter(Boolean) : [];

    const payload = {
      id: pId,
      slug: pSlug || pId,
      title: pTitle,
      description: pDescription,
      img_url: pImgUrl || "",
      demo_url: pDemoUrl || null,
      github_url: pGithubUrl || "",
      tech_stack: techArr,
      features: featArr,
      case_study: pCaseStudy || null,
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from("projects").upsert(payload);
      if (error) throw error;
      setSaveSuccess(true);
      if (projectsMode === "create") clearProjectForm();
    } catch (err) {
      console.error(err);
      setActionError(`Database Save Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Certificate
  const handleSaveCert = async (e) => {
    e.preventDefault();
    if (!cId || !cName || !cIssuer) {
      setActionError("Certificate ID, Name, and Issuer are required.");
      return;
    }
    setIsSaving(true);
    setActionError("");
    setSaveSuccess(false);

    const payload = {
      id: cId,
      name: cName,
      issuer: cIssuer,
      issue_date: cIssueDate || null,
      credential_url: cCredentialUrl || "",
      img_url: cImgUrl || ""
    };

    try {
      const { error } = await supabase.from("certificates").upsert(payload);
      if (error) throw error;
      setSaveSuccess(true);
      if (certsMode === "create") clearCertForm();
    } catch (err) {
      console.error(err);
      setActionError(`Database Save Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Interview Question
  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (!iQuestionId || !iQuestionText || !iDetailedAnswer) {
      setActionError("Question ID, Question text, and Detailed Answer are required.");
      return;
    }
    setIsSaving(true);
    setActionError("");
    setSaveSuccess(false);

    const companyArr = iCompanyTags ? iCompanyTags.split(",").map(c => c.trim()).filter(Boolean) : [];
    const tagsArr = iTagsInput ? iTagsInput.split(",").map(t => t.trim()).filter(Boolean) : [];
    const refArr = iReferencesInput ? iReferencesInput.split(",").map(r => r.trim()).filter(Boolean) : [];

    const payload = {
      id: iQuestionId,
      question: iQuestionText,
      detailed_answer: iDetailedAnswer,
      short_answer: iShortAnswer || null,
      example: iExampleText || null,
      code_example: iCodeExample || null,
      category: iCategory,
      subcategory: iSubcategory || "General",
      difficulty_level: iDifficultyLevel,
      company_tags: companyArr,
      interview_frequency: iInterviewFrequency,
      tags: tagsArr,
      references_links: refArr,
      sort_order: parseInt(iSortOrder) || 0,
      last_updated_date: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from("interview_questions").upsert(payload);
      if (error) throw error;
      setSaveSuccess(true);
      if (interviewMode === "create") clearInterviewForm();
    } catch (err) {
      console.error(err);
      setActionError(`Database Save Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== DELETE ACTIONS ====================
  const handleDeleteItem = async (table, id) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${id}" from ${table}? This action is irreversible.`)) {
      return;
    }
    setIsSaving(true);
    setActionError("");
    setSaveSuccess(false);

    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      
      alert("Successfully deleted record from Supabase.");
      
      // Refresh lists and clear local states
      if (table === "blogs") {
        setBlogsList(blogsList.filter(b => b.id !== id));
        clearBlogForm();
      } else if (table === "projects") {
        setProjectsList(projectsList.filter(p => p.id !== id));
        clearProjectForm();
      } else if (table === "certificates") {
        setCertsList(certsList.filter(c => c.id !== id));
        clearCertForm();
      } else if (table === "interview_questions") {
        setInterviewList(interviewList.filter(i => i.id !== id));
        clearInterviewForm();
      }
    } catch (err) {
      console.error(err);
      setActionError(`Delete Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Authenticate view check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center font-sans relative px-4">
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#6366f1]/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#a855f7]/5 blur-[100px]" />
        
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/5 bg-[#050515]/40 backdrop-blur-xl relative z-10 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center mx-auto mb-6">
            <Lock className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h1 className="text-xl font-bold font-sans uppercase tracking-widest mb-2">Portfolio Admin Hub</h1>
          <p className="text-xs text-gray-400 mb-6 font-mono">Secured Workspace. Please provide access passcode.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Access Passcode"
                className="w-full px-4 py-3 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-center outline-none focus:border-[#6366f1] transition-all font-mono"
              />
            </div>
            {authError && (
              <p className="text-xs text-rose-400 font-mono">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs font-bold font-sans tracking-widest uppercase cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] font-sans flex flex-col overflow-hidden relative">
      {/* Radial overlay glow background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#6366f1]/3 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-[#a855f7]/3 blur-[100px]" />
      </div>

      {/* Header bar */}
      <header className="sticky top-0 z-40 w-full h-14 bg-[#050515]/75 backdrop-blur-xl border-b border-[#6366f1]/15 flex items-center justify-between px-6 relative z-30 shadow-lg shadow-black/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-[10px] font-black">
            AH
          </div>
          <span className="text-xs font-mono font-bold text-gray-400">
            PortfolioAdmin / <span className="text-[#a855f7] uppercase tracking-wider">{currentTab}</span>
          </span>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem("cms-authenticated");
            setIsAuthenticated(false);
            navigate("/");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-all cursor-pointer uppercase"
        >
          <ArrowLeft size={11} /> Exit CMS
        </button>
      </header>

      {/* Master Workspace Panel */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar Nav */}
        <aside className="w-60 border-r border-[#6366f1]/12 bg-[#050518]/30 backdrop-blur-sm flex flex-col shrink-0 select-none">
          <div className="p-4 border-b border-[#6366f1]/12 text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#818cf8] uppercase">Tables Index</span>
          </div>
          <nav className="p-3 space-y-1 text-left flex-1">
            <button
              onClick={() => selectTab("blogs")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                currentTab === "blogs"
                  ? "bg-gradient-to-r from-[#6366f1]/15 to-[#a855f7]/5 border-l-2 border-[#6366f1] text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              <FileText size={14} className={currentTab === "blogs" ? "text-indigo-400" : "text-gray-500"} />
              Blogs & Study Notes
            </button>
            <button
              onClick={() => selectTab("projects")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                currentTab === "projects"
                  ? "bg-gradient-to-r from-[#6366f1]/15 to-[#a855f7]/5 border-l-2 border-[#6366f1] text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              <FolderGit2 size={14} className={currentTab === "projects" ? "text-emerald-400" : "text-gray-500"} />
              Projects Showcase
            </button>
            <button
              onClick={() => selectTab("certificates")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                currentTab === "certificates"
                  ? "bg-gradient-to-r from-[#6366f1]/15 to-[#a855f7]/5 border-l-2 border-[#6366f1] text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              <Award size={14} className={currentTab === "certificates" ? "text-cyan-400" : "text-gray-500"} />
              Certifications
            </button>
            <button
              onClick={() => selectTab("interview")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                currentTab === "interview"
                  ? "bg-gradient-to-r from-[#6366f1]/15 to-[#a855f7]/5 border-l-2 border-[#6366f1] text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              <HelpCircle size={14} className={currentTab === "interview" ? "text-purple-400" : "text-gray-500"} />
              Interview Q&As
            </button>
          </nav>
        </aside>

        {/* Tab content area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* TAB 1: BLOGS */}
          {currentTab === "blogs" && (
            <>
              {/* Left pane: Form */}
              <div className="w-1/2 overflow-y-auto p-6 border-r border-[#6366f1]/12 scrollbar-width-none flex flex-col text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white font-sans uppercase tracking-wide">Blogs & Study Notes</h2>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Upsert articles or study documents to the blogs table.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setBlogsMode("create"); clearBlogForm(); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${blogsMode === "create" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Plus size={10} className="inline mr-1" /> New
                    </button>
                    <button
                      onClick={() => setBlogsMode("edit")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${blogsMode === "edit" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Edit size={10} className="inline mr-1" /> Edit
                    </button>
                  </div>
                </div>

                {blogsMode === "edit" && (
                  <div className="mb-6 p-4 rounded-xl bg-indigo-500/[0.03] border border-[#6366f1]/15 space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Select Blog to Load</label>
                    <select
                      value={selectedBlogId}
                      onChange={(e) => handleLoadBlog(e.target.value)}
                      className="w-full bg-[#04040e]/90 border border-[#6366f1]/25 text-gray-200 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                    >
                      <option value="">-- Choose Article --</option>
                      {blogsList.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                )}

                <form onSubmit={handleSaveBlog} className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Blog/Note ID (Primary Key)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bId}
                          onChange={(e) => setBId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                          placeholder="unique-slug-key"
                          disabled={blogsMode === "edit"}
                        />
                        {blogsMode === "create" && (
                          <button
                            type="button"
                            onClick={generateBlogId}
                            className="px-3 py-2 rounded-xl border border-indigo-500/25 text-[10px] font-mono font-bold uppercase text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
                          >
                            Gen
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">URL Path Slug</label>
                      <input
                        type="text"
                        value={bSlug}
                        onChange={(e) => setBSlug(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="path-slug-url"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Blog Title</label>
                    <input
                      type="text"
                      value={bTitle}
                      onChange={(e) => setBTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-sans"
                      placeholder="Title of the article or note..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Short Description</label>
                    <textarea
                      value={bDescription}
                      onChange={(e) => setBDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="A short hook describing the blog..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Content Type</label>
                      <select
                        value={bContentType}
                        onChange={(e) => setBContentType(e.target.value)}
                        className="w-full bg-[#04040e]/80 border border-[#6366f1]/15 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                      >
                        <option value="article">article (HTML Content)</option>
                        <option value="note">note (PDF document viewer)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Average Read Time</label>
                      <input
                        type="text"
                        value={bReadTime}
                        onChange={(e) => setBReadTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="5 min read"
                      />
                    </div>
                  </div>

                  {bContentType === "note" ? (
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-indigo-500/[0.02] border border-[#6366f1]/15 rounded-2xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 uppercase">PDF Document URL</label>
                        <input
                          type="text"
                          value={bPdfUrl}
                          onChange={(e) => setBPdfUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                          placeholder="e.g. /files/recursion-notes.pdf"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-400 uppercase">Page Count</label>
                        <input
                          type="number"
                          value={bPageCount}
                          onChange={(e) => setBPageCount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Blog HTML Content</label>
                      <textarea
                        value={bContent}
                        onChange={(e) => setBContent(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-300 font-mono outline-none focus:border-[#6366f1] transition-all"
                        placeholder="Write blog body using HTML elements (<p>, <h2>, <pre><code>...)..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Cover Emoji</label>
                      <input
                        type="text"
                        value={bCoverEmoji}
                        onChange={(e) => setBCoverEmoji(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-center outline-none focus:border-[#6366f1] transition-all"
                        placeholder="☕"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Cover Image Banner URL</label>
                      <input
                        type="text"
                        value={bCoverImgUrl}
                        onChange={(e) => setBCoverImgUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="https://i.postimg.cc/..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Categories (Comma separated)</label>
                      <input
                        type="text"
                        value={bCategories}
                        onChange={(e) => setBCategories(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="Java, Spring Boot"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={bTags}
                        onChange={(e) => setBTags(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="OOPs, packages, basics"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="bFeatured"
                      checked={bFeatured}
                      onChange={(e) => setBFeatured(e.target.checked)}
                      className="rounded border-[#6366f1]/35 bg-[#04040e] text-indigo-500 focus:ring-0"
                    />
                    <label htmlFor="bFeatured" className="text-xs font-mono text-gray-400 select-none cursor-pointer">
                      Feature this article on main portfolio dashboard
                    </label>
                  </div>

                  {actionError && (
                    <div className="text-rose-400 text-xs font-mono flex items-center gap-1.5 py-1">
                      <AlertCircle size={12} /> {actionError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="text-emerald-400 text-xs font-mono flex items-center gap-1.5 py-1 bg-emerald-500/10 px-3 rounded-lg border border-emerald-500/20">
                      <Check size={12} /> Sync Success! Updated record in Supabase.
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-white disabled:opacity-50"
                    >
                      <Save size={13} /> {isSaving ? "Syncing..." : "Save Article"}
                    </button>
                    {blogsMode === "edit" && selectedBlogId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("blogs", selectedBlogId)}
                        className="px-4 py-3 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 transition-all text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right pane: Preview */}
              <div className="w-1/2 overflow-y-auto bg-[#04040c]/40 p-8 scrollbar-width-none text-left">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="border-b border-white/5 pb-2 mb-6">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Card & Document Preview</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono text-gray-500 uppercase">1. Portfolio Card Grid Preview</h3>
                    <BlogCard 
                      id={bId}
                      title={bTitle || "Draft Title"}
                      description={bDescription || "Draft Hook description..."}
                      date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      readTime={bReadTime || "5 min read"}
                      coverEmoji={bCoverEmoji || "📝"}
                      coverImg={bCoverImgUrl}
                      categories={bCategories ? bCategories.split(",").map(c => c.trim()) : []}
                      contentType={bContentType}
                      pdfUrl={bPdfUrl}
                      views={56}
                    />
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h3 className="text-xs font-mono text-gray-500 uppercase">2. Detailed Article Render Preview</h3>
                    {bContentType === "note" ? (
                      <div className="p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] text-center font-mono text-xs text-gray-500">
                        📚 PDF document ({bPdfUrl || "No path specified"}) renders inline PDF workbench iframe reader.
                      </div>
                    ) : (
                      <div className="p-6 border border-white/5 rounded-2xl bg-[#030014]">
                        <BlogRenderer content={bContent || "<p class='text-gray-600 font-mono text-xs'>Write HTML body content to render preview...</p>"} lineNumbers={true} isHtml={true} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PROJECTS */}
          {currentTab === "projects" && (
            <>
              {/* Left pane: Form */}
              <div className="w-1/2 overflow-y-auto p-6 border-r border-[#6366f1]/12 scrollbar-width-none flex flex-col text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white font-sans uppercase tracking-wide">Projects Showcase</h2>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Insert or update card details in the projects table.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setProjectsMode("create"); clearProjectForm(); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${projectsMode === "create" ? "bg-[#10b981]/20 text-emerald-400 border border-[#10b981]/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Plus size={10} className="inline mr-1" /> New
                    </button>
                    <button
                      onClick={() => setProjectsMode("edit")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${projectsMode === "edit" ? "bg-[#10b981]/20 text-emerald-400 border border-[#10b981]/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Edit size={10} className="inline mr-1" /> Edit
                    </button>
                  </div>
                </div>

                {projectsMode === "edit" && (
                  <div className="mb-6 p-4 rounded-xl bg-[#10b981]/[0.02] border border-[#10b981]/20 space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Select Project to Load</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleLoadProject(e.target.value)}
                      className="w-full bg-[#04040e]/90 border border-[#10b981]/25 text-gray-200 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                    >
                      <option value="">-- Choose Project --</option>
                      {projectsList.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                )}

                <form onSubmit={handleSaveProject} className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Project ID (Primary Key)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pId}
                          onChange={(e) => setPId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                          placeholder="project-slug-key"
                          disabled={projectsMode === "edit"}
                        />
                        {projectsMode === "create" && (
                          <button
                            type="button"
                            onClick={generateProjectId}
                            className="px-3 py-2 rounded-xl border border-[#10b981]/25 text-[10px] font-mono font-bold uppercase text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                          >
                            Gen
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">URL Path Slug</label>
                      <input
                        type="text"
                        value={pSlug}
                        onChange={(e) => setPSlug(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="path-slug-url"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Project Title</label>
                    <input
                      type="text"
                      value={pTitle}
                      onChange={(e) => setPTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="Title of project..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Description Summary</label>
                    <textarea
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="Summary hook of features and purpose..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Display Cover Image URL</label>
                    <input
                      type="text"
                      value={pImgUrl}
                      onChange={(e) => setPImgUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                      placeholder="https://i.postimg.cc/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Live Demo URL</label>
                      <input
                        type="text"
                        value={pDemoUrl}
                        onChange={(e) => setPDemoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="https://demo.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">GitHub Repository URL</label>
                      <input
                        type="text"
                        value={pGithubUrl}
                        onChange={(e) => setPGithubUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Tech Stack tags (Comma separated)</label>
                    <input
                      type="text"
                      value={pTechStack}
                      onChange={(e) => setPTechStack(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                      placeholder="Next.js, TypeScript, Tailwind CSS"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Key Features (One feature per line)</label>
                    <textarea
                      value={pFeatures}
                      onChange={(e) => setPFeatures(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-sans"
                      placeholder="Feature bullet 1&#10;Feature bullet 2&#10;Feature bullet 3..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Case Study Narrative (Markdown allowed)</label>
                    <textarea
                      value={pCaseStudy}
                      onChange={(e) => setPCaseStudy(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-300 font-mono outline-none focus:border-[#6366f1] transition-all"
                      placeholder="Write details of challenges, architecture, and solutions..."
                    />
                  </div>

                  {actionError && (
                    <div className="text-rose-400 text-xs font-mono flex items-center gap-1.5 py-1">
                      <AlertCircle size={12} /> {actionError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="text-emerald-400 text-xs font-mono flex items-center gap-1.5 py-1 bg-emerald-500/10 px-3 rounded-lg border border-emerald-500/20">
                      <Check size={12} /> Sync Success! Updated record in Supabase.
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-white disabled:opacity-50"
                    >
                      <Save size={13} /> {isSaving ? "Syncing..." : "Save Project"}
                    </button>
                    {projectsMode === "edit" && selectedProjectId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("projects", selectedProjectId)}
                        className="px-4 py-3 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 transition-all text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right pane: Preview */}
              <div className="w-1/2 overflow-y-auto bg-[#04040c]/40 p-8 scrollbar-width-none text-left flex flex-col justify-center items-center">
                <div className="max-w-md w-full space-y-6">
                  <div className="border-b border-white/5 pb-2 mb-6 w-full">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Premium Card Preview</span>
                  </div>

                  <div className="w-full">
                    <CardProject 
                      Img={pImgUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400"}
                      Title={pTitle || "Draft Project Title"}
                      Description={pDescription || "Draft project description details showing feature context..."}
                      Link={pDemoUrl || "#"}
                      Github={pGithubUrl || "#"}
                      id={pId}
                      TechStack={pTechStack ? pTechStack.split(",").map(t => t.trim()) : ["React", "CSS"]}
                    />
                  </div>

                  {pCaseStudy && (
                    <div className="p-4 rounded-xl border border-white/5 bg-[#050512]/60 w-full text-left">
                      <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Case Study Details Preview</h4>
                      <p className="text-[11px] font-sans text-gray-400 leading-relaxed whitespace-pre-wrap">{pCaseStudy}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: CERTIFICATES */}
          {currentTab === "certificates" && (
            <>
              {/* Left pane: Form */}
              <div className="w-1/2 overflow-y-auto p-6 border-r border-[#6366f1]/12 scrollbar-width-none flex flex-col text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white font-sans uppercase tracking-wide">Certifications</h2>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Insert or edit badges inside certificates table.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setCertsMode("create"); clearCertForm(); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${certsMode === "create" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Plus size={10} className="inline mr-1" /> New
                    </button>
                    <button
                      onClick={() => setCertsMode("edit")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${certsMode === "edit" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Edit size={10} className="inline mr-1" /> Edit
                    </button>
                  </div>
                </div>

                {certsMode === "edit" && (
                  <div className="mb-6 p-4 rounded-xl bg-cyan-500/[0.02] border border-cyan-500/20 space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Select Certificate to Load</label>
                    <select
                      value={selectedCertId}
                      onChange={(e) => handleLoadCert(e.target.value)}
                      className="w-full bg-[#04040e]/90 border border-cyan-500/25 text-gray-200 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                    >
                      <option value="">-- Choose Certificate --</option>
                      {certsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <form onSubmit={handleSaveCert} className="space-y-4 flex-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Certificate ID (Primary Key)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cId}
                        onChange={(e) => setCId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="cert-slug-key"
                        disabled={certsMode === "edit"}
                      />
                      {certsMode === "create" && (
                        <button
                          type="button"
                          onClick={generateCertId}
                          className="px-3 py-2 rounded-xl border border-cyan-500/25 text-[10px] font-mono font-bold uppercase text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
                        >
                          Gen
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Certificate Name</label>
                    <input
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="e.g. JavaScript HackerRank"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Issuer</label>
                      <input
                        type="text"
                        value={cIssuer}
                        onChange={(e) => setCIssuer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                        placeholder="e.g. HackerRank / Oracle"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Issue Date (YYYY-MM-DD)</label>
                      <input
                        type="text"
                        value={cIssueDate}
                        onChange={(e) => setCIssueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="2023-12-21"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Credential Verification URL</label>
                    <input
                      type="text"
                      value={cCredentialUrl}
                      onChange={(e) => setCCredentialUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                      placeholder="https://hackerrank.com/certificates/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Image/Badge URL</label>
                    <input
                      type="text"
                      value={cImgUrl}
                      onChange={(e) => setCImgUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                      placeholder="https://i.postimg.cc/..."
                    />
                  </div>

                  {actionError && (
                    <div className="text-rose-400 text-xs font-mono flex items-center gap-1.5 py-1">
                      <AlertCircle size={12} /> {actionError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="text-emerald-400 text-xs font-mono flex items-center gap-1.5 py-1 bg-emerald-500/10 px-3 rounded-lg border border-emerald-500/20">
                      <Check size={12} /> Sync Success! Updated record in Supabase.
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-white disabled:opacity-50"
                    >
                      <Save size={13} /> {isSaving ? "Syncing..." : "Save Badge"}
                    </button>
                    {certsMode === "edit" && selectedCertId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("certificates", selectedCertId)}
                        className="px-4 py-3 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 transition-all text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right pane: Preview */}
              <div className="w-1/2 overflow-y-auto bg-[#04040c]/40 p-8 scrollbar-width-none text-left flex flex-col justify-center items-center">
                <div className="max-w-md w-full space-y-6">
                  <div className="border-b border-white/5 pb-2 mb-6 w-full">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Certificate Card Preview</span>
                  </div>

                  <div className="w-full">
                    <Certificate 
                      ImgSertif={cImgUrl || "https://i.postimg.cc/bvNyFB56/Javascript-Basic-certificate.png"}
                      Name={cName || "HackerRank JavaScript Basic"}
                      Issuer={cIssuer || "HackerRank Verification"}
                      IssueDate={cIssueDate || "2023-12-21"}
                      CredentialUrl={cCredentialUrl || "#"}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 4: INTERVIEW Q&AS */}
          {currentTab === "interview" && (
            <>
              {/* Left pane: Form */}
              <div className="w-1/2 overflow-y-auto p-6 border-r border-[#6366f1]/12 scrollbar-width-none flex flex-col text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white font-sans uppercase tracking-wide">Interview Questions</h2>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Upsert technical reference questions to interview_questions.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setInterviewMode("create"); clearInterviewForm(); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${interviewMode === "create" ? "bg-purple-500/20 text-purple-400 border border-purple-500/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Plus size={10} className="inline mr-1" /> New
                    </button>
                    <button
                      onClick={() => setInterviewMode("edit")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${interviewMode === "edit" ? "bg-purple-500/20 text-purple-400 border border-purple-500/35" : "border border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      <Edit size={10} className="inline mr-1" /> Edit
                    </button>
                  </div>
                </div>

                <div className="mb-4 p-4 rounded-xl bg-purple-500/[0.01] border border-[#6366f1]/12 grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Working Tech Category</label>
                    <select
                      value={iCategory}
                      onChange={(e) => { setICategory(e.target.value); setSelectedInterviewId(""); }}
                      className="w-full bg-[#04040e]/95 border border-[#6366f1]/20 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                    >
                      {INTERVIEW_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {interviewMode === "edit" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Select Question</label>
                      <select
                        value={selectedInterviewId}
                        onChange={(e) => handleLoadInterview(e.target.value)}
                        className="w-full bg-[#04040e]/95 border border-[#6366f1]/20 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                      >
                        <option value="">-- Choose --</option>
                        {interviewList.map(i => <option key={i.id} value={i.id}>{i.question}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveInterview} className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Question ID (Primary Key)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={iQuestionId}
                          onChange={(e) => setIQuestionId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                          placeholder="java-gc-concepts"
                          disabled={interviewMode === "edit"}
                        />
                        {interviewMode === "create" && (
                          <button
                            type="button"
                            onClick={generateInterviewId}
                            className="px-3 py-2 rounded-xl border border-purple-500/25 text-[10px] font-mono font-bold uppercase text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                          >
                            Gen
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Subcategory / Folder Group</label>
                      <input
                        type="text"
                        value={iSubcategory}
                        onChange={(e) => setISubcategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="Garbage Collection / Multithreading"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Question Title</label>
                    <input
                      type="text"
                      value={iQuestionText}
                      onChange={(e) => setIQuestionText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="What is JVM garbage collection?"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Quick Summary Answer</label>
                    <textarea
                      value={iShortAnswer}
                      onChange={(e) => setIShortAnswer(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="Provide a quick 2-line summary answer..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Detailed Answer explanation (Markdown allowed)</label>
                    <textarea
                      value={iDetailedAnswer}
                      onChange={(e) => setIDetailedAnswer(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-sans"
                      placeholder="Use detailed paragraphs, bullet marks (- list), bold highlight (**text**), and inline code blocks (```) here..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Conceptual Example Narrative</label>
                    <textarea
                      value={iExampleText}
                      onChange={(e) => setIExampleText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                      placeholder="Real-world example explaining this concepts..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Code Implementation example</label>
                    <textarea
                      value={iCodeExample}
                      onChange={(e) => setICodeExample(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-[#a5d6ff] font-mono outline-none focus:border-[#6366f1] transition-all"
                      placeholder="// Code here..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Difficulty Level</label>
                      <select
                        value={iDifficultyLevel}
                        onChange={(e) => setIDifficultyLevel(e.target.value)}
                        className="w-full bg-[#04040e]/80 border border-[#6366f1]/15 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Frequency</label>
                      <select
                        value={iInterviewFrequency}
                        onChange={(e) => setIInterviewFrequency(e.target.value)}
                        className="w-full bg-[#04040e]/80 border border-[#6366f1]/15 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Sort Order Rank</label>
                      <input
                        type="number"
                        value={iSortOrder}
                        onChange={(e) => setISortOrder(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Company Tags</label>
                      <input
                        type="text"
                        value={iCompanyTags}
                        onChange={(e) => setICompanyTags(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="Google, Amazon"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Custom Tags</label>
                      <input
                        type="text"
                        value={iTagsInput}
                        onChange={(e) => setITagsInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="gc, memory"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">References Links</label>
                      <input
                        type="text"
                        value={iReferencesInput}
                        onChange={(e) => setIReferencesInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {actionError && (
                    <div className="text-rose-400 text-xs font-mono flex items-center gap-1.5 py-1">
                      <AlertCircle size={12} /> {actionError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="text-emerald-400 text-xs font-mono flex items-center gap-1.5 py-1 bg-emerald-500/10 px-3 rounded-lg border border-emerald-500/20">
                      <Check size={12} /> Sync Success! Updated record in Supabase.
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-white disabled:opacity-50"
                    >
                      <Save size={13} /> {isSaving ? "Syncing..." : "Save Question"}
                    </button>
                    {interviewMode === "edit" && selectedInterviewId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("interview_questions", selectedInterviewId)}
                        className="px-4 py-3 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 transition-all text-xs font-bold font-sans uppercase tracking-wider flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right pane: Preview */}
              <div className="w-1/2 overflow-y-auto bg-[#04040c]/40 p-8 scrollbar-width-none text-left">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="border-b border-white/5 pb-2 mb-6">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Question Reader Preview</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider">
                      ⚡ {iDifficultyLevel}
                    </span>
                    <span className="px-2 py-0.5 border border-indigo-500/25 bg-indigo-500/15 text-indigo-300 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider">
                      🔥 Frequency: {iInterviewFrequency}
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {iQuestionText || "Draft Question Title"}
                  </h1>

                  {iShortAnswer && (
                    <div className="p-4 rounded-xl border border-[#6366f1]/15 bg-[#6366f1]/5 flex items-start gap-3">
                      <AlertCircle size={16} className="text-[#6366f1] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold font-mono text-indigo-300 block mb-1">Quick Summary Answer</span>
                        <p className="text-gray-300 leading-relaxed font-sans">{iShortAnswer}</p>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none text-gray-300 text-xs sm:text-[13px] leading-relaxed space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1">
                      Detailed Answer
                    </h3>
                    {renderMarkdown(iDetailedAnswer || "Detailed explanation goes here...")}
                  </div>

                  {iExampleText && (
                    <div className="text-xs">
                      <h3 className="font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-2">
                        Conceptual Example
                      </h3>
                      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-gray-400">
                        {iExampleText}
                      </div>
                    </div>
                  )}

                  {iCodeExample && (
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-2">
                        Code Implementation
                      </h3>
                      <pre className="bg-[#050510] border border-white/8 rounded-xl p-4 overflow-x-auto text-[11.5px] font-mono text-[#a5d6ff] text-left">
                        <code>{iCodeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default PortfolioAdminHub;
