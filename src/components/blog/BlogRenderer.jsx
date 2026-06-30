import React, { useEffect, useRef } from "react";

// ======================== CSS SCOPING HELPERS FOR HTML BLOGS ========================
const scopeCss = (cssText, prefix) => {
  // Replace body selector with prefix
  let scoped = cssText.replace(/\bbody\b/g, prefix);
  
  // Scope each selector inside CSS blocks
  scoped = scoped.split('}').map(rule => {
    const parts = rule.split('{');
    if (parts.length === 2) {
      let selectors = parts[0];
      const body = parts[1];
      
      selectors = selectors.split(',').map(sel => {
        sel = sel.trim();
        if (!sel) return '';
        if (sel === ':root') return prefix;
        if (sel.startsWith(':root')) return sel.replace(':root', prefix);
        if (sel.startsWith(prefix) || sel.startsWith('@')) return sel;
        return `${prefix} ${sel}`;
      }).join(', ');
      
      return `${selectors} {${body}`;
    }
    return rule;
  }).join('}');
  
  return scoped;
};

const scopeHtmlStyles = (htmlContent, prefix) => {
  if (typeof htmlContent !== 'string') return htmlContent;
  const styleRegex = /<style([\s\S]*?)>([\s\S]*?)<\/style>/gi;
  return htmlContent.replace(styleRegex, (match, attrs, cssText) => {
    const scopedCss = scopeCss(cssText, prefix);
    return `<style${attrs}>${scopedCss}</style>`;
  });
};

