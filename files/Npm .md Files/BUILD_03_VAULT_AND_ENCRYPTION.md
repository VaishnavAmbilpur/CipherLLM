# How We Built CipherLLM — Part 3: The Token Vault & Encryption

> This document explains how the TokenVault works, why we chose AES-256-GCM, how PBKDF2 key derivation works, and exactly how the encrypted vault format is structured.

---

## The Vault's Job

After detection finds `{ original: "8234-5678-9012", type: "AADHAAR" }`, something needs to:

1. Assign it a token: `[AADHAAR_1]`
2. Store the mapping so we can reverse it later: `[AADHAAR_1]` → `"8234-5678-9012"`
3. Ensure the same value always gets the same token (idempotency)
4. Wipe the mapping when the session ends
5. Optionally encrypt and save the mapping to disk for long-running sessions

That is the vault's entire job. Nothing else.

---

## The TokenVault Class (`src/vault/vault.ts`)

```typescript
import { v4 as uuidv4 } from 'uuid';

export class TokenVault {
  // The core data structure: token → original value
  // Map preserves insertion order and has O(1) lookup
  private vault = new Map<string, string>();

  // Tracks how many tokens of each type have been created
  // { "AADHAAR": 1, "EMAIL": 3, "PERSON": 2 }
  private counters: Record<string, number> = {};

  // Unique ID for this session — used in audit logs
  public readonly sessionId: string;

  constructor() {
    this.sessionId = uuidv4();
    // Generates: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    // UUID v4 is random — no two sessions ever share an ID
  }

  tokenize(value: string, type: string): string {
    // IDEMPOTENCY CHECK — most important logic in the vault
    // If we've already seen this exact value, return the same token
    for (const [token, stored] of this.vault) {
      if (stored === value) return token;
    }
    // Why do we need this?
    // "Priya Sharma appears twice in the prompt."
    // Without this check, she'd get [PERSON_1] the first time
    // and [PERSON_2] the second time.
    // When the LLM responds mentioning [PERSON_1], we'd restore it.
    // But [PERSON_2] in the response would never get restored — it would
    // appear in the output as a raw token. Bug.
    // With this check: both occurrences get [PERSON_1]. Consistent.

    // Increment the counter for this type
    this.counters[type] = (this.counters[type] || 0) + 1;
    const count = this.counters[type];

    // Build the token: [TYPE_NUMBER]
    const token = `[${type}_${count}]`;

    // Store the mapping
    this.vault.set(token, value);

    return token;
  }

  // Returns the full map — used by the re-hydration engine
  getAll(): Map<string, string> {
    return this.vault;
  }

  // Returns how many items are in the vault
  size(): number {
    return this.vault.size;
  }

  // Completely wipes the vault — called at session end
  // After this, the mapping is gone forever (unless saved to disk)
  destroy(): void {
    this.vault.clear();
    // Explicitly clear counters too
    this.counters = {};
  }

  // Converts vault to a plain object for serialization
  // Used before encrypting and saving to disk
  serialize(): Record<string, string> {
    return Object.fromEntries(this.vault);
  }

  // Loads vault from a plain object
  // Used after decrypting from disk
  deserialize(data: Record<string, string>): void {
    this.vault.clear();
    for (const [token, value] of Object.entries(data)) {
      this.vault.set(token, value);
      // Rebuild counters from existing tokens
      const match = token.match(/\[(\w+)_(\d+)\]/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2]);
        this.counters[type] = Math.max(this.counters[type] || 0, num);
      }
    }
  }
}
```

### Why `Map` instead of a plain object `{}`?

We use `Map<string, string>` rather than `Record<string, string>` for two reasons:

1. **Insertion order is guaranteed.** `Map` preserves the order items were added. When we iterate the vault for re-hydration, we process tokens in the order they were created. This matters because `[PERSON_1]` and `[PERSON_11]` could both appear in a response — we need to match `[PERSON_11]` before `[PERSON_1]` to avoid partial replacement. Sorting by token name length (descending) handles this.

