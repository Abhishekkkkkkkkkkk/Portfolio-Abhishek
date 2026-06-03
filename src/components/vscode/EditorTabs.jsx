import React from "react";
import { X } from "lucide-react";

const EditorTabs = ({
  openTabs,
  activeTabId,
  allBlogs,
  onTabSelect,
  onTabClose,
  getFileExtension,
  currentTheme
}) => {
  return (
    <div className={`flex overflow-x-auto scrollbar-none shrink-0 font-mono text-[11px] select-none ${currentTheme.bgHeader} border-b border-white/5`}>
      {openTabs.map((tabId) => {
        const isActive = tabId === activeTabId;
        
        let tabIcon = "📝";
        let tabName = "";
        
        if (tabId === "readme") {
          tabIcon = "📝";
          tabName = "README.md";
        } else if (tabId === "settings") {
          tabIcon = "⚙️";
          tabName = "settings.json";
        } else {
          const blogItem = allBlogs.find(b => b.id === tabId || b.slug === tabId);
          const tabExt = getFileExtension(blogItem?.categories?.[0] || "Java");
          tabIcon = tabExt.icon;
          tabName = blogItem 
            ? `${(blogItem.slug || blogItem.id || "").replace(/-/g, "_")}.${tabExt.val}` 
            : `${(tabId || "").replace(/-/g, "_")}.md`;
        }

        return (
          <div
            key={tabId}
            onClick={() => onTabSelect(tabId)}
            className={`flex items-center gap-2 px-4 py-2 border-r border-white/5 shrink-0 cursor-pointer transition-all relative group
              ${isActive
                ? `font-bold border-t-2 ${currentTheme.tabActive} ${currentTheme.borderAccent}`
                : `${currentTheme.tabInactive} opacity-60 hover:opacity-100 hover:text-white`
              }`}
          >
            <span className={isActive ? currentTheme.textAccent : "opacity-80"}>
              {tabIcon}
            </span>
            <span className="font-mono">{tabName}</span>
            
            {/* Close button (always visible for settings/blogs when active, or on hover) */}
            {tabId !== "readme" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tabId);
                }}
                className={`ml-1 text-gray-500 hover:text-white transition-colors duration-150 rounded px-0.5 hover:bg-white/10
                  ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EditorTabs;
