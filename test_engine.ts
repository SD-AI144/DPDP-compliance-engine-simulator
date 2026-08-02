import { evaluateDPDPCompliance } from "./src/engine/dpdpEngine";
import { PRESET_TEST_CASES } from "./src/data/statutesAndNodes";

let failures = 0;
function check(desc: string, cond: boolean) {
  console.log(`${cond ? "PASS" : "FAIL"} - ${desc}`);
  if (!cond) failures++;
}

for (const tc of PRESET_TEST_CASES) {
  const result = evaluateDPDPCompliance(tc.input);
  console.log(`\n=== ${tc.title} ===`);
  console.log(JSON.stringify(result, null, 2));
  const expected = (tc.input as any)._expected_decision;
  if (expected) check(`${tc.id}: decision == ${expected}`, result.decision === expected);
}

// Targeted checks on the fixes themselves
console.log("\n--- Targeted fix verification ---");

// 1. PMLA dual clock: relationship-end clock should control when it's later
const pmlaResult = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST",
  data_principal_id: "X",
  record_type: "t",
  entity_classification: { is_reporting_entity: true, is_payment_system_operator: false, classification_source: "s" },
  record_status: { active_order_status: false, shared_pii_dependencies: [] },
  retention_context: {
    company_books_of_account: false,
    gst_invoice_linked: false,
    transaction_date: "2020-01-01",       // +5y = 2025-01-01
    business_relationship_end_date: "2023-01-01", // +5y = 2028-01-01 (later, should control)
  },
});
check(
  "PMLA: relationship-end clock (2028-01-01) controls over transaction clock (2025-01-01)",
  pmlaResult.retention_if_applicable?.expiry_date === "2028-01-01"
);

// 2. Leap-day edge case
const leapResult = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST",
  data_principal_id: "X",
  record_type: "t",
  entity_classification: { is_reporting_entity: true, is_payment_system_operator: false, classification_source: "s" },
  record_status: { active_order_status: false, shared_pii_dependencies: [] },
  retention_context: {
    company_books_of_account: false,
    gst_invoice_linked: false,
    transaction_date: "2024-02-29",
    business_relationship_end_date: null,
  },
});
console.log("Leap day + 5y expiry:", leapResult.retention_if_applicable?.expiry_date);
check("Leap day input produces a valid, well-formed date string", /^\d{4}-\d{2}-\d{2}$/.test(leapResult.retention_if_applicable?.expiry_date || ""));

// 3. Companies Act FY boundary: Jan transaction vs June transaction in same calendar year
const janTxn = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST", data_principal_id: "X", record_type: "t",
  entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "s" },
  record_status: { active_order_status: false, shared_pii_dependencies: [] },
  retention_context: { company_books_of_account: true, gst_invoice_linked: false, transaction_date: "2024-01-15", business_relationship_end_date: null },
});
const juneTxn = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST", data_principal_id: "X", record_type: "t",
  entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "s" },
  record_status: { active_order_status: false, shared_pii_dependencies: [] },
  retention_context: { company_books_of_account: true, gst_invoice_linked: false, transaction_date: "2024-06-15", business_relationship_end_date: null },
});
console.log("Jan-2024 txn (FY2023-24) expiry:", janTxn.retention_if_applicable?.expiry_date);
console.log("Jun-2024 txn (FY2024-25) expiry:", juneTxn.retention_if_applicable?.expiry_date);
check("Jan 2024 txn -> FY ending Mar 2024 -> expiry 2032-03-31", janTxn.retention_if_applicable?.expiry_date === "2032-03-31");
check("Jun 2024 txn -> FY ending Mar 2025 -> expiry 2033-03-31 (one year later than Jan case)", juneTxn.retention_if_applicable?.expiry_date === "2033-03-31");

// 4. Stacked retention: Companies Act + CGST on same record -> longer one (Companies Act, 8y) controls, CGST listed as co-applicable
const stacked = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST", data_principal_id: "X", record_type: "t",
  entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "s" },
  record_status: { active_order_status: false, shared_pii_dependencies: [] },
  retention_context: { company_books_of_account: true, gst_invoice_linked: true, transaction_date: "2024-06-15", business_relationship_end_date: null },
});
check("Stacked: controlling citation is Companies Act (longer clock)", stacked.controlling_authority.primary_citation === "Companies Act 2013 Sec 128(5)");
check("Stacked: CGST listed as co-applicable, not silently dropped", (stacked.controlling_authority.co_applicable_citations || []).includes("CGST Act 2017 Sec 36"));

// 5. Shared PII: dependency with a name that would have failed old substring match ("current_..." has no "active"/"live")
const piiResult = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST", data_principal_id: "X", record_type: "t",
  entity_classification: { is_reporting_entity: false, is_payment_system_operator: false, classification_source: "s" },
  record_status: { active_order_status: false, shared_pii_dependencies: ["current_subscription_service_record"] },
  retention_context: { company_books_of_account: false, gst_invoice_linked: false, transaction_date: "2026-01-01", business_relationship_end_date: null },
});
check("PII dependency without 'active'/'live' in its name still blocks (old bug is fixed)", piiResult.decision === "BLOCKED_ACTIVE_PROCESSING");

// 6. Spoofing gate still fails closed
const spoof = evaluateDPDPCompliance({
  request_type: "ERASURE_REQUEST", data_principal_id: "X", record_type: "t",
  entity_classification: { is_reporting_entity: true, is_payment_system_operator: true, classification_source: "s" },
  caller_supplied_override: { is_reporting_entity: false },
  record_status: { active_order_status: false, shared_pii_dependencies: [] },
  retention_context: { company_books_of_account: false, gst_invoice_linked: false, transaction_date: "2022-01-01", business_relationship_end_date: null },
});
check("Caller override present -> fails closed", spoof.decision === "ERASURE_BLOCKED_UNRESOLVED");

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
process.exit(failures === 0 ? 0 : 1);