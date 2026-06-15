import React, { useState, useEffect, useRef } from "react";

const BlogRenderer = ({ htmlContent, currentTheme, fontSize, onHeadingsDiscovered }) => {
  const [iframeHeight, setIframeHeight] = useState("500px");
  const iframeRef = useRef(null);

  // Hook to handle messages from the iframe (e.g. resize request)
  useEffect(() => {
    const handleMessage = (event) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (event.data && event.data.type === "resize-iframe") {
          setIframeHeight(`${event.data.height}px`);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Sync headings discovery when iframe loaded/rendered
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) return;

        // Parse headings from iframe document
        const els = doc.querySelectorAll("h2, h3");
        const items = [];
        els.forEach((el, i) => {
          if (!el.id) el.id = `heading-${i}`;
          items.push({ id: el.id, text: el.textContent, level: el.tagName });
        });
        
        if (onHeadingsDiscovered) {
          onHeadingsDiscovered(items);
        }
      } catch (e) {
        console.error("Failed to read headings from same-origin iframe:", e);
      }
    };

    iframe.addEventListener("load", handleIframeLoad);
    
    // Check if document is already loaded
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (doc && doc.readyState === "complete") {
        handleIframeLoad();
      }
    } catch (e) {}

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [htmlContent, onHeadingsDiscovered]);

  const accentHex = currentTheme?.accentHex || "#bd93f9";

  // Construct source document for iframe
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Sora:wght@100..800&display=swap" rel="stylesheet">
        
        <style>
          /* CSS Reset and base styles */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background: transparent;
            color: #a9b2c3;
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
            font-size: ${fontSize || 13.5}px;
          }
          
          /* Blog Prose styles */
          .blog-prose { 
            font-family: 'JetBrains Mono', monospace; 
            color: #a9b2c3; 
            line-height: 1.8; 
            text-align: left;
          }
          .blog-prose .hero { display: none; }
          .blog-prose h2 { 
            font-family: 'Sora', sans-serif; 
            font-size: 1.35em; 
            font-weight: 800; 
            color: #f8f8f2; 
            margin: 38px 0 16px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid rgba(189,147,249,0.2); 
            display: flex; 
            align-items: center; 
            gap: 8px; 
          }
          .blog-prose h2 .num { color: ${accentHex}; font-weight: 700; }
          .blog-prose h3 { font-family: 'Sora', sans-serif; font-size: 1.15em; font-weight: 700; color: #cbd5e1; margin: 24px 0 12px; }
          .blog-prose p { margin-bottom: 16px; font-family: 'Poppins', sans-serif; }
          .blog-prose strong { color: #ff79c6; font-weight: 700; }
          .blog-prose em { color: #f1fa8c; font-style: italic; }
          .blog-prose a { color: #8be9fd; text-decoration: none; border-bottom: 1px dashed rgba(139,233,253,0.4); }
          .blog-prose a:hover { border-bottom-style: solid; }
          .blog-prose ul, .blog-prose ol { padding-left: 20px; margin-bottom: 16px; font-family: 'Poppins', sans-serif; }
          .blog-prose li { margin-bottom: 6px; }
          .blog-prose ul li::marker { color: ${accentHex}; }
          .blog-prose ol li::marker { color: ${accentHex}; font-weight: 700; }
          .blog-prose :not(pre)>code { font-family: 'JetBrains Mono', monospace; background: rgba(189,147,249,0.1); color: ${accentHex}; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; border: 1px solid rgba(189,147,249,0.25); }
          .blog-prose .code-block { margin: 20px 0; }
          .blog-prose blockquote { border-left: 3px solid ${accentHex}; background: rgba(189,147,249,0.05); border-radius: 0 8px 8px 0; padding: 12px 18px; margin: 20px 0; color: #6272a4; font-style: italic; }
          .blog-prose blockquote p { margin: 0; }
          .blog-prose .callout { border-radius: 8px; padding: 12px 16px; margin: 20px 0; display: flex; gap: 12px; align-items: flex-start; border: 1px solid; }
          .blog-prose .callout-icon { font-size: 16px; flex-shrink: 0; }
          .blog-prose .callout-info { background: rgba(139,233,253,0.07); border-color: rgba(139,233,253,0.2); color: #8be9fd; }
          .blog-prose .callout-tip { background: rgba(80,250,123,0.07); border-color: rgba(80,250,123,0.2); color: #50fa7b; }
          .blog-prose .callout-warn { background: rgba(241,250,140,0.07); border-color: rgba(241,250,140,0.2); color: #f1fa8c; }
          .blog-prose .callout-danger { background: rgba(255,85,85,0.07); border-color: rgba(255,85,85,0.2); color: #ff5555; }
          .blog-prose .steps { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
          .blog-prose .step { display: flex; gap: 14px; align-items: flex-start; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 14px 18px; }
          .blog-prose .step-num { width: 28px; height: 28px; border-radius: 50%; background: ${accentHex}; color: #12121e; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .blog-prose .step-body h4 { color: #f8f8f2; font-size: 13px; font-weight: 700; margin-bottom: 2px; font-family: 'Poppins', sans-serif; }
          .blog-prose .step-body p { color: #6272a4; font-size: 12px; margin: 0; font-family: 'Poppins', sans-serif; }
          .blog-prose .arch { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
          .blog-prose .arch-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(189,147,249,0.15); border-radius: 8px; padding: 14px; text-align: center; }
          .blog-prose .arch-box .icon { font-size: 24px; margin-bottom: 6px; }
          .blog-prose .arch-box .label { font-size: 12px; font-weight: 700; color: #f8f8f2; margin-bottom: 2px; font-family: 'Poppins', sans-serif; }
          .blog-prose .arch-box .sub { font-size: 10px; color: #6272a4; font-family: 'Poppins', sans-serif; }
          .blog-prose table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12.5px; }
          .blog-prose thead tr { background: rgba(189,147,249,0.1); }
          .blog-prose th { padding: 10px 14px; text-align: left; color: ${accentHex}; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(189,147,249,0.25); }
          .blog-prose td { padding: 9px 14px; color: #a9b2c3; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .blog-prose tr:last-child td { border-bottom: none; }
          .blog-prose img { width: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin: 18px 0; }
          .blog-prose .summary { background: rgba(189,147,249,0.05); border: 1px solid rgba(189,147,249,0.2); border-radius: 8px; padding: 18px 22px; margin-top: 36px; }
          .blog-prose .summary h3 { color: ${accentHex}; font-size: 14px; margin-bottom: 10px; }
          
          /* Visualizer-specific formatting */
          .rec-vis-container {
            margin: 20px 0;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
          }
          
          @media(max-width:640px){
            .blog-prose .arch { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="blog-prose">
          ${htmlContent}
        </div>
        
        <script>
          // Wrap pre blocks with headers & copy buttons
          function setupCodeBlocks() {
            const preBlocks = document.querySelectorAll("pre");
            preBlocks.forEach((block) => {
              if (block.querySelector(".copy-code-btn") || block.parentElement.classList.contains("code-block-wrapper")) return;

              const wrapper = document.createElement("div");
              wrapper.className = "code-block-wrapper";
              
              // Apply wrappers with styling directly
              wrapper.style.position = "relative";
              wrapper.style.borderRadius = "12px";
              wrapper.style.overflow = "hidden";
              wrapper.style.margin = "24px 0";
              wrapper.style.border = "1px solid rgba(255, 255, 255, 0.1)";
              wrapper.style.backgroundColor = "#080814";
              
              block.parentNode.insertBefore(wrapper, block);
              wrapper.appendChild(block);

              const header = document.createElement("div");
              header.style.display = "flex";
              header.style.alignItems = "center";
              header.style.justifyContent = "between";
              header.style.padding = "8px 16px";
              header.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
              header.style.borderBottom = "1px solid rgba(255, 255, 255, 0.08)";
              header.style.fontSize = "11px";
              header.style.fontFamily = "monospace";
              header.style.color = "#a9b2c3";
              
              // Dots
              const dots = document.createElement("div");
              dots.style.display = "flex";
              dots.style.gap = "6px";
              dots.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background-color:#ff5f57;display:inline-block;"></span><span style="width:10px;height:10px;border-radius:50%;background-color:#febc2e;display:inline-block;"></span><span style="width:10px;height:10px;border-radius:50%;background-color:#28c840;display:inline-block;"></span>';
              
              // Language
              const lang = document.createElement("span");
              lang.style.color = "#6272a4";
              lang.style.fontWeight = "bold";
              lang.style.textTransform = "uppercase";
              lang.style.marginLeft = "12px";
              lang.style.marginRight = "auto";
              const codeEl = block.querySelector("code");
              const langClass = codeEl ? Array.from(codeEl.classList).find(c => c.startsWith("language-")) : null;
              lang.textContent = langClass ? langClass.replace("language-", "") : "code";
              
              // Copy Button
              const copyBtn = document.createElement("button");
              copyBtn.style.background = "none";
              copyBtn.style.border = "none";
              copyBtn.style.color = "#6272a4";
              copyBtn.style.cursor = "pointer";
              copyBtn.style.fontSize = "11px";
              copyBtn.style.transition = "color 0.2s";
              copyBtn.innerHTML = '<span>Copy</span>';
              
              copyBtn.addEventListener("mouseover", () => copyBtn.style.color = "#f8f8f2");
              copyBtn.addEventListener("mouseout", () => copyBtn.style.color = "#6272a4");
              
              copyBtn.addEventListener("click", async () => {
                const text = codeEl ? codeEl.textContent : block.textContent;
                try {
                  await navigator.clipboard.writeText(text);
                  copyBtn.innerHTML = '<span style="color:#50fa7b;">Copied!</span>';
                  setTimeout(() => {
                    copyBtn.innerHTML = '<span>Copy</span>';
                  }, 2000);
                } catch (err) {
                  console.error("Clipboard copy failed:", err);
                }
              });

              header.appendChild(dots);
              header.appendChild(lang);
              header.appendChild(copyBtn);
              wrapper.insertBefore(header, block);
              
              block.style.padding = "16px";
              block.style.margin = "0";
              block.style.overflowX = "auto";
              block.style.fontSize = "13px";
              block.style.lineHeight = "1.6";
              block.style.color = "#cbd5e1";
            });
          }

          // Report inner document height to parent
          function sendHeight() {
            window.parent.postMessage({
              type: 'resize-iframe',
              height: document.documentElement.scrollHeight || document.body.scrollHeight
            }, '*');
          }

          // Initial executions
          setupCodeBlocks();
          sendHeight();

          // Event listeners
          window.addEventListener('load', () => {
            setupCodeBlocks();
            sendHeight();
          });
          window.addEventListener('resize', sendHeight);
          
          document.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', sendHeight);
          });

          // Watch for mutations that change document height
          const observer = new MutationObserver(sendHeight);
          observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        </script>
      </body>
    </html>
  `;

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      title="Blog content renderer"
      className="w-full border-none"
      style={{ height: iframeHeight }}
      sandbox="allow-scripts allow-popups allow-modals allow-same-origin"
    />
  );
};

export default BlogRenderer;
