"""
DPDP 2027 Readiness: Dynamic Compliance Gateway
-------------------------------------------------
A proof-of-concept decision engine modelling how a consent-revocation
request should be routed once the DPDP Act's substantive provisions
come into force (target: 14 May 2027).

This is a portfolio / training artifact, not production code. See
README.md for what it demonstrates, what it deliberately does NOT solve,
and how to verify every statutory citation yourself before reusing any
of it.
"""

import os
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from cryptography.fernet import Fernet
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="DPDP 2027 Readiness: Dynamic Compliance Gateway")

# -----------------------------------------------------------------------------
# CRYPTOGRAPHIC KEY PERSISTENCE
# -----------------------------------------------------------------------------
# Key is written to disk so container/process restarts do not silently
# orphan previously-encrypted records (this was Bug #0 from an earlier
# draft — fixed here, kept as-is from the prior round).
KEY_FILE = os.path.join(os.path.dirname(__file__), "dpdp_secure_key.key")
if os.path.exists(KEY_FILE):
    with open(KEY_FILE, "rb") as f:
        ENCRYPTION_KEY = f.read()
else:
    ENCRYPTION_KEY = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(ENCRYPTION_KEY)

cipher_suite = Fernet(ENCRYPTION_KEY)

# -----------------------------------------------------------------------------
# STATUTORY RETENTION TABLE — verify every row yourself before relying on it.
# -----------------------------------------------------------------------------
STATUTORY_BOUNDS = {
    "marketing_profile":  {"years": 0, "statute": "DPDP Act Sec 8(7) — no override"},
    "live_order_data":    {"years": 0, "statute": "DPDP Act Sec 8(7) — no override once order closed"},
    "gst_invoice_record": {"years": 6, "statute": "CGST Act 2017 Sec 36 (72 months from annual-return due date)"},
    "corporate_books":    {"years": 8, "statute": "Companies Act 2013 Sec 128(5)"},
    "pmla_identity_log":  {"years": 5, "statute": "PMLA 2002 Sec 12(3)/(4) — only if entity is a Reporting Entity"},
}

# Record types where an ACTIVE operation (Sec 6(5)/(6)) can block erasure
# outright, before any retention-table logic runs at all.
ACTIVE_OPERATION_GATED_TYPES = {"live_order_data"}

# Record types where the underlying identity (name/phone) must stay in
# plaintext while an operation is active — e.g. a courier needs a readable
# name and phone number to complete a delivery. Bug #3 (from the last
# review) was encrypting the user's ENTIRE identity block on any
# revocation, even while data like this was still legitimately in use.
PLAINTEXT_REQUIRED_WHILE_ACTIVE = {"live_order_data"}


# -----------------------------------------------------------------------------
# ENTITY REGULATORY STATUS — resolved server-side from the record itself,
# never from client input. Bug #2 (from the last review) let the caller
# assert their own PMLA status via the request body, defaulting to the
# weaker-protection branch on any typo or invalid value. Fixed: the
# entity's status is a fact about who owns the data, stored with the
# record, not a claim the API caller gets to make.
# -----------------------------------------------------------------------------
KNOWN_ENTITY_PROFILES = {
    "MARKETPLACE": {
        "label": "Core marketplace — routes payments via third-party PA/bank",
        "is_pmla_reporting_entity": False,
    },
    "FINTECH_WALLET": {
        "label": "Licensed wallet/PPI-issuer subsidiary — payment system operator",
        "is_pmla_reporting_entity": True,
    },
}

# -----------------------------------------------------------------------------
# SIMULATED DATA STORE
# -----------------------------------------------------------------------------
# Note "entity_owner" lives on the user record — it's a fact the platform
# already knows about its own data, not something the API caller supplies.
fake_database = {
    "user_REF_9901": {
        "entity_owner": "MARKETPLACE",
        "active_order_status": "IN_TRANSIT",   # order currently being fulfilled
        "pii": {
            "name": "Karan Malhotra",
            "phone": "+91-9999988888",
        },
        "records": {
            "marketing_profile":  {"recorded_date": "2025-11-20T08:00:00Z"},
            "live_order_data":    {"recorded_date": "2026-07-13T09:00:00Z"},
            "gst_invoice_record": {"invoice_val": 1250.00, "recorded_date": "2024-01-15T14:20:00Z"},
            "pmla_identity_log":  {"transaction_id": "TXN-99821", "recorded_date": "2025-02-10T11:00:00Z"},
            "corporate_books":    {"ledger_id": "LDG-002", "recorded_date": "2015-04-01T00:00:00Z"},
        },
    },
    "user_REF_4412": {
        "entity_owner": "FINTECH_WALLET",
        "active_order_status": "NONE",
        "pii": {
            "name": "Priya Nair",
            "phone": "+91-8888877777",
        },
        "records": {
            "pmla_identity_log": {"transaction_id": "TXN-55210", "recorded_date": "2022-03-01T11:00:00Z"},
        },
    },
}


class RevocationRequest(BaseModel):
    user_id: str
    record_type: str
    # NOTE: no entity/company field here on purpose. See KNOWN_ENTITY_PROFILES above.


def parse_record_age_years(timestamp_str: str) -> int:
    recorded_dt = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    return relativedelta(datetime.now(timezone.utc), recorded_dt).years


