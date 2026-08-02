import React from "react";
import { DecisionEngineOutput } from "../types";
import { Download, ShieldCheck, FileJson, AlertCircle } from "lucide-react";

interface ExportBarProps {
  output: DecisionEngineOutput | null;
}

export const ExportBar: React.FC<ExportBarProps> = ({ output }) => {
  const handleExportJson = () => {
    if (!output) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonString = JSON.stringify(output, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dpdp-decision-export-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 px-4 py-2.5 text-slate-300 text-xs font-mono sticky bottom-0 z-30 shadow-lg">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Status info */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Deterministic Audit Mode Active · Server Parameter Authority Enforced</span>
        </div>

        {/* Right Export Button */}
        <div className="flex items-center gap-3">
          {output ? (
            <button
              onClick={handleExportJson}
              className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded shadow-md flex items-center gap-2 transition-colors active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Execution JSON</span>
            </button>
          ) : (
            <button
              disabled
              title="Run a decision first to enable JSON export"
              className="py-1.5 px-3.5 bg-slate-800 text-slate-500 font-mono text-xs rounded border border-slate-700/50 cursor-not-allowed flex items-center gap-2"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export Execution JSON (Run Decision First)</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
