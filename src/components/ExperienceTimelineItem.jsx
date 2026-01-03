import React from "react";

const ExperienceTimelineItem = ({
  jobTitle,
  company,
  duration,
  timeline,
  location,
  responsibilities = [],
  technologies = [],
  impact,
}) => {
  return (
    <div className="relative pl-2 pb-12">
      {/* Timeline Dot */}
      <div className="absolute -left-[27px] top-2 flex items-center justify-center">
        <span className="absolute w-6 h-6 rounded-full bg-yellow-400/30 blur-md" />
        <span className="absolute w-4 h-4 rounded-full border border-white bg-white" />
        <span className="w-2 h-2 rounded-full bg-[#6366f1] z-10" />
      </div>

      <div className="space-y-2">
        {jobTitle && (
          <h4 className="text-white font-semibold">
            {jobTitle}
          </h4>
        )}

        {company && (
          <p className="text-gray-300 text-sm">
            {company}
          </p>
        )}

        {duration && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a855f7]">Duration:</span> {duration}
          </p>
        )}
{/* 
        {timeline && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a855f7]">Timeline:</span> {timeline}
          </p>
        )} */}

        {location && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a855f7]">Location:</span> {location}
          </p>
        )}

        {responsibilities.length > 0 && (
          <div className="pt-2">
            <p className="text-[#a855f7] text-sm font-medium">
              Work Done / Responsibilities:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              {responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {technologies.length > 0 && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a855f7]">Tools / Technologies:</span>{" "}
            {technologies.join(", ")}
          </p>
        )}

        {impact && (
          <p className="text-sm text-gray-400">
            <span className="text-[#a855f7]">Impact:</span> {impact}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExperienceTimelineItem;
