# Context: Phase 3 — Security & Storage

## <decisions>
- **Encryption Algorithm:** AES-256-GCM (Authenticated Encryption).
- **Key Derivation:** PBKDF2 with 100,000 iterations to derive the Master Key from a user-provided passphrase.
- **Persistence:** Encrypted vaults will be stored as `.vault` files in a local `.cipherllm/sessions/` directory.
- **IV/Tag Management:** Initialization Vectors (IV) and Auth Tags must be stored alongside the encrypted data for decryption.
</decisions>

## <specifics>
- **File Structure:**
  ```bash
  ~/.cipherllm/sessions/sess_abc123.vault
  ```
</specifics>

## <canonical_refs>
- [03_TECHSTACK.md](file:///c:/Users/Vaishnav%20Ambilpur/Desktop/CipherLLM/files/03_TECHSTACK.md)
</canonical_refs>

---
*Generated: 2026-04-14*
