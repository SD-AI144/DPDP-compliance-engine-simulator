import React from "react";
import { DecisionEngineOutput, GraphNode } from "../types";
import {
  GRAPH_NODES,
  GRAPH_EDGES,
  LEGEND_ITEMS,
} from "../data/statutesAndNodes";
import {
  Gavel,
  Shield,
  Code,
  Layers,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Sparkles,
} from "lucide-react";

interface DecisionGraphCanvasProps {
  output: DecisionEngineOutput | null;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
}

export const DecisionGraphCanvas: React.FC<DecisionGraphCanvasProps> = ({
  output,
  selectedNodeId,
  onSelectNode,
}) => {
  const visitedNodeIds = output?._execution_trace.visited_node_ids || [];
  const activeEdgeIds = output?._execution_trace.active_edge_ids || [];

  const getNodeIcon = (node: GraphNode) => {
    switch (node.nodeType) {
      case "statute":
        return <Gavel className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "hybrid":
        return <Scale className="w-4 h-4 text-amber-400 shrink-0" />;
      case "engineering":
      default:
        return <Code className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getNodeColors = (node: GraphNode, isVisited: boolean, isSelected: boolean) => {
    let baseBorder = "border-slate-800";
    let baseBg = "bg-slate-900";
    let textColor = "text-slate-300";
    let accentBadge = "bg-slate-800 text-slate-400";

    if (node.nodeType === "statute") {
      baseBorder = isVisited
        ? "border-emerald-500 shadow-emerald-950/80 shadow-lg ring-2 ring-emerald-500/40"
        : "border-emerald-900/60";
      baseBg = isVisited ? "bg-emerald-950/90" : "bg-slate-900/90";
      textColor = isVisited ? "text-emerald-200" : "text-slate-300";
      accentBadge = "bg-emerald-900/80 text-emerald-300 border border-emerald-700/60";
    } else if (node.nodeType === "hybrid") {
      baseBorder = isVisited
        ? "border-amber-500 shadow-amber-950/80 shadow-lg ring-2 ring-amber-500/40"
        : "border-amber-900/60";
      baseBg = isVisited ? "bg-amber-950/90" : "bg-slate-900/90";
      textColor = isVisited ? "text-amber-200" : "text-slate-300";
      accentBadge = "bg-amber-900/80 text-amber-300 border border-amber-700/60";
    } else if (node.nodeType === "engineering") {
      baseBorder = isVisited
        ? "border-blue-500 shadow-blue-950/80 shadow-lg ring-2 ring-blue-500/40"
        : "border-blue-900/60";
      baseBg = isVisited ? "bg-blue-950/90" : "bg-slate-900/90";
      textColor = isVisited ? "text-blue-200" : "text-slate-300";
      accentBadge = "bg-blue-900/80 text-blue-300 border border-blue-700/60";
    }

    if (isSelected) {
      baseBorder += " ring-4 ring-white/60 border-white";
    }

    return { baseBorder, baseBg, textColor, accentBadge };
  };

  return (
    <div className="w-full bg-slate-950 rounded-lg border border-slate-800 p-4 relative flex flex-col justify-between select-none shrink-0">
      {/* Top Canvas Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Interactive Decision Tree Graph (8 Evaluation Nodes)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Click any node to inspect bare act excerpts & statutory rationale
        </span>
      </div>

      {/* Bounded Scrollable Viewport for Graph Canvas */}
      <div className="w-full flex-1 overflow-auto bg-slate-950/60 rounded-md border border-slate-900 p-2 my-1 relative max-h-[620px] min-h-[460px] custom-scrollbar">
        {/* SVG Canvas for Edges + Absolute HTML Overlay for Nodes */}
        <div className="relative w-[700px] h-[860px] mx-auto">
          {/* SVG Edge Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
          <defs>
            <marker
              id="arrowhead-normal"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#475569" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="10"
              markerHeight="8"
              refX="8"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill="#10b981" />
            </marker>
          </defs>

          {/* Render Graph Edges */}
          {GRAPH_EDGES.map((edge) => {
            const sourceNode = GRAPH_NODES.find((n) => n.id === edge.source);
            const targetNode = GRAPH_NODES.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            const isActive = activeEdgeIds.includes(edge.id);

            const x1 = sourceNode.x + sourceNode.width / 2;
            const y1 = sourceNode.y + sourceNode.height;
            const x2 = targetNode.x + targetNode.width / 2;
            const y2 = targetNode.y;

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? "#10b981" : "#334155"}
                  strokeWidth={isActive ? "3" : "1.5"}
                  strokeDasharray={isActive ? "none" : "4 2"}
                  markerEnd={
                    isActive ? "url(#arrowhead-active)" : "url(#arrowhead-normal)"
                  }
                  className="transition-all duration-300"
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2 + 8}
                    y={(y1 + y2) / 2}
                    fill={isActive ? "#34d399" : "#64748b"}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isActive ? "bold" : "normal"}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Graph Nodes */}
        {GRAPH_NODES.map((node) => {
          const isVisited = visitedNodeIds.includes(node.id);
          const isSelected = selectedNodeId === node.id;
          const { baseBorder, baseBg, textColor, accentBadge } = getNodeColors(
            node,
            isVisited,
            isSelected
          );

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
              className={`absolute cursor-pointer transition-all duration-200 rounded-lg p-2.5 flex flex-col justify-between border ${baseBorder} ${baseBg} hover:border-slate-400 group shadow-md hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getNodeIcon(node)}
                  <span
                    className={`font-mono font-bold text-xs truncate ${textColor}`}
                  >
                    {node.label}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${accentBadge}`}
                >
                  {node.nodeType}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span className="truncate">{node.subtitle}</span>
                {isVisited && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800">
                    EXECTD
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Graph Legend (Always visible bottom-left matching prompt §3) */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-900/80 p-3 rounded-md shrink-0">
        <div className="font-mono font-bold text-slate-300 text-xs flex items-center gap-1.5 shrink-0">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Node Category Legend:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 w-full">
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.type}
              className="flex items-start gap-2 p-1.5 rounded bg-slate-950/90 border border-slate-800"
            >
              <div
                className="w-3 h-3 rounded-full mt-0.5 shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <span
                  className="font-mono font-semibold text-[11px] block"
                  style={{ color: item.color }}
                >
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight block">
                  {item.meaning}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
