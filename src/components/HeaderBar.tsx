import React from "react";
import { Scale, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

interface HeaderBarProps {
  onOpenRegimeModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenRegimeModal }) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-inner">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white font-mono">
                DPDP Compliance Decision Engine
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                v1.0 Console
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic legal-engineering evaluation matrix for DPDP Act 2023 & Rules
            </p>
          </div>
        </div>

        {/* Right immutable badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenRegimeModal}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded transition-colors"
            title="View Regime Enforcement Schedule"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules Timeline</span>
          </button>

          {/* Immutable badge required by prompt §1 */}
          <div
            id="regime-status-badge"
            className="flex items-center gap-2 bg-amber-950/80 text-amber-300 border border-amber-600/60 px-3 py-1.5 rounded-md font-mono text-xs font-bold tracking-wider shadow-sm select-none"
            title="Non-dismissible simulation environment indicator"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>MAY_2027_READINESS_SIMULATION</span>
          </div>
        </div>
      </div>
    </header>
  );
};
