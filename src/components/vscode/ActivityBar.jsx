import React from "react";
import { Folder, Search, GitBranch, Blocks, User, Settings } from "lucide-react";

const ActivityBar = ({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  onSettingsClick,
  onProfileClick,
  currentTheme
}) => {
  const items = [
    { id: "explorer", icon: Folder, label: "Explorer" },
    { id: "search", icon: Search, label: "Search Panel" },
    { id: "git", icon: GitBranch, label: "Source Control (Git)", badge: 2 },
    { id: "extensions", icon: Blocks, label: "Extensions Marketplace" }
  ];

  const handleIconClick = (id) => {
    if (activeView === id) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setActiveView(id);
      setSidebarOpen(true);
    }
  };

  return (
    <div className={`w-12 flex flex-col items-center justify-between py-4 border-r border-white/5 shrink-0 bg-black/40 select-none`}>
      {/* Top Icons */}
      <div className="flex flex-col gap-5 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = sidebarOpen && activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleIconClick(item.id)}
              className={`relative w-full py-1.5 flex items-center justify-center transition-colors focus:outline-none group`}
              title={item.label}
            >
              {/* Left active line indicator */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all
                  ${isActive ? `bg-[${currentTheme.accentHex}]` : "bg-transparent group-hover:bg-white/20"}`}
                style={{ backgroundColor: isActive ? currentTheme.accentHex : undefined }}
              />
              
              <Icon 
                className={`w-5 h-5 transition-colors
                  ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                style={{ color: isActive ? "#ffffff" : undefined }}
              />

              {item.badge && (
                <span className="absolute bottom-1 right-1.5 bg-indigo-600 text-white font-sans font-bold text-[8px] px-1 rounded-full scale-90">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-4 w-full items-center">
        <button 
          onClick={onProfileClick}
          className={`w-full py-1.5 flex items-center justify-center transition-colors focus:outline-none group relative`}
          title="About Me (ABOUT_ME.md)"
        >
          <div 
            className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all
              ${sidebarOpen && activeView === "profile" ? `bg-[${currentTheme.accentHex}]` : "bg-transparent group-hover:bg-white/20"}`}
            style={{ backgroundColor: (sidebarOpen && activeView === "profile") ? currentTheme.accentHex : undefined }}
          />
          <User 
            className={`w-5 h-5 transition-colors
              ${sidebarOpen && activeView === "profile" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            style={{ color: (sidebarOpen && activeView === "profile") ? "#ffffff" : undefined }}
          />
        </button>
        <button 
          onClick={onSettingsClick}
          className={`w-full py-1.5 flex items-center justify-center transition-colors focus:outline-none group`}
          title="Settings (settings.json)"
        >
          <Settings className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
