# Context: Phase 4 — Intelligence Layer

## <decisions>
- **Local NLP:** Use the `compromise` library for JavaScript-native NER.
- **Entity Types:** Focus on `PERSON`, `ORG`, and `LOCATION`.
- **Integration:** The NLP detector runs after the regex detector to catch entities that don't follow fixed patterns (e.g., Names of people).
- **Session Memory:** The TokenVault must correctly merge regex-detected and NLP-detected entities without duplication.
</decisions>

## <specifics>
- **Library Choice:** `compromise` was chosen for zero-dependency local execution in Node.js.
</specifics>

## <canonical_refs>
- [03_TECHSTACK.md](file:///c:/Users/Vaishnav%20Ambilpur/Desktop/CipherLLM/files/03_TECHSTACK.md)
</canonical_refs>

---
*Generated: 2026-04-14*
