# CipherLLM — The Solution

---

## 🧠 The Core Concept

CipherLLM acts as a **secure proxy** that sits between your application and any LLM provider.

Every prompt passes through it. Sensitive data is stripped, replaced with tokens, and the clean prompt is forwarded to the AI. When the AI responds, the real data is quietly re-inserted locally — before anyone sees the response.

---

## 🔄 The Full Pipeline — Step By Step

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — USER SENDS A PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Summarize the employment contract for Priya Sharma,
Aadhaar 8234-5678-9012, email priya@techcorp.in,
salary ₹18,50,000 per annum."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — DETECTION LAYER SCANS THE PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Detected PII:
┌──────────────────────┬─────────────┬────────────┐
│ Value                │ Type        │ Token      │
├──────────────────────┼─────────────┼────────────┤
│ Priya Sharma         │ PERSON      │ [PERSON_1] │
│ 8234-5678-9012       │ AADHAAR     │ [AADHAAR_1]│
│ priya@techcorp.in    │ EMAIL       │ [EMAIL_1]  │
│ ₹18,50,000           │ SALARY      │ [SALARY_1] │
└──────────────────────┴─────────────┴────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — VAULT STORES ORIGINAL VALUES LOCALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TokenVault (AES-256 encrypted, stored locally):
{
  "[PERSON_1]":  "Priya Sharma",
  "[AADHAAR_1]": "8234-5678-9012",
  "[EMAIL_1]":   "priya@techcorp.in",
  "[SALARY_1]":  "₹18,50,000"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — SANITIZED PROMPT SENT TO LLM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Summarize the employment contract for [PERSON_1],
Aadhaar [AADHAAR_1], email [EMAIL_1],
salary [SALARY_1] per annum."

        → Sent to OpenAI / Claude / Gemini

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — LLM RESPONDS WITH TOKENS INTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"The contract for [PERSON_1] specifies an annual
compensation of [SALARY_1], effective immediately.
HR can reach [PERSON_1] at [EMAIL_1]."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — RE-HYDRATION ENGINE RESTORES REAL DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"The contract for Priya Sharma specifies an annual
compensation of ₹18,50,000, effective immediately.
HR can reach Priya Sharma at priya@techcorp.in."

        → Shown to user. Real data never left locally.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏗️ The 4 Solution Layers

### Layer 1 — PII Detection Engine

Finds sensitive data using two methods:

**Regex Detection** — fast, deterministic, runs first:
```javascript
const PII_PATTERNS = {
  // Indian-specific
  aadhaar:     /\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
  pan:         /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
  phone_in:    /(\+91|0)?[6-9]\d{9}/g,
  upi:         /[a-zA-Z0-9._-]+@[a-zA-Z]{3,}/g,
  salary_in:   /₹\s?\d+(?:,\d{2,3})*(?:\.\d+)?/g,
  voter_id:    /[A-Z]{3}[0-9]{7}/g,

  // Universal
  email:       /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  ssn:         /\d{3}-\d{2}-\d{4}/g,
  api_key:     /[a-zA-Z0-9]{32,}/g,
  credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};
```

**NLP / NER Detection** — smart, catches names and organizations:
- Uses `compromise` library (lightweight, runs in Node.js)
- Detects: Person names, company names, locations
- Catches what regex cannot — *"the employee at Infosys in Pune"*

---

### Layer 2 — Token Vault

Encrypted local storage that maps tokens to real values:

```javascript
class TokenVault {
  constructor() {
    this.vault = new Map();
    this.counters = {};
    this.sessionId = crypto.randomUUID();
  }

  add(value, type) {
    // Check if already tokenized (prevents duplicate tokens)
    for (const [token, stored] of this.vault) {
      if (stored === value) return token;
    }
    const count = (this.counters[type] = (this.counters[type] || 0) + 1);
    const token = `[${type}_${count}]`;
    this.vault.set(token, value);
    return token;
  }

  destroy() {
    this.vault.clear(); // Wiped at session end
  }
}
```

**Properties:**
- Never written to disk unless user explicitly saves
- If saved → AES-256-GCM encrypted before storage
- Scoped per conversation session
- Same value always maps to same token (consistency)

---

### Layer 3 — AES-256-GCM Encryption

For any vault that is persisted beyond a session:

```javascript
import crypto from 'crypto';

function encryptVault(vaultData, masterKey) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  let encrypted = cipher.update(JSON.stringify(vaultData), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    data: encrypted,
    tag: cipher.getAuthTag().toString('hex')
  };
}
```

The master key is derived from the user's passphrase using **PBKDF2** — the same approach used in Chatty's E2EE implementation.

---

### Layer 4 — Re-hydration Engine

Restores real data into the AI's response:

```javascript
function rehydrate(response, vault) {
  let result = response;
  for (const [token, original] of vault.entries()) {
    // Fuzzy match handles LLM mangling like [Person_1] or [ PERSON_1 ]
    const pattern = new RegExp(
      token.replace(/[[\]]/g, '\\$&').replace(/[_]/g, '[_\\s]?'),
      'gi'
    );
    result = result.replace(pattern, original);
  }
  return result;
}
```

---

## 🛡️ What Gets Detected — Full PII Coverage

| Category | Indian PII | Universal PII |
|---|---|---|
| Identity | Aadhaar, PAN, Voter ID | SSN, Passport No. |
| Contact | +91 phone, UPI ID | Email, Phone |
| Financial | ₹ salary, Bank IFSC | Credit card, IBAN |
| Personal | Names (NER) | Names (NER) |
| Technical | — | API keys, secrets, tokens |
| Location | City/state (NER) | Addresses (NER) |

---

## ⚠️ Known Edge Cases and How They're Handled

### Problem 1 — LLM Mangles Tokens
The LLM might return `[Person_1]` instead of `[PERSON_1]`.
**Fix:** Case-insensitive fuzzy regex during re-hydration.

### Problem 2 — Same Person, Multiple Tokens
Without a consistency check, "John" in sentence 1 and "John" in sentence 5 could become `[PERSON_1]` and `[PERSON_3]`.
**Fix:** Vault checks for existing value before creating a new token.

### Problem 3 — Implicit PII
*"My patient in Ward 4"* — no name, but still PII.
**Fix:** Phase 2 feature — local semantic model for contextual detection.

### Problem 4 — Multi-turn Conversations
Token vault must persist across turns, not reset each message.
**Fix:** Session-scoped vault tied to conversation ID, not message ID.

---

## 🔌 How Developers Use It

```javascript
import CipherLLM from 'cipherllm';

const cipher = new CipherLLM({ provider: 'openai' });

// That's it. Everything is handled automatically.
const response = await cipher.chat(
  "Summarize the contract for Priya Sharma, salary ₹18,50,000"
);

console.log(response);
// → "The contract for Priya Sharma specifies ₹18,50,000..."
// Priya's data never touched OpenAI's servers.
```

---

*The solution is simple to use. The protection is serious underneath.*
