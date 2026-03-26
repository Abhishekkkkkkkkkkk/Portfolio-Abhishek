import React from 'react';

const TechStackIcon = ({ TechStackIcon, Language }) => {
  return (
    <div className="group w-[100px] h-[100px] rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-2 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl shrink-0">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-50 blur transition duration-300" />
        <img
          src={TechStackIcon}
          alt={`${Language} icon`}
          className="relative h-10 w-10 object-contain transform transition-transform duration-300"
        />
      </div>
      <span className="text-slate-300 font-semibold text-[11px] tracking-wide group-hover:text-white transition-colors duration-300 text-center leading-tight px-1 line-clamp-2 w-full">
        {Language}
      </span>
    </div>
  );
};

export default TechStackIcon;