import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

const QuickOpen = ({
  isOpen,
  onClose,
  allBlogs,
  onFileSelect,
  getFileExtension
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Combine blogs with hardcoded files (README and settings.json)
  const items = [
    { id: "readme", title: "README.md", category: "Workspace", icon: "📝", subtitle: "workspace" },
    { id: "settings", title: "settings.json", category: "Config", icon: "⚙️", subtitle: "workspace/config" },
    ...allBlogs.map(b => {
      const ext = getFileExtension(b.categories?.[0] || "Java");
      const filename = `${(b.slug || b.id || "").replace(/-/g, "_")}.${ext.val}`;
      const folderSlug = (b.categories?.[0] || "java").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return {
        id: b.slug || b.id,
        title: filename,
        category: b.categories?.[0] || "Java",
        icon: ext.icon,
        subtitle: `workspace/${folderSlug}`,
        rawTitle: b.title
      };
    })
  ];

  // Filter items based on query
  const filteredItems = items.filter(item => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.rawTitle && item.rawTitle.toLowerCase().includes(q))
    );
  });

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onFileSelect(filteredItems[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10%] bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        ref={modalRef}
        className="w-[calc(100%-24px)] mx-3 max-w-lg rounded-lg border border-white/10 bg-[#0d0d16] shadow-2xl overflow-hidden font-mono text-xs text-gray-300"
      >
        {/* Search header input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-white/5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search files by name..."
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white placeholder-gray-600 font-mono py-0.5"
          />
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onFileSelect(item.id);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors
                    ${isSelected 
                      ? "bg-indigo-500/20 text-white border-l-2 border-indigo-500 font-bold" 
                      : "hover:bg-white/5 text-gray-400"}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className={`truncate ${isSelected ? "text-white" : "text-gray-300"}`}>{item.title}</div>
                      {item.rawTitle && (
                        <div className="text-[10px] text-gray-600 truncate">{item.rawTitle}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-600 shrink-0 font-bold uppercase tracking-wider ml-4">
                    {item.subtitle}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-gray-600 italic">
              No matching files in workspace.
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3 py-1.5 bg-[#09090e] border-t border-white/5 text-[9px] text-gray-600 flex items-center justify-between">
          <span>Arrows: navigate • Enter: open • Esc: close</span>
          <span>Files count: {filteredItems.length}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickOpen;
