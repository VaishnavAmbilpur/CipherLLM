# CipherLLM — Tech Stack

---

## 🗂️ Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                    CIPHERLLM STACK                   │
├────────────────┬────────────────────────────────────┤
│  Layer         │  Technology                        │
├────────────────┼────────────────────────────────────┤
│  Runtime       │  Node.js v18+                      │
│  Language      │  TypeScript                        │
│  Framework     │  Express.js                        │
│  Encryption    │  Node.js crypto (AES-256-GCM)      │
│  NLP / NER     │  compromise (JS) + spaCy (Python)  │
│  Key Derive    │  PBKDF2 via crypto module           │
│  Vault Storage │  In-memory Map + encrypted JSON    │
│  LLM Clients   │  OpenAI SDK, Anthropic SDK         │
│  Dashboard UI  │  Next.js 14                        │
│  Styling       │  Tailwind CSS                      │
│  Distribution  │  npm package                       │
│  Testing       │  Jest + Supertest                  │
│  Monitoring    │  Sentry                            │
└────────────────┴────────────────────────────────────┘
```

---

## 🔧 Core Dependencies

### The Gateway (Backend)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "compromise": "^14.10.0",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.21",
    "jest": "^29.0.0",
    "supertest": "^6.3.4",
    "nodemon": "^3.0.2"
  }
}
```

### The Dashboard (Frontend — Phase 2)

```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.383.0"
  }
}
```

---

## 🔐 Encryption Layer — Why These Choices

### AES-256-GCM
```
Why AES?     → Industry standard, FIPS 140-2 approved
Why 256-bit? → Maximum key length, quantum-resistant for now
Why GCM?     → Authenticated encryption — detects tampering
               Same cipher used in Chatty — you already know it
```

### PBKDF2 for Key Derivation
```
Why not raw password? → Too weak, brute-forceable
Why PBKDF2?           → 100,000 iterations of SHA-256
                        Adds computational cost to brute-force attacks
                        Same approach as Chatty's room code derivation
```

### Node.js `crypto` Module
```
Why not a third-party library?
→ Built into Node.js — no extra dependency
→ Battle-tested, maintained by Node core team
→ Zero supply-chain risk
```

---

## 🧠 NLP Layer — The Two-Engine Approach

### Engine 1 — `compromise` (JavaScript)

Runs in the same Node.js process. No extra service needed.

```javascript
import nlp from 'compromise';

function detectEntitiesWithNLP(text) {
  const doc = nlp(text);
  const entities = [];

  doc.people().forEach(person => {
    entities.push({ value: person.text(), type: 'PERSON' });
  });

  doc.organizations().forEach(org => {
    entities.push({ value: org.text(), type: 'ORG' });
  });

  doc.places().forEach(place => {
    entities.push({ value: place.text(), type: 'LOCATION' });
  });

  return entities;
}
```

**Good for:** Common English names, organizations, places
**Limitation:** Struggles with Indian names like "Vangala Varshith Reddy"

---

### Engine 2 — `spaCy` (Python Microservice) — Phase 2

A lightweight Python Flask server for advanced NER:

```python
# ner_service.py
from flask import Flask, request, jsonify
import spacy

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")  # lightweight model

@app.route('/detect', methods=['POST'])
def detect():
    text = request.json.get('text', '')
    doc = nlp(text)
    entities = [
        {"text": ent.text, "label": ent.label_}
        for ent in doc.ents
    ]
    return jsonify({"entities": entities})
```

Called from Node.js via internal HTTP:
```javascript
const response = await fetch('http://localhost:5001/detect', {
  method: 'POST',
  body: JSON.stringify({ text: prompt })
});
```

**Why run it separately?** spaCy is Python-only. A microservice keeps your Node.js gateway clean while giving you access to one of the best NER models available.

---

## 🌐 LLM Provider Abstraction

CipherLLM supports multiple providers via a unified interface:

```typescript
interface LLMProvider {
  name: string;
  send(prompt: string): Promise<string>;
}

class OpenAIProvider implements LLMProvider {
  name = 'openai';
  async send(prompt: string) {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    });
    return res.choices[0].message.content;
  }
}

class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  async send(prompt: string) {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });
    return res.content[0].text;
  }
}
```

Adding a new provider = implementing one interface. Clean and extensible.

---

## 💾 Storage Architecture

### Phase 1 — In-Memory (Session Only)

```
Request arrives → TokenVault created (Map)
                → Vault lives in RAM during session
                → Vault destroyed when session ends
                → Zero persistence, zero risk
```

### Phase 2 — Encrypted Persistent Storage

```
Vault data
    → JSON.stringify()
    → AES-256-GCM encrypt with master key
    → Write to encrypted .vault file locally
    → Master key never stored, derived from passphrase each time
```

File structure:
```
~/.cipherllm/
├── config.json          ← API keys, provider settings
├── sessions/
│   ├── sess_abc123.vault ← Encrypted vault for session abc123
│   └── sess_xyz789.vault
└── audit.log            ← What was redacted and when
```

---

## 📊 Dashboard Tech (Phase 2)

Built with Next.js 14 and Tailwind. Shows:

```
┌─────────────────────────────────────────┐
│         CipherLLM Dashboard             │
├─────────────┬───────────────────────────┤
│ This Session│  47 PII items intercepted │
│ Total       │  1,203 items protected    │
│ Top Types   │  EMAIL (34%), PERSON(28%) │
│             │  AADHAAR(18%), PHONE(12%) │
├─────────────┴───────────────────────────┤
│ Recent Redactions                        │
│ ● EMAIL intercepted — 2 mins ago        │
│ ● AADHAAR intercepted — 5 mins ago      │
│ ● PERSON intercepted — 5 mins ago       │
└─────────────────────────────────────────┘
```

Tech choices:
- **Recharts** for the interception analytics graph
- **Lucide React** for icons
- **Tailwind CSS** for styling — same as Chatty frontend

---

## 🧪 Testing Stack

```javascript
// Example: Test that Aadhaar is correctly tokenized
describe('PII Detection', () => {
  test('detects Aadhaar number', () => {
    const result = detect("Patient Aadhaar: 8234-5678-9012");
    expect(result).toContainEqual({
      original: '8234-5678-9012',
      token: '[AADHAAR_1]',
      type: 'AADHAAR'
    });
  });

  test('LLM never receives original Aadhaar', async () => {
    const intercepted = [];
    mockLLM.on('receive', (prompt) => intercepted.push(prompt));
    await cipher.chat("Aadhaar is 8234-5678-9012");
    expect(intercepted[0]).not.toContain('8234-5678-9012');
  });
});
```

---

## 🔗 Why This Stack Fits You Specifically

| Technology | Where You've Used It Before |
|---|---|
| Node.js / Express | Flow-q backend |
| AES-256-GCM | Chatty E2EE encryption |
| PBKDF2 | Chatty key derivation |
| Next.js 14 | Flow-q frontend |
| Tailwind CSS | Chatty frontend |
| MongoDB (optional vault) | Flow-q database |
| Sentry monitoring | Flow-q error tracking |

**You are not learning a new stack. You are applying your existing stack to a new, harder problem.** That's the most efficient path to building something impressive.
