import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, Search, ChevronRight, Sun, Moon } from "lucide-react";
import { supabase } from "../../../services/supabase";

const formatCompanyTitle = (slug) => {
  if (!slug) return "";
  const lowers = ["tcs", "hcl", "ibm", "sap", "jvm", "dsa", "mvc", "api", "rest"];
  const val = slug.toLowerCase().trim();
  if (lowers.includes(val)) {
    return val.toUpperCase();
  }
  return slug
    .split("-")
    .map(word => {
      if (word.toLowerCase() === "morgans") return "Morgan"; // edge case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const DIFFICULTY_CLASSES = {
  "Beginner": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Intermediate": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Advanced": "text-rose-400 bg-rose-500/10 border-rose-500/20"
};

const SUBTOPIC_ORDER = {
  "dsa": [
    "DSA Fundamentals",
    "Time & Space Complexity",
    "Complexity",
    "Recursion",
    "Bit Manipulation",
    "Arrays",
    "Basics",
    "Prefix Sum",
    "Sliding Window",
    "Two Pointers",
    "Binary Search on Arrays",
    "Matrix",
    "Advanced Array Problems",
    "Strings",
    "Linked Lists",
    "Linked List",
    "Stack",
    "Queue",
    "Hashing",
    "Heap",
    "Tree",
    "Binary Search Tree",
    "Trie",
    "Graph",
    "Greedy",
    "Backtracking",
    "Dynamic Programming",
    "Segment Tree",
    "Fenwick Tree",
    "Disjoint Set Union",
    "Advanced Algorithms"
  ],
  "java": [
    "Java Fundamentals",
    "Basics",
    "OOPs Concepts",
    "OOPS",
    "Data Types & Operators",
    "Control Flow",
    "Strings",
    "Exception Handling",
    "Collections Framework",
    "Collections",
    "Generics",
    "Multithreading & Concurrency",
    "Multithreading",
    "Concurrency",
    "Java 8 Features",
    "Java 8",
    "JVM Architecture",
    "JVM Memory Management",
    "JVM",
    "Garbage Collection",
    "Java Internals",
    "File I/O & Serialization",
    "Serialization",
    "Best Practices & Design Patterns"
  ],
  "spring-boot": [
    "Spring Boot Fundamentals",
    "Architecture",
    "Auto-Configuration",
    "Starter Dependencies",
    "Dependency Injection",
    "Spring Beans",
    "Configuration & Properties",
    "Spring Profiles",
    "Spring Boot Actuator",
    "Actuator",
    "Spring Boot Testing",
    "Testing",
    "Performance & Optimization",
    "Spring Boot Internals",
    "Application Startup",
    "Deployment"
  ],
  "spring-mvc": [
    "Spring MVC Fundamentals",
    "Architecture",
    "Request Lifecycle",
    "DispatcherServlet",
    "Controllers",
    "Request Mapping",
    "Data Binding",
    "Validation",
    "Exception Handling",
    "View Resolution",
    "REST Controllers",
    "Cross-Cutting Concerns",
    "Filters",
    "Interceptors",
    "AOP",
    "Spring MVC Internals",
    "Performance & Best Practices",
    "Common Interview Scenarios"
  ],
  "hibernate-jpa": [
    "Hibernate Fundamentals",
    "JPA Basics",
    "Configuration",
    "Entity Mapping",
    "Session & Entity Lifecycle",
    "CRUD Operations",
    "Querying",
    "JPQL & HQL",
    "Criteria API",
    "Native SQL",
    "Relationships & Associations",
    "OneToOne",
    "OneToMany",
    "ManyToOne",
    "ManyToMany",
    "Caching",
    "First Level Cache",
    "Second Level Cache",
    "Performance Tuning",
    "N+1 Query Problem",
    "Transaction Management",
    "Concurrency & Locking",
    "Optimistic Locking",
    "Pessimistic Locking",
    "Hibernate Internals"
  ],
  "sql": [
    "SQL Fundamentals",
    "Basic Queries",
    "Filtering & Sorting",
    "Joins",
    "Inner Join",
    "Left Join",
    "Right Join",
    "Full Join",
    "Aggregation & Grouping",
    "Subqueries & CTEs",
    "Window Functions",
    "Indexes & Query Optimization",
    "Transactions & ACID",
    "Database Normalization",
    "Stored Procedures & Triggers"
  ],
  "javascript": [
    "JavaScript Fundamentals",
    "Variables & Data Types",
    "Functions & Scope",
    "Closures",
    "Objects & Prototypes",
    "Prototypal Inheritance",
    "Asynchronous JavaScript",
    "Promises",
    "Async/Await",
    "Event Loop",
    "DOM Manipulation",
    "ES6+ Features",
    "Error Handling",
    "Memory Management & V8",
    "Performance & Best Practices"
  ],
  "react": [
    "React Fundamentals",
    "Components & Props",
    "State Management",
    "Component Lifecycle",
    "Hooks",
    "useState",
    "useEffect",
    "useContext",
    "useMemo & useCallback",
    "Custom Hooks",
    "Routing",
    "Context API",
    "State Management Libraries",
    "Redux",
    "Zustand",
    "Performance Optimization",
    "Virtual DOM & Reconciliation",
    "React Internals",
    "Server-Side Rendering",
    "Next.js Basics"
  ],
  "system-design": [
    "System Design Fundamentals",
    "Scaling",
    "Vertical vs Horizontal Scaling",
    "Load Balancers",
    "Caching Strategies",
    "Database Sharding & Partitioning",
    "Replication",
    "ACID vs BASE",
    "CAP Theorem",
    "Consistent Hashing",
    "Message Queues & Event Streaming",
    "Microservices Architecture",
    "API Gateway",
    "Service Discovery",
    "Distributed Transactions",
    "Saga Pattern",
    "System Design Case Studies"
  ]
};

const getCategoryOrderIndex = (category, subcategoryName) => {
  if (!category || !subcategoryName) return 9999;
  const normalizedCategory = category.toLowerCase().replace(/_/g, "-");
  const orderList = SUBTOPIC_ORDER[normalizedCategory];
  if (!orderList) return 9999;
  const nameLower = subcategoryName.toLowerCase().trim();
  const idx = orderList.findIndex(item => {
    const itemLower = item.toLowerCase().trim();
    return itemLower === nameLower || nameLower.includes(itemLower) || itemLower.includes(nameLower);
  });
  return idx !== -1 ? idx : 9999;
};

const getQuestionProgressionScore = (q) => {
  const text = (q.question || "").toLowerCase();
  const tagsStr = (q.tags || []).map(t => t.toLowerCase()).join(" ");
  const combined = `${text} ${tagsStr}`;

  // 1. Check tags/text for Internal Working
  const isInternal = combined.includes("internal") || 
                     combined.includes("under the hood") || 
                     combined.includes("how it works") || 
                     combined.includes("mechanism") || 
                     combined.includes("lifecycle") || 
                     combined.includes("architecture");

  // 2. Check tags/text for Scenario-Based
  const isScenario = combined.includes("scenario") || 
                     combined.includes("real-time") || 
                     combined.includes("real world") || 
                     combined.includes("design a") || 
                     combined.includes("how would you");

  // 3. Check tags/text for Practical
  const isPractical = combined.includes("implement") || 
                      combined.includes("coding") || 
                      combined.includes("write") || 
                      combined.includes("program") || 
                      combined.includes("example") || 
                      combined.includes("practical");

  // 4. Check for Frequently Asked (based on frequency field or tag)
  const isFreq = q.interview_frequency === "High" || combined.includes("frequent");

  // Difficulty Mapping
  const diff = q.difficulty_level || "Beginner";
  
  if (isFreq) return 6;
  if (isPractical) return 5;
  if (isScenario) return 4;
  if (isInternal) return 3;
  if (diff === "Advanced" || diff === "Expert") return 2;
  if (diff === "Intermediate") return 1;
  return 0; // Default / Basic / Beginner
};

const CompanyDetail = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  
  const companyTitle = formatCompanyTitle(companyName);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [actualCompanyName, setActualCompanyName] = useState(companyTitle);
  const [theme, setTheme] = useState(() => localStorage.getItem("global-theme") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
    localStorage.setItem("global-theme", theme);
    window.dispatchEvent(new CustomEvent("global-theme-changed", { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail);
    };
    window.addEventListener("global-theme-changed", handleThemeChange);
    return () => window.removeEventListener("global-theme-changed", handleThemeChange);
  }, []);

  useEffect(() => {
    const fetchCompanyQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .select("*");

        if (error) throw error;
        
        if (data) {
          const targetSlug = (companyName || "").toLowerCase().trim();
          const matched = data.filter(q => 
            q.company_tags && Array.isArray(q.company_tags) && q.company_tags.some(tag => 
              tag && typeof tag === 'string' && tag.toLowerCase().replace(/\s+/g, "-").trim() === targetSlug
            )
          );
          setQuestions(matched);

          // Find correct display name from the matched tags, e.g., "JPMorgan Chase"
          let displayName = "";
          for (const q of matched) {
            if (q.company_tags && Array.isArray(q.company_tags)) {
              const foundTag = q.company_tags.find(tag => 
                tag && typeof tag === 'string' && tag.toLowerCase().replace(/\s+/g, "-").trim() === targetSlug
              );
              if (foundTag) {
                displayName = foundTag;
                break;
              }
            }
          }
          setActualCompanyName(displayName || companyTitle);
        }
      } catch (err) {
        console.error("Failed to load company questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyQuestions();
  }, [companyName, companyTitle]);

  const filteredQuestions = questions.filter(q => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (q.question && q.question.toLowerCase().includes(query)) ||
      (q.subcategory && q.subcategory.toLowerCase().includes(query)) ||
      (q.tags && Array.isArray(q.tags) && q.tags.some(t => t && typeof t === 'string' && t.toLowerCase().includes(query)));

    const matchesDifficulty = selectedDifficulty === "All" || q.difficulty_level === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  }).sort((a, b) => {
    // 1. Sort by category
    const catA = (a.category || "").toLowerCase();
    const catB = (b.category || "").toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);

    // 2. Sort by subcategory learning order
    const idxA = getCategoryOrderIndex(a.category, a.subcategory);
    const idxB = getCategoryOrderIndex(b.category, b.subcategory);
    if (idxA !== idxB) return idxA - idxB;

    // 3. Sort by question progression score
    const scoreA = getQuestionProgressionScore(a);
    const scoreB = getQuestionProgressionScore(b);
    if (scoreA !== scoreB) return scoreA - scoreB;

    // 4. Sort by sort_order
    if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);

    // 5. Fallback alphabetically
    return a.question.localeCompare(b.question);
  });

  // Calculate statistics
  const totalCount = questions.length;
  const dsaCount = questions.filter(q => q.category && typeof q.category === 'string' && q.category.toLowerCase() === "dsa").length;
  const javaCount = questions.filter(q => q.category && typeof q.category === 'string' && q.category.toLowerCase() === "java").length;
  const systemDesignCount = questions.filter(q => q.category && typeof q.category === 'string' && q.category.toLowerCase() === "system-design").length;
  const otherCount = totalCount - dsaCount - javaCount - systemDesignCount;

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#22d3ee]/4 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#6366f1]/4 blur-[110px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
        
        {/* Top Header Actions Row */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/interview-questions")}
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </button>

          <button
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-[#6366f1]/20 bg-[#6366f1]/5 text-indigo-300 hover:text-white hover:bg-[#6366f1]/15 hover:border-[#6366f1]/35 transition-all cursor-pointer"
            title="Toggle theme mode"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1 w-8 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#22d3ee] uppercase">
                Company Target Track
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight flex items-center gap-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              <Building2 className="w-10 h-10 text-cyan-400 shrink-0" />
              {actualCompanyName}
            </h1>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/6 flex items-center gap-4 text-left font-mono">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Questions Count</div>
              <div className="text-base font-extrabold text-white mt-0.5">{totalCount} Curated Q&As</div>
            </div>
          </div>
        </div>

        {/* Company Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl border border-white/5 bg-[#050512]/40 text-left font-mono">
            <div className="text-xs text-gray-500 uppercase">DSA Questions</div>
            <div className="text-xl font-bold text-white mt-1">{dsaCount}</div>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-[#050512]/40 text-left font-mono">
            <div className="text-xs text-gray-500 uppercase">Java Core</div>
            <div className="text-xl font-bold text-white mt-1">{javaCount}</div>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-[#050512]/40 text-left font-mono">
            <div className="text-xs text-gray-500 uppercase">System Design</div>
            <div className="text-xl font-bold text-white mt-1">{systemDesignCount}</div>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-[#050512]/40 text-left font-mono">
            <div className="text-xs text-gray-500 uppercase">Other Topics</div>
            <div className="text-xl font-bold text-white mt-1">{otherCount}</div>
          </div>
        </div>

        {/* Question List Section */}
        <div className="text-left">
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
              Questions Catalog ({filteredQuestions.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0a0a1a]/60 border border-white/8 outline-none text-xs text-gray-200 focus:border-[#6366f1]/50 focus:bg-white/[0.01] transition-all font-mono"
                />
              </div>

              {/* Difficulty filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-[#0a0a1a]/65 border border-white/10 text-gray-300 rounded-xl px-3 py-1.5 text-xs outline-none font-mono"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mx-auto mb-4" />
              Fetching Question Set...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-gray-600 border border-dashed border-white/5 rounded-2xl">
              No questions found for this company matching criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q) => {
                return (
                  <Link
                    key={q.id}
                    to={`/interview-questions/topic/${(q.category || "").toLowerCase().replace(/\s+/g, "-")}?q=${q.id}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-[#050512]/30 hover:bg-[#07071e]/75 hover:border-cyan-500/20 transition-all cursor-pointer gap-4 text-decoration-none group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 mt-1.5 block w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs sm:text-[13px] font-bold text-white font-mono group-hover:text-cyan-400 transition-colors line-clamp-1 leading-normal">
                          {q.question}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                          <span>{(q.category || "").replace(/_/g, " ")}</span>
                          <span>•</span>
                          <span>{q.subcategory}</span>
                          {q.tags && q.tags.length > 0 && (
                            <>
                              <span>•</span>
                              {q.tags.map(tag => (
                                <span key={tag} className="text-purple-400">#{tag}</span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase ${DIFFICULTY_CLASSES[q.difficulty_level] || "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                        {q.difficulty_level || "Unknown"}
                      </span>
                      
                      <span className="text-[9px] text-gray-500 group-hover:text-white transition-colors uppercase tracking-wider flex items-center gap-0.5">
                        View Q&A <ChevronRight size={10} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompanyDetail;
