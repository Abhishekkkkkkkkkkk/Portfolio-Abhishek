import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

// ======================== SYNTAX HIGHLIGHTER ========================

const KEYWORDS_BY_LANG = {
  java: new Set([
    "public", "private", "protected", "class", "interface", "extends", "implements",
    "static", "void", "int", "long", "double", "float", "boolean", "char", "String",
    "return", "if", "else", "for", "while", "do", "new", "null", "true", "false",
    "import", "package", "final", "abstract", "this", "super", "throws", "try",
    "catch", "finally", "throw", "volatile", "synchronized", "transient", "assert"
  ]),
  javascript: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "class", "extends", "import", "export", "default", "new", "null", "undefined",
    "true", "false", "async", "await", "of", "in", "typeof", "instanceof", "this",
    "super", "from", "delete", "switch", "case", "break", "continue", "throw", "try", "catch"
  ]),
  typescript: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
    "class", "extends", "import", "export", "default", "new", "null", "undefined",
    "true", "false", "async", "await", "of", "in", "typeof", "instanceof", "this",
    "super", "from", "delete", "interface", "type", "namespace", "keyof", "readonly",
    "any", "number", "string", "boolean", "void", "never", "unknown", "as", "declare"
  ]),
  sql: new Set([
    "select", "insert", "update", "delete", "from", "where", "join", "inner", "left",
    "right", "outer", "on", "group", "by", "order", "having", "limit", "offset", "and",
    "or", "not", "in", "exists", "like", "between", "is", "null", "create", "table",
    "alter", "drop", "index", "view", "database", "into", "values", "set", "primary",
    "key", "foreign", "references", "unique", "default", "check", "trigger", "returns"
  ]),
  python: new Set([
    "def", "class", "return", "if", "elif", "else", "for", "while", "break", "continue",
    "import", "from", "as", "try", "except", "finally", "raise", "assert", "with",
    "lambda", "pass", "in", "is", "and", "or", "not", "True", "False", "None", "global", "nonlocal"
  ]),
  bash: new Set([
    "if", "then", "else", "elif", "fi", "for", "while", "in", "do", "done", "case",
    "esac", "function", "return", "exit", "echo", "cd", "ls", "pwd", "mkdir", "rm",
    "cp", "mv", "grep", "awk", "sed", "sudo", "chmod", "export", "alias", "local"
  ]),
  cpp: new Set([
    "int", "double", "float", "char", "bool", "void", "class", "struct", "public", "private", "protected",
    "template", "typename", "include", "define", "if", "else", "for", "while", "do", "return", "new", "delete",
    "namespace", "using", "std", "vector", "string", "cout", "cin", "endl", "const", "static", "virtual", "override",
    "auto", "typedef", "switch", "case", "break", "continue", "constexpr", "nullptr"
  ])
};

const TYPES_BY_LANG = {
  java: new Set(["int", "long", "double", "float", "boolean", "char", "void", "String", "Object", "List", "Map", "Set", "ArrayList", "HashMap", "HashSet", "Exception", "Thread", "System"]),
  typescript: new Set(["string", "number", "boolean", "void", "never", "unknown", "any", "Record", "Omit", "Pick", "Partial", "Required", "Promise"]),
  cpp: new Set(["string", "vector", "map", "set", "unordered_map", "unordered_set", "pair", "queue", "stack", "priority_queue", "size_t"])
};

