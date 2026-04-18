# CipherLLM — Execution Plan

---

## 🗺️ The Guiding Rule

> Ship a working, honest MVP before you build anything impressive.
> A regex-only version that works is infinitely better than a broken NER version.

---

## 📅 Full Execution Timeline

```
Week 1-2   → PHASE 1: Core MVP (Regex + Proxy + Vault)
Week 3-4   → PHASE 2: Intelligence Layer (NER + Dashboard)
Week 5-6   → PHASE 3: Distribution (npm package + Extensions)
Week 7+    → PHASE 4: Product (Compliance Reports + Enterprise)
```

---

## ⚡ Phase 1 — Core MVP (Week 1–2)

### Goal
A working proxy that strips Indian PII from prompts using regex, stores it in a session vault, sends the clean prompt to an LLM, and re-hydrates the response. Demonstrable in a 5-minute live demo.

---

### Day 1–2: Project Setup

```bash
# Initialize project
mkdir cipherllm && cd cipherllm
npm init -y
npm install express typescript openai @anthropic-ai/sdk dotenv uuid zod
npm install -D @types/node @types/express ts-node nodemon jest

# Folder structure
cipherllm/
├── src/
│   ├── detection/
│   │   ├── regex.ts        ← PII regex patterns
│   │   └── detector.ts     ← Main detection engine
│   ├── vault/
│   │   ├── vault.ts        ← TokenVault class
│   │   └── crypto.ts       ← AES-256-GCM functions
│   ├── providers/
│   │   ├── openai.ts       ← OpenAI provider
│   │   └── anthropic.ts    ← Anthropic provider
│   ├── rehydration/
│   │   └── rehydrate.ts    ← Token → real value engine
│   ├── gateway/
│   │   └── proxy.ts        ← Main CipherLLM class
│   └── index.ts            ← Entry point + Express server
├── tests/
├── .env.example
└── package.json
```

---

### Day 3–4: Detection Engine

Build the regex pattern library — start with Indian PII first:

```typescript
// src/detection/regex.ts

export const PII_PATTERNS: Record<string, RegExp> = {
  // Indian PII — your competitive moat
  AADHAAR:    /\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
  PAN:        /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
  PHONE_IN:   /(\+91|0)?[6-9]\d{9}/g,
  UPI:        /[a-zA-Z0-9._-]+@[a-zA-Z]{3,}/g,
  SALARY_IN:  /₹\s?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?/g,
  VOTER_ID:   /[A-Z]{3}[0-9]{7}/g,

  // Universal PII
  EMAIL:      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  SSN:        /\d{3}-\d{2}-\d{4}/g,
  CREDIT_CARD:/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // Technical secrets
  API_KEY:    /[a-zA-Z0-9_-]{32,}/g,
};
```

Write unit tests immediately:
```typescript
// tests/detection.test.ts
test('detects Aadhaar', () => {
  const result = detect("Aadhaar: 8234-5678-9012");
  expect(result[0].type).toBe('AADHAAR');
  expect(result[0].original).toBe('8234-5678-9012');
});
```

**Milestone: 100% test pass rate on regex detection before moving on.**

---

### Day 5–6: Token Vault

```typescript
// src/vault/vault.ts
export class TokenVault {
  private vault = new Map<string, string>();
  private counters: Record<string, number> = {};

  tokenize(value: string, type: string): string {
    // Idempotent — same value always gets same token
    for (const [token, stored] of this.vault) {
      if (stored === value) return token;
    }
    const count = (this.counters[type] = (this.counters[type] || 0) + 1);
    const token = `[${type}_${count}]`;
    this.vault.set(token, value);
    return token;
  }

  getAll(): Map<string, string> { return this.vault; }
  destroy(): void { this.vault.clear(); }
}
```

---

### Day 7–8: Proxy Gateway + Re-hydration

```typescript
// src/gateway/proxy.ts
export class CipherLLM {
  private vault = new TokenVault();

  async chat(prompt: string): Promise<string> {
    // 1. Detect PII
    const detections = detect(prompt);

    // 2. Sanitize prompt
    let sanitized = prompt;
    for (const { original, type } of detections) {
      const token = this.vault.tokenize(original, type);
      sanitized = sanitized.replace(original, token);
    }

    // 3. Send to LLM
    const rawResponse = await this.provider.send(sanitized);

    // 4. Re-hydrate response
    return rehydrate(rawResponse, this.vault.getAll());
  }
}
```

---

### Day 9–10: Express API Server + Test Demo

Build the REST API so any application can use CipherLLM as a drop-in proxy:

```typescript
// POST /v1/chat
app.post('/v1/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  const session = getOrCreateSession(sessionId);
  const response = await session.cipher.chat(message);
  res.json({
    response,
    redactions: session.cipher.getRedactionCount()
  });
});
```

**Phase 1 Deliverable:** A running Express server that:
- Accepts prompts via REST API
- Strips Indian + universal PII
- Forwards to OpenAI or Anthropic
- Returns re-hydrated response
- Shows redaction count per session

**Demo script for Phase 1:**
```bash
curl -X POST http://localhost:3000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarize contract for Priya Sharma, Aadhaar 8234-5678-9012, salary ₹18,50,000"}'

# Response:
# "The contract for Priya Sharma specifies ₹18,50,000..."
# redactions: 3
```

---

## 🧠 Phase 2 — Intelligence Layer (Week 3–4)

### Goal
Add NLP-based entity detection, multi-turn conversation memory, and a basic dashboard.

### Week 3 — NER via `compromise`

```bash
npm install compromise
```

Extend the detector to catch names and organizations:
```typescript
import nlp from 'compromise';

export function detectWithNLP(text: string): Detection[] {
  const doc = nlp(text);
  const entities: Detection[] = [];

  doc.people().forEach(p => {
    entities.push({ original: p.text(), type: 'PERSON' });
  });
  doc.organizations().forEach(o => {
    entities.push({ original: o.text(), type: 'ORG' });
  });
  return entities;
}
```

### Week 4 — Dashboard (Next.js)

```bash
npx create-next-app@latest dashboard --typescript --tailwind
```

Three pages only for MVP dashboard:
1. `/` — Live session view (redactions happening in real time)
2. `/history` — Past sessions, what was intercepted
3. `/audit` — Exportable compliance log

---

## 📦 Phase 3 — Distribution (Week 5–6)

### Goal
Make CipherLLM installable with a single command.

### npm Package

```
npm install cipherllm
```

Structure the package:
```
cipherllm/
├── src/           ← Source TypeScript
├── dist/          ← Compiled JavaScript (what gets published)
├── README.md      ← How to use it
└── package.json   ← Main entry: "dist/index.js"
```

Publish:
```bash
npm login
npm publish --access public
```

### VS Code Extension — Phase 3B

An extension that redacts PII before you paste code into Copilot:

Trigger: `Ctrl + Shift + P` → "CipherLLM: Redact Selection"

This is a **different distribution channel** — reaches developers who've never heard of your npm package.

---

## 🏢 Phase 4 — Enterprise Features (Week 7+)

### Compliance Audit Log
Every redaction logged with:
```json
{
  "timestamp": "2026-04-13T10:23:45Z",
  "sessionId": "sess_abc123",
  "piiType": "AADHAAR",
  "action": "TOKENIZED",
  "llmProvider": "openai",
  "promptLength": 234
}
```
Note: Log the *type* of PII, never the actual value.

### DPDP / GDPR Compliance Report
One-click PDF report: "In the last 30 days, CipherLLM intercepted X Aadhaar numbers, Y email addresses, Z salary figures. Zero raw PII was transmitted to external LLMs."

**This report is what an enterprise shows their compliance officer.**

---

## ✅ Milestone Checklist

### Phase 1 — Must Have
- [ ] Regex patterns for Aadhaar, PAN, phone, email, salary
- [ ] TokenVault class with idempotent tokenization
- [ ] AES-256-GCM encryption for vault
- [ ] Re-hydration engine with fuzzy matching
- [ ] OpenAI + Anthropic provider support
- [ ] Express REST API
- [ ] Jest tests with >80% coverage
- [ ] Working live demo

### Phase 2 — Should Have
- [ ] NLP NER via `compromise`
- [ ] Multi-turn conversation vault persistence
- [ ] Next.js dashboard — redaction stats
- [ ] Session management

### Phase 3 — Nice To Have
- [ ] npm package published
- [ ] VS Code extension
- [ ] spaCy microservice for advanced NER
- [ ] CLI tool: `npx cipherllm "your prompt here"`

### Phase 4 — Enterprise
- [ ] Audit log system
- [ ] Compliance PDF report
- [ ] Multi-tenant API key management
- [ ] Rate limiting and usage analytics

---

## 🚨 Rules For Execution

1. **Test before you build the next layer.** Don't touch the NLP layer until regex tests are 100% passing.
2. **Never fake the encryption.** If the vault isn't actually encrypted, say so — don't pretend.
3. **Demo on real data.** Not "example@email.com" — use a realistic fake Indian name and Aadhaar in your demo.
4. **Ship Phase 1 before telling anyone.** A working demo beats a great README.
5. **The npm package is the moat.** One `npm install` and any developer can use it. That's the distribution advantage over every enterprise-only competitor.
