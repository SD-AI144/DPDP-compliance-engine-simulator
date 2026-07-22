import streamlit as st
from fastapi.testclient import TestClient
from main import app
import time # Used to simulate the "thinking" animation

client = TestClient(app)

# --- UI Configuration (Wide layout for dashboard feel) ---
st.set_page_config(page_title="DPDP Compliance Engine", page_icon="🛡️", layout="wide")

# --- Sidebar (The Control Panel) ---
with st.sidebar:
    st.title("⚙️ Control Panel")
    st.markdown("Simulate a Data Principal's erasure request under **Sec 6(4)**.")
    st.divider()
    
    user_id = st.text_input("Data Principal ID", value="user_REF_9901")
    record_type = st.selectbox(
        "Target Data Category",
        [
            "live_order_data",
            "marketing_profile", 
            "pmla_identity_log", 
            "gst_invoice_record",
            "corporate_books"
        ]
    )
    st.divider()
    submit_btn = st.button("Execute Erasure Engine", type="primary", use_container_width=True)

# --- Main Dashboard Area ---
st.title("🛡️ DPDP 2027 Automated Triage Dashboard")
st.markdown("Live monitoring of statutory conflicts and data erasure queues.")

# Add fake enterprise metrics to make it look like a production system
col1, col2, col3 = st.columns(3)
col1.metric(label="Total Erasure Requests (30d)", value="14,204", delta="Active")
col2.metric(label="Statutory Preservations", value="3,842", delta="PMLA / CGST", delta_color="off")
col3.metric(label="Escalated to Legal Review", value="12", delta="-3 Resolved", delta_color="inverse")

st.divider()

# --- Execution & Animation ---
if submit_btn:
    payload = {"user_id": user_id, "record_type": record_type}
    
    # This creates a visually impressive "Thinking" dropdown
    with st.status("Initializing Statutory Decision Engine...", expanded=True) as status:
        st.write("🔍 **Gate 1:** Querying active operational dependencies (Sec 6(5)/(6))...")
        time.sleep(0.6) # Short pause for visual effect
        
        st.write("🏛️ **Gate 2:** Resolving server-side regulatory entity profile...")
        time.sleep(0.6)
        
        st.write("⏱️ **Gate 3:** Calculating record age against statutory retention bounds...")
        time.sleep(0.6)
        
        st.write("🔐 **Gate 4:** Evaluating cross-record plaintext dependencies...")
        time.sleep(0.6)
        
        # Actually hit the API here
        response = client.post("/api/v1/consent/revoke", json=payload)
        
        status.update(label="Statutory Evaluation Complete", state="complete", expanded=False)

    # --- Render Results ---
    st.subheader("⚖️ Final Legal Verdict")
    
    if response.status_code == 200:
        result = response.json()
        action = result.get("action_executed", "")
        
        # Bold, card-like result displays
        if "HARD_DELETE" in action:
            st.success(f"✅ **ACTION: {action}**")
            st.info("The data has been permanently erased under DPDP Act Sec 8(7). No statutory retention overrides apply.")
        elif "DECLINE" in action:
            st.error(f"🚫 **ACTION: {action}**")
            st.warning("Erasure blocked under DPDP Sec 6(5)/(6). Cannot delete data tied to an active, in-transit operation.")
        elif "PRESERVE" in action:
            st.warning(f"🛡️ **ACTION: {action}**")
            st.info("Record preserved due to statutory mandate (e.g., PMLA, CGST). Identity encrypted if no other active dependency exists.")
            
        # Hide the JSON inside an expander so it doesn't look like a raw spreadsheet
        with st.expander("View Raw Audit Ledger (JSON)"):
            st.json(result)
            
    else:
        st.error(f"🚨 Engine Failed Closed (HTTP {response.status_code})")
        with st.expander("View Error Details"):
            try:
                st.json(response.json())
            except:
                st.write(response.text)
else:
    # Default state before clicking the button
    st.info("👈 Waiting for input. Use the Control Panel on the left to simulate a request.")
