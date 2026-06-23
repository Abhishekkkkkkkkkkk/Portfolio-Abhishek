import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, HelpCircle, Building2, CheckCircle, Bookmark, Star, ArrowRight, BookOpen, ShieldAlert, Award, Play } from "lucide-react";
import { supabase } from "../services/supabase";

// Category configuration
const CATEGORIES = [
  { id: "java", name: "Java", emoji: "☕", desc: "Core Java, OOPs, Collections, JVM, Multithreading, Streams", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20 text-orange-400" },
  { id: "spring-boot", name: "Spring Boot", emoji: "🍃", desc: "Dependency Injection, MVC, REST APIs, Security, JPA, Microservices", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20 text-emerald-400" },
  { id: "dsa", name: "DSA", emoji: "🧮", desc: "Arrays, Strings, Recursion, Trees, Graphs, DP, Binary Search", color: "from-violet-500/20 to-indigo-500/10", border: "border-violet-500/20 text-violet-400" },
  { id: "system-design", name: "System Design", emoji: "🏛️", desc: "HLD, LLD, Scalability, Distributed Transactions, Saga Pattern", color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/20 text-amber-400" },
  { id: "frontend", name: "Frontend", emoji: "⚛️", desc: "HTML, CSS, JS, ES6+, TypeScript, React, Next.js, Redux, Performance", color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20 text-cyan-400" },
  { id: "backend", name: "Backend", emoji: "💾", desc: "Node.js, Express, REST APIs, Security, Auth, System Design", color: "from-blue-600/20 to-indigo-600/10", border: "border-blue-500/20 text-blue-400" },
  { id: "mern-stack", name: "MERN Stack", emoji: "🥞", desc: "MongoDB, Express, React, Node, Full Stack architecture", color: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20 text-pink-400" }
];

// Famous companies list
const POPULAR_COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber", 
  "LinkedIn", "Adobe", "Atlassian", "Walmart", "Goldman Sachs", "JPMorgan Chase", 
  "Visa", "Salesforce", "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", 
  "Zoho", "Paytm", "PhonePe", "Razorpay", "Swiggy", "Zomato", "Flipkart"
];

const InterviewPrep = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Progress states
  const [completedIds, setCompletedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [favoritedIds, setFavoritedIds] = useState(new Set());

  // Stats
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    // Load local progress
    try {
      const completed = JSON.parse(localStorage.getItem("iq-completed") || "[]");
      const bookmarked = JSON.parse(localStorage.getItem("iq-bookmarked") || "[]");
      const favorited = JSON.parse(localStorage.getItem("iq-favorited") || "[]");
      
      setCompletedIds(new Set(completed));
      setBookmarkedIds(new Set(bookmarked));
      setFavoritedIds(new Set(favorited));
      setCompletedCount(completed.length);
    } catch (e) {
      console.warn("Failed to load local progress:", e);
    }

    // Fetch questions
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .select("id, category, subcategory, difficulty_level, company_tags");

        if (error) throw error;

        if (data) {
          setQuestions(data);
          setTotalQuestions(data.length);

          // Calculate stats
          const stats = {};
          data.forEach(q => {
            const cat = q.category.toLowerCase();
            if (!stats[cat]) stats[cat] = { total: 0, completed: 0 };
            stats[cat].total += 1;
          });
          
          // Re-sync completed count with database IDs
          const completedList = JSON.parse(localStorage.getItem("iq-completed") || "[]");
          const validCompleted = completedList.filter(id => data.some(q => q.id === id));
          setCompletedCount(validCompleted.length);
          
          validCompleted.forEach(id => {
            const questionObj = data.find(q => q.id === id);
            if (questionObj) {
              const cat = questionObj.category.toLowerCase();
              if (stats[cat]) stats[cat].completed += 1;
            }
          });

          setCategoryStats(stats);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const progressPercent = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  // Filter companies by search query if any
  const filteredCompanies = POPULAR_COMPANIES.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#6366f1]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#a855f7]/5 blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
        {/* Back Link */}
        <button
          onClick={() => {
            sessionStorage.setItem("scrollToSection", "Portfolio");
            navigate("/");
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors duration-200 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Portfolio
        </button>

        {/* Hero Header */}
        <div className="text-left mb-12 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#818cf8] uppercase">
              Interactive Preparation Platform
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Interview Prep
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Crack your coding and system design rounds. Solve structured topic-wise questions sorted by difficulty, track your readiness score, and filter by top tier companies.
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="mb-12 p-6 rounded-2xl border border-white/8 bg-[#0a0a1a]/60 backdrop-blur-md relative overflow-hidden" data-aos="fade-up">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/4 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-left w-full md:w-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">Your Prep Progress</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold text-white font-mono">{progressPercent}%</span>
                <span className="text-xs text-gray-500 font-mono">Readiness Index</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 max-w-md">
                You have completed <span className="text-white font-bold font-mono">{completedCount}</span> out of <span className="text-white font-bold font-mono">{totalQuestions || 7}</span> available questions. Keep going!
              </p>
            </div>
            
            <div className="flex-1 w-full md:max-w-md">
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2">
                <span>0% Beginner</span>
                <span>50% Intermediate</span>
                <span>100% Interview Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-14">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-6 text-left">
            Select a Practice Track
          </h2>
          
          {loading ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin mx-auto mb-4" />
              Loading Question Banks...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map((cat) => {
                const stats = categoryStats[cat.id] || { total: 0, completed: 0 };
                const catPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/interview-prep/topic/${cat.id}`)}
                    className="group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(99,102,241,0.25)] cursor-pointer text-left overflow-hidden bg-[#0a0a1a]/85 border-white/6 hover:border-indigo-500/35 backdrop-blur-md"
                  >
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                      <span className="text-3xl p-2.5 rounded-xl bg-white/4 group-hover:scale-110 transition-transform duration-300">
                        {cat.emoji}
                      </span>
                      <div className="text-[10px] font-mono text-indigo-400 group-hover:text-white transition-colors bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {stats.completed}/{stats.total} Solved
                      </div>
                    </div>

                    <div className="relative z-10 flex-1">
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide group-hover:text-[#a855f7] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>

                    {/* Miniature Progress Line */}
                    <div className="w-full mt-6 bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${catPercent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Company-Wise preparation section */}
        <div className="text-left border-t border-white/5 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                Company-Specific Collections
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Filter questions frequently reported in interview cycles of target tech companies.
              </p>
            </div>
            
            {/* Simple company search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0a0a1a]/60 border border-white/8 outline-none text-xs text-gray-200 focus:border-[#6366f1]/50 focus:bg-white/[0.01] transition-all font-mono"
              />
            </div>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-gray-600">
              No matching companies found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredCompanies.map((company) => (
                <button
                  key={company}
                  onClick={() => navigate(`/interview-prep/company/${company.toLowerCase().replace(/\s+/g, "-")}`)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-[#050512]/40 hover:bg-[#07071e]/70 hover:border-indigo-500/25 transition-all text-xs font-semibold font-mono text-gray-400 hover:text-[#22d3ee] cursor-pointer group"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#22d3ee] transition-colors" />
                  <span className="truncate">{company}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
