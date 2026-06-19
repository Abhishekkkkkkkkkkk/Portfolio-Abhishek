import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { X } from "lucide-react";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";
import ComplexityTable from "./ComplexityTable";
import TraceBlock from "./TraceBlock";

// ======================== ZOOMABLE IMAGE ========================
const ZoomableImage = ({ src, alt, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-8 flex flex-col items-center select-none">
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-zoom-in overflow-hidden rounded-2xl border border-white/8 bg-[#070715] shadow-lg max-w-full transition-all duration-300 hover:border-[#6366f1]/40"
      >
        <img 
          src={src} 
          alt={alt} 
          loading="lazy" 
          className="max-h-[450px] object-contain transition-transform duration-500 group-hover:scale-[1.01]" 
        />
        <div className="absolute inset-0 bg-[#6366f1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      {(alt || title) && (
        <span className="mt-3 text-center text-xs font-mono text-gray-500 italic max-w-lg leading-normal">
          {alt || title}
        </span>
      )}

      {/* Zoom Modal Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-4 bg-[#030014]/90 backdrop-blur-md cursor-zoom-out animate-fade-in"
        >
          <div className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </div>
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-zoom-in" 
          />
          {(alt || title) && (
            <span className="mt-4 text-sm font-mono text-gray-300 text-center max-w-2xl select-text">
              {alt || title}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ======================== MERMAID DIAGRAM RENDERER ========================
const MermaidRenderer = ({ chart }) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const renderChart = async () => {
      try {
        if (!window.mermaid) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
            script.async = true;
            script.onload = () => {
              window.mermaid.initialize({
                startOnLoad: false,
                theme: "dark",
                securityLevel: "loose",
                themeVariables: {
                  background: "#070715",
                  primaryColor: "#6366f1",
                  secondaryColor: "#a855f7",
                  tertiaryColor: "#1e1b4b",
                  lineColor: "#475569"
                }
              });
              resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        if (!active) return;

        const id = `mermaid-${Math.floor(Math.random() * 1000000)}`;
        const { svg: renderedSvg } = await window.mermaid.render(id, chart);
        
        if (active) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch (err) {
        console.error("Mermaid parsing error:", err);
        if (active) {
          setError(true);
        }
      }
    };

    renderChart();
    return () => {
      active = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono">
        Failed to render Mermaid diagram. Double check your diagram syntax:
        <pre className="mt-2 p-2 rounded bg-black/40 overflow-x-auto text-[11px]">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="py-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Generating diagram layout...
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-center bg-[#070715]/40 border border-white/6 p-6 rounded-2xl overflow-x-auto my-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

// Helper to inspect blockquote elements and detect GitHub-style alerts: > [!TIP]
const renderBlockquote = (props) => {
  const children = props.children;
  
  // Find first text nodes inside paragraphs
  let alertType = null;
  let cleanChildren = children;

  // ReactMarkdown wraps blockquote content in <p> elements
  const firstChild = React.Children.toArray(children)[0];
  if (firstChild && firstChild.type === "p") {
    const firstGrandchild = React.Children.toArray(firstChild.props.children)[0];
    if (typeof firstGrandchild === "string") {
      const match = /^\[!(TIP|WARNING|DANGER|IMPORTANT|INFO|INTERVIEW|BEST-PRACTICE|QUESTION|ANSWER|COMMON-MISTAKES|FOLLOW-UP-QUESTIONS|NOTE)\]/i.exec(firstGrandchild.trim());
      if (match) {
        alertType = match[1].toLowerCase();
        
        // Remove the prefix from the first grandchild text
        const remainderText = firstGrandchild.replace(/^\[!(TIP|WARNING|DANGER|IMPORTANT|INFO|INTERVIEW|BEST-PRACTICE|QUESTION|ANSWER|COMMON-MISTAKES|FOLLOW-UP-QUESTIONS|NOTE)\]\s*/i, "");
        
        // Construct clean grandchildren
        const otherGrandchildren = React.Children.toArray(firstChild.props.children).slice(1);
        const cleanGrandchildren = remainderText ? [remainderText, ...otherGrandchildren] : otherGrandchildren;
        
        // Recreate the first paragraph without the alert tag
        const cleanParagraph = React.cloneElement(firstChild, firstChild.props, cleanGrandchildren);
        
        // Replace the first child with this clean paragraph
        cleanChildren = [cleanParagraph, ...React.Children.toArray(children).slice(1)];
      }
    }
  }

  if (alertType) {
    return <Callout variant={alertType}>{cleanChildren}</Callout>;
  }

  return (
    <blockquote className="border-l-4 border-indigo-500 bg-indigo-500/5 rounded-r-xl p-4 my-6 italic text-gray-400 font-sans">
      {children}
    </blockquote>
  );
};

