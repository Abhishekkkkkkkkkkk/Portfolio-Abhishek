import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Award, ZoomIn } from "lucide-react";

const Certificate = ({ ImgSertif }) => {
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

  return (
    <>
      {/* ── Thumbnail Card ── */}
      <div
        className="group relative cursor-pointer w-full"
        onClick={() => setOpen(true)}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.3))", filter: "blur(8px)" }}
        />

        {/* Card */}
        <div
          className="relative rounded-2xl border border-white/10 overflow-hidden transition-all duration-400 group-hover:border-[#6366f1]/50 group-hover:-translate-y-1.5"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        >
          {/* Skeleton */}
          {!imgLoaded && (
            <div
              className="w-full h-44 flex items-center justify-center animate-pulse"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))" }}
            >
              <Award style={{ width: 40, height: 40, color: "rgba(99,102,241,0.2)" }} />
            </div>
          )}

          {/* Image */}
          <img
            src={ImgSertif}
            alt="Certificate"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-auto block transition-all duration-500 group-hover:scale-105 group-hover:brightness-75 ${imgLoaded ? "opacity-100" : "opacity-0 h-0"}`}
            style={{ filter: "contrast(1.05) saturate(1.05)" }}
          />

          {/* Shine sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ zIndex: 20 }}>
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:translate-x-full -translate-x-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }}
            />
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col items-center justify-center gap-3"
            style={{ zIndex: 10, background: "linear-gradient(to top, rgba(3,0,20,0.85) 0%, rgba(3,0,20,0.3) 50%, transparent 100%)" }}
          >
            <div
              className="p-3.5 rounded-2xl border border-white/20 backdrop-blur-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-400"
              style={{ background: "rgba(99,102,241,0.25)" }}
            >
              <ZoomIn style={{ width: 22, height: 22, color: "white" }} />
            </div>
            <span
              className="text-white text-sm font-bold tracking-wide translate-y-2 group-hover:translate-y-0 transition-transform duration-400"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)", transitionDelay: "75ms" }}
            >
              View Certificate
            </span>
          </div>

          {/* Badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/15 backdrop-blur-sm opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300"
            style={{ zIndex: 30, background: "rgba(0,0,0,0.55)" }}
          >
            <Award style={{ width: 12, height: 12, color: "#a78bfa" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Certificate
            </span>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ zIndex: 30, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)" }}
          />
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
  <Award style={{ width: 14, height: 14, color: "#9ca3af" }} />
</button>
            </div>

            {/* Image — scrollable */}
            <div className="flex-1 overflow-auto p-4 sm:p-5" style={{ minHeight: 0 }}>
              <img
                src={ImgSertif}
                alt="Certificate Full View"
                className="w-full h-auto block rounded-xl"
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