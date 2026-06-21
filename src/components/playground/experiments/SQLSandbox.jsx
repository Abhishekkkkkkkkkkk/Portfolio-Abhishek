import React, { useState } from "react";
import { Database, Play, HelpCircle, RefreshCw, Table } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

// Mock Database Tables
const MOCK_DB = {
  skills: [
    { id: 1, name: "React", category: "frontend", proficiency: "expert" },
    { id: 2, name: "Node.js", category: "backend", proficiency: "advanced" },
    { id: 3, name: "Java", category: "backend", proficiency: "expert" },
    { id: 4, name: "PostgreSQL", category: "database", proficiency: "advanced" },
    { id: 5, name: "TailwindCSS", category: "frontend", proficiency: "expert" },
    { id: 6, name: "Spring Boot", category: "backend", proficiency: "advanced" },
  ],
  projects: [
    { id: 1, title: "Portfolio V5", language: "JavaScript", role: "Fullstack", stars: 120 },
    { id: 2, title: "Microservices platform", language: "Java", role: "Backend", stars: 85 },
    { id: 3, title: "Grid pathfinder visualizer", language: "JavaScript", role: "Frontend", stars: 64 },
    { id: 4, title: "E-Commerce App", language: "JavaScript", role: "Fullstack", stars: 40 },
  ],
  experience: [
    { id: 1, company: "Google DeepMind pair", position: "AI Coding Assistant", duration: "1 year" },
    { id: 2, company: "Tech Solutions Inc", position: "Software Engineer", duration: "2 years" },
    { id: 3, company: "Startup Hub", position: "Junior Developer", duration: "1 year" },
  ],
};

const SCHEMAS = {
  skills: { id: "INT", name: "VARCHAR", category: "VARCHAR", proficiency: "VARCHAR" },
  projects: { id: "INT", title: "VARCHAR", language: "VARCHAR", role: "VARCHAR", stars: "INT" },
  experience: { id: "INT", company: "VARCHAR", position: "VARCHAR", duration: "VARCHAR" },
};