function highlightCode(code, lang) {
  const language = (lang || "").toLowerCase();

  // Special highlighter for JSON
  if (language === "json") {
    const rx = /("(?:\\.|[^\\])*?")\s*(:)|("(?:\\.|[^\\])*?")|(\b\d+\b)|(true|false|null)/g;
    const nodes = [];
    let last = 0;
    let key = 0;
    let m;
    while ((m = rx.exec(code)) !== null) {
      if (m.index > last) {
        nodes.push(code.slice(last, m.index));
      }
      const [full, jsonKey, colon, jsonStrValue, numValue, boolValue] = m;
      if (jsonKey) {
        nodes.push(<span key={key++} className="text-purple-400 font-semibold">{jsonKey}</span>);
        if (colon) nodes.push(<span key={key++} className="text-gray-300">{colon}</span>);
      } else if (jsonStrValue) {
        nodes.push(<span key={key++} className="text-emerald-400">{jsonStrValue}</span>);
      } else if (numValue) {
        nodes.push(<span key={key++} className="text-amber-400">{numValue}</span>);
      } else if (boolValue) {
        nodes.push(<span key={key++} className="text-amber-500 font-semibold">{boolValue}</span>);
      }
      last = rx.lastIndex;
    }
    if (last < code.length) {
      nodes.push(code.slice(last));
    }
    return nodes;
  }

  // Special highlighter for HTML/XML
  if (language === "html" || language === "xml") {
    const rx = /(<!--[\s\S]*?-->)|(<[\/]?[a-zA-Z0-9:-]+)|(\/?>)|([a-zA-Z0-9:-]+)\s*(=)\s*("[^"]*")/g;
    const nodes = [];
    let last = 0;
    let key = 0;
    let m;
    while ((m = rx.exec(code)) !== null) {
      if (m.index > last) {
        nodes.push(code.slice(last, m.index));
      }
      const [full, comment, tagOpen, tagClose, attrName, attrEq, attrVal] = m;
      if (comment) {
        nodes.push(<span key={key++} className="text-gray-500 italic">{comment}</span>);
      } else if (tagOpen) {
        nodes.push(<span key={key++} className="text-purple-400 font-semibold">{tagOpen}</span>);
      } else if (tagClose) {
        nodes.push(<span key={key++} className="text-purple-400 font-semibold">{tagClose}</span>);
      } else if (attrName) {
        nodes.push(<span key={key++} className="text-cyan-400">{attrName}</span>);
        if (attrEq) nodes.push(<span key={key++} className="text-[#22d3ee]">{attrEq}</span>);
        if (attrVal) nodes.push(<span key={key++} className="text-emerald-400">{attrVal}</span>);
      }
      last = rx.lastIndex;
    }
    if (last < code.length) {
      nodes.push(code.slice(last));
    }
    return nodes;
  }

  // Special highlighter for CSS
  if (language === "css") {
    const rx = /(\/\*[\s\S]*?\*\/)|([a-zA-Z0-9_.-]+)\s*({)|(})|([a-zA-Z-]+)\s*(:)\s*([^;}]+)(;)/g;
    const nodes = [];
    let last = 0;
    let key = 0;
    let m;
    while ((m = rx.exec(code)) !== null) {
      if (m.index > last) {
        nodes.push(code.slice(last, m.index));
      }
      const [full, comment, selector, openBrace, closeBrace, propName, colon, propVal, semicolon] = m;
      if (comment) {
        nodes.push(<span key={key++} className="text-gray-500 italic">{comment}</span>);
      } else if (selector) {
        nodes.push(<span key={key++} className="text-purple-400 font-bold">{selector}</span>);
        if (openBrace) nodes.push(<span key={key++} className="text-[#22d3ee]">{openBrace}</span>);
      } else if (closeBrace) {
        nodes.push(<span key={key++} className="text-[#22d3ee]">{closeBrace}</span>);
      } else if (propName) {
        nodes.push(<span key={key++} className="text-cyan-400">{propName}</span>);
        if (colon) nodes.push(<span key={key++} className="text-gray-300">{colon}</span>);
        if (propVal) nodes.push(<span key={key++} className="text-emerald-400">{propVal}</span>);
        if (semicolon) nodes.push(<span key={key++} className="text-gray-300">{semicolon}</span>);
      }
      last = rx.lastIndex;
    }
    if (last < code.length) {
      nodes.push(code.slice(last));
    }
    return nodes;
  }

  // Standard procedural/OOP highlighter (Java, JS, TS, Python, C++, SQL, Bash)
  const kw = KEYWORDS_BY_LANG[language] || new Set();
  const types = TYPES_BY_LANG[language] || new Set();

  const rx = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(#.*)|(["'`](?:\\.|[^\\])*?["'`])|(\b\d+\.?\d*\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)|([+\-*/%=<>!&|^~?:,;{}()[\].])/g;
  
  const nodes = [];
  let last = 0;
  let key = 0;
  let m;

  while ((m = rx.exec(code)) !== null) {
    if (m.index > last) {
      nodes.push(code.slice(last, m.index));
    }

    const [full, lineComment, blockComment, bashComment, str, num, word, op] = m;

    if (lineComment || blockComment || bashComment) {
      nodes.push(<span key={key++} className="text-gray-500 italic">{full}</span>);
    } else if (str) {
      nodes.push(<span key={key++} className="text-emerald-400">{full}</span>);
    } else if (num) {
      nodes.push(<span key={key++} className="text-amber-400">{full}</span>);
    } else if (word) {
      if (kw.has(word)) {
        nodes.push(<span key={key++} className="text-purple-400 font-bold">{word}</span>);
      } else if (types.has(word) || /^[A-Z]/.test(word)) {
        nodes.push(<span key={key++} className="text-cyan-400 font-medium">{word}</span>);
      } else {
        nodes.push(<span key={key++} className="text-gray-100">{word}</span>);
      }
    } else if (op) {
      nodes.push(<span key={key++} className="text-[#22d3ee]">{op}</span>);
    }

    last = rx.lastIndex;
  }

  if (last < code.length) {
    nodes.push(code.slice(last));
  }

  return nodes;
}

// ======================== MAIN CODEBLOCK ========================

const CodeBlock = ({ code, language, filename, showLineNumbers }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = (code || "").trim().split("\n");

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-white/8 bg-[#070715] shadow-xl shadow-black/30 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/6 select-none">
        <div className="flex items-center gap-3">
          {/* OS Terminal buttons */}
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {filename && (
            <span className="text-[11px] font-mono text-gray-500 tracking-wider">
              {filename}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {language && (
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded uppercase">
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-white/5 bg-white/4 text-gray-400 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all duration-200 cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Pane */}
      <div className="flex text-xs leading-6 overflow-x-auto select-text font-mono">
        {/* Line Numbers Column */}
        {showLineNumbers !== false && (
          <div className="select-none py-4 text-right border-r border-white/5 bg-black/15 text-gray-700 min-w-[40px] px-3">
            {lines.map((_, i) => (
              <div key={i} className="h-6 pr-1 font-mono text-[11px]">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Code Content */}
        <pre className="py-4 px-5 overflow-x-auto flex-1 text-gray-300 font-mono text-[13px] bg-[#070715] m-0 whitespace-pre">
          <code>{highlightCode(code, language)}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
