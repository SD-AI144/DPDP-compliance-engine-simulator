import React, { useEffect } from "react";
import { GraphNode } from "../types";
import { LEGEND_ITEMS } from "../data/statutesAndNodes";
import { X, BookOpen, Scale, Shield, Code, Gavel, ExternalLink } from "lucide-react";

interface CitationDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  node,
  onClose,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const legendInfo = LEGEND_ITEMS.find((item) => item.type === node.nodeType);

  const getNodeIcon = () => {
    switch (node.nodeType) {
      case "statute":
        return <Gavel className="w-5 h-5 text-emerald-400" />;
      case "hybrid":
        return <Scale className="w-5 h-5 text-amber-400" />;
      case "engineering":
      default:
        return <Code className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      {/* Outside click area */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content */}
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Top Bar with close button */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                {getNodeIcon()}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Node Inspector · Step {node.stepNumber}
                </span>
                <h2 className="text-base font-bold text-white font-mono leading-tight">
                  {node.label}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Citation Header */}
          <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-md border border-slate-800">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Controlling Citation</span>
            </span>
            <p className="text-sm font-mono font-semibold text-slate-100">
              {node.sectionCitation}
            </p>
            <p className="text-xs text-slate-300 font-medium">{node.title}</p>
          </div>

          {/* 2. Bare Act Excerpt (Quoted block) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Bare Act Operative Excerpt
            </label>
            <blockquote className="p-4 rounded-r-md bg-slate-950 border-l-4 border-emerald-500 font-serif text-slate-200 text-xs italic leading-relaxed shadow-inner">
              {node.bareActExcerpt}
            </blockquote>
          </div>

          {/* 3. Rationale */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Compliance Decision Rationale
            </label>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-850 p-3 rounded-md border border-slate-800">
              {node.rationale}
            </p>
          </div>

          {/* Statute vs Engineering Distinction */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Statute vs Engineering Discretion Analysis
            </label>
            <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-md border border-slate-800 leading-relaxed">
              {node.statuteVSDiscretion}
            </p>
          </div>

          {/* 4. Node Type Tag */}
          {legendInfo && (
            <div
              className="p-3 rounded-md border flex items-center gap-3"
              style={{
                backgroundColor: legendInfo.bgColor,
                borderColor: legendInfo.borderColor,
              }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: legendInfo.color }}
              />
              <div>
                <span
                  className="font-mono font-bold text-xs block"
                  style={{ color: legendInfo.color }}
                >
                  {legendInfo.label}
                </span>
                <span className="text-[11px] text-slate-700 font-sans block mt-0.5">
                  {legendInfo.meaning}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>DPDP Act 2023 · Sec 5, 6, 8, 12</span>
          <span>May 2027 Readiness</span>
        </div>
      </div>
    </div>
  );
};
