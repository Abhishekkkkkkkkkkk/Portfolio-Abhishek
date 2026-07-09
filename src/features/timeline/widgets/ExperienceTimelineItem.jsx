import React from "react";
import { Briefcase } from "lucide-react";

const ExperienceTimelineItem = ({
  jobTitle,
  company,
  duration,
  timeline,
  location,
  responsibilities = [],
  technologies = [],
  impact,
  isActive = false,
}) => {
  return (
    <div className="relative flex gap-6">
      {/* Timeline Dot + Line */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className="relative flex items-center justify-center mt-1 shrink-0">
          <span
            className={`absolute w-5 h-5 rounded-full blur-sm ${
              isActive ? "bg-green-400/50" : "bg-[#7c3aed]/50"
            }`}
          />
          <span
            className={`w-3 h-3 rounded-full border-2 z-10 ${
              isActive
                ? "bg-green-400 border-green-300"
                : "bg-[#7c3aed] border-[#a78bfa]"
            }`}
          />
        </div>
        {/* Vertical line below dot */}
        <div className="w-px flex-1 mt-2 bg-gradient-to-b from-[#7c3aed]/60 to-transparent min-h-[2rem]" />
      </div>

      {/* Card */}
      <div className="mb-8 flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-5 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h4 className="text-white font-bold text-lg leading-tight">{company}</h4>
            {jobTitle && (
              <p className="text-[#22d3ee] text-sm font-medium mt-0.5">{jobTitle}</p>
            )}
          </div>
          {(duration || timeline) && (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm whitespace-nowrap">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{duration || timeline}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        {isActive && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </span>
        )}

        {/* Location */}
        {location && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a78bfa]">Location:</span> {location}
          </p>
        )}

        {/* Responsibilities */}
        {responsibilities.length > 0 && (
          <ul className="space-y-2 pt-1">
            {responsibilities.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#22d3ee] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Technologies */}
        {technologies.length > 0 && (
          <p className="text-sm text-gray-400 pt-1">
            <span className="text-[#a78bfa]">Tools / Technologies:</span>{" "}
            {technologies.join(", ")}
          </p>
        )}

        {/* Impact */}
        {impact && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a78bfa]">Impact:</span> {impact}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExperienceTimelineItem;