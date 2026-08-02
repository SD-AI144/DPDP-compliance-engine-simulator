import React, { useState, useEffect } from "react";
import {
  DecisionEngineInput,
  DecisionEngineOutput,
  GraphNode,
  TestCasePreset,
} from "./types";
import { PRESET_TEST_CASES } from "./data/statutesAndNodes";
import { evaluateDPDPCompliance } from "./engine/dpdpEngine";
import { HeaderBar } from "./components/HeaderBar";
import { InputPane } from "./components/InputPane";
import { ExecutionSummaryStrip } from "./components/ExecutionSummaryStrip";
import { DecisionGraphCanvas } from "./components/DecisionGraphCanvas";
import { CitationDrawer } from "./components/CitationDrawer";
import { ExportBar } from "./components/ExportBar";
import { RegimeModal } from "./components/RegimeModal";

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("TC-01");
  const [input, setInput] = useState<DecisionEngineInput>(
    PRESET_TEST_CASES[0].input
  );
  const [output, setOutput] = useState<DecisionEngineOutput | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isRegimeModalOpen, setIsRegimeModalOpen] = useState(false);

  // Run evaluation whenever input or decision button is clicked
  const handleRunDecision = () => {
    const result = evaluateDPDPCompliance(input);
    setOutput(result);
  };

  // Initial evaluation on mount & preset load
  useEffect(() => {
    handleRunDecision();
  }, []);

  const handleSelectPreset = (preset: TestCasePreset) => {
    setSelectedPresetId(preset.id);
    setInput(preset.input);
    const result = evaluateDPDPCompliance(preset.input);
    setOutput(result);
  };

  const handleInputChange = (newInput: DecisionEngineInput) => {
    setInput(newInput);
    setSelectedPresetId(null); // Custom tweaking
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header Bar with immutable MAY_2027_READINESS_SIMULATION badge */}
      <HeaderBar onOpenRegimeModal={() => setIsRegimeModalOpen(true)} />

      {/* Dual Pane Main Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane - Input Controls & Presets (~32%) */}
        <InputPane
          input={input}
          onChangeInput={handleInputChange}
          onRunDecision={handleRunDecision}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* Right Pane - Decision Graph & Execution Summary (~68%) */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-60px)]">
          {/* Top Execution Summary Strip */}
          <ExecutionSummaryStrip output={output} />

          {/* Decision Graph Canvas */}
          <DecisionGraphCanvas
            output={output}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        </div>
      </main>

      {/* Fixed Export Bar Footer */}
      <ExportBar output={output} />

      {/* Slide-out Citation Drawer */}
      <CitationDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Rules Timeline Modal */}
      <RegimeModal
        isOpen={isRegimeModalOpen}
        onClose={() => setIsRegimeModalOpen(false)}
      />
    </div>
  );
}
