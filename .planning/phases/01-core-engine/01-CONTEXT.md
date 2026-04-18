# Context: Phase 1 — Core Engine

## <decisions>
- **PII Detection:** Use regex patterns specified in `04_EXECUTION.md` as the primary engine. Aadhaar regex MUST support spaces and compact formats.
- **Tokenization:** Standard `[TYPE_N]` format (e.g., `[PERSON_1]`). Tokenization is idempotent per session.
- **Re-hydration:** Global string replacement using fuzzy matching to catch case variations or minor mangling by the LLM.
- **Validation:** Phase 1 will be validated using a robust Jest test suite with mock LLM responses to ensure logic correctness.
- **Library Selection:** Node.js built-in `crypto` for future-proofing; `dotenv` for env management.
</decisions>

## <specifics>
- **Aadhaar Regex:** `/\d{4}[\s-]?\d{4}[\s-]?\d{4}/g`
- **PAN Regex:** `/[A-Z]{5}[0-9]{4}[A-Z]{1}/g`
- **Email Regex:** Standard pattern from `regex.ts` in `04_EXECUTION.md`.
</specifics>

## <canonical_refs>
- [04_EXECUTION.md](file:///c:/Users/Vaishnav%20Ambilpur/Desktop/CipherLLM/files/04_EXECUTION.md)
</canonical_refs>

---
*Generated: 2026-04-14*