const SQLSandbox = () => {
  const [query, setQuery] = useState("SELECT * FROM skills WHERE category = 'backend' ORDER BY name ASC;");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTableSchema, setActiveTableSchema] = useState("skills");

  // Query engine parser
  const runQuery = () => {
    playTap();
    setError(null);
    setResults(null);

    const cleanQuery = query.trim().replace(/;$/, "");
    if (!cleanQuery) {
      setError("Query cannot be empty.");
      playFail();
      return;
    }

    // Basic regex parser
    // Matches: SELECT <cols> FROM <tab> [WHERE <condition>] [ORDER BY <col> [ASC|DESC]]
    const sqlRegex = /^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i;
    const match = cleanQuery.match(sqlRegex);

    if (!match) {
      setError("Syntax Error: Make sure your query follows standard SQL syntax:\nSELECT cols FROM table [WHERE col = 'val'] [ORDER BY col [ASC|DESC]]");
      playFail();
      return;
    }

    const [, colsStr, tableName, whereStr, orderByStr] = match;
    const targetTable = tableName.toLowerCase();

    // Check if table exists
    if (!MOCK_DB[targetTable]) {
      setError(`Table '${tableName}' does not exist. Try: skills, projects, or experience.`);
      playFail();
      return;
    }

    let rows = JSON.parse(JSON.stringify(MOCK_DB[targetTable]));

    // Handle WHERE filter
    if (whereStr) {
      // Parse simple conditions: col = val, col > val, col < val, col LIKE val
      const condRegex = /(\w+)\s*(=|>|<|LIKE)\s*(.+)/i;
      const condMatch = whereStr.match(condRegex);
      if (!condMatch) {
        setError(`SQL Parser Limitation: Only basic filters like 'col = val', 'col > val', or 'col LIKE val' are supported.`);
        playFail();
        return;
      }

      const [, colName, operator, valueRaw] = condMatch;
      const col = colName.toLowerCase().trim();
      const val = valueRaw.replace(/'/g, "").replace(/"/g, "").trim();

      // Check if column exists in table schema
      if (rows[0] && rows[0][col] === undefined) {
        setError(`Column '${colName}' does not exist in table '${tableName}'.`);
        playFail();
        return;
      }

      rows = rows.filter((row) => {
        const rowVal = row[col];
        if (operator === "=") {
          return String(rowVal).toLowerCase() === val.toLowerCase();
        } else if (operator === ">") {
          return Number(rowVal) > Number(val);
        } else if (operator === "<") {
          return Number(rowVal) < Number(val);
        } else if (operator.toUpperCase() === "LIKE") {
          const regexVal = val.replace(/%/g, ".*");
          return new RegExp(`^${regexVal}$`, "i").test(String(rowVal));
        }
        return true;
      });
    }

    // Handle ORDER BY sorting
    if (orderByStr) {
      const parts = orderByStr.trim().split(/\s+/);
      const col = parts[0].toLowerCase();
      const direction = parts[1] ? parts[1].toUpperCase() : "ASC";

      if (rows[0] && rows[0][col] === undefined) {
        setError(`Column '${parts[0]}' does not exist to order by.`);
        playFail();
        return;
      }

      rows.sort((a, b) => {
        let valA = a[col];
        let valB = b[col];

        if (typeof valA === "number" && typeof valB === "number") {
          return direction === "DESC" ? valB - valA : valA - valB;
        }
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return direction === "DESC" ? 1 : -1;
        if (valA > valB) return direction === "DESC" ? -1 : 1;
        return 0;
      });
    }

    // Handle column selection (SELECT cols)
    const selectCols = colsStr.split(",").map((c) => c.trim().toLowerCase());
    let finalColumns = [];

    if (selectCols.includes("*")) {
      if (rows.length > 0) {
        finalColumns = Object.keys(rows[0]);
      } else {
        finalColumns = Object.keys(SCHEMAS[targetTable]);
      }
    } else {
      // Validate columns
      const availableCols = Object.keys(SCHEMAS[targetTable]);
      for (const col of selectCols) {
        if (!availableCols.includes(col)) {
          setError(`Column '${col}' does not exist in table '${tableName}'.`);
          playFail();
          return;
        }
      }
      finalColumns = selectCols;
      rows = rows.map((row) => {
        const newRow = {};
        finalColumns.forEach((c) => {
          newRow[c] = row[c];
        });
        return newRow;
      });
    }

    setResults({ columns: finalColumns, data: rows });
    playSuccess();
    trackExperimentInteracted("sql-sandbox");
  };

  const handlePredefinedQuery = (q) => {
    setQuery(q);
    playTap();
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          SQL Query Sandbox
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Execute SQL commands against a mock developer database to fetch details on skills, portfolio projects, and experiences!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Tables Reference */}
        <div className="md:col-span-1 rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Available Schema</span>
          
          <div className="flex flex-wrap md:flex-col gap-2">
            {Object.keys(MOCK_DB).map((tableName) => (
              <button
                key={tableName}
                onClick={() => {
                  setActiveTableSchema(tableName);
                  playTap();
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg border text-left cursor-pointer transition-all ${
                  activeTableSchema === tableName
                    ? "bg-[#6366f1]/15 text-[#a78bfa] border-[#6366f1]/40"
                    : "bg-white/3 text-gray-400 border-white/5 hover:text-white"
                }`}
              >
                <Table className="w-3.5 h-3.5 shrink-0" />
                <span>{tableName}</span>
              </button>
            ))}
          </div>

          {/* Render Active Schema Columns */}
          <div className="border-t border-white/5 pt-3">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-2">Columns in `{activeTableSchema}`</span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              {Object.entries(SCHEMAS[activeTableSchema]).map(([col, type]) => (
                <div key={col} className="flex justify-between text-gray-400">
                  <span className="text-[#a78bfa] font-bold">{col}</span>
                  <span className="text-gray-600">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Query Workspace */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Preset query quick selections */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handlePredefinedQuery("SELECT * FROM skills WHERE category = 'frontend';")}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-[9px] cursor-pointer border border-white/5"
            >
              Get Frontend Skills
            </button>
            <button
              onClick={() => handlePredefinedQuery("SELECT title, stars FROM projects WHERE stars > 50 ORDER BY stars DESC;")}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-[9px] cursor-pointer border border-white/5"
            >
              Popular Projects
            </button>
            <button
              onClick={() => handlePredefinedQuery("SELECT * FROM experience WHERE company LIKE '%Solutions%';")}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-[9px] cursor-pointer border border-white/5"
            >
              Filter Experience
            </button>
          </div>

          {/* Compiler Input */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck="false"
              className="w-full h-24 rounded-xl border border-white/10 bg-[#040410] p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 leading-normal"
            />
            <button
              onClick={runQuery}
              className="absolute bottom-3 right-3 py-2 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Query</span>
            </button>
          </div>

          {/* Outputs / Errors / Tabular result */}
          <div className="flex-1 min-h-[160px] rounded-xl border border-white/8 bg-[#040410] p-4 flex flex-col justify-start overflow-hidden">
            {error && (
              <div className="text-rose-500 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {error}
              </div>
            )}

            {!error && !results && (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10">
                <HelpCircle className="w-6 h-6 mb-2 text-gray-600" />
                <p className="text-xs">Execute a SELECT query above to fetch data.</p>
              </div>
            )}

            {!error && results && (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[#a78bfa]">
                      {results.columns.map((col) => (
                        <th key={col} className="pb-2 pr-4 font-bold uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.data.length === 0 ? (
                      <tr>
                        <td colSpan={results.columns.length} className="pt-4 text-center text-gray-600">
                          Empty set (0 rows returned)
                        </td>
                      </tr>
                    ) : (
                      results.data.map((row, idx) => (
                        <tr key={idx} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                          {results.columns.map((col) => (
                            <td key={col} className="py-2.5 pr-4 text-gray-300">{row[col]}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="mt-3 text-[9px] text-gray-600 text-right">
                  {results.data.length} row(s) returned successfully.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLSandbox;