2. **No prototype pollution.** A plain JavaScript object `{}` inherits methods from `Object.prototype` — `toString`, `hasOwnProperty`, `constructor`, etc. If someone's PII happened to be a string like `"constructor"`, it could cause subtle bugs. `Map` has no prototype pollution risk.

---

## Vault Encryption (`src/vault/crypto.ts`)

For Phase 1 (in-memory sessions), the vault is never saved to disk — it exists only in RAM and is destroyed when the session ends.

For persistent sessions (saving across server restarts), the vault must be encrypted before writing to disk. We use AES-256-GCM.

### Why AES-256-GCM Specifically

There are three choices for symmetric encryption:

| Algorithm | Problem |
|---|---|
| AES-128-CBC | 128-bit key is shorter. CBC mode doesn't detect tampering. |
| AES-256-CBC | Good key length. But CBC mode has no authentication — someone can modify the ciphertext and you'd never know. |
| **AES-256-GCM** | 256-bit key. GCM mode is **authenticated** — any modification to the ciphertext is detected immediately. |

"Authenticated encryption" means AES-256-GCM does two things simultaneously: it encrypts the data AND it generates an authentication tag. When you decrypt, if anyone modified even one bit of the ciphertext, the authentication tag won't match and decryption fails with an error. This is called "Authenticated Encryption with Associated Data" (AEAD).

For a vault containing real Aadhaar numbers and names, we need this guarantee. A silent data corruption could restore wrong data, which is worse than restoration failing.

### The Encryption Functions

```typescript
// src/vault/crypto.ts

import crypto from 'crypto';

// These are used in the encrypted file format
const SALT_BYTES = 16;   // 128-bit salt for key derivation
const IV_BYTES = 12;     // 96-bit IV — GCM's recommended IV length
const TAG_BYTES = 16;    // 128-bit authentication tag (GCM standard)
const KEY_BYTES = 32;    // 256-bit key (AES-256)
const PBKDF2_ITERATIONS = 100_000;

// ─────────────────────────────────────────
// STEP 1: DERIVE A KEY FROM A PASSPHRASE
// ─────────────────────────────────────────
function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    passphrase,          // The user's passphrase (never stored)
    salt,                // Random salt (stored alongside ciphertext)
    PBKDF2_ITERATIONS,  // 100,000 rounds of hashing
    KEY_BYTES,           // Output: 32 bytes = 256-bit key
    'sha256'             // HMAC algorithm
  );
}
/*
 * Why not just use the passphrase directly as the key?
 *
 * Passphrases chosen by humans are weak. "mypassword123" is only
 * about 40 bits of entropy. AES-256 needs 256 bits.
 *
 * PBKDF2 solves this by:
 * 1. Running SHA-256 100,000 times. This takes ~100ms on modern hardware.
 *    For the legitimate user: barely noticeable.
 *    For an attacker trying billions of passphrases: makes brute-force
 *    100,000x slower — effectively infeasible.
 * 2. Using a random salt. Two vaults encrypted with the same passphrase
 *    produce completely different keys because their salts are different.
 *    This prevents rainbow table attacks.
 */

// ─────────────────────────────────────────
// STEP 2: ENCRYPT
// ─────────────────────────────────────────
export function encryptVault(
  data: Record<string, string>,
  passphrase: string
): string {
  // Generate a fresh random salt every time we encrypt
  // Even if you encrypt the same data twice with the same passphrase,
  // you get different ciphertext because the salt is different
  const salt = crypto.randomBytes(SALT_BYTES);

  // Generate a fresh random IV (Initialization Vector)
  // IV ensures that encrypting the same plaintext twice gives different ciphertext
  const iv = crypto.randomBytes(IV_BYTES);

  // Derive the 256-bit key from the passphrase + salt
  const key = deriveKey(passphrase, salt);

  // Create the AES-256-GCM cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt the vault data (serialized as JSON)
  const plaintext = JSON.stringify(data);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  // Get the authentication tag (16 bytes generated by GCM mode)
  const authTag = cipher.getAuthTag();

  // Pack everything into a single string: salt:iv:tag:ciphertext
  // All encoded as hex for safe storage in text files
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex')
  ].join(':');
}

// ─────────────────────────────────────────
// STEP 3: DECRYPT
// ─────────────────────────────────────────
export function decryptVault(
  encryptedString: string,
  passphrase: string
): Record<string, string> {
  // Split the stored string back into its components
  const parts = encryptedString.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid vault format');
  }

  const [saltHex, ivHex, authTagHex, dataHex] = parts;

  // Convert hex strings back to Buffers
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(dataHex, 'hex');

  // Re-derive the key using the stored salt and the provided passphrase
  const key = deriveKey(passphrase, salt);

  // Create the decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  // Set the authentication tag — GCM will verify this during decryption
  decipher.setAuthTag(authTag);

  try {
    // Decrypt — throws if authentication tag doesn't match (tampered data)
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()    // ← this is where GCM authentication happens
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  } catch (err) {
    // This error means either:
    // 1. Wrong passphrase was provided
    // 2. The encrypted file was tampered with
    // We can't distinguish between them — and that's by design
    throw new Error('Decryption failed: incorrect passphrase or corrupted vault');
  }
}
```

