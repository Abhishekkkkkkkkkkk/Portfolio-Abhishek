import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

const AchievementToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleUnlock = (e) => {
      const { id, title, description, icon } = e.detail;
      const toastId = `${id}-${Date.now()}`;
      setToasts((prev) => [...prev, { id: toastId, title, description, icon }]);

      // Remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5000);
    };

    window.addEventListener("achievement-unlocked", handleUnlock);
    return () => {
      window.removeEventListener("achievement-unlocked", handleUnlock);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="pointer-events-auto flex gap-4 p-4 rounded-2xl border border-yellow-500/30 bg-[#0c0c1e]/90 backdrop-blur-2xl shadow-[0_10px_30px_rgba(234,179,8,0.25)] ring-1 ring-yellow-500/20 overflow-hidden relative group"
          >
            {/* Ambient gold glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Sparkles decoration */}
            <div className="absolute top-1 right-2 text-yellow-500/40 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Achievement Icon */}
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/30 border border-yellow-500/40 text-2xl shadow-inner shadow-yellow-500/10 animate-[bounce_1.5s_infinite]">
              {toast.icon}
            </div>

            {/* Toast Copy */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                Achievement Unlocked!
              </span>
              <h4 className="text-sm font-bold text-white truncate">
                {toast.title}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {toast.description}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToast;
