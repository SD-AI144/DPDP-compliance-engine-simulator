import { GraphEdge, GraphNode, TestCasePreset } from "../types";

export const LEGEND_ITEMS = [
  {
    type: "statute" as const,
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#86efac",
    label: "Statute-Backed (Green)",
    meaning:
      "Directly compelled by a specific cited section — no engineering discretion involved.",
  },
  {
    type: "hybrid" as const,
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    label: "Hybrid Legal + Eng (Amber)",
    meaning:
      "Statute mandates the required outcome, but the specific mechanism (e.g. a boolean flag standing in for a 'reasonable time' standard) is an implementation design choice.",
  },
  {
    type: "engineering" as const,
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    label: "Pure Engineering (Blue)",
    meaning:
      "Design decision made in the absence of any explicit statutory mandate. No section is cited as the source of the mechanism itself.",
  },
];

export const GRAPH_NODES: GraphNode[] = [
  {
    id: "step_0_integrity",
    label: "Step 0: Integrity Gate",
    subtitle: "Server Parameter Authority",
    nodeType: "engineering",
    shape: "diamond",
    stepNumber: 0,
    x: 320,
    y: 40,
    width: 220,
    height: 70,
    sectionCitation: "No statutory citation — engineering principle",
    title: "Caller Spoofing & Parameter Integrity Gate",
    excerptType: "not_statutory",
    bareActExcerpt:
      "[Not statutory text — there is no DPDP provision addressing API request design.] " +
      "This is our own engineering rule for this project: any parameter that determines a " +
      "legal outcome (entity classification, record status, retention basis) must be read " +
      "from stored/server-side records, never from values supplied in the caller's request " +
      "payload. An unrecognised or caller-supplied override is treated as untrustworthy and " +
      "the engine fails closed.",
    rationale:
      "Prevents a caller from asserting its own regulatory status (e.g. claiming 'not a PMLA " +
      "reporting entity') to force an outcome. Any attempt to include an override field at all " +
      "is treated as suspicious and blocks the request, regardless of what value it carries.",
    statuteVSDiscretion:
      "Pure Engineering: zero-trust parameter validation. No section of the DPDP Act requires " +
      "this design — it's good practice adopted to prevent a specific abuse case.",
  },
  {
    id: "step_1_trigger",
    label: "Step 1: Request Trigger",
    subtitle: "Withdrawal vs Erasure",
    nodeType: "statute",
    shape: "rect",
    stepNumber: 1,
    x: 320,
    y: 150,
    width: 220,
    height: 65,
    sectionCitation: "DPDP Act 2023, Sec 6(4), 6(5), 6(6)",
    title: "Consent Withdrawal & Erasure Trigger Evaluation",
    excerptType: "verbatim",
    bareActExcerpt:
      "Sec 6(4): \"Where consent given by the Data Principal is the basis of processing of " +
      "personal data, such Data Principal shall have the right to withdraw her consent at any " +
      "time, with the ease of doing so being comparable to the ease with which such consent " +
      "was given.\"\n\n" +
      "Sec 6(5): \"The consequences of the withdrawal referred to in sub-section (4) shall be " +
      "borne by the Data Principal, and such withdrawal shall not affect the legality of " +
      "processing of the personal data based on consent before its withdrawal.\"\n\n" +
      "Sec 6(6): \"If a Data Principal withdraws her consent to the processing of personal data " +
      "under sub-section (5), the Data Fiduciary shall, within a reasonable time, cease and " +
      "cause its Data Processors to cease processing the personal data of such Data Principal " +
      "unless such processing without her consent is required or authorised under the " +
      "provisions of this Act or the rules made thereunder or any other law for the time being " +
      "in force in India.\"",
    rationale:
      "Consent withdrawal stops future processing (6(6)) but does not retroactively make prior " +
      "processing unlawful (6(5)). Withdrawal is a distinct trigger from an erasure request " +
      "under Sec 12(3) — both are handled from here.",
    statuteVSDiscretion:
      "Statute-Backed: this is a corrected citation. An earlier draft of this project " +
      "attributed the 'shall not affect legality of processing before withdrawal' sentence to " +
      "6(6) — it is actually in 6(5). 6(6) is the separate 'cease within a reasonable time' " +
      "duty. Verify this yourself against the bare Act before trusting this node.",
  },
  {
    id: "step_2_active",
    label: "Step 2: Active Processing",
    subtitle: "Active Order Gate",
    nodeType: "hybrid",
    shape: "diamond",
    stepNumber: 2,
    x: 320,
    y: 250,
    width: 220,
    height: 70,
    sectionCitation: "DPDP Act 2023, Sec 6(5)-(6)",
    title: "Active Order & Processing Gate Check",
    excerptType: "verbatim",
    bareActExcerpt:
      "Same text as Step 1 — Sec 6(5) and 6(6) (see above). The Act itself gives an on-point " +
      "illustration under Sec 6(5): \"X ... places an order for supply of a good while making " +
      "payment for the same. If X withdraws her consent, Y may stop enabling X to use the app " +
      "or website for placing orders, but may not stop the processing for supply of the goods " +
      "already ordered and paid for by X.\"",
    rationale:
      "The statute's actual standard is 'within a reasonable time' (6(6)) and 'not affecting " +
      "the legality of processing before withdrawal' (6(5)) — both fuzzy, fact-dependent " +
      "standards. This node operationalises that as a hard boolean (active_order_status), " +
      "which is a simplification we chose, not something the statute itself specifies.",
    statuteVSDiscretion:
      "Hybrid: the outcome (don't kill an in-progress, already-authorised process) is " +
      "statute-compelled. The specific mechanism — a boolean flag standing in for 'reasonable " +
      "time' — is an engineering abstraction of a standard, not a rule. Say this explicitly if " +
      "asked; don't imply the Act specifies a boolean.",
  },
  {
    id: "step_3_pii_isolation",
    label: "Step 3: PII Isolation Check",
    subtitle: "Shared Dependencies",
    nodeType: "engineering",
    shape: "diamond",
    stepNumber: 3,
    x: 320,
    y: 360,
    width: 220,
    height: 70,
    sectionCitation: "DPDP Act 2023, Sec 8(7) & Sec 12(3) (anchor only — mechanism is ours)",
    title: "Shared PII Cross-Record Dependency Isolation",
    excerptType: "verbatim",
    bareActExcerpt:
      "Sec 8(7): \"A Data Fiduciary shall, unless retention is necessary for compliance with " +
      "any law for the time being in force,— (a) erase personal data, upon the Data Principal " +
      "withdrawing her consent or as soon as it is reasonable to assume that the specified " +
      "purpose is no longer being served, whichever is earlier; and (b) cause its Data " +
      "Processor to erase any personal data that was made available by the Data Fiduciary for " +
      "processing to such Data Processor.\"\n\n" +
      "Sec 12(3): \"A Data Principal shall make a request in such manner as may be prescribed " +
      "to the Data Fiduciary for erasure of her personal data, and upon receipt of such a " +
      "request, the Data Fiduciary shall erase her personal data unless retention of the same " +
      "is necessary for the specified purpose or for compliance with any law for the time " +
      "being in force.\"",
    rationale:
      "Neither section says anything about shared identity fields used by more than one " +
      "record. This check exists so that erasing/encrypting one record's identity data doesn't " +
      "silently break a different, still-active record that needs the same name/phone in " +
      "plaintext. That's a data-minimisation judgment call, not a statutory requirement.",
    statuteVSDiscretion:
      "Pure Engineering: anchored to the general erasure duty above, but the specific " +
      "cross-record dependency check has no citation of its own. Say so plainly if asked — " +
      "there is no section number for 'check other active records first.'",
  },
  {
    id: "step_4_override",
    label: "Step 4: Statutory Overrides",
    subtitle: "PMLA / Companies / CGST",
    nodeType: "statute",
    shape: "diamond",
    stepNumber: 4,
    x: 320,
    y: 470,
    width: 220,
    height: 75,
    sectionCitation:
      "PMLA Sec 2(1)(wa), 2(1)(rc), 12(3)/(4) · Companies Act Sec 128(5) · CGST Sec 36",
    title: "Statutory Mandatory Retention Override Evaluation",
    excerptType: "verbatim",
    bareActExcerpt:
      "PMLA 2002, Sec 2(1)(wa): \"'reporting entity' means a banking company, financial " +
      "institution, intermediary or a person carrying on a designated business or " +
      "profession.\"\n\n" +
      "PMLA 2002, Sec 2(1)(rc): \"'payment system operator' means a person who operates a " +
      "payment system and such person includes his overseas principal.\"\n\n" +
      "PMLA 2002, Sec 12(3): \"The records referred to in clause (a) of sub-section (1) shall " +
      "be maintained for a period of five years from the date of transaction between a client " +
      "and the reporting entity.\"\n\n" +
      "PMLA 2002, Sec 12(4): \"The records referred to in clause (e) of sub-section (1) shall " +
      "be maintained for a period of five years after the business relationship between a " +
      "client and the reporting entity has ended or the account has been closed, whichever is " +
      "later.\"\n\n" +
      "Companies Act 2013, Sec 128(5): \"The books of account of every company relating to a " +
      "period of not less than eight financial years immediately preceding a financial year, " +
      "or where the company had been in existence for a period less than eight years, in " +
      "respect of all the preceding years together with the vouchers relevant to any entry in " +
      "such books of account shall be kept in good order.\"\n\n" +
      "CGST Act 2017, Sec 36: \"Every registered person required to keep and maintain books of " +
      "account or other records ... shall retain them until the expiry of seventy-two months " +
      "from the due date of furnishing of annual return for the year pertaining to such " +
      "accounts and records.\"",
    rationale:
      "These are four separate provisions from three different Acts, quoted individually — " +
      "not one continuous provision. More than one can apply to the same record at once (e.g. " +
      "a merchant's transaction can be both a Companies Act book entry AND a GST-linked " +
      "invoice simultaneously). The controlling retention date is whichever computes latest; " +
      "the others still apply and are listed as co-applicable, not discarded.",
    statuteVSDiscretion:
      "Statute-Backed: explicit statutory retention duties. The engineering judgment is only " +
      "in HOW multiple simultaneously-applicable duties are combined (take the latest expiry, " +
      "disclose the rest) — that combination rule itself is ours, the individual retention " +
      "periods are not.",
  },
  {
    id: "step_5_security",
    label: "Step 5: Security Duty",
    subtitle: "Sec 8(5) / Rule 6(1)(a)",
    nodeType: "statute",
    shape: "rect",
    stepNumber: 5,
    x: 320,
    y: 585,
    width: 220,
    height: 65,
    sectionCitation: "DPDP Act 2023, Sec 8(5); DPDP Rules 2025, Rule 6(1)(a)",
    title: "Security Safeguards on Retained Personal Data",
    excerptType: "verbatim",
    bareActExcerpt:
      "Sec 8(5): \"A Data Fiduciary shall protect personal data in its possession or under its " +
      "control, including in respect of any processing undertaken by it or on its behalf by a " +
      "Data Processor, by taking reasonable security safeguards to prevent personal data " +
      "breach.\"",
    rationale:
      "Data retained under a statutory exception must still be protected — encryption, " +
      "obfuscation, masking, or virtual tokens per Rule 6(1)(a). Do NOT confuse this with " +
      "'techno-legal measures' — under DPDP Rules 2025, Rule 2(1)(b), that term refers only " +
      "to Rules 20 and 22 (how the Data Protection Board and Appellate Tribunal run as digital " +
      "offices), not to a Data Fiduciary's own security duties.",
    statuteVSDiscretion:
      "Statute-Backed: direct obligation under Sec 8(5) and Rule 6(1)(a).",
  },
  {
    id: "step_6_notice",
    label: "Step 6: Notice Citation",
    subtitle: "Sec 5 Notice vs Sec 6",
    nodeType: "statute",
    shape: "rect",
    stepNumber: 6,
    x: 320,
    y: 685,
    width: 220,
    height: 60,
    sectionCitation: "DPDP Act 2023, Sec 5(1)",
    title: "Data Principal Notice Distinction",
    excerptType: "verbatim",
    bareActExcerpt:
      "Sec 5(1): \"Every request made to a Data Principal under section 6 for consent shall be " +
      "accompanied or preceded by a notice given by the Data Fiduciary to the Data Principal, " +
      "informing her,— (i) the personal data and the purpose for which the same is proposed " +
      "to be processed; (ii) the manner in which she may exercise her rights under sub-section " +
      "(4) of section 6 and section 13; and (iii) the manner in which the Data Principal may " +
      "make a complaint to the Board, in such manner and as may be prescribed.\"",
    rationale:
      "Notice is Section 5. Consent is Section 6. They interact (a consent request must be " +
      "preceded by notice) but they are not the same duty — don't cite Section 6 for the " +
      "notice requirement.",
    statuteVSDiscretion:
      "Statute-Backed: precise section separation between Notice (Sec 5) and Consent (Sec 6).",
  },
  {
    id: "step_7_output",
    label: "Step 7: Final Output",
    subtitle: "Structured Decision JSON",
    nodeType: "engineering",
    shape: "rect",
    stepNumber: 7,
    x: 320,
    y: 775,
    width: 220,
    height: 60,
    sectionCitation: "No statutory citation — output format only",
    title: "Deterministic Decision Output & Regime Disclosure",
    excerptType: "not_statutory",
    bareActExcerpt:
      "[Not statutory text.] Describes this tool's own JSON output shape: controlling_authority " +
      "(including any co-applicable citations), retention clock, security_requirement, flags, " +
      "and a non-dismissible MAY_2027_READINESS_SIMULATION disclaimer. This is a design " +
      "artifact of this project, not a legal requirement.",
    rationale:
      "Machine-readable output intended to support an auditable trail — which node fired, " +
      "which citation controlled, what the retention clock basis was — for review by a human " +
      "before any real deletion or retention action is taken.",
    statuteVSDiscretion:
      "Pure Engineering: output schema design.",
  },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { id: "edge_0_to_1", source: "step_0_integrity", target: "step_1_trigger", label: "Valid Server Integrity", condition: "always" },
  { id: "edge_1_to_2", source: "step_1_trigger", target: "step_2_active", label: "Evaluate Active Gate", condition: "always" },
  { id: "edge_2_to_3", source: "step_2_active", target: "step_3_pii_isolation", label: "No Active Order", condition: "no" },
  { id: "edge_3_to_4", source: "step_3_pii_isolation", target: "step_4_override", label: "Check Overrides", condition: "always" },
  { id: "edge_4_to_5", source: "step_4_override", target: "step_5_security", label: "Retain or Erase", condition: "always" },
  { id: "edge_5_to_6", source: "step_5_security", target: "step_6_notice", label: "Notice Reference", condition: "always" },
  { id: "edge_6_to_7", source: "step_6_notice", target: "step_7_output", label: "Final JSON", condition: "always" },
];