### The Encrypted File Format Explained

When a vault is saved to disk, it looks like this:

```
a3f2b8c9d4e5f6a7:b8c9d4e5f6a7b8c9:f6a7b8c9d4e5f6a7b8c9d4e5f6a7b8c9:4d5e6f7a8b9c0d1e2f...
```

It's four colon-separated hex strings:

```
[16 bytes SALT] : [12 bytes IV] : [16 bytes AUTH TAG] : [N bytes CIPHERTEXT]
```

- **SALT (16 bytes):** Used with the passphrase to derive the encryption key. Different for every vault. Stored in plaintext — it's not secret.
- **IV (12 bytes):** Initialization vector. Ensures two encryptions of the same data produce different ciphertext. Stored in plaintext — it's not secret.
- **AUTH TAG (16 bytes):** AES-256-GCM's integrity check. If anyone modifies even one byte of the ciphertext, this tag won't match during decryption and an error is thrown.
- **CIPHERTEXT (N bytes):** The actual encrypted vault data. Without the passphrase, this is meaningless random-looking bytes.

The salt and IV are not secrets — they exist to prevent precomputed attacks. Only the passphrase (which is never stored) makes decryption possible.

### Saving and Loading the Vault

```typescript
// In TokenVault class, the save/load methods:

import { encryptVault, decryptVault } from './crypto';
import fs from 'fs';

save(filePath: string, passphrase: string): void {
  const data = this.serialize();
  const encrypted = encryptVault(data, passphrase);
  fs.writeFileSync(filePath, encrypted, 'utf8');
}

load(filePath: string, passphrase: string): void {
  const encrypted = fs.readFileSync(filePath, 'utf8');
  const data = decryptVault(encrypted, passphrase);
  this.deserialize(data);
}
```

---

## Testing the Vault (`tests/vault.test.ts`)

