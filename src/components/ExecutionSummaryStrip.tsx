import React from "react";
import { DecisionEngineOutput } from "../types";
import {
  CheckCircle2,
  Lock,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Scale,
} from "lucide-react";

interface ExecutionSummaryStripProps {
  output: DecisionEngineOutput | null;
}

export const ExecutionSummaryStrip: React.FC<ExecutionSummaryStripProps> = ({
  output,
}) => {
  if (!output) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-400 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Decision Engine Idle. Click "Run Deterministic Decision Engine" or pick a test preset.</span>
        </div>
      </div>
    );
  }

  const { decision, controlling_authority, retention_if_applicable, flags, _execution_trace } = output;

  const getDecisionBadge = () => {
    switch (decision) {
      case "ERASE":
        return {
          bg: "bg-emerald-950 border-emerald-500/80 text-emerald-300",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: "DECISION: ERASE",
          desc: "Data principal request approved. Safe cryptographic erasure mandated under Sec 12(3) / Sec 8(7).",
        };
      case "RETAIN":
        return {
          bg: "bg-amber-950 border-amber-500/80 text-amber-300",
          icon: <Lock className="w-4 h-4 text-amber-400" />,
          label: "DECISION: RETAIN",
          desc: "Erasure overridden by mandatory statutory retention law in force.",
        };
      case "BLOCKED_ACTIVE_PROCESSING":
        return {
          bg: "bg-blue-950 border-blue-500/80 text-blue-300",
          icon: <Clock className="w-4 h-4 text-blue-400" />,
          label: "DECISION: BLOCKED_ACTIVE_PROCESSING",
          desc: "Immediate erasure blocked due to active in-progress order or shared active identity dependency.",
        };
      case "ERASURE_BLOCKED_UNRESOLVED":
      default:
        return {
          bg: "bg-rose-950 border-rose-500/80 text-rose-300",
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          label: "DECISION: ERASURE_BLOCKED_UNRESOLVED",
          desc: "Fail closed triggered due to caller payload parameter integrity violation or unresolved parameters.",
        };
    }
  };

  const badge = getDecisionBadge();

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Main Decision Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-md border font-mono font-bold text-xs flex items-center gap-2 shadow-sm ${badge.bg}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          <div className="hidden sm:block text-xs text-slate-300">
            <span className="text-slate-400 block text-[11px]">Primary Authority:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {controlling_authority.primary_citation || "N/A (Fail Closed)"}
            </span>
          </div>
        </div>

        {/* Badges & Flags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1">
            <Scale className="w-3 h-3 text-emerald-400" />
            <span>Basis: {controlling_authority.basis}</span>
          </span>

          {retention_if_applicable?.expiry_date && (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Expiry: {retention_if_applicable.expiry_date}</span>
            </span>
          )}

          {flags.parameter_integrity_warning && (
            <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-mono text-[11px] flex items-center gap-1 font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>Spoofing Alert</span>
            </span>
          )}

          {flags.shared_pii_conflict_detected && (
            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300 font-mono text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Shared PII Isolated</span>
            </span>
          )}

          <span className="text-[10px] text-slate-400 font-mono ml-auto">
            Eval Time: {_execution_trace.execution_time_ms}ms
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-normal pl-1">
        {badge.desc}{" "}
        {retention_if_applicable && (
          <span className="text-slate-300 font-mono">
            [{retention_if_applicable.duration}]
          </span>
        )}
      </p>
    </div>
  );
};
