import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Edit, Trash2, Check, AlertCircle, Plus } from "lucide-react";
import { supabase } from "../services/supabase";

// Category configurations mapped exactly to your 15 folders
const CATEGORIES = [
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

// Helper: Custom simple markdown parser to render preview
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

const InterviewAdminEditor = () => {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // CMS Mode: "create" or "edit"
  const [editorMode, setEditorMode] = useState("create");
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");

  // Form Fields State
  const [category, setCategory] = useState("Java");
  const [subcategory, setSubcategory] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [detailedAnswer, setDetailedAnswer] = useState("");
  const [exampleText, setExampleText] = useState("");
  const [codeExample, setCodeExample] = useState("");
  const [companyTags, setCompanyTags] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Beginner");
  const [interviewFrequency, setInterviewFrequency] = useState("Medium");
  const [tagsInput, setTagsInput] = useState("");
  const [referencesInput, setReferencesInput] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check auth
  const handleAuth = (e) => {
    e.preventDefault();
    if (passcode === "Abhishek@123") {
      setIsAuthenticated(true);
      setErrorMsg("");
      // Save auth token temporarily to sessionStorage
      sessionStorage.setItem("cms-authenticated", "true");
    } else {
      setErrorMsg("Invalid Admin Passcode.");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("cms-authenticated") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch questions when category changes in "edit" mode
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchCategoryQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .select("id, question")
          .eq("category", category);

        if (error) throw error;
        setQuestionsList(data || []);
      } catch (err) {
        console.error("Failed to load questions for edit dropdown:", err);
      }
    };

    fetchCategoryQuestions();
  }, [category, isAuthenticated, editorMode]);

  // Load question data when a question is selected for editing
  const handleLoadQuestion = async (qId) => {
    setSelectedQuestionId(qId);
    if (!qId) {
      clearForm();
      return;
    }

    try {
      const { data, error } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("id", qId)
        .single();

      if (error) throw error;

      if (data) {
        setQuestionId(data.id);
        setCategory(data.category);
        setSubcategory(data.subcategory || "");
        setQuestionText(data.question || "");
        setShortAnswer(data.short_answer || "");
        setDetailedAnswer(data.detailed_answer || "");
        setExampleText(data.example || "");
        setCodeExample(data.code_example || "");
        setDifficultyLevel(data.difficulty_level || "Beginner");
        setInterviewFrequency(data.interview_frequency || "Medium");
        setSortOrder(data.sort_order || 0);

        // Arrays to comma strings
        setCompanyTags(data.company_tags ? data.company_tags.join(", ") : "");
        setTagsInput(data.tags ? data.tags.join(", ") : "");
        setReferencesInput(data.references_links ? data.references_links.join(", ") : "");
      }
    } catch (err) {
      console.error("Failed to load question details:", err);
    }
  };

  const clearForm = () => {
    setQuestionId("");
    setSubcategory("");
    setQuestionText("");
    setShortAnswer("");
    setDetailedAnswer("");
    setExampleText("");
    setCodeExample("");
    setCompanyTags("");
    setTagsInput("");
    setReferencesInput("");
    setSortOrder(0);
    setSelectedQuestionId("");
  };

  // Automatically generate ID from question text
  const handleGenerateId = () => {
    if (!questionText) return;
    const clean = questionText
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setQuestionId(`${catSlug}-${clean.substring(0, 45)}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!questionId || !questionText || !detailedAnswer) {
      setErrorMsg("Question ID, Question Title, and Detailed Answer are required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    // Format arrays
    const formattedCompanies = companyTags
      ? companyTags.split(",").map(c => c.trim()).filter(Boolean)
      : [];
    const formattedTags = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    const formattedReferences = referencesInput
      ? referencesInput.split(",").map(r => r.trim()).filter(Boolean)
      : [];

    const payload = {
      id: questionId,
      question: questionText,
      detailed_answer: detailedAnswer,
      short_answer: shortAnswer || null,
      example: exampleText || null,
      code_example: codeExample || null,
      category: category,
      subcategory: subcategory || "General",
      difficulty_level: difficultyLevel,
      company_tags: formattedCompanies,
      interview_frequency: interviewFrequency,
      tags: formattedTags,
      references_links: formattedReferences,
      sort_order: parseInt(sortOrder) || 0,
      last_updated_date: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from("interview_questions")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      setSaveSuccess(true);
      if (editorMode === "create") {
        clearForm();
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(`Failed to save question: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuestionId) return;
    
    if (!window.confirm(`Are you sure you want to delete question "${questionText}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("interview_questions")
        .delete()
        .eq("id", selectedQuestionId);

      if (error) throw error;
      
      alert("Question deleted successfully.");
      clearForm();
      // Force reload category questions
      setQuestionsList(prev => prev.filter(q => q.id !== selectedQuestionId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030014] text-[#e2e8f0] flex items-center justify-center font-sans">
        <form onSubmit={handleAuth} className="p-8 rounded-2xl border border-white/8 bg-[#0a0a1a]/80 backdrop-blur-md max-w-sm w-full text-left space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-[10px] text-white font-bold">KB</span>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">Q&A CMS Login</h2>
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Please enter your admin passcode to configure interview Q&As.</p>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gray-400 uppercase">Admin Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-sm text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
              placeholder="••••••••"
              required
            />
          </div>

          {errorMsg && (
            <div className="text-rose-400 text-[10px] font-mono flex items-center gap-1">
              <AlertCircle size={10} /> {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-bold rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Authenticate Editor
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#e2e8f0] font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-[#6366f1]/12 bg-[#050518]/90 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/interview-questions" className="text-xs font-mono text-gray-500 hover:text-white flex items-center gap-1.5 text-decoration-none">
            <ArrowLeft size={12} /> Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-xs font-mono text-[#a855f7] font-bold uppercase tracking-wider">
            Technical Q&A CMS
          </span>
        </div>

        {/* Toggle CMS Mode */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#050512] border border-[#6366f1]/15 rounded-lg p-0.5 text-[10px] font-mono font-bold">
            <button
              onClick={() => { setEditorMode("create"); clearForm(); }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${editorMode === "create" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Add New
            </button>
            <button
              onClick={() => { setEditorMode("edit"); clearForm(); }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${editorMode === "edit" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Modify Existing
            </button>
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem("cms-authenticated");
              setIsAuthenticated(false);
            }}
            className="text-[10px] font-mono font-bold text-gray-500 hover:text-white uppercase transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Form Column */}
        <div className="w-1/2 overflow-y-auto border-r border-[#6366f1]/12 p-6 text-left space-y-5 bg-[#050518]/20 select-text">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-[#6366f1]/10 pb-2">
            {editorMode === "create" ? <Plus size={14} className="text-[#a855f7]" /> : <Edit size={14} className="text-indigo-400" />}
            {editorMode === "create" ? "Add Interview Q&A Article" : "Modify Interview Q&A Article"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Category selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#04040e]/80 border border-[#6366f1]/15 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Subcategory (Topic)</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                  placeholder="e.g. Collections Framework"
                  required
                />
              </div>
            </div>

            {/* Load dropdown if in Edit Mode */}
            {editorMode === "edit" && (
              <div className="space-y-1.5 p-3 rounded-xl border border-indigo-500/15 bg-indigo-500/5">
                <label className="text-[10px] font-mono text-[#818cf8] uppercase font-bold">Select Article to Modify</label>
                <select
                  value={selectedQuestionId}
                  onChange={(e) => handleLoadQuestion(e.target.value)}
                  className="w-full bg-[#04040e]/90 border border-indigo-500/30 text-[#e2e8f0] text-xs rounded-xl px-3 py-2 outline-none font-mono"
                >
                  <option value="">-- Choose Question from {category} --</option>
                  {questionsList.map(q => (
                    <option key={q.id} value={q.id}>{q.question}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Question Text</label>
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                placeholder="What is the difference between..."
                required
              />
            </div>

            {/* Question ID and Generate helper */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Question Unique ID (Slug)</label>
                <button
                  type="button"
                  onClick={handleGenerateId}
                  className="text-[9px] font-mono text-[#a855f7] hover:underline cursor-pointer"
                >
                  Generate ID from Title
                </button>
              </div>
              <input
                type="text"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                placeholder="e.g. java-collections-hashmap-vs-hashtable"
                disabled={editorMode === "edit"}
                required
              />
            </div>

            {/* Short Summary Answer */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Elevator Pitch / Quick Summary Answer</label>
              <input
                type="text"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                placeholder="A concise 2-sentence summary of the answer"
              />
            </div>

            {/* Detailed Answer text area */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Detailed Answer explanation (Supports Markdown)</label>
                <span className="text-[9px] font-mono text-gray-600">Use double newlines for paragraphs, ** for bold, ``` for code</span>
              </div>
              <textarea
                value={detailedAnswer}
                onChange={(e) => setDetailedAnswer(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-sans leading-relaxed select-text"
                placeholder="Explain the concepts, background, internal workings, and design trade-offs in detail..."
                required
              />
            </div>

            {/* Conceptual example */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Conceptual Example (Plaintext Description)</label>
              <textarea
                value={exampleText}
                onChange={(e) => setExampleText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all"
                placeholder="Provide a conceptual, real-world example explaining this question..."
              />
            </div>

            {/* Code example */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Code Implementation (Raw Code)</label>
              <textarea
                value={codeExample}
                onChange={(e) => setCodeExample(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-[#a5d6ff] font-mono outline-none focus:border-[#6366f1] transition-all"
                placeholder="// Java code goes here..."
              />
            </div>

            {/* Metas: Difficulty, Frequency, Sort Order */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Difficulty Level</label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
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
                  value={interviewFrequency}
                  onChange={(e) => setInterviewFrequency(e.target.value)}
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
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                />
              </div>
            </div>

            {/* Tags Inputs: Company, Tags, References */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Company Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={companyTags}
                  onChange={(e) => setCompanyTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                  placeholder="Google, Amazon, Microsoft, TCS"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Custom Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                  placeholder="multithreading, memory leak, garbage collection"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Reference Links (Comma Separated)</label>
                <input
                  type="text"
                  value={referencesInput}
                  onChange={(e) => setReferencesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#04040e]/60 border border-[#6366f1]/25 text-xs text-gray-200 outline-none focus:border-[#6366f1] transition-all font-mono"
                  placeholder="https://docs.oracle.com/..., https://baeldung.com/..."
                />
              </div>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="text-rose-400 text-xs font-mono flex items-center gap-1.5 py-1">
                <AlertCircle size={12} /> {errorMsg}
              </div>
            )}

            {/* Save Button toolbar */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} className="text-emerald-400" /> Successfully Saved!
                  </>
                ) : (
                  <>
                    <Save size={14} /> {isSaving ? "Saving Article..." : "Publish Article to Cloud"}
                  </>
                )}
              </button>

              {editorMode === "edit" && selectedQuestionId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                  title="Delete article"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Right Side Live Preview Column */}
        <div className="w-1/2 overflow-y-auto p-6 bg-[#050510]/50 select-text flex flex-col text-left">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-[#6366f1]/10 pb-2 mb-6 shrink-0 select-none">
            <Eye size={14} className="text-emerald-400" />
            Live Q&A Reader Preview
          </h2>

          <div className="max-w-xl w-full mx-auto flex-1 flex flex-col animate-fade-in text-left">
            {/* Badges preview */}
            <div className="flex flex-wrap items-center gap-2 mb-4 select-none">
              <span className="px-2 py-0.5 border rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                ⚡ {difficultyLevel}
              </span>
              <span className="px-2 py-0.5 border rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border-indigo-500/25">
                🔥 Frequency: {interviewFrequency}
              </span>
              <span className="px-2 py-0.5 border border-white/5 bg-white/4 rounded-md text-[9px] font-mono text-gray-400">
                📁 {subcategory || "(subcategory)"}
              </span>
            </div>

            {/* Question Text preview */}
            <h1 className="text-xl font-bold text-white leading-snug tracking-tight mb-6 font-sans">
              {questionText || "Question Title displays here..."}
            </h1>

            {/* Action Bar preview */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/6 py-3.5 mb-8 select-none">
              <div className="text-[10px] text-gray-500 font-mono">
                Category: <span className="text-[#a855f7] font-bold">{category}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {companyTags ? (
                  companyTags.split(",").map(c => c.trim()).filter(Boolean).map(comp => (
                    <span key={comp} className="px-2 py-0.5 bg-[#0e0d21] border border-cyan-500/25 text-[9px] font-mono text-[#22d3ee] rounded-md">
                      🏢 {comp}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] text-gray-600 font-mono italic">No company tags</span>
                )}
              </div>
            </div>

            {/* Summary preview */}
            {shortAnswer && (
              <div className="mb-8 p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 flex items-start gap-3">
                <AlertCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold font-mono text-indigo-300 block mb-1">Quick Summary Answer</span>
                  <p className="text-gray-300 leading-relaxed font-sans">{shortAnswer}</p>
                </div>
              </div>
            )}

            {/* Detailed Answer preview */}
            <div className="prose prose-invert max-w-none text-gray-300 text-xs sm:text-[13px] leading-relaxed space-y-4 mb-8 font-sans">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3 select-none">
                Detailed Answer
              </h3>
              {detailedAnswer ? renderMarkdown(detailedAnswer) : (
                <p className="text-gray-600 italic font-mono text-xs">No detailed answer written yet.</p>
              )}
            </div>

            {/* Conceptual Example preview */}
            {exampleText && (
              <div className="mb-8 text-xs">
                <h3 className="font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3 select-none">
                  Conceptual Example
                </h3>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-gray-400 leading-relaxed">
                  {exampleText}
                </div>
              </div>
            )}

            {/* Code preview */}
            {codeExample && (
              <div className="mb-8">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/5 pb-1 mb-3 select-none">
                  Code Implementation
                </h3>
                <pre className="bg-[#050510] border border-white/8 rounded-xl p-4 overflow-x-auto text-[11.5px] font-mono text-[#a5d6ff] text-left leading-relaxed">
                  <code>{codeExample}</code>
                </pre>
              </div>
            )}

            {/* References preview */}
            {referencesInput && (
              <div className="text-xs border-t border-white/5 pt-6 mb-12 select-none">
                <h3 className="font-mono font-bold uppercase tracking-wider text-gray-500 mb-3">
                  References & Read-ups
                </h3>
                <div className="flex flex-col gap-2">
                  {referencesInput.split(",").map(r => r.trim()).filter(Boolean).map((refLink, idx) => (
                    <span key={idx} className="text-gray-400 truncate font-mono text-[10px] flex items-center gap-1.5">
                      <span className="text-indigo-400">🔗</span> {refLink}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewAdminEditor;