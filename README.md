

# DPDP 2027 Consent & Erasure Decision Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-10%20passing-brightgreen.svg)](TestMain.py)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)

A techno-legal architecture Proof-of-Concept (PoC) demonstrating how statutory consent revocation under India's **Digital Personal Data Protection (DPDP) Act, 2023** interacts with mandatory statutory retention periods across the **PMLA, 2002**, **CGST Act, 2017**, and **Companies Act, 2013**.

Developed as an independent legal-tech exploration by a law graduate, this engine translates statutory reasoning into executable API decision paths.

---

## Executive Summary & Legal Problem Statement
> ⚠️ **Project Status & Legal Research Disclaimer**
> 
> The statutory framework and cross-act citations in this repository are currently undergoing primary-source legal verification (tracked in [`VERIFICATION_CHECKLIST.md`](VERIFICATION_CHECKLIST.md)). This project is an independent techno-legal proof-of-concept demonstrating statutory logic translation into code, and does not constitute formal legal advice.

When a Data Principal revokes consent or requests data erasure under **Section 6(4)** of the DPDP Act, 2023, a Data Fiduciary cannot execute a blanket deletion. Platforms must navigate overlapping legal mandates:

1. **Ongoing Operations:** Consent withdrawal does not invalidate processing necessary for active obligations or in-transit operations (**Section 6(5) & 6(6)**).
2. **Statutory Override:** Erasure obligations yield to laws requiring data retention (**Section 8(7)**), such as tax logs, corporate books, or anti-money laundering records.
3. **Selective Pseudonymization:** If financial or tax records must be preserved beyond consent revocation, shared identity fields must be encrypted unless an active operational dependency still requires plain text.

This project implements a TypeScript-based Node.js web application (deployed via Google AI Studio) that receives a data erasure request, evaluates statutory conflict matrices, and determines whether to **Hard Delete**, **Decline**, or **Preserve with Targeted Pseudonymization/Encryption**.

---
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e095e369-5f17-4a6a-9bbb-c05e6d8bad78

## Tech Stack & Architecture

This project has been transitioned to a modern web architecture integrated with Google AI Studio:

* **Frontend & Tooling:** Built with **TypeScript** for type-safe logic and **Vite** for rapid bundling and development.
* **Environment:** Powered by **Node.js**.
* **AI Integration:** Utilizes the **Google Gemini API** (via Google AI Studio) to process natural language inputs and execute complex statutory decision logic.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
---
## Architectural Decision Logic

```mermaid
graph TD
    A["User requests erasure - Sec 6(4)"] --> B{"Record type requires<br/>active-operation check?"}
    B -- "Yes, and status = IN_TRANSIT" --> C["DECLINE erasure - Sec 6(5)/(6)<br/>re-evaluate later"]
    B -- "No, or operation closed" --> D{"Look up retention rule<br/>for this record type"}

    D -->|"marketing / closed order data"| E["HARD DELETE - Sec 8(7)"]
    D -->|"financial / tax / PMLA record"| F{"Resolve entity_owner<br/>server-side. Unknown -> fail closed"}

    F -->|"pmla_identity_log AND<br/>entity is NOT a Reporting Entity"| G["Reroute to Companies Act<br/>Sec 128(5), 8y"]
    F -->|"pmla_identity_log AND<br/>entity IS a Reporting Entity"| H["Apply PMLA Sec 12(3)/(4), 5y"]
    F -->|"gst_invoice_record"| I["Apply CGST Sec 36, 6y"]
    F -->|"corporate_books"| J["Apply Companies Act Sec 128(5), 8y"]

    G --> K{"Record age vs. statutory bound"}
    H --> K
    I --> K
    J --> K

    K -->|"age >= bound"| E
    K -->|"age < bound"| L{"Any OTHER active record<br/>still needs plaintext identity?"}

    L -->|"Yes"| M["PRESERVE record.<br/>Leave identity plaintext for now"]
    L -->|"No"| N["PRESERVE record.<br/>Encrypt identity - Rule 6(1)(a)<br/>Generate KMS token"]