def other_active_plaintext_dependency(uid: str, excluding_type: str) -> bool:
    """
    True if some OTHER still-present record for this user both (a) requires
    plaintext identity while active and (b) is currently active. If so, the
    shared PII block must not be encrypted yet, even though the record we
    ARE processing is being preserved/pseudonymised.
    """
    user_record = fake_database[uid]
    for rtype, rdata in user_record["records"].items():
        if rtype == excluding_type:
            continue
        if rtype in PLAINTEXT_REQUIRED_WHILE_ACTIVE and user_record.get("active_order_status") == "IN_TRANSIT":
            return True
    return False


def pseudonymize_user_pii(uid: str) -> str:
    """Encrypts the shared identity block. Only call this once it's confirmed
    safe — see other_active_plaintext_dependency()."""
    raw_pii = str(fake_database[uid]["pii"]).encode()
    encrypted_block = cipher_suite.encrypt(raw_pii)
    fake_database[uid]["pii"] = {
        "access_restriction": "RULE_6_1_A_COMPLIANT_PSEUDONYMIZATION",
        "kms_reference_token": encrypted_block.decode(),
    }
    return encrypted_block.decode()


@app.post("/api/v1/consent/revoke")
def process_data_revocation(request: RevocationRequest):
    uid = request.user_id
    rtype = request.record_type

    if uid not in fake_database:
        raise HTTPException(status_code=404, detail="User not found.")
    user_record = fake_database[uid]

    if rtype not in user_record["records"]:
        raise HTTPException(status_code=404, detail="Record not found for this user.")

    # ---- Resolve entity status server-side, fail CLOSED on anything unknown ----
    entity_id = user_record.get("entity_owner")
    if entity_id not in KNOWN_ENTITY_PROFILES:
        raise HTTPException(
            status_code=500,
            detail=f"Unrecognised or missing entity_owner '{entity_id}' for user {uid}. "
                   f"Refusing to route a compliance decision against an unknown regulatory profile.",
        )
    entity_profile = KNOWN_ENTITY_PROFILES[entity_id]

    # ---- GATE 1: Section 6(5)/(6) — is there an active operation depending on this data? ----
    if rtype in ACTIVE_OPERATION_GATED_TYPES and user_record.get("active_order_status") == "IN_TRANSIT":
        return {
            "regime_status": "MAY_2027_READINESS_SIMULATION (Statutes Pending Force)",
            "action_executed": "ERASURE_DECLINED_ACTIVE_OPERATION",
            "statutory_basis": "DPDP Act, 2023 - Section 6(5)/(6)",
            "justification": (
                "Withdrawal of consent does not undo the legality of processing already "
                "underway, and the Data Fiduciary may continue processing necessary to "
                "complete a service already committed to. Erasure will be re-evaluated once "
                "active_order_status is no longer IN_TRANSIT."
            ),
        }

    # ---- GATE 2: PMLA fallback — only applies if the owning entity is a reporting entity ----
    compliance_rule = STATUTORY_BOUNDS[rtype]
    if rtype == "pmla_identity_log" and not entity_profile["is_pmla_reporting_entity"]:
        # This entity has no PMLA record-keeping duty for this data — fall back
        # to ordinary corporate/tax retention instead of a PMLA override.
        rule_requirement_years = STATUTORY_BOUNDS["corporate_books"]["years"]
        statute_authority = (
            f"{STATUTORY_BOUNDS['corporate_books']['statute']} "
            f"(entity '{entity_id}' is not a PMLA Reporting Entity — see README)"
        )
    else:
        rule_requirement_years = compliance_rule["years"]
        statute_authority = compliance_rule["statute"]

    record_age = parse_record_age_years(user_record["records"][rtype]["recorded_date"])

    # ---- Branch A: no retention override, or the statutory window has expired ----
    if rule_requirement_years == 0 or record_age >= rule_requirement_years:
        del user_record["records"][rtype]
        return {
            "regime_status": "MAY_2027_READINESS_SIMULATION (Statutes Pending Force)",
            "action_executed": "HARD_DELETE",
            "statutory_basis": "DPDP Act, 2023 - Section 8(7)",
            "justification": f"Record age ({record_age}y) meets/exceeds retention bound "
                              f"under {statute_authority}. Erasure executed.",
        }

    # ---- Branch B: retention window still active — preserve the record, isolate identity ----
    if other_active_plaintext_dependency(uid, excluding_type=rtype):
        return {
            "regime_status": "MAY_2027_READINESS_SIMULATION (Statutes Pending Force)",
            "action_executed": "RECORD_PRESERVED_PII_UNCHANGED",
            "statutory_basis": f"DPDP Rules 2025 - Rule 6(1)(a), deferred",
            "conflict_resolution": f"Preservation required by {statute_authority} "
                                    f"({rule_requirement_years}y bound, record is {record_age}y old). "
                                    f"Identity fields NOT yet encrypted: another active operation for "
                                    f"this user still requires plaintext identity.",
        }

    token = pseudonymize_user_pii(uid)
    return {
        "regime_status": "MAY_2027_READINESS_SIMULATION (Statutes Pending Force)",
        "action_executed": "RESTRICTED_PSEUDONYMIZATION",
        "statutory_basis": "DPDP Rules 2025 - Rule 6(1)(a)",
        "conflict_resolution": f"Preservation required by {statute_authority} "
                                f"({rule_requirement_years}y bound, record is {record_age}y old).",
        "operational_state": "Identity fields encrypted; numerical/ledger data left intact.",
        "persistence_token": token,
    }