// Custom Table Renderer to output our custom styling
const renderTable = (props) => {
  // Extract headers and rows from ReactMarkdown components
  // ReactMarkdown will pass table children: [thead, tbody]
  const childrenArray = React.Children.toArray(props.children);
  const thead = childrenArray.find(c => c.type === "thead");
  const tbody = childrenArray.find(c => c.type === "tbody");

  let headers = [];
  if (thead) {
    const tr = React.Children.toArray(thead.props.children)[0];
    if (tr) {
      headers = React.Children.toArray(tr.props.children).map(th => {
        // Extract text content from cell children recursively
        return getReactTextContent(th.props.children);
      });
    }
  }

  let rows = [];
  if (tbody) {
    const trs = React.Children.toArray(tbody.props.children);
    rows = trs.map(tr => {
      return React.Children.toArray(tr.props.children).map(td => {
        return getReactTextContent(td.props.children);
      });
    });
  }

  return <ComplexityTable headers={headers} rows={rows} />;
};

// Utility to extract raw text content from nested React children
const getReactTextContent = (children) => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getReactTextContent).join("");
  }
  if (children && children.props && children.props.children) {
    return getReactTextContent(children.props.children);
  }
  return "";
};

const renderCode = ({ inline, className, children, showLineNumbers, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const codeText = String(children).replace(/\n$/, "");

  // If it's a code block (not inline)
  if (!inline && match) {
    const language = match[1];

    if (language === "mermaid") {
      return <MermaidRenderer chart={codeText} />;
    }

    // If language is 'trace', render TraceBlock instead of CodeBlock
    if (language === "trace") {
      const lines = codeText.split("\n").filter(l => l.trim() !== "");
      if (lines.length > 0) {
        const headers = lines[0].split("|").map(s => s.trim()).filter(Boolean);
        const rows = lines.slice(1).map(line => {
          return line.split("|").map(s => s.trim()).filter(s => s !== "");
        }).filter(row => row.length > 0);
        return <TraceBlock title={props.filename || "Execution Trace"} headers={headers} rows={rows} />;
      }
    }

    return (
      <CodeBlock
        code={codeText}
        language={language}
        filename={props.filename || props.metastring}
        showLineNumbers={showLineNumbers}
      />
    );
  }

  // Otherwise, render normal inline code badge
  return (
    <code className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#a855f7] select-text break-words">
      {children}
    </code>
  );
};

const MarkdownRenderer = ({ content, lineNumbers }) => {
  // If the content starts with HTML and has no markdown-like markers, or is flagged,
  // we can use standard dangerous rendering as fallback for backward compatibility
  const isHtmlOnly = typeof content === "string" && content.trim().startsWith("<div") && content.includes("class=");

  if (isHtmlOnly) {
    return (
      <div 
        className="blog-prose select-text text-left" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  return (
    <div className="blog-prose select-text text-left prose prose-invert max-w-none text-gray-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: (codeProps) => renderCode({ ...codeProps, showLineNumbers: lineNumbers !== "off" }),
          blockquote: renderBlockquote,
          table: renderTable,
          img: ({ src, alt, title }) => <ZoomableImage src={src} alt={alt} title={title} />,
          h1: ({ children }) => <h1 className="text-3xl font-black text-white mt-10 mb-4 font-mono leading-tight">{children}</h1>,
          h2: ({ children }) => {
            // Generate clean anchor id
            const textContent = getReactTextContent(children);
            const id = textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <h2 id={id} className="text-2xl font-extrabold text-white mt-8 mb-4 border-b border-white/10 pb-2 scroll-mt-20 flex items-center gap-2">
                <span className="text-[#a855f7]">#</span> {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const textContent = getReactTextContent(children);
            const id = textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <h3 id={id} className="text-lg font-bold text-gray-200 mt-6 mb-3 scroll-mt-20 flex items-center gap-1.5">
                <span className="text-[#a855f7]/60">##</span> {children}
              </h3>
            );
          },
          h4: ({ children }) => <h4 className="text-base font-semibold text-gray-300 mt-5 mb-2">{children}</h4>,
          p: ({ children }) => <p className="text-[15px] leading-relaxed mb-4 text-gray-300 font-sans">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="text-[14.5px] leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#22d3ee] font-semibold hover:underline border-b border-dashed border-[#22d3ee]/40 pb-0.5 transition-all duration-200"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
