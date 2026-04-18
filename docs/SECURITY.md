# Security & Privacy Model

CipherLLM is built from the ground up to prevent data leakage.

## 1. Zero-Trust Gateway
The system operates as a "middleman" that never sends raw PII to the cloud. All identification and redaction happen **locally** within your server/container.

## 2. Vault Encryption (AES-256-GCM)
If you choose to persist session data (Phase 3), CipherLLM uses **AES-256-GCM**, the gold standard for authenticated encryption.

### Key Derivation (PBKDF2)
Master keys are not stored in plaintext. We use **PBKDF2** (Password-Based Key Derivation Function 2) with:
- **Salt:** 16-byte random salt per vault.
- **Iterations:** 100,000 rounds.
- **HMAC:** SHA-256.

### Encrypted Vault Format
Encrypted files stored on disk follow a four-part sealed format:
`salt:iv:auth_tag:ciphertext`

## 3. PII-Safe Audit Logs
Our `AuditLogger` is designed for strict compliance.
- **Metadata Captured:** Timestamp, SessionID, PII Type (e.g., "AADHAAR"), Token (e.g., "[AADHAAR_1]").
- **Never Captured:** The actual Aadhaar number or name.

This ensures that even if audit logs are compromised, no sensitive information is leaked.
