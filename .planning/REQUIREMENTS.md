# CipherLLM — Requirements

## Overview
CipherLLM must provide a high-performance, secure, and extensible proxy for LLM prompts. The primary goal is to strip PII before it reaches third-party servers and restore it locally.

## Functional Requirements

### 1. PII Detection (Regex) [REQ-001]
- **Indian Aadhaar:** `\d{4}[\s-]?\d{4}[\s-]?\d{4}` [REQ-001.1]
- **Indian PAN:** `[A-Z]{5}[0-9]{4}[A-Z]{1}` [REQ-001.2]
- **Indian Phone:** `(\+91|0)?[6-9]\d{9}` [REQ-001.3]
- **Indian UPI:** `[a-zA-Z0-9._-]+@[a-zA-Z]{3,}` [REQ-001.4]
- **Indian ₹ Salary:** `₹\s?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?` [REQ-001.5]
- **Universal Email:** Standard email RFC pattern [REQ-001.6]
- **Secrets/Keys:** Detection of strings >32 chars that look like API keys [REQ-001.7]

### 2. Token Vault [REQ-002]
- **Idempotency:** The same value in a single session must map to the same token. [REQ-002.1]
- **Token Format:** `[TYPE_N]` (e.g., `[PERSON_1]`). [REQ-002.2]
- **Encryption:** Vault must be encrypted with AES-256-GCM before persistence. [REQ-002.3]

### 3. LLM Proxy [REQ-003]
- **Provider Support:** OpenAI (GPT-4o) and Anthropic (Claude 3.5 Sonnet). [REQ-003.1]
- **Sanitization:** Prompts must be replaced with tokens before sending. [REQ-003.2]
- **Re-hydration:** AI responses must have tokens replaced with original values. [REQ-003.3]

### 4. Intelligence (NER) [REQ-004]
- **Local NER:** Use `compromise` for name and organization detection. [REQ-004.1]
- **Contextual Detection:** Handle fuzzy matching for LLM-mangled tokens. [REQ-004.2]

### 5. Management UI [REQ-005]
- **Live Monitoring:** Show redactions happening in real-time. [REQ-005.1]
- **Compliance Logs:** Export logs showing what types of PII were redacted (never the values). [REQ-005.2]

## Non-Functional Requirements

### 1. Performance [REQ-NF1]
- Detection and sanitization overhead must be <100ms per request.

### 2. Security [REQ-NF2]
- Zero raw PII may be logged to external observability tools (e.g., Sentry).
- Master keys for encryption must never be stored in plaintext.

### 3. Distribution [REQ-NF3]
- Must be installable via `npm install cipherllm`.
- Provide a Dockerized version for enterprise self-hosting.

---
*Last updated: 2026-04-14*
