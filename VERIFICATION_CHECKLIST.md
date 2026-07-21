# Verification checklist — do not skip this before using the project

You are the one whose name goes on this. Everything below is organized by
how confident you should be in *my* process, not how confident I sounded
in conversation. Confidence in tone is not evidence.

## How to read the tiers

- **Tier 1 — full primary text read by me.** Lowest risk, but still check.
- **Tier 2 — search-engine snippets only.** I did not open and read the
  full source document. Meaningful risk of missing context, an outdated
  version, or a misreading. Verify independently before relying on any of
  these.
- **Tier 3 — secondary commentary, explicitly not authority.** Used for
  framing/context only. Treat as a lead, not a fact.

---

## Tier 1 — DPDP Act, 2023 and DPDP Rules, 2025

Source: the Gazette PDFs you uploaded directly into this conversation —
G.S.R. 846(E) dated 13 November 2025 (Rules) and the Act as published
11 August 2023.

| Claim | Verify at |
|---|---|
| Section 5 = Notice, Section 6 = Consent, Section 6(4)/(5)/(6), Section 8(5)/(7), Section 12(3) | indiacode.nic.in — search "Digital Personal Data Protection Act 2023" |
| Rule 2(1)(b) defines "techno-legal measures" via Rules 20 & 22 | egazette.gov.in — search G.S.R. 846(E), 13 Nov 2025 |
| Rule 6(1)(a) — encryption/obfuscation/masking/virtual tokens | Same gazette notification |
| Rule 8(3) / Seventh Schedule — 1 year minimum log retention | Same gazette notification |
| Commencement: Rules 1,2,17-21 immediate; Rule 4 on 13 Nov 2026; Rules 3,5-16,22,23 on 14 May 2027 | Rule 1 of the same notification — also cross-check MeitY's own press release, meity.gov.in, since commencement dates are sometimes separately notified |
| Schedule — ₹250cr penalty tied to Sec 8(5) breach | Same Act, the Schedule under Sec 33(1) |

**My risk here:** transcription/reading errors within a document I did
have in full. Re-read the specific section yourself before citing it,
don't just trust my paraphrase.

---

## Tier 2 — everything checked only via search snippets

I ran search queries and read short excerpts. I did not fetch or read any
of these documents in full.

| Claim | What I'm not sure of | Verify at |
|---|---|---|
| PMLA Sec 2(1)(wa) = "reporting entity" | Whether I'm reading the current consolidated version — PMLA has been amended repeatedly | indiacode.nic.in ("Prevention of Money-Laundering Act 2002"); cross-check amendment notifications at fiuindia.gov.in |
| PMLA Sec 2(1)(l) = "financial institution," includes "payment system operator" | Same — also whether "payment system operator" sits in 2(1)(l) itself or is cross-referenced from 2(1)(rb)/(rc) | Same as above; also check RBI's Payment and Settlement Systems Act, 2007 definitions, which PMLA's definition partly borrows from |
| PMLA Sec 12(3)/(4) — 5-year retention | Whether this is the current period (retention periods get amended) | Same, indiacode.nic.in |
| Companies Act 2013, Sec 128(5) — 8 financial years | Not independently confirmed beyond snippet | mca.gov.in or indiacode.nic.in |
| CGST Act 2017, Sec 36 — 72 months | Not independently confirmed beyond snippet; GST provisions change by notification often | cbic.gov.in (GST law section) |
| Income-tax Rule 6F — limited to specified professions, doesn't apply to companies | Confirmed the scope language but not the full current rule text | incometaxindia.gov.in — search "Rule 6F" |
| PayPal held to be a "payment system operator" / reporting entity by FIU-IND; challenged before Delhi High Court; penalty quashed | **I have not read this judgment.** Everything I said came from secondary blog summaries. The actual holding, its scope, and whether it's under further appeal are all things I cannot confirm | delhihighcourt.nic.in case search; indiankanoon.org as free cross-reference; SCC Online/Manupatra if you have access; the original FIU-IND adjudication order (search "FIU-IND adjudication order PayPal") |
| GDPR Art 17(3)(b), Art 6(1)(c), Art 23 | Text summarized from snippets, not read in full article form | eur-lex.europa.eu — official EU law database, search "Regulation (EU) 2016/679" |
| UK Money Laundering Regulations 2017, Regulation 40 — 5-year retention | Snippet only | legislation.gov.uk — search "Money Laundering Regulations 2017" |
| An ICO decision (published via EDPB's Article 60 register) finding a refusal to erase, based on 4th AMLD retention duty, lawful under Art 6(1)(c) | **I have not opened and read this PDF.** I only saw it described in a search result | The PDF should be at edpb.europa.eu under Article 60 final decisions — open it and read the actual finding, not my summary of a summary |
| ICO general guidance on right to erasure / legal obligation basis | Summarized from ico.org.uk pages, not fully re-read | ico.org.uk — "Right to erasure" and "Legal obligation" guidance pages directly |

---

## Tier 3 — secondary commentary (context only, cited as such, not authority)

These were referenced to show the topic is being discussed elsewhere, not
as legal authority for anything. Don't cite them as sources of law.

- ConsentOS — "NBFC DPDP Compliance: KYC, PMLA, CIBIL Rules"
- SARC Global — "DPDP Act for Indian Banks"
- NALSAR Tech Law Forum — piece on Rule 8(3) vs Sec 8(7)
- SCC OnLine Blog — Lexathon entry on Sec 8(7)/12(3) and machine unlearning
- SCC OnLine Blog / Lexology — commentary on the PayPal case
- Tenet Law, ISMS.online — GDPR/AML commentary

If you use any of these in the memo, label them explicitly as commentary,
not statute or case law, and re-verify the specific factual claim you're
relying on against its own cited source, not against my summary of it.

---

## The one meta-point worth remembering

Every specific error caught across this whole project — the wrong
Income-tax rule, the misused "techno-legal measures" term, the missing
Section 6(5) check in the code, the client-controlled entity status — was
caught by checking a *specific, narrow* claim against its actual source,
not by generally trusting or distrusting the overall output. Do the same
here: don't audit this document for "does it feel right," audit it one
row at a time against the primary source listed next to it.
