import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error, invalid-token
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!token) {
      setStatus("invalid-token");
      setLogs(["[Error]: Unsubscribe token parameter 'token' is missing.", "[Sys]: Aborting de-registration request."]);
      return;
    }

    const performUnsubscribe = async () => {
      setLogs((prev) => [
        ...prev,
        "[Sys]: Initializing de-registration session...",
        `[Sys]: Parsing unsubscribe token: ${token}`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setLogs((prev) => [
        ...prev,
        "[Database]: Contacting Supabase directory...",
        "[Database]: Verifying subscriber record...",
      ]);

      try {
        const { data, error } = await supabase
          .from("subscribers")
          .delete()
          .eq("id", token)
          .select();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (error) {
          console.error("Unsubscribe error:", error);
          setStatus("error");
          setLogs((prev) => [
            ...prev,
            `[Database]: Error executing delete: ${error.message}`,
            "[Sys]: Process terminated with error code 1.",
          ]);
        } else if (!data || data.length === 0) {
          setStatus("invalid-token");
          setLogs((prev) => [
            ...prev,
            "[Database]: No active subscriber found matching the token.",
            "[Sys]: Process aborted. Token may already be deactivated.",
          ]);
        } else {
          setStatus("success");
          setLogs((prev) => [
            ...prev,
            `[Database]: Successfully deleted record for: ${data[0].email}`,
            "[Sys]: Cleaning up session caching...",
            "[Compiler]: Success! Newsletter channel unsubscribed.",
          ]);
        }
      } catch (err) {
        console.error("Unsubscribe exception:", err);
        setStatus("error");
        setLogs((prev) => [
          ...prev,
          `[Sys]: Exception occurred: ${err.message}`,
          "[Sys]: Process terminated with code 1.",
        ]);
      }
    };

    performUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#030014] text-gray-300 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#bd93f9]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#ff79c6]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d16] overflow-hidden shadow-2xl animate-fadeIn">
        {/* IDE Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#181824] text-[11px] font-mono text-gray-500">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="truncate mx-4 font-semibold text-gray-400">abhishek-portfolio ~ unsubscribe.sh</div>
          <div className="text-[9px] text-[#ff79c6] font-mono">Bash</div>
        </div>

        {/* Content Pane */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-3">
            {status === "loading" && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-12 h-12 text-[#bd93f9] animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="flex justify-center py-4">
                <CheckCircle2 className="w-16 h-16 text-[#50fa7b] drop-shadow-[0_0_8px_rgba(80,250,123,0.3)]" />
              </div>
            )}
            {(status === "error" || status === "invalid-token") && (
              <div className="flex justify-center py-4">
                <AlertTriangle className="w-16 h-16 text-[#ff5555] drop-shadow-[0_0_8px_rgba(255,85,85,0.3)]" />
              </div>
            )}

            <h1 className="text-2xl font-black font-mono tracking-tight text-white">
              {status === "loading" && "Processing Request..."}
              {status === "success" && "Subscription Cancelled"}
              {status === "invalid-token" && "Invalid Unsubscribe Link"}
              {status === "error" && "An Error Occurred"}
            </h1>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {status === "loading" && "Removing your email from our automated subscriber directory..."}
              {status === "success" && "You've been successfully unsubscribed. We're sorry to see you go!"}
              {status === "invalid-token" && "This unsubscribe link is invalid, expired, or has already been used."}
              {status === "error" && "We couldn't process your request. Please try again later or contact support."}
            </p>
          </div>

          {/* Code/Terminal console logs output */}
          <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-xs text-left leading-relaxed space-y-1.5 overflow-x-auto">
            <div className="text-gray-500 border-b border-white/5 pb-2 mb-2 flex items-center justify-between">
              <span>OUTPUT LOGS</span>
              <span className="text-[10px] uppercase font-semibold text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">Console</span>
            </div>
            {logs.map((log, idx) => {
              let color = "text-gray-300";
              if (log.startsWith("[Error]")) color = "text-[#ff5555]";
              else if (log.startsWith("[Database]")) color = "text-[#8be9fd]";
              else if (log.startsWith("[Compiler]")) color = "text-[#50fa7b]";
              else if (log.startsWith("[Sys]")) color = "text-[#6272a4]";
              return (
                <div key={idx} className={`${color}`}>
                  {log}
                </div>
              );
            })}
            {status === "loading" && (
              <div className="text-gray-500 animate-pulse font-bold">
                &gt; Processing request...
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-[#8be9fd] text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              &lt; Return to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
