import React from "react";

const ComplexityTable = ({ headers = [], rows = [] }) => {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/8 bg-black/10 select-text">
      <table className="w-full text-sm border-collapse text-left">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/6">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 font-mono"
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
              className="border-b border-white/4 last:border-0 hover:bg-white/[0.01] transition-colors"
            >
              {row.map((cell, ci) => {
                // Check if cell is an complexity marker like O(1) or O(n) to highlight it
                const isComplexity = typeof cell === "string" && /^[OΘΩ]\(.*\)$/i.test(cell.trim());
                return (
                  <td
                    key={ci}
                    className={`px-4 py-3 text-[13px] leading-relaxed font-sans text-gray-300 ${
                      isComplexity ? "font-mono font-semibold text-[#a855f7]" : ""
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
  );
};

export default ComplexityTable;
