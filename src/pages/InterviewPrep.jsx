import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Building2, HelpCircle as HelpIcon, ArrowRight } from "lucide-react";
import { supabase } from "../services/supabase";

// Category configurations mapped exactly to your 15 folders
const CATEGORIES = [
  { id: "java", name: "Java", emoji: "☕", desc: "Core Java, OOPs, Collections, JVM, Multithreading, Streams, GC", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20 text-orange-400" },
  { id: "spring-boot", name: "Spring Boot", emoji: "🍃", desc: "Dependency Injection, MVC, REST APIs, Beans, Transactions", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20 text-emerald-400" },
  { id: "microservices", name: "Microservices", emoji: "⚙️", desc: "Architecture, Resiliency, Service Registry, Saga, Bulkhead, Outbox", color: "from-indigo-500/20 to-purple-500/10", border: "border-indigo-500/20 text-indigo-400" },
  { id: "dbms", name: "DBMS", emoji: "🗄️", desc: "Normalization, Relational/Non-relational, Zero-downtime schema migrations", color: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/20 text-rose-400" },
  { id: "dsa", name: "DSA", emoji: "🧮", desc: "Array & String Algorithms, Sliding Window, Stack, Cache Design", color: "from-violet-500/20 to-fuchsia-500/10", border: "border-violet-500/20 text-violet-400" },
  { id: "design-patterns", name: "Design Patterns", emoji: "📐", desc: "Singleton, Factory, Builder, Strategy, Observer, SOLID principles", color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20 text-blue-400" },
  { id: "docker", name: "Docker", emoji: "🐳", desc: "Containerization, Dockerfiles, Volumes, Networking, CLI cheat sheet", color: "from-sky-500/20 to-blue-500/10", border: "border-sky-500/20 text-sky-400" },
  { id: "hibernate-jpa", name: "Hibernate & JPA", emoji: "💾", desc: "FetchType, Lazy vs Eager, Pagination, Caching, N+1 Select Problem", color: "from-teal-500/20 to-emerald-500/10", border: "border-teal-500/20 text-teal-400" },
  { id: "jms", name: "JMS", emoji: "✉️", desc: "Queue vs Topic models, Spring JmsTemplate, Message Listeners", color: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20 text-pink-400" },
  { id: "kafka", name: "Kafka", emoji: "🧲", desc: "Producers, Brokers, Consumer Groups, Partitions, Durability, ISR", color: "from-red-500/20 to-orange-500/10", border: "border-red-500/20 text-red-400" },
  { id: "oops", name: "OOPs", emoji: "🧩", desc: "Classes, Objects, Inheritance, Polymorphism, Encapsulation, SOLID", color: "from-cyan-500/20 to-teal-500/10", border: "border-cyan-500/20 text-cyan-400" },
  { id: "redis", name: "Redis", emoji: "⚡", desc: "In-memory caching, TTL, Key-value eviction policies, Session storage", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20 text-yellow-400" },
  { id: "sql", name: "SQL", emoji: "📊", desc: "Queries, Joins, Indexing, Stored Procedures, Optimization, B+ Trees", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20 text-amber-400" },
  { id: "spring-security", name: "Spring Security", emoji: "🔒", desc: "Authentication, Authorization, JWT, OAuth2, Inter-service security", color: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20 text-green-400" },
  { id: "system-design", name: "System Design", emoji: "🏛️", desc: "HLD, LLD, Scalability, Rate Limiting, High Availability, Ledgers", color: "from-violet-500/20 to-indigo-500/10", border: "border-violet-500/20 text-violet-400" }
];

// Map of page id to database category name (if they differ)
const DB_CAT_MAP = {
  "hibernate-jpa": "Hibernate_JPA",
  "design-patterns": "Design Patterns",
  "spring-boot": "Spring Boot",
  "spring-security": "Spring Security",
  "system-design": "System Design"
};

const POPULAR_COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber", 
  "LinkedIn", "Adobe", "Atlassian", "Walmart", "Goldman Sachs", "JPMorgan Chase", 
  "Visa", "Salesforce", "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", 
  "Accenture", "Zoho", "Paytm", "PhonePe", "Razorpay", "Swiggy", "Zomato", "Flipkart"
];

const InterviewPrep = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryStats, setCategoryStats] = useState({});
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .select("category");

        if (error) throw error;

        if (data) {
          setTotalQuestions(data.length);
          const stats = {};
          data.forEach(q => {
            // Normalize to lower case for stat mapping
            const cat = q.category.toLowerCase().trim();
            if (!stats[cat]) stats[cat] = 0;
            stats[cat] += 1;
          });
          setCategoryStats(stats);
        }
      } catch (err) {
        console.error("Failed to fetch questions stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getCount = (catId) => {
    // Check both standard id and DB mapped category name
    const dbName = DB_CAT_MAP[catId] || catId;
    const count = categoryStats[dbName.toLowerCase()] || categoryStats[catId.toLowerCase()] || 0;
    return count;
  };

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
        <div className="text-left mb-12 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#818cf8] uppercase">
                Technical Reference Library
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
              Interview Q&As
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Browse through my structured repository of technical interview questions and high-quality answers. Grouped by core domains, subtopics, and companies for convenient reference.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#050512]/40 text-left font-mono shrink-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Total Q&A Articles</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{totalQuestions} Q&As</div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-14">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-6 text-left">
            Technology Categories
          </h2>
          
          {loading ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin mx-auto mb-4" />
              Loading Question Banks...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map((cat) => {
                const count = getCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/interview-questions/topic/${cat.id}`)}
                    className="group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-12px_rgba(99,102,241,0.25)] cursor-pointer text-left overflow-hidden bg-[#0a0a1a]/85 border-white/6 hover:border-indigo-500/35 backdrop-blur-md"
                  >
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                      <span className="text-3xl p-2.5 rounded-xl bg-white/4 group-hover:scale-110 transition-transform duration-300">
                        {cat.emoji}
                      </span>
                      <div className="text-[10px] font-mono text-indigo-400 group-hover:text-white transition-colors bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {count} {count === 1 ? 'Question' : 'Questions'}
                      </div>
                    </div>

                    <div className="relative z-10 flex-1">
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide group-hover:text-[#a855f7] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
                        {cat.desc}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500 group-hover:text-indigo-400 transition-colors w-full relative z-10">
                      <span>Browse Library</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
                Browse by Company Tag
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                View interview questions compiled from recent hiring cycles of top tech companies.
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
                  onClick={() => navigate(`/interview-questions/company/${company.toLowerCase().replace(/\s+/g, "-")}`)}
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
