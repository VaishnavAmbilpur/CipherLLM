# Research: Pitfalls

## 1. Token Mangling by LLM
**Risk:** LLMs may change the case or slightly modify tokens (e.g., `[PERSON_1]` becomes `[Person_1]`).
**Prevention:** Use a case-insensitive, fuzzy-matching regex for re-hydration.

## 2. Context Leakage
**Risk:** "Implicit PII" (e.g., *"The CEO of the only hospital in Wayanad"*) is not caught by simple regex or NLP.
**Prevention:** User education in Phase 1; advanced semantic detection in later phases.

## 3. Data Residency
**Risk:** Storing the encrypted vault on a cloud database might still violate strict data residency for some sectors.
**Prevention:** Default to local disk storage for the vault; allow user-configurable storage backends.

## 4. Performance Latency
**Risk:** Large prompts with many PII items could slow down the request significantly.
**Prevention:** Optimize regex execution order (most common first) and limit NLP scan to suspected PII regions if possible.

## 5. DPDP Act Ambiguities
**Risk:** Indian regulations may update frequently.
**Prevention:** Build modular detection plugins so new patterns (like Virtual Aadhaar) can be added easily without core changes.

---
*Last updated: 2026-04-14*
