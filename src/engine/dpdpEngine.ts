import {
  DecisionEngineInput,
  DecisionEngineOutput,
  RegimeStatus,
} from "../types";

export const MANDATORY_REGIME_STATUS: RegimeStatus = {
  simulation_label: "MAY_2027_READINESS_SIMULATION",
  dpdp_rules_in_force: ["Rule 1", "Rule 2", "Rules 17-21"],
  dpdp_rules_pending: {
    rule_4_consent_managers: "2026-11-13",
    substantive_obligations_rules_3_5_16_22_23: "2027-05-14",
  },
  disclaimer:
    "This response simulates DPDP compliance logic ahead of the 14 May 2027 commencement of substantive obligations. It is not a determination of current enforceable law.",
};

// -----------------------------------------------------------------------------
// DATE HELPERS
// -----------------------------------------------------------------------------
// Real Date-object arithmetic (not string concatenation) so leap-day edge
// cases (e.g. Feb 29 + 5 years landing on a non-leap year) normalise the way
// a calendar actually would, instead of producing an invalid date string.
function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

// Indian financial year runs 1 April to 31 March. A transaction in
// Jan-Mar belongs to the FY that STARTED the previous April; a transaction
// in Apr-Dec belongs to the FY that started that same April and ends the
// following March. Returns the calendar year in which that FY's 31 March
// falls.
function indianFYEndYear(dateStr: string): number {
  const [yearStr, monthStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  return month >= 4 ? year + 1 : year;
}

/**
 * PMLA Sec 12(3)/(4): two independent clocks can apply to the same record —
 * 5 years from the transaction date (12(3)), and 5 years after the business
 * relationship ended (12(4)) if that date is known. Whichever computes LATER
 * is the one actually controlling; the earlier one doesn't get to shorten it.
 */
function computePmlaRetention(
  transactionDate: string,
  relationshipEndDate: string | null
): { expiry: string; clockBasis: string } {
  const txnExpiry = addYears(transactionDate, 5);
  if (!relationshipEndDate) {
    return {
      expiry: txnExpiry,
      clockBasis:
        "PMLA Sec 12(3): 5 years from transaction date (no business-relationship-end date supplied, so only this clock is available)",
    };
  }
  const idExpiry = addYears(relationshipEndDate, 5);
  if (idExpiry >= txnExpiry) {
    return {
      expiry: idExpiry,
      clockBasis:
        "PMLA Sec 12(4): 5 years after business relationship ended — this clock runs later than the Sec 12(3) transaction-date clock, so it controls",
    };
  }
  return {
    expiry: txnExpiry,
    clockBasis:
      "PMLA Sec 12(3): 5 years from transaction date — this clock runs later than the Sec 12(4) relationship-end clock, so it controls",
  };
}

function companiesActExpiry(transactionDate: string): string {
  const fyEnd = indianFYEndYear(transactionDate);
  return `${fyEnd + 8}-03-31`;
}

function cgstExpiry(transactionDate: string): string {
  // Approximation: GST annual-return due date defaults to 31 December
  // following the relevant financial year's close. Government notifications
  // extend this most years — verify the actual notified due date for the
  // year in question before treating this as authoritative.
  const fyEnd = indianFYEndYear(transactionDate);
  return `${fyEnd + 6}-12-31`;
}

interface RetentionCandidate {
  citation: string;
  duration: string;
  expiry: string;
  clockBasis: string;
}

/**
 * Deterministic Decision Engine for DPDP Compliance
 */
export function evaluateDPDPCompliance(
  input: DecisionEngineInput
): DecisionEngineOutput {
  const startTime = performance.now();
  const visitedNodes: string[] = [];
  const activeEdges: string[] = [];
  const logs: string[] = [];

  const logStep = (nodeId: string, message: string) => {
    visitedNodes.push(nodeId);
    logs.push(`[${nodeId}] ${message}`);
  };

  // Step 0: Server-Side Parameter Integrity Gate
  logStep(
    "step_0_integrity",
    "Checking server-side parameter integrity and payload authorization."
  );

  if (
    input.caller_supplied_override &&
    Object.keys(input.caller_supplied_override).length > 0
  ) {
    logs.push(
      "[step_0_integrity] PARAMETER INTEGRITY WARNING: caller_supplied_override field present in payload — rejecting regardless of its values, not comparing against server truth."
    );
    logs.push(
      "[step_0_integrity] Failing closed to ERASURE_BLOCKED_UNRESOLVED per engineering principle (not statute) — see statutesAndNodes.ts step_0."
    );

    const endTime = performance.now();
    return {
      decision: "ERASURE_BLOCKED_UNRESOLVED",
      controlling_authority: {
        primary_citation: null,
        basis: "engineering_decision",
        overrides_erasure: true,
      },
      retention_if_applicable: null,
      security_requirement: {
        citation: "Sec 8(5) DPDP / Rule 6(1)(a)",
        measures: ["encryption", "obfuscation", "masking", "virtual_tokens"],
      },
      flags: {
        parameter_integrity_warning: true,
        requires_legal_review: true,
        shared_pii_conflict_detected: false,
      },
      regime_status: MANDATORY_REGIME_STATUS,
      _execution_trace: {
        visited_node_ids: ["step_0_integrity"],
        active_edge_ids: [],
        terminal_node_id: "step_0_integrity",
        execution_time_ms: Math.round((endTime - startTime) * 100) / 100,
        evaluation_logs: logs,
      },
    };
  }

  activeEdges.push("edge_0_to_1");

  // Step 1: Trigger Check
  logStep(
    "step_1_trigger",
    `Evaluated request_type: ${input.request_type}. Sec 6(4) withdrawal or Sec 12(3) erasure request.`
  );
  activeEdges.push("edge_1_to_2");

  // Step 2: Active Processing Gate — Sec 6(5)/(6)
  logStep("step_2_active", "Checking active order / operational process gate.");
  if (input.record_status.active_order_status === true) {
    logs.push(
      "[step_2_active] active_order_status == true. Immediate erasure blocked — Sec 6(5)/(6): withdrawal does not affect legality of processing already underway, and the Fiduciary gets a reasonable time to wind down."
    );
    activeEdges.push("edge_2_to_5");
    logStep("step_5_security", "Applying mandatory Sec 8(5) safeguards to active order data.");
    activeEdges.push("edge_5_to_6");
    logStep("step_6_notice", "Notice obligation referenced under DPDP Sec 5.");
    activeEdges.push("edge_6_to_7");
    logStep("step_7_output", "Finalizing BLOCKED_ACTIVE_PROCESSING output.");

    const endTime = performance.now();
    return {
      decision: "BLOCKED_ACTIVE_PROCESSING",
      controlling_authority: {
        primary_citation: "DPDP Sec 6(5)-(6)",
        basis: "statute",
        overrides_erasure: true,
      },
      retention_if_applicable: null,
      security_requirement: {
        citation: "Sec 8(5) DPDP / Rule 6(1)(a)",
        measures: ["encryption", "obfuscation", "masking", "virtual_tokens"],
      },
      flags: {
        parameter_integrity_warning: false,
        requires_legal_review: false,
        shared_pii_conflict_detected:
          input.record_status.shared_pii_dependencies.length > 0,
      },
      regime_status: MANDATORY_REGIME_STATUS,
      _execution_trace: {
        visited_node_ids: visitedNodes,
        active_edge_ids: activeEdges,
        terminal_node_id: "step_2_active",
        execution_time_ms: Math.round((endTime - startTime) * 100) / 100,
        evaluation_logs: logs,
      },
    };
  }

  activeEdges.push("edge_2_to_3");

  // Step 3: Shared-PII Isolation Check
  // FIXED: no longer guesses based on whether the dependency's name string
  // happens to contain "active" or "live". ANY listed dependency blocks —
  // if it's in the array at all, treat it as something that still needs
  // this identity data, full stop. A dependency that's actually closed out
  // should be removed from the array by the caller, not left in and
  // pattern-matched against its name.
  logStep(
    "step_3_pii_isolation",
    `Checking shared PII dependencies: [${input.record_status.shared_pii_dependencies.join(", ")}].`
  );

  const hasSharedPiiDependencies =
    input.record_status.shared_pii_dependencies.length > 0;

  if (hasSharedPiiDependencies) {
    logs.push(
      `[step_3_pii_isolation] Conflict detected: ${input.record_status.shared_pii_dependencies.length} other record(s) still depend on the shared identity block. Blocking regardless of dependency name.`
    );
    activeEdges.push("edge_3_to_5");
    logStep("step_5_security", "Applying Sec 8(5) isolation safeguards to shared PII block.");
    activeEdges.push("edge_5_to_6");
    logStep("step_6_notice", "Notice obligation referenced under Sec 5.");
    activeEdges.push("edge_6_to_7");
    logStep("step_7_output", "Finalizing BLOCKED_ACTIVE_PROCESSING (Shared PII Conflict).");

    const endTime = performance.now();
    return {
      decision: "BLOCKED_ACTIVE_PROCESSING",
      controlling_authority: {
        primary_citation: "DPDP Sec 8(7) / Sec 12(3) (Shared PII Isolation — mechanism is an engineering call, not a cited rule)",
        basis: "engineering_decision",
        overrides_erasure: true,
      },
      retention_if_applicable: null,
      security_requirement: {
        citation: "Sec 8(5) DPDP / Rule 6(1)(a)",
        measures: ["encryption", "obfuscation", "masking", "virtual_tokens"],
      },
      flags: {
        parameter_integrity_warning: false,
        requires_legal_review: true,
        shared_pii_conflict_detected: true,
      },
      regime_status: MANDATORY_REGIME_STATUS,
      _execution_trace: {
        visited_node_ids: visitedNodes,
        active_edge_ids: activeEdges,
        terminal_node_id: "step_3_pii_isolation",
        execution_time_ms: Math.round((endTime - startTime) * 100) / 100,
        evaluation_logs: logs,
      },
    };
  }

  activeEdges.push("edge_3_to_4");

  // Step 4: Statutory Overrides Check — FIXED to stack multiple applicable
  // retention duties instead of returning on the first one matched. A
  // single record can be a Companies Act book entry AND a GST invoice AND
  // (if the entity qualifies) a PMLA record all at once. Compute every
  // applicable clock, let the one with the LATEST expiry control, and
  // disclose the rest rather than silently dropping them.
  logStep(
    "step_4_override",
    "Evaluating statutory retention overrides: PMLA, Companies Act, CGST Act."
  );

  const { is_reporting_entity, is_payment_system_operator } = input.entity_classification;
  const {
    company_books_of_account,
    gst_invoice_linked,
    transaction_date,
    business_relationship_end_date,
  } = input.retention_context;

  const candidates: RetentionCandidate[] = [];

  if (is_reporting_entity || is_payment_system_operator) {
    const pmla = computePmlaRetention(transaction_date, business_relationship_end_date);
    logs.push(
      `[step_4_override] Entity is ${is_reporting_entity ? "a Reporting Entity" : ""}${
        is_reporting_entity && is_payment_system_operator ? " and " : ""
      }${is_payment_system_operator ? "a Payment System Operator" : ""} — PMLA Sec 12(3)/(4) applies.`
    );
    candidates.push({
      citation: "PMLA 2002 Sec 12(3)/(4)",
      duration: "5 years from transaction date, or 5 years after business relationship ended (whichever is later)",
      expiry: pmla.expiry,
      clockBasis: pmla.clockBasis,
    });
  }

  if (company_books_of_account) {
    logs.push("[step_4_override] Record is a company books-of-account entry — Companies Act Sec 128(5) applies.");
    candidates.push({
      citation: "Companies Act 2013 Sec 128(5)",
      duration: "8 financial years immediately preceding the current financial year",
      expiry: companiesActExpiry(transaction_date),
      clockBasis: "8 financial years from the FY (1 Apr - 31 Mar) in which the transaction falls",
    });
  }

  if (gst_invoice_linked) {
    logs.push("[step_4_override] Record is GST-invoice-linked — CGST Act Sec 36 applies.");
    candidates.push({
      citation: "CGST Act 2017 Sec 36",
      duration: "72 months (6 years) from due date of annual return",
      expiry: cgstExpiry(transaction_date),
      clockBasis:
        "72 months from the approximate annual-return due date for the relevant FY (verify against any government-notified extension for that year)",
    });
  }

  if (candidates.length > 0) {
    const controlling = candidates.reduce((latest, c) => (c.expiry > latest.expiry ? c : latest));
    const coApplicable = candidates
      .filter((c) => c.citation !== controlling.citation)
      .map((c) => c.citation);

    if (coApplicable.length > 0) {
      logs.push(
        `[step_4_override] ${candidates.length} statutory retention duties apply simultaneously. Controlling (latest expiry): ${controlling.citation}. Also applicable: ${coApplicable.join(", ")}.`
      );
    }

    activeEdges.push("edge_4_to_5");
    logStep("step_5_security", "Applying Sec 8(5) safeguards to retained records.");
    activeEdges.push("edge_5_to_6");
    logStep("step_6_notice", "Notice obligation referenced under Sec 5.");
    activeEdges.push("edge_6_to_7");
    logStep("step_7_output", `Finalizing RETAIN decision. Controlling authority: ${controlling.citation}.`);

    const endTime = performance.now();
    return {
      decision: "RETAIN",
      controlling_authority: {
        primary_citation: controlling.citation,
        basis: "statute",
        overrides_erasure: true,
        co_applicable_citations: coApplicable.length > 0 ? coApplicable : undefined,
      },
      retention_if_applicable: {
        duration: controlling.duration,
        expiry_date: controlling.expiry,
        clock_start_basis: controlling.clockBasis,
      },
      security_requirement: {
        citation: "Sec 8(5) DPDP / Rule 6(1)(a)",
        measures: ["encryption", "obfuscation", "masking", "virtual_tokens"],
      },
      flags: {
        parameter_integrity_warning: false,
        requires_legal_review: false,
        shared_pii_conflict_detected: hasSharedPiiDependencies,
      },
      regime_status: MANDATORY_REGIME_STATUS,
      _execution_trace: {
        visited_node_ids: visitedNodes,
        active_edge_ids: activeEdges,
        terminal_node_id: "step_4_override",
        execution_time_ms: Math.round((endTime - startTime) * 100) / 100,
        evaluation_logs: logs,
      },
    };
  }

  // Step 5, 6, 7: Default Erasure Allowed — no statutory override applies
  logs.push(
    "[step_4_override] No statutory retention overrides apply. Default erasure duty under DPDP Sec 8(7) / 12(3) invoked."
  );
  activeEdges.push("edge_4_to_5");
  logStep("step_5_security", "Confirming secure deletion standards for un-retained personal data.");
  activeEdges.push("edge_5_to_6");
  logStep("step_6_notice", "Referencing Data Principal notice history under Sec 5.");
  activeEdges.push("edge_6_to_7");
  logStep("step_7_output", "Finalizing ERASE decision output.");

  const endTime = performance.now();
  return {
    decision: "ERASE",
    controlling_authority: {
      primary_citation: "DPDP Act 2023 Sec 8(7) / Sec 12(3)",
      basis: "statute",
      overrides_erasure: false,
    },
    retention_if_applicable: null,
    security_requirement: {
      citation: "Sec 8(5) DPDP / Rule 6(1)(a)",
      measures: ["secure_deletion", "cryptographic_erasure", "zeroization"],
    },
    flags: {
      parameter_integrity_warning: false,
      requires_legal_review: false,
      shared_pii_conflict_detected: hasSharedPiiDependencies,
    },
    regime_status: MANDATORY_REGIME_STATUS,
    _execution_trace: {
      visited_node_ids: visitedNodes,
      active_edge_ids: activeEdges,
      terminal_node_id: "step_7_output",
      execution_time_ms: Math.round((endTime - startTime) * 100) / 100,
      evaluation_logs: logs,
    },
  };
}