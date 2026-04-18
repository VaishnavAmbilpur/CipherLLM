# CipherLLM 🔒

**CipherLLM** is a privacy-first LLM gateway designed to strip sensitive PII (Personally Identifiable Information) from prompts before they reach external LLM providers (like OpenAI or Anthropic) and re-hydrate the response locally.

Built with a focus on compliance with the **India DPDP Act 2023**, it ensures that raw sensitive data never leaves your infrastructure.

---

## 🚀 Key Features

- **Multi-Layer Detection:** Combines high-speed Regex (for Aadhaar, PAN, UPI) with local NLP (for Names, Orgs, Locations).
- **Idempotent Token Vault:** Consistent tokenization ([PERSON_1]) ensures that the same PII value receives the same token within a session.
- **Enterprise-Grade Security:** All local mappings are secured with **AES-256-GCM** authenticated encryption.
- **Provider Agnostic:** Built-in support for OpenAI, Anthropic, and custom mock providers.
- **Monitoring Dashboard:** A Next.js 14 dashboard for real-time redaction analytics and session monitoring.
- **Audit-Ready:** Generates privacy-compliant JSONL audit logs for regulatory reporting.

---

## 📦 Quick Start

### Installation
```bash
npm install cipherllm
```

### Basic Usage (Library)
```typescript
import { CipherLLM, OpenAIProvider } from 'cipherllm';

const provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
const cipher = new CipherLLM(provider);

async function main() {
  const prompt = "Please summarize the file for mark@meta.com regarding Aadhaar 8234-5678-9012.";
  const result = await cipher.chat(prompt, 'user-session-123');

  console.log(result.response); 
  // Output: "The document for mark@meta.com with Aadhaar 8234-5678-9012 is..."
  // (Redaction happened in flight, re-hydration happened locally)
}
```

### Running the Gateway (Server)
```bash
npm start
```
The gateway will run at `http://localhost:3000`.

---

## 🏗 Architecture

1. **Proxy Layer:** Express.js server handling incoming requests.
2. **Detection Layer:** 
   - **Regex:** Handles deterministic patterns (Aadhaar, PAN, Email).
   - **Intelligence:** Uses `compromise` for non-patterned entities (Names).
3. **Vault Layer:** Manages token mappings and persistent encryption.
4. **LLM Connector:** Handles the out-bound call with the *redacted* prompt.
5. **Re-hydration Engine:** Fuzzy-matches tokens in the LLM response to restore original values.

---

## 📜 Documentation

- [API Reference](./docs/API_REFERENCE.md)
- [PII Support & Regex](./docs/PII_SUPPORT.md)
- [Security & Encryption](./docs/SECURITY.md)
- [Compliance (DPDP Act)](./docs/COMPLIANCE.md)
- [Dashboard Guide](./docs/DASHBOARD_GUIDE.md)

---

## 🛠 Development

### Testing
```bash
npm test
```
The project maintains a 100% logic coverage with over 30 unit and integration tests.

---

## 📄 License
ISC © 2026 CipherLLM Team
