import React from "react";

const TraceBlock = ({ title, headers = [], rows = [] }) => {
  return (
    <div className="my-6 text-left">
      {title && (
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded w-fit mb-3">
          {title}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[#6366f1]/20 bg-[#6366f1]/2 shadow-lg shadow-indigo-500/5">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#6366f1]/10 border-b border-[#6366f1]/25">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 font-mono font-bold text-[#818cf8]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-[#6366f1]/10 last:border-0 hover:bg-[#6366f1]/4 transition-colors"
              >
                {row.map((cell, ci) => {
                  const hasCheck = typeof cell === "string" && (cell.includes("✓") || cell.includes("checked"));
                  return (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 font-mono text-[11.5px] ${
                        hasCheck ? "text-emerald-400 font-bold" : "text-gray-300"
                      }`}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TraceBlock;
