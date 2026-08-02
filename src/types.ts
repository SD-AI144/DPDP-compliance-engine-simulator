/**
 * Types for DPDP Compliance Decision Engine Console
 */

export type RequestType = "CONSENT_WITHDRAWAL" | "ERASURE_REQUEST";

export interface EntityClassification {
  is_reporting_entity: boolean;
  is_payment_system_operator: boolean;
  classification_source: string;
}

export interface CallerSuppliedOverride {
  is_reporting_entity?: boolean;
  is_payment_system_operator?: boolean;
  source?: string;
}

export interface RecordStatus {
  active_order_status: boolean;
  shared_pii_dependencies: string[];
}

export interface RetentionContext {
  company_books_of_account: boolean;
  gst_invoice_linked: boolean;
  transaction_date: string; // ISO format YYYY-MM-DD
  business_relationship_end_date: string | null; // ISO format YYYY-MM-DD or null
}

export interface DecisionEngineInput {
  request_type: RequestType;
  data_principal_id: string;
  record_type: string;
  entity_classification: EntityClassification;
  caller_supplied_override?: CallerSuppliedOverride | null;
  record_status: RecordStatus;
  retention_context: RetentionContext;
}

export interface TestCaseInput extends DecisionEngineInput {
  _test_case_id?: string;
  _expected_decision?: string;
  _expected_citation?: string;
  _expected_flag?: string;
  _note_for_qa?: string;
}

export type DecisionOutcome =
  | "ERASE"
  | "RETAIN"
  | "BLOCKED_ACTIVE_PROCESSING"
  | "ERASURE_BLOCKED_UNRESOLVED";

export type CitationBasis = "statute" | "engineering_decision";

export interface ControllingAuthority {
  primary_citation: string | null;
  basis: CitationBasis;
  overrides_erasure: boolean;
  // Other statutory retention duties that ALSO applied to this record, in
  // addition to the controlling (longest) one. A record can be caught by
  // more than one retention statute simultaneously (e.g. Companies Act AND
  // CGST) — the controlling one is whichever computes the latest expiry,
  // but the others still legally apply and should not be hidden.
  co_applicable_citations?: string[];
}

export interface RetentionIfApplicable {
  duration: string;
  expiry_date: string | null;
  clock_start_basis: string;
}

export interface SecurityRequirement {
  citation: string;
  measures: string[];
}

export interface DecisionFlags {
  parameter_integrity_warning: boolean;
  requires_legal_review: boolean;
  shared_pii_conflict_detected: boolean;
}

export interface RegimeStatus {
  simulation_label: "MAY_2027_READINESS_SIMULATION";
  dpdp_rules_in_force: string[];
  dpdp_rules_pending: {
    rule_4_consent_managers: string;
    substantive_obligations_rules_3_5_16_22_23: string;
  };
  disclaimer: string;
}

export interface DecisionEngineOutput {
  decision: DecisionOutcome;
  controlling_authority: ControllingAuthority;
  retention_if_applicable: RetentionIfApplicable | null;
  security_requirement: SecurityRequirement;
  flags: DecisionFlags;
  regime_status: RegimeStatus;
  // Metadata for graph tracing
  _execution_trace: {
    visited_node_ids: string[];
    active_edge_ids: string[];
    terminal_node_id: string;
    execution_time_ms: number;
    evaluation_logs: string[];
  };
}

export type NodeType = "statute" | "hybrid" | "engineering";

export interface GraphNode {
  id: string;
  label: string;
  subtitle: string;
  nodeType: NodeType;
  shape?: "rect" | "diamond";
  stepNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sectionCitation: string;
  title: string;
  // IMPORTANT: only put text here that is copy-paste verbatim from the bare
  // Act/Rules, per excerptType below. Never paraphrase into this field —
  // paraphrases belong in `rationale`.
  bareActExcerpt: string;
  // "verbatim": bareActExcerpt is an exact quote from the cited section(s).
  // "not_statutory": there is no statute text to quote — this node is an
  // engineering design choice, and bareActExcerpt says so explicitly rather
  // than inventing quote-like text.
  excerptType: "verbatim" | "not_statutory";
  rationale: string;
  statuteVSDiscretion: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: "yes" | "no" | "always" | "fallback";
}

export interface TestCasePreset {
  id: string;
  title: string;
  shortDesc: string;
  input: TestCaseInput;
}