const BlogRenderer = ({ content, lineNumbers, isHtml }) => {
  const containerRef = useRef(null);
  const [theme, setTheme] = React.useState(() => localStorage.getItem("global-theme") || "dark");

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail);
    };
    window.addEventListener("global-theme-changed", handleThemeChange);
    return () => window.removeEventListener("global-theme-changed", handleThemeChange);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      // Find all script tags in the loaded HTML
      const scripts = containerRef.current.querySelectorAll("script");
      scripts.forEach(script => {
        const newScript = document.createElement("script");
        // Copy all attributes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        // Copy inner code content.
        // Replace let/const with var to prevent redeclaration SyntaxErrors in SPA navigation,
        // while keeping declarations in the global scope so inline onclick handlers can access them.
        if (script.textContent.trim()) {
          newScript.textContent = script.textContent
            .replace(/\blet\s+/g, "var ")
            .replace(/\bconst\s+/g, "var ");
        }
        // Append to DOM to trigger execution
        document.body.appendChild(newScript);
        // Remove it immediately to keep DOM clean (scripts will have run already)
        document.body.removeChild(newScript);
      });

      // Since window.onload won't fire during React client-side transitions,
      // execute any onload handler registered by the script immediately.
      if (typeof window.onload === "function") {
        try {
          window.onload();
        } catch (err) {
          console.error("Error executing window.onload from blog script:", err);
        }
      }
    }

    return () => {
      if (typeof window.onload === "function") {
        window.onload = null;
      }
    };
  }, [content]);

  const scopedContent = scopeHtmlStyles(content || '', '.blog-prose');

  return (
    <div 
      ref={containerRef}
      className={`blog-prose select-text text-left prose ${theme === "light" ? "prose-slate" : "prose-invert"} max-w-none ${theme === "light" ? "text-slate-800" : "text-gray-300"}`}
    >
      <style>{`
        .blog-prose .toc-container,
        .blog-prose .toc,
        .blog-prose #toc,
        .blog-prose .table-of-contents,
        .blog-prose [class*="toc-"] {
          display: none !important;
        }

        /* Premium theme overrides for opened blogs */
        .blog-prose {
          --bg: #030014 !important;
          --surface: #0a0720 !important;
          --surface-2: #110d33 !important;
          --border: rgba(99, 102, 241, 0.25) !important;
          --accent: #6366f1 !important;
          --accent-soft: rgba(99, 102, 241, 0.15) !important;
          --text: #cbd5e1 !important;
          --text-muted: #94a3b8 !important;
          --code-bg: #050410 !important;
          --green: #10b981 !important;
          --green-soft: rgba(16, 185, 129, 0.12) !important;
          --blue: #3b82f6 !important;
          --blue-soft: rgba(59, 130, 246, 0.12) !important;
          --red: #ef4444 !important;
          --red-soft: rgba(239, 68, 68, 0.12) !important;

          color: #cbd5e1 !important;
          line-height: 1.8 !important;
          font-size: 1.05rem !important;
        }
        .blog-prose h1, .blog-prose h2, .blog-prose h3, .blog-prose h4 {
          color: #ffffff !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
        }
        .blog-prose h2 {
          border-bottom: 1px solid rgba(99, 102, 241, 0.15) !important;
          padding-bottom: 0.5rem !important;
          margin-top: 3rem !important;
        }
        .blog-prose p {
          margin-bottom: 1.5rem !important;
        }

        /* Glowing card visualizer container */
        .blog-prose .vis-dashboard {
          background: linear-gradient(135deg, rgba(13, 8, 41, 0.7) 0%, rgba(20, 16, 55, 0.4) 100%) !important;
          border: 1px solid rgba(99, 102, 241, 0.25) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 16px !important;
          padding: 1.75rem !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }
        .blog-prose .vis-controls-panel {
          background: rgba(9, 6, 28, 0.6) !important;
          border: 1px solid rgba(99, 102, 241, 0.15) !important;
          border-radius: 12px !important;
        }

        /* SVG Nodes styling fix */
        .blog-prose svg rect {
          rx: 8px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .blog-prose svg rect[fill="var(--surface-2)"] {
          fill: rgba(30, 30, 58, 0.9) !important;
          stroke: rgba(99, 102, 241, 0.5) !important;
          stroke-width: 1.5px !important;
        }
        .blog-prose svg g:hover rect {
          transform: translateY(-1px) !important;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4)) !important;
        }
        .blog-prose svg text {
          fill: #f1f5f9 !important;
        }

        /* Code highlight formatting */
        .blog-prose pre {
          background: #080718 !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          padding: 1.25rem !important;
          margin: 1.75rem 0 !important;
        }
        .blog-prose code {
          background: rgba(99, 102, 241, 0.1) !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          color: #a5b4fc !important;
          border-radius: 6px !important;
          padding: 0.15rem 0.35rem !important;
          font-size: 0.9em !important;
        }
        .blog-prose pre code {
          background: none !important;
          border: none !important;
          color: #e2e8f0 !important;
          padding: 0 !important;
          font-size: 0.95em !important;
        }
        /* Premium Light Theme overrides for opened blogs */
        body.light .blog-prose {
          --bg: #f6f5ff !important;
          --surface: #ffffff !important;
          --surface-2: #f0effc !important;
          --border: rgba(99, 102, 241, 0.15) !important;
          --accent: #4f46e5 !important;
          --accent-soft: rgba(79, 70, 229, 0.1) !important;
          --text: #312e81 !important;
          --text-muted: #6b7280 !important;
          --code-bg: #f3f4f6 !important;
          --green: #059669 !important;
          --green-soft: rgba(5, 150, 105, 0.08) !important;
          --blue: #2563eb !important;
          --blue-soft: rgba(37, 99, 235, 0.08) !important;
          --red: #dc2626 !important;
          --red-soft: rgba(220, 38, 38, 0.08) !important;

          color: #312e81 !important;
        }

        body.light .blog-prose h1,
        body.light .blog-prose h2,
        body.light .blog-prose h3,
        body.light .blog-prose h4 {
          color: #1e1b4b !important;
        }

        body.light .blog-prose h2 {
          border-bottom: 1px solid rgba(99, 102, 241, 0.15) !important;
        }

        /* Light visualizer card styling */
        body.light .blog-prose .vis-dashboard {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 239, 252, 0.7) 100%) !important;
          border: 1px solid rgba(99, 102, 241, 0.15) !important;
          box-shadow: 0 15px 35px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
        }
        body.light .blog-prose .vis-controls-panel {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(99, 102, 241, 0.12) !important;
        }

        /* Light visualizer SVG nodes */
        body.light .blog-prose svg rect[fill="var(--surface-2)"] {
          fill: #f5f4fe !important;
          stroke: rgba(99, 102, 241, 0.25) !important;
        }
        body.light .blog-prose svg text {
          fill: #1e1b4b !important;
        }
        body.light .blog-prose svg rect[fill="var(--accent-soft)"] {
          fill: rgba(79, 70, 229, 0.1) !important;
          stroke: #4f46e5 !important;
        }
        body.light .blog-prose svg rect[fill="var(--green-soft)"] {
          fill: rgba(5, 150, 105, 0.1) !important;
          stroke: #059669 !important;
        }

        /* Light Code Highlight block formatting */
        body.light .blog-prose pre {
          background: #fafafa !important;
          border: 1px solid rgba(99, 102, 241, 0.15) !important;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.04) !important;
        }
        body.light .blog-prose pre code {
          color: #232329 !important;
        }
        body.light .blog-prose code {
          background: rgba(99, 102, 241, 0.06) !important;
          border: 1px solid rgba(99, 102, 241, 0.12) !important;
          color: #4f46e5 !important;
        }
        /* Light theme overrides for dry run steps */
        body.light .blog-prose .step {
          background: #ffffff !important;
          border: 1.5px solid rgba(99, 102, 241, 0.15) !important;
          color: #312e81 !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.03) !important;
        }
        body.light .blog-prose .step h4 {
          color: #1e1b4b !important;
        }
        body.light .blog-prose .step-num {
          background: rgba(99, 102, 241, 0.08) !important;
          color: #4f46e5 !important;
          border: 1px solid rgba(99, 102, 241, 0.18) !important;
        }

        /* Light theme overrides for dry run table & arrays */
        body.light .blog-prose table {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose th {
          background: rgba(99, 102, 241, 0.04) !important;
          color: #1e1b4b !important;
          border-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose td {
          color: #334155 !important;
          border-color: rgba(99, 102, 241, 0.1) !important;
        }
        body.light .blog-prose .array-cell {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.25) !important;
        }
        body.light .blog-prose .array-cell .cell-val {
          color: #1e1b4b !important;
        }
        body.light .blog-prose .array-cell .cell-idx {
          color: #6b7280 !important;
        }

        /* Light theme overrides for DOs and DON'Ts list */
        body.light .blog-prose .dd-good {
          background: rgba(16, 185, 129, 0.03) !important;
          border-color: rgba(16, 185, 129, 0.25) !important;
          color: #065f46 !important;
        }
        body.light .blog-prose .dd-bad {
          background: rgba(239, 68, 68, 0.03) !important;
          border-color: rgba(239, 68, 68, 0.25) !important;
          color: #991b1b !important;
        }
        body.light .blog-prose .dd-list li {
          color: #374151 !important;
        }

        /* Light theme overrides for visualizer logs & stacks */
        body.light .blog-prose .vis-desc-box {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.12) !important;
          color: #334155 !important;
        }
        body.light .blog-prose .vis-stack-title {
          color: #4f46e5 !important;
          border-bottom-color: rgba(99, 102, 241, 0.12) !important;
        }
        body.light .blog-prose .vis-stack-item {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.12) !important;
          color: #1e1b4b !important;
        }
        body.light .blog-prose .vis-stack-item.active-item {
          background: rgba(79, 70, 229, 0.08) !important;
          border-left-color: #4f46e5 !important;
        }

        /* Light theme overrides for bottom FAQ & Summary */
        body.light .blog-prose .summary {
          background: rgba(99, 102, 241, 0.04) !important;
          border: 1.5px solid rgba(99, 102, 241, 0.15) !important;
          color: #312e81 !important;
        }
        body.light .blog-prose .summary h3 {
          color: #1e1b4b !important;
        }
        body.light .blog-prose .faq-item {
          background: #ffffff !important;
          border: 1px solid rgba(99, 102, 241, 0.12) !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.02) !important;
        }
        body.light .blog-prose .faq-question {
          color: #1e1b4b !important;
          border-bottom-color: rgba(99, 102, 241, 0.08) !important;
        }
        body.light .blog-prose .faq-answer {
          color: #475569 !important;
        }
        body.light .blog-prose strong {
          color: #1e1b4b !important;
        }
        body.light .blog-prose li {
          color: #334155 !important;
        }

        /* LIGHT THEME INJECTED VISIBILITY FIXES */
        body.light .blog-prose .vis-canvas-container,
        body.light .blog-prose .tree-container {
          background: #ffffff !important;
          border: 1px solid rgba(99, 102, 241, 0.15) !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.02) !important;
        }
        body.light .blog-prose svg line[stroke="var(--border)"] {
          stroke: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose svg line[stroke="var(--accent)"] {
          stroke: #4f46e5 !important;
        }

        /* Fix visualizer text labels in tree */
        body.light .blog-prose svg g text,
        body.light .blog-prose svg text {
          fill: #1e1b4b !important;
        }

        /* Fix callout box contrast in light mode */
        body.light .blog-prose .callout {
          background: #ffffff !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04) !important;
        }
        body.light .blog-prose .callout-info {
          background: rgba(37, 99, 235, 0.04) !important;
          border-left-color: #2563eb !important;
          color: #1e3a8a !important;
        }
        body.light .blog-prose .callout-tip {
          background: rgba(5, 150, 105, 0.04) !important;
          border-left-color: #059669 !important;
          color: #064e3b !important;
        }
        body.light .blog-prose .callout-warn {
          background: rgba(220, 38, 38, 0.04) !important;
          border-left-color: #dc2626 !important;
          color: #7f1d1d !important;
        }

        /* Fix inputs and select controls inside visualizer */
        body.light .blog-prose .vis-select,
        body.light .blog-prose input[type="text"] {
          background: #ffffff !important;
          border: 1px solid rgba(99, 102, 241, 0.25) !important;
          color: #1e1b4b !important;
        }
        body.light .blog-prose .vis-btn {
          background: #f5f4fe !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          color: #4f46e5 !important;
        }
        body.light .blog-prose .vis-btn-primary {
          background: #4f46e5 !important;
          border-color: #4f46e5 !important;
          color: #ffffff !important;
        }

        /* Fix Code block switcher tab buttons */
        body.light .blog-prose .code-tabs {
          background: #fafafa !important;
          border-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose .tab-headers {
          background: #f3f2fc !important;
          border-bottom-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose .tab-btn {
          color: #4b5563 !important;
        }
        body.light .blog-prose .tab-btn:hover {
          color: #1e1b4b !important;
          background: rgba(99, 102, 241, 0.04) !important;
        }
        body.light .blog-prose .tab-btn.active {
          color: #4f46e5 !important;
          background: #fafafa !important;
          border-color: rgba(99, 102, 241, 0.15) !important;
        }

        /* Fix code mockup headers */
        body.light .blog-prose .ide-header {
          background: #f3f2fc !important;
          border-bottom-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose .ide-filename {
          color: #4b5563 !important;
        }
        body.light .blog-prose .ide-copy-btn {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.15) !important;
          color: #4b5563 !important;
        }
        body.light .blog-prose .ide-copy-btn:hover {
          background: #f3f2fc !important;
          color: #4f46e5 !important;
          border-color: #4f46e5 !important;
        }

        /* Inline code markers */
        body.light .blog-prose code {
          background: rgba(99, 102, 241, 0.05) !important;
          border: 1px solid rgba(99, 102, 241, 0.15) !important;
          color: #4f46e5 !important;
        }

        /* Palindrome visualizer dashboard overrides in light mode */
        body.light .blog-prose .visualizer-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 239, 252, 0.8) 100%) !important;
          border: 1px solid rgba(99, 102, 241, 0.18) !important;
          box-shadow: 0 15px 35px rgba(99, 102, 241, 0.08) !important;
          color: #1e1b4b !important;
        }
        body.light .blog-prose .visualizer-title {
          color: #1e1b4b !important;
        }
        body.light .blog-prose .visualizer-status {
          background: rgba(79, 70, 229, 0.08) !important;
          color: #4f46e5 !important;
          border: 1px solid rgba(99, 102, 241, 0.18) !important;
        }
        body.light .blog-prose .visualizer-config {
          color: #334155 !important;
        }
        body.light .blog-prose .visualizer-config span {
          color: #334155 !important;
        }

        /* Input field visualizer */
        body.light .blog-prose .input-vis {
          background: #ffffff !important;
          border: 1px solid rgba(99, 102, 241, 0.25) !important;
          color: #1e1b4b !important;
        }

        /* Buttons in Palindrome visualizer */
        body.light .blog-prose .btn-vis {
          background: #ffffff !important;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          color: #4f46e5 !important;
        }
        body.light .blog-prose .btn-vis:hover {
          background: #e0e7ff !important;
          border-color: #4f46e5 !important;
        }
        body.light .blog-prose .btn-primary-vis {
          background: #4f46e5 !important;
          border-color: #4f46e5 !important;
          color: #ffffff !important;
        }
        body.light .blog-prose .btn-primary-vis:hover {
          background: #4338ca !important;
          color: #ffffff !important;
        }
        body.light .blog-prose #vis-btn-reset {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
          color: #4f46e5 !important;
        }
        body.light .blog-prose #vis-btn-reset:hover {
          background: #e0e7ff !important;
          color: #4f46e5 !important;
        }
        body.light .blog-prose #vis-word-input + .btn-vis {
          background: #f5f4fe !important;
          color: #4f46e5 !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
        }
        body.light .blog-prose #vis-word-input + .btn-vis:hover {
          background: #e0e7ff !important;
        }

        /* HTML Recursion Call Tree styling overrides in light mode */
        body.light .blog-prose .node-box {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.2) !important;
          color: #334155 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
        }
        body.light .blog-prose .node-title {
          color: #1e1b4b !important;
        }
        body.light .blog-prose .node-action {
          color: #4f46e5 !important;
        }
        body.light .blog-prose .node-state {
          color: #6b7280 !important;
          border-top-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose .node-connector {
          background: rgba(99, 102, 241, 0.25) !important;
        }
        body.light .blog-prose .node-connector::after {
          border-top-color: rgba(99, 102, 241, 0.25) !important;
        }

        /* Hero main title and descriptions fix in light mode */
        body.light .blog-prose .hero {
          border-bottom-color: rgba(99, 102, 241, 0.15) !important;
        }
        body.light .blog-prose .hero h1 {
          background: linear-gradient(135deg, #1e1b4b 20%, #4f46e5 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
        body.light .blog-prose .hero-desc {
          color: #4b5563 !important;
        }
        body.light .blog-prose .hero-chip {
          background: rgba(99, 102, 241, 0.08) !important;
          border-color: rgba(99, 102, 241, 0.25) !important;
          color: #4f46e5 !important;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: scopedContent }} />
    </div>
  );
};

export default BlogRenderer;
