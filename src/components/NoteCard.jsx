import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FileText, Download, Eye, X, Calendar, BookOpen, ExternalLink } from "lucide-react";

const TAG_STYLES = {
  Java:            "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Spring Boot":   "bg-green-500/10  text-green-400  border-green-500/20",
  DSA:             "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "System Design": "bg-amber-500/10  text-amber-400  border-amber-500/20",
  React:           "bg-cyan-500/10   text-cyan-400   border-cyan-500/20",
  JavaScript:      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  MySQL:           "bg-blue-500/10   text-blue-400   border-blue-500/20",
  default:         "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const TagBadge = ({ tag }) => {
  const style = TAG_STYLES[tag] || TAG_STYLES.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style}`}>
      {tag}
    </span>
  );
};

/* ─── PDF Viewer Modal ─── */
const PdfModal = ({ open, onClose, pdfUrl, title }) => {
  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Escape" && open) onClose(); },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999, padding: "8px", animation: "noteFadeIn 0.2s ease-out" }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }} />

      {/* Modal */}
      <div
        className="relative flex flex-col w-full"
        style={{
          zIndex: 10,
          maxWidth: "860px",
          height: "calc(100vh - 16px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,10,26,0.97)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.7)",
          animation: "noteScaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "10px 12px" }}
        >
          {/* Left: dots + title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Traffic dots — hidden on very small screens */}
            <div className="hidden sm:flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,95,87,0.8)" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,189,46,0.8)" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(40,202,65,0.8)" }} />
            </div>
            <FileText style={{ width: 13, height: 13, color: "#a78bfa", flexShrink: 0 }} />
            <span
              className="truncate"
              style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", minWidth: 0 }}
            >
              {title}
            </span>
          </div>

          {/* Right: open + close */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg transition-all duration-300"
              style={{
                padding: "5px 10px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                fontSize: 11,
                fontWeight: 600,
                color: "#9ca3af",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9ca3af"; }}
            >
              <ExternalLink style={{ width: 11, height: 11 }} />
              <span className="hidden sm:inline">Open</span>
            </a>

            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-lg transition-all duration-300"
              style={{ width: 30, height: 30, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <X style={{ width: 13, height: 13, color: "#9ca3af" }} />
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            title={title}
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 12px" }}
        >
          <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: "0.04em", textAlign: "center" }}>
            Press ESC or click outside to close
          </span>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)" }}
        />
      </div>

      <style>{`
        @keyframes noteFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes noteScaleIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>,
    document.body
  );
};

/* ─── Note Card ─── */
const NoteCard = ({ id, title, description, subject, tags = [], pdfUrl, coverEmoji = "📄", pages, date, featured = false }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const BG_MAP = {
    Java:            "from-orange-500/10 to-orange-600/5",
    "Spring Boot":   "from-green-500/10  to-green-600/5",
    DSA:             "from-purple-500/10 to-purple-600/5",
    "System Design": "from-amber-500/10  to-amber-600/5",
    React:           "from-cyan-500/10   to-cyan-600/5",
    JavaScript:      "from-yellow-500/10 to-yellow-600/5",
    default:         "from-indigo-500/10 to-indigo-600/5",
  };
  const bg = BG_MAP[subject] || BG_MAP.default;

  return (
    <>
      <div className="group relative w-full h-full">
        {/* Outer glow */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))", filter: "blur(8px)" }}
        />

        {/* Card */}
        <div className="relative h-full flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden group-hover:border-[#6366f1]/40 transition-all duration-300 group-hover:-translate-y-1">

          {/* Shine */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:translate-x-full -translate-x-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
            />
          </div>

          {/* Cover */}
          <div className={`h-[90px] flex items-center justify-center bg-gradient-to-br ${bg} shrink-0 relative`}>
            <span className="text-4xl">{coverEmoji}</span>
            {featured && (
              <div
                className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md"
                style={{ background: "rgba(99,102,241,0.85)", border: "1px solid rgba(99,102,241,0.5)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span style={{ fontSize: 9, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.08em" }}>Featured</span>
              </div>
            )}
            <div
              className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <FileText style={{ width: 10, height: 10, color: "#f87171" }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em" }}>PDF</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-4 gap-2.5">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 2).map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}

            <h4 className="text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-[#a78bfa] transition-colors duration-300">
              {title}
            </h4>

            {description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                {description}
              </p>
            )}

            <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: "#4b5563" }}>
              {pages && (
                <span className="flex items-center gap-1">
                  <BookOpen style={{ width: 11, height: 11 }} />
                  {pages}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar style={{ width: 11, height: 11 }} />
                  {date}
                </span>
              )}
            </div>

            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Actions */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.25))"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))"; }}
              >
                <Eye style={{ width: 13, height: 13 }} />
                View
              </button>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-xl transition-all duration-300 hover:scale-110"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#9ca3af", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.1)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; e.currentTarget.style.color = "#4ade80"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9ca3af"; }}
                >
                  <Download style={{ width: 13, height: 13 }} />
                </a>
              )}
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }}
          />
        </div>
      </div>

      <PdfModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        pdfUrl={pdfUrl}
        title={title}
      />
    </>
  );
};

export default NoteCard;