export const PRESET_TEST_CASES: TestCasePreset[] = [
  {
    id: "TC-01",
    title: "TC-01: Active Processing Gate",
    shortDesc: "In-progress food delivery order blocks immediate erasure under Sec 6(5)-(6).",
    input: {
      _test_case_id: "TC-01_ACTIVE_PROCESSING_GATE",
      _expected_decision: "BLOCKED_ACTIVE_PROCESSING",
      _expected_citation: "DPDP Sec 6(5)-(6)",
      request_type: "ERASURE_REQUEST",
      data_principal_id: "DP-FD-88213",
      record_type: "food_delivery_order_record",
      entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "server_verified_merchant_registry" },
      record_status: { active_order_status: true, shared_pii_dependencies: [] },
      retention_context: { company_books_of_account: false, gst_invoice_linked: false, transaction_date: "2026-07-22", business_relationship_end_date: null },
    },
  },
  {
    id: "TC-02",
    title: "TC-02: PMLA Statutory Override",
    shortDesc: "Wallet transaction held under PMLA Sec 12(3)/(4) — later of the two clocks controls.",
    input: {
      _test_case_id: "TC-02_PMLA_STATUTORY_OVERRIDE",
      _expected_decision: "RETAIN",
      _expected_citation: "PMLA 2002 Sec 12(3)/(4)",
      request_type: "CONSENT_WITHDRAWAL",
      data_principal_id: "DP-WL-40567",
      record_type: "wallet_transaction_record",
      entity_classification: { is_reporting_entity: true, is_payment_system_operator: true, classification_source: "server_verified_rbi_pso_license_registry" },
      record_status: { active_order_status: false, shared_pii_dependencies: [] },
      retention_context: { company_books_of_account: false, gst_invoice_linked: false, transaction_date: "2023-04-11", business_relationship_end_date: "2024-01-10" },
    },
  },
  {
    id: "TC-03",
    title: "TC-03: Shared PII Isolation Conflict",
    shortDesc: "E-commerce identity tied to another active record — no substring guessing, any listed dependency blocks.",
    input: {
      _test_case_id: "TC-03_SHARED_PII_ISOLATION",
      _expected_decision: "BLOCKED_ACTIVE_PROCESSING",
      _expected_flag: "shared_pii_conflict_detected: true",
      request_type: "ERASURE_REQUEST",
      data_principal_id: "DP-EC-91004",
      record_type: "ecommerce_identity_block",
      entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "server_verified_merchant_registry" },
      record_status: { active_order_status: false, shared_pii_dependencies: ["current_subscription_service_record"] },
      retention_context: { company_books_of_account: false, gst_invoice_linked: false, transaction_date: "2026-06-30", business_relationship_end_date: null },
    },
  },
  {
    id: "TC-04",
    title: "TC-04: Companies Act + CGST stacked retention",
    shortDesc: "Same record is both a books-of-account entry AND a GST invoice — controlling authority is whichever expires later, both disclosed.",
    input: {
      _test_case_id: "TC-04_STACKED_RETENTION",
      _expected_decision: "RETAIN",
      _expected_citation: "Companies Act 2013 Sec 128(5)",
      request_type: "ERASURE_REQUEST",
      data_principal_id: "DP-MR-30219",
      record_type: "merchant_transaction_ledger_entry",
      entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "server_verified_merchant_registry" },
      record_status: { active_order_status: false, shared_pii_dependencies: [] },
      retention_context: { company_books_of_account: true, gst_invoice_linked: true, transaction_date: "2024-06-15", business_relationship_end_date: null },
    },
  },
  {
    id: "TC-05",
    title: "TC-05: Client-Side Override Rejected",
    shortDesc: "Any caller-supplied override field at all is rejected and fails closed — not a value-comparison, a presence check.",
    input: {
      _test_case_id: "TC-05_CLIENT_SIDE_SPOOFING_FAIL_CLOSED",
      _expected_decision: "ERASURE_BLOCKED_UNRESOLVED",
      _expected_flag: "parameter_integrity_warning: true",
      _note_for_qa:
        "The engine does not compare caller_supplied_override against server truth — it " +
        "rejects the request the moment that field is present at all, regardless of its " +
        "values. This is intentionally stricter than mismatch-detection.",
      request_type: "ERASURE_REQUEST",
      data_principal_id: "DP-WL-77531",
      record_type: "wallet_kyc_identity_record",
      entity_classification: { is_reporting_entity: true, is_payment_system_operator: true, classification_source: "server_verified_rbi_pso_license_registry" },
      caller_supplied_override: { is_reporting_entity: false, is_payment_system_operator: false, source: "client_request_payload_untrusted" },
      record_status: { active_order_status: false, shared_pii_dependencies: [] },
      retention_context: { company_books_of_account: false, gst_invoice_linked: false, transaction_date: "2022-09-05", business_relationship_end_date: "2025-09-05" },
    },
  },
];