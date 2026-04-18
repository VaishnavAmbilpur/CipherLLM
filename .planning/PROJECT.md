# CipherLLM — Project Context

## What This Is
A privacy-preserving prompt gateway for LLMs. It acts as a secure middleware that detects and redacts sensitive PII (Personal Identifiable Information) — with a specific focus on Indian data patterns like Aadhaar, PAN, and UPI — before sending prompts to external AI providers (OpenAI, Anthropic, etc.). It re-hydrates the response locally using an encrypted Token Vault.

## The Core Value
Indian enterprises want to use AI but are blocked by data residency and privacy laws (DPDP Act 2023). CipherLLM removes this blocker by ensuring sensitive data never leaves the local environment.

## Requirements

### Active
- [ ] **Indian PII Detection:** Robust regex patterns for Aadhaar, PAN, UPI, Phone, and ₹ Salary.
- [ ] **Universal PII Detection:** Email, SSN, Credit Cards, API Keys.
- [ ] **Token Vault:** Idempotent tokenization and mapping of real values to tokens.
- [ ] **Encryption Layer:** AES-256-GCM encryption for persistent vaults.
- [ ] **LLM Provider Integration:** Support for OpenAI and Anthropic SDKs.
- [ ] **Re-hydration Engine:** Fuzzy-matching restoration of original data into LLM responses.
- [ ] **Proxy API:** Express-based REST API for easy integration.
- [ ] **NLP Intelligence:** Name and Organization detection via `compromise`.
- [ ] **Dashboard:** Next.js based UI for monitoring redactions and session history.

### Out of Scope
- [ ] **Fine-tuning Models:** We redact data, we don't train models.
- [ ] **Cloud Hosting of PII:** All PII stays local to the user's environment in Mode 1 & 2.

## Key Decisions

| Decision | Rationale | Outcome |
| :--- | :--- | :--- |
| **Node.js/TypeScript** | Prototyping speed and strong ecosystem for LLM SDKs. | Validated |
| **AES-256-GCM** | Industry standard for authenticated encryption. | Validated |
| **Two-Engine NER** | Regex for speed/determinism; `compromise` for lightweight local NLP. | Validated |
| **India-First** | High demand due to DPDP Act 2023 compliance. | Validated |

## Evolution
This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-13 after initialization*
