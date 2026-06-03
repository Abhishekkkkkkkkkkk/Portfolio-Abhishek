import React from "react";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = ({
  activeTabId,
  blog,
  getFileExtension
}) => {
  let breadcrumbItems = [];

  if (activeTabId === "readme") {
    breadcrumbItems = [
      { name: "workspace", type: "folder" },
      { name: "README.md", type: "file", icon: "📝" }
    ];
  } else if (activeTabId === "settings") {
    breadcrumbItems = [
      { name: "workspace", type: "folder" },
      { name: "config", type: "folder" },
      { name: "settings.json", type: "file", icon: "⚙️" }
    ];
  } else if (blog) {
    const primaryCat = blog.categories?.[0] || "Java";
    const folderSlug = primaryCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const itemExt = getFileExtension(primaryCat);
    const filename = `${(blog.slug || blog.id || "").replace(/-/g, "_")}.${itemExt.val}`;

    breadcrumbItems = [
      { name: "workspace", type: "folder" },
      { name: folderSlug, type: "folder" },
      { name: filename, type: "file", icon: itemExt.icon }
    ];
  } else {
    breadcrumbItems = [
      { name: "workspace", type: "folder" },
      { name: activeTabId || "file.md", type: "file", icon: "📝" }
    ];
  }

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-black/10 text-[10px] font-mono text-gray-500 border-b border-white/5 select-none shrink-0 overflow-x-auto scrollbar-none">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />}
          <div className="flex items-center gap-1 shrink-0 hover:text-gray-300 cursor-pointer">
            {item.icon && <span className="text-[10px]">{item.icon}</span>}
            <span>{item.name}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
