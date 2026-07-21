import streamlit as st
from fastapi.testclient import TestClient
from main import app  # Imports your existing FastAPI application

# Initialize the in-memory client
# This calls your API logic directly without needing a separate uvicorn server!
client = TestClient(app)

# --- UI Configuration ---
st.set_page_config(page_title="DPDP Erasure Simulator", page_icon="⚖️", layout="centered")

st.title("⚖️ DPDP Consent & Erasure Engine")
st.markdown("""
Simulate a Data Principal requesting erasure under **Section 6(4)** of the DPDP Act. 
The engine will evaluate the request against active operations and statutory retention mandates (PMLA, CGST, Companies Act).
""")

st.divider()

# --- Input Form ---
st.subheader("1. Request Details")

col1, col2 = st.columns(2)
with col1:
    user_id = st.text_input("User ID", value="user_REF_9901", help="Enter a mock user ID mapped in your database.")
with col2:
    record_type = st.selectbox(
        "Target Record Type",
        [
            "live_order_data",
            "marketing_data", 
            "pmla_identity_log", 
            "gst_invoice_record",
            "corporate_books"
        ],
        help="Select the category of data the user wants deleted."
    )

st.write("") # Spacer

# --- Execution ---
if st.button("Submit Erasure Request (Sec 6(4))", type="primary", use_container_width=True):
    
    payload = {
        "user_id": user_id,
        "record_type": record_type
    }
    
    with st.spinner("Evaluating statutory conflicts..."):
        # We hit the FastAPI endpoint in-memory
        response = client.post("/api/v1/consent/revoke", json=payload)
        
        st.subheader("2. Engine Decision")
        
        if response.status_code == 200:
            result = response.json()
            action = result.get("action_executed", "")
            
            # Color-coded visual feedback based on the decision
            if "HARD_DELETE" in action:
                st.success(f"✅ **{action}**")
                st.info("Decision: Data successfully erased under Sec 8(7). No overriding retention laws apply.")
            elif "DECLINE" in action:
                st.error(f"🚫 **{action}**")
                st.info("Decision: Erasure blocked under Sec 6(5)/(6) due to an active, in-transit operation.")
            elif "PRESERVE" in action:
                st.warning(f"🛡️ **{action}**")
                st.info("Decision: Record preserved due to statutory mandate (e.g., PMLA, CGST). Identity encrypted if no other active operations require it.")
            else:
                st.info(f"ℹ️ **{action}**")
                
            st.markdown("### Raw API Response Ledger")
            st.json(result)
            
        else:
            # Handle HTTP 500s (like the Fail Closed bug fix for unknown entities)
            st.error(f"🚨 Request Failed (HTTP {response.status_code})")
            st.markdown("This usually happens if the engine **fails closed** (e.g., unrecognized regulatory entity profile).")
            try:
                st.json(response.json())
            except:
                st.write(response.text)
