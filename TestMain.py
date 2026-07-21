from fastapi.testclient import TestClient
import main

client = TestClient(main.app)


def call(user_id, record_type):
    r = client.post("/api/v1/consent/revoke", json={"user_id": user_id, "record_type": record_type})
    print(f"\n>>> {user_id} / {record_type}  -> HTTP {r.status_code}")
    print(r.json())
    return r


print("=== 1. Active order in progress: must DECLINE, not delete ===")
r = call("user_REF_9901", "live_order_data")
assert r.status_code == 200
assert r.json()["action_executed"] == "ERASURE_DECLINED_ACTIVE_OPERATION"

print("\n=== 2. Marketing data: no override -> hard delete ===")
r = call("user_REF_9901", "marketing_profile")
assert r.json()["action_executed"] == "HARD_DELETE"

print("\n=== 3. GST invoice, still within window, active order still open -> preserve, PII untouched ===")
r = call("user_REF_9901", "gst_invoice_record")
assert r.json()["action_executed"] == "RECORD_PRESERVED_PII_UNCHANGED"
assert main.fake_database["user_REF_9901"]["pii"]["name"] == "Karan Malhotra"  # unchanged

print("\n=== 4. Corporate books, 11 years old, exceeds 8y window -> hard delete ===")
r = call("user_REF_9901", "corporate_books")
assert r.json()["action_executed"] == "HARD_DELETE"

print("\n=== 5. PMLA log, MARKETPLACE is not a reporting entity -> falls back to Companies Act (8y), still preserved ===")
r = call("user_REF_9901", "pmla_identity_log")
assert r.json()["action_executed"] == "RECORD_PRESERVED_PII_UNCHANGED"
assert "not a PMLA Reporting Entity" in r.json()["conflict_resolution"]

print("\n=== 6. Close the active order, then re-run the same PMLA request: PII should now get encrypted ===")
main.fake_database["user_REF_9901"]["active_order_status"] = "NONE"
r = call("user_REF_9901", "pmla_identity_log")
assert r.json()["action_executed"] == "RESTRICTED_PSEUDONYMIZATION"
assert main.fake_database["user_REF_9901"]["pii"]["access_restriction"] == "RULE_6_1_A_COMPLIANT_PSEUDONYMIZATION"

print("\n=== 7. Second user: FINTECH_WALLET IS a PMLA reporting entity, record is 4y old (< 5y bound) -> preserved+pseudonymized ===")
r = call("user_REF_4412", "pmla_identity_log")
assert r.json()["action_executed"] == "RESTRICTED_PSEUDONYMIZATION"
assert "PMLA 2002 Sec 12(3)/(4)" in r.json()["conflict_resolution"]

print("\n=== 8. Unknown user -> 404 ===")
r = call("nope", "marketing_profile")
assert r.status_code == 404

print("\n=== 9. Unknown record type -> 404 ===")
r = call("user_REF_9901", "not_a_real_type")
assert r.status_code == 404

print("\n=== 10. Corrupted/unknown entity_owner -> fails CLOSED (500), not silently permissive ===")
main.fake_database["user_REF_9901"]["records"]["marketing_profile"] = {"recorded_date": "2026-01-01T00:00:00Z"}
main.fake_database["user_REF_9901"]["entity_owner"] = "SOME_TYPO_VALUE"
r = call("user_REF_9901", "marketing_profile")
assert r.status_code == 500

print("\nALL CHECKS PASSED")
