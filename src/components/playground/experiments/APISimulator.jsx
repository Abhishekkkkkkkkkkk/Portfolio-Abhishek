import React, { useState, useEffect } from "react";
import { Send, Globe, Server, Code, FileText, CheckCircle2 } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess, playFail } from "../../../services/soundEffects";

const INITIAL_SKILLS = [
  { id: 1, name: "React", category: "frontend" },
  { id: 2, name: "Node.js", category: "backend" },
];

const INITIAL_PROJECTS = [
  { id: 1, name: "Portfolio", language: "JS" },
];

const APISimulator = () => {
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/api/v1/skills");
  const [requestBody, setRequestBody] = useState(JSON.stringify({ name: "TypeScript", category: "frontend" }, null, 2));
  
  // Stateful database for local persistence during sandbox session
  const [skillsDb, setSkillsDb] = useState(INITIAL_SKILLS);
  const [projectsDb, setProjectsDb] = useState(INITIAL_PROJECTS);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Auto update request body placeholder depending on method/endpoint
  useEffect(() => {
    if (method === "GET" || method === "DELETE") {
      setRequestBody("");
      return;
    }

    if (endpoint.includes("skills")) {
      setRequestBody(JSON.stringify({ name: "TypeScript", category: "frontend" }, null, 2));
    } else if (endpoint.includes("projects")) {
      setRequestBody(JSON.stringify({ name: "AI Sandbox", language: "React" }, null, 2));
    } else {
      setRequestBody(JSON.stringify({ bio: "Web Developer", location: "India" }, null, 2));
    }
  }, [method, endpoint]);

  const handleSend = () => {
    playTap();
    setLoading(true);
    setResponse(null);

    // Simulate latency
    const latency = Math.floor(Math.random() * 800) + 300; // 300ms - 1100ms

    setTimeout(() => {
      let status = 200;
      let statusText = "OK";
      let body = {};
      
      try {
        if (endpoint === "/api/v1/skills") {
          if (method === "GET") {
            body = { count: skillsDb.length, skills: skillsDb };
          } else if (method === "POST") {
            const parsed = JSON.parse(requestBody);
            if (!parsed.name || !parsed.category) {
              status = 400;
              statusText = "Bad Request";
              body = { error: "Validation Failed. Fields 'name' and 'category' are required." };
            } else {
              const newSkill = { id: skillsDb.length + 1, ...parsed };
              setSkillsDb((prev) => [...prev, newSkill]);
              status = 201;
              statusText = "Created";
              body = { message: "Skill created successfully", skill: newSkill };
            }
          } else {
            status = 405;
            statusText = "Method Not Allowed";
            body = { error: `Method ${method} not allowed on endpoint ${endpoint}.` };
          }
        } 
        
        else if (endpoint.startsWith("/api/v1/skills/")) {
          const id = parseInt(endpoint.split("/").pop());
          const exists = skillsDb.find(s => s.id === id);

          if (!exists) {
            status = 404;
            statusText = "Not Found";
            body = { error: `Skill with ID ${id} not found.` };
          } else {
            if (method === "GET") {
              body = { skill: exists };
            } else if (method === "PUT") {
              const parsed = JSON.parse(requestBody);
              setSkillsDb(prev => prev.map(s => s.id === id ? { ...s, ...parsed } : s));
              body = { message: `Skill ${id} updated`, updatedFields: parsed };
            } else if (method === "DELETE") {
              setSkillsDb(prev => prev.filter(s => s.id !== id));
              body = { message: `Skill ${id} deleted successfully` };
            } else {
              status = 405;
              statusText = "Method Not Allowed";
              body = { error: `Method ${method} not allowed.` };
            }
          }
        }

        else if (endpoint === "/api/v1/projects") {
          if (method === "GET") {
            body = { count: projectsDb.length, projects: projectsDb };
          } else if (method === "POST") {
            const parsed = JSON.parse(requestBody);
            if (!parsed.name) {
              status = 400;
              statusText = "Bad Request";
              body = { error: "Validation Failed. Field 'name' is required." };
            } else {
              const newProj = { id: projectsDb.length + 1, ...parsed };
              setProjectsDb((prev) => [...prev, newProj]);
              status = 201;
              statusText = "Created";
              body = { message: "Project registered", project: newProj };
            }
          } else {
            status = 405;
            statusText = "Method Not Allowed";
            body = { error: `Method ${method} not allowed.` };
          }
        }

        else if (endpoint === "/api/v1/profile") {
          if (method === "GET") {
            body = {
              name: "Abhishek",
              title: "Full Stack Engineer",
              status: "open_to_work",
              links: { github: "github.com", linkedin: "linkedin.com" }
            };
          } else if (method === "PUT") {
            status = 403;
            statusText = "Forbidden";
            body = { error: "Permission denied. Root admin credentials required to modify profile." };
          } else {
            status = 405;
            statusText = "Method Not Allowed";
            body = { error: `Method ${method} not allowed.` };
          }
        }

        else {
          status = 404;
          statusText = "Not Found";
          body = { error: "Endpoint route matches nothing on this server." };
        }
      } catch (err) {
        status = 500;
        statusText = "Internal Server Error";
        body = { error: "Server failed to parse JSON payload. Verify your syntax." };
      }

      setResponse({
        status,
        statusText,
        time: `${latency}ms`,
        size: `${JSON.stringify(body).length} B`,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-powered-by": "Express / Node Mock Server",
          "cache-control": "no-cache",
        },
        body
      });
      setLoading(false);

      if (status >= 200 && status < 300) {
        playSuccess();
      } else {
        playFail();
      }
      trackExperimentInteracted("api-sim");
    }, latency);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          Rest API client Simulator
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Perform stateful requests (GET, POST, PUT, DELETE) against a virtual REST API. Updates actually affect the local dataset!
        </p>
      </div>

      {/* Main Form Fields */}
      <div className="flex flex-col gap-4">
        {/* Method & Endpoint Selector */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              playTap();
            }}
            className={`px-3 py-3 rounded-xl border text-xs font-mono font-bold focus:outline-none transition-all cursor-pointer ${
              method === "GET"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : method === "POST"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : method === "PUT"
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* Endpoint select list */}
          <select
            value={endpoint}
            onChange={(e) => {
              setEndpoint(e.target.value);
              playTap();
            }}
            className="flex-1 bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="/api/v1/skills">GET/POST /api/v1/skills (Full List)</option>
            <option value="/api/v1/skills/1">GET/PUT/DELETE /api/v1/skills/1 (Individual)</option>
            <option value="/api/v1/skills/2">GET/PUT/DELETE /api/v1/skills/2 (Individual)</option>
            <option value="/api/v1/projects">GET/POST /api/v1/projects (Full List)</option>
            <option value="/api/v1/profile">GET/PUT /api/v1/profile (Bio details)</option>
          </select>

          {/* Send Request Button */}
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-5 py-3 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-[#6366f1]/50 text-white text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#6366f1]/10 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Sending..." : "Send Request"}</span>
          </button>
        </div>

        {/* JSON Request Body (For POST/PUT) */}
        {(method === "POST" || method === "PUT") && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">JSON Request Payload</span>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full h-28 rounded-xl border border-white/8 bg-[#040410] p-4 font-mono text-xs text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              spellCheck="false"
            />
          </div>
        )}

        {/* Server Response Panel */}
        <div className="rounded-xl border border-white/8 bg-[#040410] p-4 min-h-[200px] flex flex-col gap-3 font-mono text-xs relative">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest select-none">
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-gray-500" />
              Response headers & data
            </span>
            {response && (
              <div className="flex gap-3 text-right">
                <span>Time: <strong className="text-white">{response.time}</strong></span>
                <span>Size: <strong className="text-white">{response.size}</strong></span>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Connecting to server...</span>
            </div>
          )}

          {!loading && !response && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-600">
              <Code className="w-6 h-6 mb-2" />
              <span>No request sent yet. Modify options above and press Send.</span>
            </div>
          )}

          {!loading && response && (
            <div className="flex flex-col gap-4">
              {/* Response Stats */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className={`px-2.5 py-1 rounded font-bold ${
                  response.status >= 200 && response.status < 300
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  Status: {response.status} {response.statusText}
                </span>

                {Object.entries(response.headers).map(([k, v]) => (
                  <span key={k} className="px-2.5 py-1 rounded bg-white/3 text-gray-500 border border-white/5">
                    {k}: {v}
                  </span>
                ))}
              </div>

              {/* JSON Response Body */}
              <div className="bg-black/35 rounded-lg p-3 text-xs leading-relaxed text-gray-300 overflow-y-auto max-h-52 whitespace-pre-wrap">
                {JSON.stringify(response.body, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APISimulator;
