import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle, HelpCircle, Trophy, CheckCircle2, XCircle, MessageSquare } from "lucide-react";

const CALLOUT_CONFIGS = {
  info: {
    border: "border-cyan-500/20 border-l-cyan-500",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    label: "Info",
    icon: Info
  },
  note: {
    border: "border-cyan-500/20 border-l-cyan-500",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    label: "Note",
    icon: Info
  },
  tip: {
    border: "border-emerald-500/20 border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    label: "Tip",
    icon: Lightbulb
  },
  warning: {
    border: "border-amber-500/20 border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    label: "Warning",
    icon: AlertTriangle
  },
  danger: {
    border: "border-rose-500/20 border-l-rose-500",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    label: "Important",
    icon: AlertCircle
  },
  important: {
    border: "border-rose-500/20 border-l-rose-500",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    label: "Important",
    icon: AlertCircle
  },
  interview: {
    border: "border-purple-500/20 border-l-purple-500",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    label: "Interview Tip",
    icon: Trophy
  },
  "best-practice": {
    border: "border-indigo-500/20 border-l-indigo-500",
    bg: "bg-indigo-500/5",
    text: "text-indigo-400",
    label: "Best Practice",
    icon: Lightbulb
  },
  question: {
    border: "border-indigo-500/20 border-l-indigo-500",
    bg: "bg-indigo-500/5",
    text: "text-indigo-400",
    label: "Question",
    icon: HelpCircle
  },
  answer: {
    border: "border-emerald-500/20 border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    label: "Suggested Answer",
    icon: CheckCircle2
  },
  "common-mistakes": {
    border: "border-rose-500/20 border-l-rose-500",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    label: "Common Mistakes",
    icon: XCircle
  },
  "follow-up-questions": {
    border: "border-amber-500/20 border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    label: "Follow-up Questions",
    icon: MessageSquare
  }
};

const Callout = ({ variant = "info", title, children }) => {
  const v = variant.toLowerCase();
  const cfg = CALLOUT_CONFIGS[v] || CALLOUT_CONFIGS.info;
  const Icon = cfg.icon;

  return (
    <div className={`my-6 rounded-r-xl border border-l-4 p-4 text-left flex gap-3.5 transition-all duration-300 ${cfg.border} ${cfg.bg}`}>
      <div className={`p-1.5 rounded-lg bg-white/4 shrink-0 h-fit ${cfg.text}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>
          {title || cfg.label}
        </div>
        <div className="text-[13.5px] leading-relaxed text-gray-300 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Callout;