```typescript
describe('TokenVault — Tokenization', () => {

  test('tokenizes a value and returns a token', () => {
    const vault = new TokenVault();
    const token = vault.tokenize('8234-5678-9012', 'AADHAAR');
    expect(token).toBe('[AADHAAR_1]');
  });

  test('second unique value of same type increments counter', () => {
    const vault = new TokenVault();
    vault.tokenize('8234-5678-9012', 'AADHAAR');
    const token2 = vault.tokenize('9999-8888-7777', 'AADHAAR');
    expect(token2).toBe('[AADHAAR_2]');
  });

  test('idempotency — same value always returns same token', () => {
    const vault = new TokenVault();
    const t1 = vault.tokenize('priya@corp.in', 'EMAIL');
    const t2 = vault.tokenize('priya@corp.in', 'EMAIL');
    expect(t1).toBe(t2);
    expect(t1).toBe('[EMAIL_1]');
  });

  test('vault size counts unique values only', () => {
    const vault = new TokenVault();
    vault.tokenize('priya@corp.in', 'EMAIL');
    vault.tokenize('priya@corp.in', 'EMAIL'); // duplicate
    vault.tokenize('8234-5678-9012', 'AADHAAR');
    expect(vault.size()).toBe(2); // not 3
  });

  test('destroy clears all mappings', () => {
    const vault = new TokenVault();
    vault.tokenize('test@email.com', 'EMAIL');
    vault.destroy();
    expect(vault.size()).toBe(0);
    // After destroy, same value gets a fresh token
    const token = vault.tokenize('test@email.com', 'EMAIL');
    expect(token).toBe('[EMAIL_1]'); // resets to 1
  });
});

describe('Vault Encryption (AES-256-GCM)', () => {

  test('encrypts and decrypts vault correctly', () => {
    const vault = new TokenVault();
    vault.tokenize('Priya Sharma', 'PERSON');
    vault.tokenize('8234-5678-9012', 'AADHAAR');

    const passphrase = 'test-passphrase-123';
    const tmpFile = '/tmp/test-vault.enc';

    vault.save(tmpFile, passphrase);

    const vault2 = new TokenVault();
    vault2.load(tmpFile, passphrase);

    // vault2 should have the same mappings as vault
    expect(vault2.getAll().get('[PERSON_1]')).toBe('Priya Sharma');
    expect(vault2.getAll().get('[AADHAAR_1]')).toBe('8234-5678-9012');
  });

  test('decryption fails with wrong passphrase', () => {
    const vault = new TokenVault();
    vault.tokenize('secret', 'API_KEY');
    vault.save('/tmp/test-vault2.enc', 'correct-passphrase');

    const vault2 = new TokenVault();
    expect(() => {
      vault2.load('/tmp/test-vault2.enc', 'wrong-passphrase');
    }).toThrow('Decryption failed');
  });

  test('two encryptions of same data produce different ciphertext', () => {
    const data = { '[PERSON_1]': 'Priya Sharma' };
    const enc1 = encryptVault(data, 'passphrase');
    const enc2 = encryptVault(data, 'passphrase');
    // Different because salt and IV are random each time
    expect(enc1).not.toBe(enc2);
    // But both decrypt to the same data
    expect(decryptVault(enc1, 'passphrase')).toEqual(data);
    expect(decryptVault(enc2, 'passphrase')).toEqual(data);
  });

  test('tampered ciphertext throws authentication error', () => {
    const data = { '[EMAIL_1]': 'priya@corp.in' };
    const encrypted = encryptVault(data, 'passphrase');

    // Tamper with the ciphertext (last part after the 4th colon)
    const parts = encrypted.split(':');
    parts[3] = parts[3].replace('a', 'b'); // flip one hex character
    const tampered = parts.join(':');

    expect(() => decryptVault(tampered, 'passphrase')).toThrow();
  });
});
```

---

## The Session Model

Each call to `new CipherLLM(provider)` creates a fresh `TokenVault` with a new UUID session ID. The vault persists for the lifetime of that `CipherLLM` instance.

For multi-turn conversations, the same `CipherLLM` instance should be reused across messages. This is handled by the `sessionId` parameter in `cipher.chat(prompt, sessionId)` — the gateway keeps a Map of session IDs to `CipherLLM` instances.

```typescript
// In the gateway (proxy.ts):
const sessions = new Map<string, CipherLLM>();

function getOrCreateSession(sessionId: string): CipherLLM {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new CipherLLM(provider));
  }
  return sessions.get(sessionId)!;
}
```

If `[PERSON_1]` was tokenized in message 1, and the LLM refers to `[PERSON_1]` in message 5, the same vault is still alive with the same mapping. It gets re-hydrated correctly.

---

*Next: [Part 4 — LLM Providers, Re-hydration & The Main Gateway](./BUILD_04_PROVIDERS_AND_GATEWAY.md)*
