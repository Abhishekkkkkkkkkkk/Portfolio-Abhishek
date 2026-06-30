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
  "system_design": "System Design",
  "Angular": "Angular",
  "JavaScript": "JavaScript"
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
const parseInlineMarkdown = (text) => {
  if (!text) return "";

  const codeRegex = /`([^`]+)`/;
  const boldRegex = /\*\*(.*?)\*\*/;
  const italicRegex = /\*([^*]+)\*/;

  const codeMatch = codeRegex.exec(text);
  const boldMatch = boldRegex.exec(text);
  const italicMatch = italicRegex.exec(text);

  let firstMatch = null;
  let firstIndex = Infinity;
  let matchType = null; // 'code' | 'bold' | 'italic'

  if (codeMatch && codeMatch.index < firstIndex) {
    firstIndex = codeMatch.index;
    firstMatch = codeMatch;
    matchType = 'code';
  }
  if (boldMatch && boldMatch.index < firstIndex) {
    firstIndex = boldMatch.index;
    firstMatch = boldMatch;
    matchType = 'bold';
  }
  if (italicMatch && italicMatch.index < firstIndex) {
    if (!boldMatch || boldMatch.index !== italicMatch.index) {
      firstIndex = italicMatch.index;
      firstMatch = italicMatch;
      matchType = 'italic';
    }
  }

  if (!firstMatch) {
    return text;
  }

  const beforeText = text.substring(0, firstIndex);
  const matchedText = firstMatch[1];
  const afterText = text.substring(firstIndex + firstMatch[0].length);

  const result = [];
  if (beforeText) {
    result.push(parseInlineMarkdown(beforeText));
  }

  if (matchType === 'code') {
    result.push(
      <code className="bg-white/10 text-amber-200 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/5">
        {matchedText}
      </code>
    );
  } else if (matchType === 'bold') {
    result.push(
      <strong className="text-white font-semibold">
        {parseInlineMarkdown(matchedText)}
      </strong>
    );
  } else if (matchType === 'italic') {
    result.push(
      <em className="italic text-gray-300">
        {parseInlineMarkdown(matchedText)}
      </em>
    );
  }

  if (afterText) {
    result.push(parseInlineMarkdown(afterText));
  }

  const flat = [];
  const walk = (node) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node !== null && node !== undefined && node !== '') {
      flat.push(node);
    }
  };
  walk(result);

  return flat.map((node, i) => {
    if (React.isValidElement(node)) {
      return React.cloneElement(node, { key: i });
    }
    return node;
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const elements = [];
  
  let currentType = null; // 'code' | 'ul' | 'ol' | 'table' | 'p'
  let codeContent = [];
  let listItems = [];
  let tableLines = [];
  let paragraphLines = [];

  const ALIGN_CLASSES = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };

  const flushCurrent = (keyPrefix) => {
    if (currentType === 'code') {
      elements.push(
        <pre key={`code-${keyPrefix}`} className="bg-[#050510] border border-white/8 rounded-xl p-4 overflow-x-auto text-[11.5px] font-mono text-[#a5d6ff] text-left my-4 leading-relaxed">
          <code>{codeContent.join('\n')}</code>
        </pre>
      );
      codeContent = [];
      currentType = null;
    } else if (currentType === 'ul') {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="list-disc pl-5 space-y-1.5 my-3 text-left">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-300 leading-relaxed text-xs sm:text-[13px]">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      currentType = null;
    } else if (currentType === 'ol') {
      elements.push(
        <ol key={`ol-${keyPrefix}`} className="list-decimal pl-5 space-y-1.5 my-3 text-left">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-300 leading-relaxed text-xs sm:text-[13px]">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      listItems = [];
      currentType = null;
    } else if (currentType === 'table') {
      const parsedRows = tableLines.map(row => {
        const cells = row.split('|').map(c => c.trim());
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();
        return cells;
      });

      const delimiterIdx = parsedRows.findIndex(row => 
        row.length > 0 && row.every(cell => /^:?-+:?$/.test(cell))
      );

      let headers = [];
      let bodyRows = [];
      let alignments = [];

      if (delimiterIdx !== -1) {
        alignments = parsedRows[delimiterIdx].map(cell => {
          const left = cell.startsWith(':');
          const right = cell.endsWith(':');
          if (left && right) return 'center';
          if (right) return 'right';
          return 'left';
        });
        headers = parsedRows.slice(0, delimiterIdx);
        bodyRows = parsedRows.slice(delimiterIdx + 1);
      } else {
        if (parsedRows.length > 1) {
          headers = [parsedRows[0]];
          bodyRows = parsedRows.slice(1);
        } else {
          bodyRows = parsedRows;
        }
      }

      elements.push(
        <div key={`table-${keyPrefix}`} className="overflow-x-auto my-4 rounded-xl border border-white/8">
          <table className="min-w-full divide-y divide-white/8 text-[12px] sm:text-[13px]">
            {headers.length > 0 && (
              <thead className="bg-white/[0.03]">
                {headers.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => {
                      const align = alignments[cIdx] || 'left';
                      const alignClass = ALIGN_CLASSES[align] || 'text-left';
                      return (
                        <th 
                          key={cIdx} 
                          className={`px-4 py-3 ${alignClass} font-semibold text-white tracking-wider border-r border-white/5 last:border-r-0`}
                        >
                          {parseInlineMarkdown(cell)}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
            )}
            <tbody className="divide-y divide-white/5 bg-transparent">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.01] transition-colors">
                  {row.map((cell, cIdx) => {
                    const align = alignments[cIdx] || 'left';
                    const alignClass = ALIGN_CLASSES[align] || 'text-left';
                    return (
                      <td 
                        key={cIdx} 
                        className={`px-4 py-2.5 ${alignClass} text-gray-300 border-r border-white/5 last:border-r-0`}
                      >
                        {parseInlineMarkdown(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
      currentType = null;
    } else if (currentType === 'p') {
      if (paragraphLines.length > 0) {
        elements.push(
          <p key={`p-${keyPrefix}`} className="mb-4 text-left leading-relaxed text-gray-300 text-xs sm:text-[13px]">
            {parseInlineMarkdown(paragraphLines.join(' '))}
          </p>
        );
        paragraphLines = [];
      }
      currentType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle code block toggle
    if (trimmed.startsWith('```')) {
      if (currentType === 'code') {
        flushCurrent(i);
      } else {
        flushCurrent(i);
        currentType = 'code';
      }
      continue;
    }

    if (currentType === 'code') {
      codeContent.push(line);
      continue;
    }

    // Empty line
    if (trimmed === '') {
      flushCurrent(i);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushCurrent(i);
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      
      let headingClass = "";
      if (level === 1) headingClass = "text-base font-semibold text-white mt-6 mb-2 border-b border-white/5 pb-1";
      else if (level === 2) headingClass = "text-sm font-semibold text-white mt-5 mb-2";
      else if (level === 3) headingClass = "text-xs font-bold uppercase tracking-wider text-gray-200 mt-4 mb-2";
      else headingClass = "text-xs font-semibold text-gray-300 mt-3 mb-1.5";

      const HeadingTag = `h${level}`;
      elements.push(
        <HeadingTag key={`h-${i}`} className={headingClass}>
          {parseInlineMarkdown(content)}
        </HeadingTag>
      );
      continue;
    }

    // Tables
    if (trimmed.startsWith('|')) {
      if (currentType !== 'table') {
        flushCurrent(i);
        currentType = 'table';
      }
      tableLines.push(line);
      continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^([*-]|\+)\s+(.*)$/);
    if (ulMatch) {
      if (currentType !== 'ul') {
        flushCurrent(i);
        currentType = 'ul';
      }
      listItems.push(ulMatch[2]);
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (currentType !== 'ol') {
        flushCurrent(i);
        currentType = 'ol';
      }
      listItems.push(olMatch[2]);
      continue;
    }

    // List item line continuation
    if (currentType === 'ul' || currentType === 'ol') {
      if (listItems.length > 0) {
        listItems[listItems.length - 1] += ' ' + trimmed;
        continue;
      }
    }

    // Normal paragraph line
    if (currentType !== 'p') {
      flushCurrent(i);
      currentType = 'p';
    }
    paragraphLines.push(line);
  }

  flushCurrent(lines.length);
  return elements;
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
              {/* Detailed Answer Explanation */}
              <div className="prose prose-invert max-w-none text-gray-300 text-xs sm:text-[13px] leading-relaxed space-y-4 mb-8 font-sans">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3">
                  Detailed Answer
                </h3>
                {renderMarkdown(activeQuestion.detailed_answer)}
              </div>

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
                    {activeQuestion.references_links.map((refLink, idx) => {
                      let label = refLink;
                      let url = refLink;
                      if (refLink.includes('|')) {
                        const parts = refLink.split('|');
                        label = parts[0].trim();
                        url = parts[1].trim();
                      }
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-decoration-none truncate font-mono"
                        >
                          <ExternalLink size={10} className="shrink-0" /> {label}
                        </a>
                      );
                    })}
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
