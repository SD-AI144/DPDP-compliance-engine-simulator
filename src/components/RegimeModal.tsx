import React from "react";
import { X, Calendar, ShieldAlert, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { MANDATORY_REGIME_STATUS } from "../engine/dpdpEngine";

interface RegimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegimeModal: React.FC<RegimeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 text-slate-100 rounded-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950 border border-amber-600/50 rounded-lg text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-white">
                DPDP Act Statutory Enforcement Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Regime Status Disclosure & Transitional Phasing Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-md font-mono text-amber-200">
            <span className="font-bold block text-amber-300 mb-1">
              {MANDATORY_REGIME_STATUS.simulation_label}
            </span>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              {MANDATORY_REGIME_STATUS.disclaimer}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono font-bold text-slate-300 block">
              DPDP Rules Status Overview
            </span>

            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block">
                    Rules Currently In Force
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {MANDATORY_REGIME_STATUS.dpdp_rules_in_force.join(", ")} (Board constitution, appeal procedures & preliminary definitions).
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="font-bold">Pending Enforcement Dates:</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 pl-6 list-disc">
                  <li>
                    <strong className="text-amber-200">Rule 4 (Consent Managers):</strong> Enforceable from{" "}
                    <span className="text-emerald-400">{MANDATORY_REGIME_STATUS.dpdp_rules_pending.rule_4_consent_managers}</span>
                  </li>
                  <li>
                    <strong className="text-amber-200">Substantive Obligations (Notice, Erasure, Security Rules 3, 5-16, 22, 23):</strong> Enforceable from{" "}
                    <span className="text-emerald-400 font-bold">{MANDATORY_REGIME_STATUS.dpdp_rules_pending.substantive_obligations_rules_3_5_16_22_23}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
