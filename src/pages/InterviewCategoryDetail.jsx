import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Search, HelpCircle, AlertCircle, MessageSquare, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "../services/supabase";

const CATEGORY_NAME_MAP = {
  "java": "Java",
  "spring-boot": "Spring Boot",
  "spring_boot": "Spring Boot",
  "microservices": "Microservices",
  "dbms": "DBMS",
  "dsa": "DSA",
  "design-patterns": "Design Patterns",
  "design_patterns": "Design Patterns",
  "docker": "Docker",
  "hibernate-jpa": "Hibernate_JPA",
  "hibernate_jpa": "Hibernate_JPA",
  "jms": "JMS",
  "kafka": "Kafka",
  "oops": "OOPs",
  "redis": "Redis",
  "sql": "SQL",
  "spring-security": "Spring Security",
  "spring_security": "Spring Security",
  "system-design": "System Design",
  "system_design": "System Design"
};

const DIFFICULTY_CLASSES = {
  "Beginner": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Intermediate": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Advanced": "bg-rose-500/10 text-rose-400 border-rose-500/20"
};

const FREQUENCY_CLASSES = {
  "High": "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  "Medium": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Low": "bg-gray-500/10 text-gray-400 border-gray-500/20"
};

// Helper: Custom simple markdown parser to render detailed answer
const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((paragraph, idx) => {
    // Check if paragraph is a code block
    if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
      const code = paragraph.replace(/^```[a-z]*\n|```$/g, '');
      return (
        <pre key={idx} className="bg-[#050510] border border-white/8 rounded-xl p-4 overflow-x-auto text-[11.5px] font-mono text-[#a5d6ff] text-left my-4">
          <code>{code}</code>
        </pre>
      );
    }

    // Check if paragraph is a bullet list
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

    // Default paragraph
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

const InterviewCategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contentContainerRef = useRef(null);

  const dbCategoryName = CATEGORY_NAME_MAP[categoryId.toLowerCase()] || categoryId;
  
  // Dynamic display name
  const displayCategoryName = dbCategoryName.replace(/_/g, " & ");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");

  // Fetch Questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .select("*")
          .eq("category", dbCategoryName);

        if (error) throw error;

        if (data) {
          // Sort by sort_order first, then question text
          const sorted = [...data].sort((a, b) => {
            if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);
            return a.question.localeCompare(b.question);
          });
          
          setQuestions(sorted);
          if (sorted.length > 0) {
            const params = new URLSearchParams(location.search);
            const qParam = params.get("q");
            const matchedQ = sorted.find(q => q.id === qParam);
            setActiveQuestion(matchedQ || sorted[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [dbCategoryName, location.search]);

  // Extract all unique companies from these questions
  const companiesList = ["All"];
  questions.forEach(q => {
    if (q.company_tags) {
      q.company_tags.forEach(tag => {
        if (!companiesList.includes(tag)) {
          companiesList.push(tag);
        }
      });
    }
  });

  // Filter Logic
  const filteredQuestions = questions.filter(q => {
    // Search query matches question, answer, subtopic or tags
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      q.question.toLowerCase().includes(query) ||
      (q.detailed_answer && q.detailed_answer.toLowerCase().includes(query)) ||
      (q.subcategory && q.subcategory.toLowerCase().includes(query)) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(query))) ||
      (q.company_tags && q.company_tags.some(c => c.toLowerCase().includes(query)));

    const matchesDifficulty = selectedDifficulty === "All" || q.difficulty_level === selectedDifficulty;

    const matchesCompany = selectedCompany === "All" || (q.company_tags && q.company_tags.includes(selectedCompany));

    return matchesSearch && matchesDifficulty && matchesCompany;
  });

  // Group filtered questions by subcategory
  const groupedQuestions = {};
  filteredQuestions.forEach(q => {
    const sub = q.subcategory || "General";
    if (!groupedQuestions[sub]) groupedQuestions[sub] = [];
    groupedQuestions[sub].push(q);
  });

  // Scroll details pane to top on active question change
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo(0, 0);
    }
  }, [activeQuestion]);

  return (
    <div className="h-screen bg-[#030014] text-[#e2e8f0] font-sans flex flex-col overflow-hidden relative">
      {/* Background radial overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#6366f1]/3 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-[#a855f7]/3 blur-[100px]" />
      </div>

      {/* Header bar */}
      <header className="sticky top-0 z-40 w-full h-14 bg-[#050515]/75 backdrop-blur-xl border-b border-[#6366f1]/15 flex items-center justify-between px-4 sm:px-6 relative z-30 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <Link to="/interview-questions" className="flex items-center gap-2 select-none group" style={{ textDecoration: "none" }}>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-[10px] font-black group-hover:scale-105 transition-transform duration-300">
              IP
            </div>
            <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-white transition-colors">
              InterviewQuestions
            </span>
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-xs font-mono text-[#a855f7] font-bold uppercase tracking-wider">
            {displayCategoryName}
          </span>
        </div>

        <button
          onClick={() => navigate("/interview-questions")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#6366f1]/20 bg-[#6366f1]/5 text-[10px] font-mono font-bold text-indigo-300 hover:text-white hover:bg-[#6366f1]/15 transition-all cursor-pointer uppercase"
        >
          <ArrowLeft size={11} /> Dashboard
        </button>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Side: Question Explorer */}
        <aside className="w-80 md:w-96 border-r border-[#6366f1]/12 bg-[#050518]/25 backdrop-blur-sm flex flex-col shrink-0 select-none">
          {/* Explorer Filters Header */}
          <div className="p-4 border-b border-[#6366f1]/12 space-y-3.5 text-left bg-gradient-to-b from-[#6366f1]/4 to-transparent">
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or tags..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#04040e]/60 border border-[#6366f1]/25 text-[11px] text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono placeholder:text-gray-600"
              />
            </div>

            {/* Filter selectors grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {/* Difficulty Filter */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase tracking-wide">Difficulty</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-[#04040e]/80 border border-[#6366f1]/15 text-gray-300 rounded px-1.5 py-1 outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Company selection */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase tracking-wide">Company Tag</span>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="bg-[#04040e]/80 border border-[#6366f1]/15 text-gray-300 rounded px-1.5 py-1 outline-none"
                >
                  {companiesList.map(comp => (
                    <option key={comp} value={comp}>{comp === "All" ? "All" : comp}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible Subcategories and Questions */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-width-none" style={{ scrollbarWidth: "none" }}>
            {Object.keys(groupedQuestions).length === 0 ? (
              <div className="py-12 text-center text-[10px] font-mono text-gray-600">
                No questions found matching criteria.
              </div>
            ) : (
              Object.keys(groupedQuestions).map((subtopic) => {
                const list = groupedQuestions[subtopic];

                return (
                  <div key={subtopic} className="space-y-1.5 text-left">
                    <div className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#a855f7]/70 flex items-center gap-1.5 pl-1">
                      📁 {subtopic}
                    </div>
                    
                    <div className="border-l border-white/5 ml-2 pl-2 space-y-1">
                      {list.map((item) => {
                        const isCurrent = activeQuestion && activeQuestion.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveQuestion(item)}
                            className={`w-full text-left py-2 px-2.5 rounded text-[11px] font-mono leading-normal border transition-all flex items-start gap-2 cursor-pointer ${
                              isCurrent
                                ? "bg-gradient-to-r from-[#6366f1]/15 to-[#a855f7]/5 border-[#6366f1]/35 text-[#22d3ee] font-semibold"
                                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
                            }`}
                          >
                            <span className="shrink-0 mt-1 block w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                            <span className="flex-1 line-clamp-2">
                              {item.question}
                            </span>
                            
                            <span className="shrink-0 flex items-center gap-0.5 text-[8px] uppercase tracking-wider font-bold">
                              <span className={`px-1.5 py-0.5 rounded ${
                                item.difficulty_level === "Beginner" ? "text-emerald-400 bg-emerald-500/10" :
                                item.difficulty_level === "Intermediate" ? "text-amber-400 bg-amber-500/10" :
                                "text-rose-400 bg-rose-500/10"
                              }`}>
                                {item.difficulty_level[0]}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Detailed Reader Pane */}
        <main
          ref={contentContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 select-text flex flex-col scrollbar-width-none"
          style={{ scrollbarWidth: "none" }}
        >
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin mb-4" />
              <p className="text-gray-500 font-mono text-[10px] tracking-wider uppercase">Loading Question Details...</p>
            </div>
          ) : !activeQuestion ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <HelpCircle className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">No Active Question</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">Select a question from the explorer to see detailed answers.</p>
            </div>
          ) : (
            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col text-left animate-fade-in">
              
              {/* Question badges */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 border rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${DIFFICULTY_CLASSES[activeQuestion.difficulty_level]}`}>
                    ⚡ {activeQuestion.difficulty_level}
                  </span>
                  <span className={`px-2 py-0.5 border rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${FREQUENCY_CLASSES[activeQuestion.interview_frequency]}`}>
                    🔥 Frequency: {activeQuestion.interview_frequency}
                  </span>
                  <span className="px-2 py-0.5 border border-white/5 bg-white/4 rounded-md text-[9px] font-mono text-gray-400">
                    📁 {activeQuestion.subcategory}
                  </span>
                </div>

                {/* Company Tag Badges */}
                {activeQuestion.company_tags && activeQuestion.company_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-w-sm justify-end">
                    {activeQuestion.company_tags.map(comp => (
                      <span
                        key={comp}
                        onClick={() => navigate(`/interview-questions/company/${comp.toLowerCase().replace(/\s+/g, "-")}`)}
                        className="px-2 py-0.5 bg-[#0e0d21] border border-cyan-500/25 hover:border-cyan-500/50 hover:bg-[#22d3ee]/5 text-[9px] font-mono text-[#22d3ee] rounded-md transition-all cursor-pointer"
                        title={`View other ${comp} questions`}
                      >
                        🏢 {comp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight mb-6 font-sans">
                {activeQuestion.question}
              </h1>

              {/* Short Answer Summary Box */}
              {activeQuestion.short_answer && (
                <div className="mb-8 p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 flex items-start gap-3">
                  <AlertCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold font-mono text-indigo-300 block mb-1">Quick Summary Answer</span>
                    <p className="text-gray-300 leading-relaxed font-sans">{activeQuestion.short_answer}</p>
                  </div>
                </div>
              )}

              {/* Detailed Answer Explanation */}
              <div className="prose prose-invert max-w-none text-gray-300 text-xs sm:text-[13px] leading-relaxed space-y-4 mb-8 font-sans">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3">
                  Detailed Answer
                </h3>
                {renderMarkdown(activeQuestion.detailed_answer)}
              </div>

              {/* Example block */}
              {activeQuestion.example && (
                <div className="mb-8 text-xs">
                  <h3 className="font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3">
                    Conceptual Example
                  </h3>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-gray-400 leading-relaxed">
                    {activeQuestion.example}
                  </div>
                </div>
              )}

              {/* Code Example block */}
              {activeQuestion.code_example && (
                <div className="mb-8">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3">
                    Code Implementation
                  </h3>
                  <pre className="bg-[#050510] border border-white/8 rounded-xl p-4 overflow-x-auto text-[11.5px] font-mono text-[#a5d6ff] text-left leading-relaxed">
                    <code>{activeQuestion.code_example}</code>
                  </pre>
                </div>
              )}

              {/* Follow-up Questions */}
              {activeQuestion.follow_up_questions && activeQuestion.follow_up_questions.length > 0 && (
                <div className="mb-8 text-xs border-t border-white/5 pt-6">
                  <h3 className="font-mono font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                    <MessageSquare size={13} /> Follow-up Interview Questions
                  </h3>
                  <ul className="space-y-1.5 list-none pl-0">
                    {activeQuestion.follow_up_questions.map((fq, idx) => (
                      <li key={idx} className="text-gray-400 flex items-start gap-2">
                        <span className="text-indigo-500 font-bold shrink-0 font-mono">Q:</span>
                        <span>{fq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reference Links */}
              {activeQuestion.references_links && activeQuestion.references_links.length > 0 && (
                <div className="text-xs border-t border-white/5 pt-6 mb-12">
                  <h3 className="font-mono font-bold uppercase tracking-wider text-gray-500 mb-3">
                    References & Read-ups
                  </h3>
                  <div className="flex flex-col gap-2">
                    {activeQuestion.references_links.map((refLink, idx) => (
                      <a
                        key={idx}
                        href={refLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-decoration-none truncate font-mono"
                      >
                        <ExternalLink size={10} className="shrink-0" /> {refLink}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default InterviewCategoryDetail;
