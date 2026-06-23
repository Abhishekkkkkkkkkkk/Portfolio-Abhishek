import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, HelpCircle, Briefcase, Award, CheckCircle, Search, ExternalLink, ChevronRight } from "lucide-react";
import { supabase } from "../services/supabase";

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

const CompanyDetail = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  
  const companyTitle = formatCompanyTitle(companyName);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Local storage lists for stats
  const [completedList, setCompletedList] = useState([]);

  useEffect(() => {
    try {
      setCompletedList(JSON.parse(localStorage.getItem("iq-completed") || "[]"));
    } catch (e) {
      console.warn("Failed to load completed questions progress:", e);
    }
  }, []);

  useEffect(() => {
    const fetchCompanyQuestions = async () => {
      setLoading(true);
      try {
        // Query matching questions
        const { data, error } = await supabase
          .from("interview_questions")
          .select("*")
          .contains("company_tags", [companyTitle]);

        if (error) throw error;
        
        if (data) {
          setQuestions(data);
        }
      } catch (err) {
        console.error("Failed to load company questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyQuestions();
  }, [companyTitle]);

  // Filters
  const filteredQuestions = questions.filter(q => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      q.question.toLowerCase().includes(query) ||
      (q.subcategory && q.subcategory.toLowerCase().includes(query)) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(query)));

    const matchesDifficulty = selectedDifficulty === "All" || q.difficulty_level === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  // Calculate statistics
  const totalCount = questions.length;
  const solvedCount = questions.filter(q => completedList.includes(q.id)).length;
  const dsaCount = questions.filter(q => q.category.toLowerCase() === "dsa").length;
  const javaCount = questions.filter(q => q.category.toLowerCase() === "java").length;
  const systemDesignCount = questions.filter(q => q.category.toLowerCase() === "system-design").length;
  const webDevCount = questions.filter(q => ["frontend", "backend", "spring-boot", "mern-stack"].includes(q.category.toLowerCase())).length;

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#22d3ee]/4 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#6366f1]/4 blur-[110px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
        
        {/* Back Link */}
        <button
          onClick={() => navigate("/interview-prep")}
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors duration-200 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>

        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12" data-aos="fade-in">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1 w-8 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#22d3ee] uppercase">
                Company Target Track
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight flex items-center gap-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              <Building2 className="w-10 h-10 text-cyan-400 shrink-0" />
              {companyTitle}
            </h1>
          </div>

          {/* Simple progress badge */}
          <div className="px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/6 flex items-center gap-4 text-left font-mono">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Solved Status</div>
              <div className="text-base font-extrabold text-white mt-0.5">{solvedCount} / {totalCount}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Readiness</div>
              <div className="text-base font-extrabold text-cyan-400 mt-0.5">
                {totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Company Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-aos="fade-up">
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
            <div className="text-xs text-gray-500 uppercase">Web Dev</div>
            <div className="text-xl font-bold text-white mt-1">{webDevCount}</div>
          </div>
        </div>

        {/* Question List Section */}
        <div className="text-left" data-aos="fade-up" data-aos-delay="100">
          
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
                const isCompleted = completedList.includes(q.id);

                return (
                  <Link
                    key={q.id}
                    to={`/interview-prep/topic/${q.category.toLowerCase()}?q=${q.id}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-[#050512]/30 hover:bg-[#07071e]/75 hover:border-cyan-500/20 transition-all cursor-pointer gap-4 text-decoration-none group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle size={14} className="text-emerald-400 fill-emerald-500/10" />
                        ) : (
                          <span className="block w-3.5 h-3.5 rounded-full border border-gray-600" />
                        )}
                      </span>
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs sm:text-[13px] font-bold text-white font-mono group-hover:text-cyan-400 transition-colors line-clamp-1 leading-normal">
                          {q.question}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                          <span>{q.category}</span>
                          <span>•</span>
                          <span>{q.subcategory}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase ${DIFFICULTY_CLASSES[q.difficulty_level]}`}>
                        {q.difficulty_level}
                      </span>
                      
                      <span className="text-[9px] text-gray-500 group-hover:text-white transition-colors uppercase tracking-wider flex items-center gap-0.5">
                        Practice <ChevronRight size={10} />
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
