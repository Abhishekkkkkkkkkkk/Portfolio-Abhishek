import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Award, ZoomIn, ExternalLink, Calendar, ShieldCheck } from "lucide-react";

const Certificate = ({ ImgSertif, Name, Issuer, IssueDate, CredentialUrl }) => {
  const [open, setOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Escape" && open) setOpen(false); },
    [open]
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

  const formattedDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      {/* ── Premium Certificate Card ── */}
      <div className="group relative w-full h-full flex flex-col">
        {/* Hover Glow Behind Card */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#6366f1]/0 to-[#a855f7]/0 group-hover:from-[#6366f1]/25 group-hover:to-[#a855f7]/20 blur-md transition-all duration-500 pointer-events-none" />

        {/* Main Card Container */}
        <div className="relative flex flex-col h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl overflow-hidden shadow-xl group-hover:border-[#6366f1]/40 transition-all duration-400">
          
          {/* Shine overlay sweep */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>

          {/* ── Image & Hover Overlay Preview ── */}
          <div 
            className="relative overflow-hidden cursor-pointer bg-slate-950/40 border-b border-white/5 shrink-0" 
            style={{ height: "180px" }}
            onClick={() => setOpen(true)}
          >
            {/* Skeleton / Placeholder Loader */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-gradient-to-br from-[#6366f1]/5 to-[#a855f7]/5">
                <Award className="w-10 h-10 text-indigo-500/30" />
              </div>
            )}

            {/* Certificate Image */}
            <img
              src={ImgSertif}
              alt={Name || "Certificate"}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Verification / Certified Shield - Top Left */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Verified</span>
            </div>
          </div>

          {/* ── Content Details Area ── */}
          <div className="flex flex-col flex-1 p-5 gap-3 text-left">
            {/* Issuer Name Tag */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[#a78bfa] text-[9px] font-bold uppercase tracking-wider">
                {Issuer || "Issuer"}
              </span>
            </div>

            {/* Certificate Title */}
            <h3 
              className="text-sm font-black text-[#e2e8f0] group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2"
              title={Name}
            >
              {Name || "Certificate"}
            </h3>

            {/* Date Metadata */}
            {IssueDate && (
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                <Calendar className="w-3.5 h-3.5 text-indigo-400/60" />
                <span>Issued {formattedDate(IssueDate)}</span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full my-1" />

            {/* ── Verification Actions ── */}
            <div className="flex items-center justify-between gap-4 pt-1 z-20">
              {CredentialUrl ? (
                <a
                  href={CredentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-white hover:underline transition-all duration-200"
                >
                  Verify Credential
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[10px] text-gray-600 font-medium italic">Credential link unavailable</span>
              )}

              <button
                onClick={() => setOpen(true)}
                className="text-[11px] font-bold text-indigo-400 hover:text-white transition-colors duration-200"
              >
                Full Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal — rendered in document.body via portal ── */}
      {open && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 99999, padding: "16px", animation: "certFadeIn 0.2s ease-out" }}
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
          />

          {/* Modal box */}
          <div
            className="relative flex flex-col"
            style={{
              zIndex: 10,
              width: "100%",
              maxWidth: "680px",
              maxHeight: "calc(100vh - 32px)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(10,10,26,0.97)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
              animation: "certScaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,95,87,0.8)" }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,189,46,0.8)" }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: "rgba(40,202,65,0.8)" }} />
                </div>
                <div className="flex items-center gap-2 ml-1">
                  <Award style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>Certificate Preview</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl transition-all duration-300"
                style={{ width: 32, height: 32, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <X style={{ width: 14, height: 14, color: "#9ca3af" }} />
              </button>
            </div>

            {/* Image — scrollable */}
            <div className="flex-1 overflow-auto p-4 sm:p-5 text-center" style={{ minHeight: 0 }}>
              <img
                src={ImgSertif}
                alt="Certificate Full View"
                className="max-w-full h-auto inline-block rounded-xl"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-center px-5 py-3 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                Press ESC or click outside to close
              </span>
            </div>

            {/* Bottom accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)" }}
            />
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes certFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes certScaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Certificate;