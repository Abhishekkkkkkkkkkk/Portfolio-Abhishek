import React from "react";
import EducationTimelineItem from "./EducationTimelineItem";
import ExperienceTimelineItem from "./ExperienceTimelineItem";

const Timeline = ({ title, icon: Icon, data, type }) => {
  return (
    <div className="relative w-full pl-12">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 h-full w-px border-l-2 border-gray-400" />

      {/* Header */}
      <div className="flex items-center gap-0 mb-12">
        <div className="absolute left-1 top-0 w-10 h-10 rounded-xl bg-[#1f2933] border border-gray-700 flex items-center justify-center">
          <Icon size={25} className="text-[#a855f7]" />
        </div>
        <div className="w-12" />
        <h3 className="text-xl font-semibold text-[#6366f1] mr-10">
          {title}
        </h3>
      </div>

      {data.map((item, index) =>
        type === "education" ? (
          <EducationTimelineItem key={index} {...item} />
        ) : (
          <ExperienceTimelineItem key={index} {...item} />
        )
      )}
    </div>
  );
};

export default Timeline;
