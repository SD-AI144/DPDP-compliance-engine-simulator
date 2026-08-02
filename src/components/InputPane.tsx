import React, { useState } from "react";
import {
  DecisionEngineInput,
  RequestType,
  TestCasePreset,
} from "../types";
import { PRESET_TEST_CASES } from "../data/statutesAndNodes";
import {
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  Receipt,
  RotateCcw,
  AlertTriangle,
  Tag,
  Calendar,
  X,
  Plus,
} from "lucide-react";

interface InputPaneProps {
  input: DecisionEngineInput;
  onChangeInput: (newInput: DecisionEngineInput) => void;
  onRunDecision: () => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: TestCasePreset) => void;
}

export const InputPane: React.FC<InputPaneProps> = ({
  input,
  onChangeInput,
  onRunDecision,
  selectedPresetId,
  onSelectPreset,
}) => {
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newDependency, setNewDependency] = useState("");

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(input, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestTypeChange = (type: RequestType) => {
    onChangeInput({
      ...input,
      request_type: type,
    });
  };

  const handleToggleEntityClassification = (
    key: "is_reporting_entity" | "is_payment_system_operator"
  ) => {
    onChangeInput({
      ...input,
      entity_classification: {
        ...input.entity_classification,
        [key]: !input.entity_classification[key],
      },
    });
  };

  const handleToggleRetentionContext = (
    key: "company_books_of_account" | "gst_invoice_linked"
  ) => {
    onChangeInput({
      ...input,
      retention_context: {
        ...input.retention_context,
        [key]: !input.retention_context[key],
      },
    });
  };

  const handleToggleActiveOrder = () => {
    onChangeInput({
      ...input,
      record_status: {
        ...input.record_status,
        active_order_status: !input.record_status.active_order_status,
      },
    });
  };

  const handleAddDependency = () => {
    if (!newDependency.trim()) return;
    const trimmed = newDependency.trim().toLowerCase().replace(/\s+/g, "_");
    if (!input.record_status.shared_pii_dependencies.includes(trimmed)) {
      onChangeInput({
        ...input,
        record_status: {
          ...input.record_status,
          shared_pii_dependencies: [
            ...input.record_status.shared_pii_dependencies,
            trimmed,
          ],
        },
      });
    }
    setNewDependency("");
  };

  const handleRemoveDependency = (dep: string) => {
    onChangeInput({
      ...input,
      record_status: {
        ...input.record_status,
        shared_pii_dependencies: input.record_status.shared_pii_dependencies.filter(
          (d) => d !== dep
        ),
      },
    });
  };

  // Record age threshold helper
  const calculateYearsAgo = (dateStr: string) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const now = new Date("2026-07-23");
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleAgeSliderChange = (years: number) => {
    const currentYear = 2026;
    const targetYear = currentYear - years;
    const newTxDate = `${targetYear}-01-15`;
    onChangeInput({
      ...input,
      retention_context: {
        ...input.retention_context,
        transaction_date: newTxDate,
      },
    });
  };

  const currentYearsAgo = calculateYearsAgo(
    input.retention_context.transaction_date
  );

  const handleToggleCallerSpoofing = () => {
    if (input.caller_supplied_override) {
      // Remove override
      const { caller_supplied_override, ...rest } = input;
      onChangeInput(rest);
    } else {
      // Inject untrusted override
      onChangeInput({
        ...input,
        caller_supplied_override: {
          is_reporting_entity: false,
          is_payment_system_operator: false,
          source: "client_request_payload_untrusted",
        },
      });
    }
  };

  return (
    <div className="w-full lg:w-[32%] shrink-0 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-60px)]">
      {/* Test Case Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Preset Simulation Test Cases</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">5 QA Scenarios</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESET_TEST_CASES.map((tc) => {
            const isSelected = selectedPresetId === tc.id;
            return (
              <button
                key={tc.id}
                onClick={() => onSelectPreset(tc)}
                className={`text-left p-2 rounded-md text-xs transition-all border ${
                  isSelected
                    ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/30"
                    : "bg-slate-850/60 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>{tc.title}</span>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-800/80 text-emerald-200 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {tc.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* Form Controls Header */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          Request Parameters
        </h2>

        {/* Data Principal & Record Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Data Principal ID
            </label>
            <input
              type="text"
              value={input.data_principal_id}
              onChange={(e) =>
                onChangeInput({ ...input, data_principal_id: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Record Type
            </label>
            <input
              type="text"
              value={input.record_type}
              onChange={(e) =>
                onChangeInput({ ...input, record_type: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Request Type Dropdown */}
        <div>
          <label className="text-[11px] font-medium text-slate-300 block mb-1">
            Request Type (DPDP Trigger)
          </label>
          <select
            value={input.request_type}
            onChange={(e) => handleRequestTypeChange(e.target.value as RequestType)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ERASURE_REQUEST">ERASURE_REQUEST (Sec 12(3) Duty)</option>
            <option value="CONSENT_WITHDRAWAL">CONSENT_WITHDRAWAL (Sec 6(4) Trigger)</option>
          </select>
        </div>

        {/* Server-Side Entity Classification Toggles */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-slate-300 block">
            Server Entity Classification (PMLA Sector Laws)
          </label>
          <div className="space-y-1.5">
            <label className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={input.entity_classification.is_reporting_entity}
                onChange={() => handleToggleEntityClassification("is_reporting_entity")}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold block text-slate-200">
                  Is Reporting Entity (PMLA Sec 2(1)(wa))
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Mandatory 5-yr retention under PMLA Sec 12(3)
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={input.entity_classification.is_payment_system_operator}
                onChange={() =>
                  handleToggleEntityClassification("is_payment_system_operator")
                }
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold block text-slate-200">
                  Is Payment System Operator (PMLA Sec 2(1)(l))
                </span>
                <span className="text-[10px] text-slate-400 block">
                  RBI licensed PSO / wallet payment provider
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Statutory Books & Tax Linked Toggles */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-slate-300 block">
            Accounting & Tax Retention Basis
          </label>
          <div className="space-y-1.5">
            <label className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={input.retention_context.company_books_of_account}
                onChange={() => handleToggleRetentionContext("company_books_of_account")}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Company Books of Account</span>
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Companies Act Sec 128(5) — Retain 8 financial years
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={input.retention_context.gst_invoice_linked}
                onChange={() => handleToggleRetentionContext("gst_invoice_linked")}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">GST Invoice Linked</span>
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  CGST Act Sec 36 — Retain 72 months (6 yrs)
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Operational Status Toggle */}
        <div>
          <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs text-slate-200">
            <div>
              <span className="font-semibold block text-slate-200">
                Active Order / Fulfillment Status
              </span>
              <span className="text-[10px] text-slate-400 block">
                Sec 6(5)-(6) Active processing gate
              </span>
            </div>
            <input
              type="checkbox"
              checked={input.record_status.active_order_status}
              onChange={handleToggleActiveOrder}
              className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
            />
          </label>
        </div>

        {/* Shared PII Dependencies Multi-Tag */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
            <span>Shared PII Cross-Record Dependencies</span>
            <span className="text-[10px] font-mono text-slate-400">
              {input.record_status.shared_pii_dependencies.length} tags
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded min-h-[38px]">
            {input.record_status.shared_pii_dependencies.map((dep) => (
              <span
                key={dep}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono"
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{dep}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDependency(dep)}
                  className="hover:text-red-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {input.record_status.shared_pii_dependencies.length === 0 && (
              <span className="text-[11px] text-slate-400 italic">None specified</span>
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. active_subscription_record"
              value={newDependency}
              onChange={(e) => setNewDependency(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDependency())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddDependency}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 font-mono"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>

        {/* Record Age Slider with Legally Meaningful Threshold Ticks */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Record Age (Transaction Date)</span>
            </label>
            <span className="font-mono text-emerald-400 font-semibold text-xs">
              {currentYearsAgo} years ago ({input.retention_context.transaction_date})
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={currentYearsAgo}
            onChange={(e) => handleAgeSliderChange(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          {/* Ticks at 1, 5, 6, 8 years */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span className={currentYearsAgo === 0 ? "text-emerald-400 font-bold" : ""}>0y</span>
            <span className={currentYearsAgo === 1 ? "text-emerald-400 font-bold" : ""}>1y</span>
            <span className={currentYearsAgo === 5 ? "text-emerald-400 font-bold" : ""} title="PMLA 5y">
              5y (PMLA)
            </span>
            <span className={currentYearsAgo === 6 ? "text-emerald-400 font-bold" : ""} title="GST 6y">
              6y (GST)
            </span>
            <span className={currentYearsAgo === 8 ? "text-emerald-400 font-bold" : ""} title="Companies 8y">
              8y (Co. Act)
            </span>
            <span className={currentYearsAgo === 10 ? "text-emerald-400 font-bold" : ""}>10y</span>
          </div>
        </div>

        {/* Client-Side Injected Payload Spoofing Simulation Toggle */}
        <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Caller Payload Injection (TC-05)</span>
            </span>
            <input
              type="checkbox"
              checked={!!input.caller_supplied_override}
              onChange={handleToggleCallerSpoofing}
              className="rounded border-amber-700 bg-amber-950 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
          </div>
          <p className="text-[11px] text-amber-200/80">
            Injects untrusted caller parameter overrides. Engine will discard caller claims and fail closed to ERASURE_BLOCKED_UNRESOLVED.
          </p>
        </div>

        {/* Run Decision Button */}
        <button
          onClick={onRunDecision}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-md shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN DETERMINISTIC DECISION ENGINE</span>
        </button>

        {/* Collapsible Current Input Payload JSON Preview */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="w-full text-left text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between py-1 border-t border-slate-800"
          >
            <span className="font-mono text-[11px]">Current Input Payload JSON</span>
            {showJsonPreview ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {showJsonPreview && (
            <div className="mt-2 relative">
              <button
                onClick={handleCopyJson}
                className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[10px] flex items-center gap-1 z-10 font-mono"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(input, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
