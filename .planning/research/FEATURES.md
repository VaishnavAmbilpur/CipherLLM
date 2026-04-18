# Research: Features

## Table Stakes (Must-Have)
- **High-Precision Regex:** Standard patterns for Aadhaar, PAN, Emails, and Phone numbers.
- **Provider Abstraction:** Consistent API for interacting with OpenAI and Anthropic.
- **Local Re-hydration:** Tokens replaced with original values in the response BEFORE the user sees it.
- **Vault Encryption:** No plaintext storage of PII on disk.

## Differentiators (Competitive Moats)
- **India-Specific PII:** Deep support for Aadhaar (handling spaces), Voter ID, UPI IDs, and ₹ salary notation.
- **Developer Experience:** npm-first distribution allows any Node developer to add privacy with one line of code.
- **Privacy Audit Logs:** Cryptographically signed logs of *what* was redacted for compliance reporting without storing the redacted data itself.

## Future Potential (Phase 2+)
- **VS Code Extension:** Redact before pasting into Copilot or ChatGPT.
- **Multilingual Support:** Detecting PII in Hinglish or regional Indian languages.
- **CLI Tool:** `npx cipherllm "prompt"` for quick CLI-based privacy scans.

---
*Last updated: 2026-04-14*
