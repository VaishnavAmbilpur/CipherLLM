# How We Built CipherLLM — Part 1: Project Setup & Architecture

> This document explains every decision made when setting up the project from scratch — the folder structure, the TypeScript configuration, the package choices, and why each thing is the way it is.

---

## The Problem We Were Solving

Before writing a single line of code, we needed a crisp definition of what the library does:

> A developer calls `cipher.chat("Hello, my Aadhaar is 8234-5678-9012")`. The library detects the Aadhaar, replaces it with `[AADHAAR_1]`, sends the clean prompt to OpenAI, gets a response back, replaces `[AADHAAR_1]` with `8234-5678-9012` again, and returns the final response. OpenAI never sees the real Aadhaar number.

That single description gave us the full architecture before we opened a code editor.

---

## The 5-Layer Architecture

We identified 5 distinct jobs the library needed to do:

```
INPUT PROMPT
     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — DETECTION ENGINE                             │
│  Scans the prompt. Finds PII using regex + NLP.         │
│  Output: list of { value: "8234-5678-9012", type: "AADHAAR" }
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2 — TOKEN VAULT                                  │
│  Assigns a token to each detected value.                │
│  Stores the mapping: [AADHAAR_1] → "8234-5678-9012"     │
│  Vault is encrypted if saved to disk.                   │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3 — LLM PROVIDER                                 │
│  Sends the sanitized prompt to OpenAI / Anthropic.      │
│  Completely swappable — same interface for all models.  │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 4 — RE-HYDRATION ENGINE                          │
│  Takes the LLM response. Replaces [AADHAAR_1] back      │
│  with "8234-5678-9012". Handles fuzzy matching.         │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 5 — AUDIT LOGGER                                 │
│  Logs what type of PII was intercepted and when.        │
│  NEVER logs the actual values. Only metadata.           │
└─────────────────────────────────────────────────────────┘
     ↓
OUTPUT RESPONSE (real data restored, LLM never saw it)
```

Each layer became a folder inside `src/`. Each layer has one job and only talks to adjacent layers. This separation means you can test each layer in complete isolation.

---

## Folder Structure — Every File Explained

```
cipherllm/
├── src/
│   ├── detection/
│   │   ├── regex.ts          ← All PII regex patterns live here
│   │   └── detector.ts       ← Orchestrates regex + NLP, returns detections
│   │
│   ├── vault/
│   │   ├── vault.ts          ← TokenVault class — the in-memory Map
│   │   └── crypto.ts         ← AES-256-GCM encrypt/decrypt functions
│   │
│   ├── providers/
│   │   ├── openai.ts         ← OpenAI implementation of LLMProvider
│   │   ├── anthropic.ts      ← Anthropic implementation of LLMProvider
│   │   └── mock.ts           ← Mock provider used in tests (no real API calls)
│   │
│   ├── rehydration/
│   │   └── rehydrate.ts      ← Takes LLM response + vault, restores real data
│   │
│   ├── logger/
│   │   └── audit.ts          ← AuditLogger class
│   │
│   ├── gateway/
│   │   └── proxy.ts          ← CipherLLM class — orchestrates all 5 layers
│   │
│   ├── types.ts              ← All shared TypeScript interfaces
│   └── lib.ts                ← THE PUBLIC ENTRY POINT — only exports what users need
│
├── tests/
│   ├── detection.test.ts     ← Tests for regex patterns + NLP
│   ├── vault.test.ts         ← Tests for tokenization + idempotency
│   ├── crypto.test.ts        ← Tests for AES-256 encrypt/decrypt
│   ├── rehydration.test.ts   ← Tests for fuzzy token restoration
│   ├── providers.test.ts     ← Tests for provider abstraction
│   └── integration.test.ts  ← End-to-end: prompt in → real data out
│
├── docs/
│   ├── API_REFERENCE.md
│   ├── PII_SUPPORT.md
│   ├── SECURITY.md
│   ├── COMPLIANCE.md
│   └── DASHBOARD_GUIDE.md
│
├── package.json
├── tsconfig.json
├── jest.config.js
├── .gitignore
└── README.md
```

### Why `lib.ts` is the only public entry point

This is a critical design decision. `lib.ts` is the only file that exports anything to the outside world. Every other file exports things for internal use only.

This means when a developer does `import { CipherLLM } from 'cipherllm'`, they only see:
- `CipherLLM` — the main class
- `OpenAIProvider`, `AnthropicProvider` — the providers
- `TokenVault`, `AuditLogger` — advanced usage
- The TypeScript types they need

They do NOT see `rehydrate()`, `detect()`, `PII_PATTERNS`, or any internal functions. Those are implementation details. If we ever change how detection works internally, the public API stays the same. Developers' code doesn't break.

---

## Initializing the Project

```bash
mkdir cipherllm
cd cipherllm
npm init -y
```

`npm init -y` creates a bare `package.json` with defaults. We then manually edited it.

### Installing Dependencies

```bash
# Runtime dependencies — these install for everyone who uses the package
npm install @anthropic-ai/sdk openai compromise uuid zod

# Dev dependencies — only needed to BUILD the package, not to USE it
npm install -D typescript ts-node ts-jest jest nodemon \
  @types/node @types/jest @types/supertest supertest
```

**Why each runtime dependency:**

| Package | Version Used | Why We Need It |
|---|---|---|
| `@anthropic-ai/sdk` | ^0.88.0 | Official Anthropic SDK — the only safe way to call Claude |
| `openai` | ^6.34.0 | Official OpenAI SDK |
| `compromise` | ^14.15.0 | NLP library for detecting person names, orgs, locations. Runs in Node.js with zero Python required |
| `uuid` | ^13.0.0 | Generating unique session IDs (`sess_abc123`) |
| `zod` | ^4.3.6 | Runtime validation of inputs — prevents crashes from malformed API calls |

**Why each dev dependency:**

| Package | Why |
|---|---|
| `typescript` | Compiles `.ts` → `.js`. Goes in devDeps because users of the package get compiled `.js` files, not source. |
| `ts-node` | Runs TypeScript directly during development (`npm run dev`) |
| `ts-jest` | Makes Jest understand TypeScript files in tests |
| `jest` | Test runner |
| `nodemon` | Restarts the dev server on file changes |
| `@types/*` | Type definitions for packages that don't bundle their own |
| `supertest` | Makes HTTP assertions in integration tests without starting a real server |

**Intentionally NOT included:**

- `express` — not needed. This is a library, not a server
- `cors`, `axios`, `dotenv` — server concerns. Library users handle this themselves

---

## TypeScript Configuration — `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "node16",
    "rootDir": "./src",
    "moduleResolution": "node16",
    "types": ["node", "jest"],
    "outDir": "./dist/src",
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["tests/**/*", "node_modules", "dist"]
}
```

**Every option explained:**

`"target": "es2016"` — Compiles to ES2016 JavaScript. This is the version of JavaScript that Node.js 18+ understands natively. We don't need to go lower because we're targeting Node.js developers, not browsers.

`"module": "node16"` — Use Node.js 16+ module resolution. This handles both `import/export` and `require()` correctly. The alternative `"commonjs"` doesn't handle `.js` extensions in import paths properly.

`"rootDir": "./src"` — TypeScript only compiles files inside `src/`. Without this, it would try to compile your `tests/` folder into `dist/` too, which you never want in a published package.

`"outDir": "./dist/src"` — Compiled JavaScript goes here. The path must match what you put in `package.json`'s `"main"` field. Our `package.json` says `"main": "dist/src/lib.js"` — that's where the compiled `lib.ts` lands.

`"declaration": true` — Generates `.d.ts` type definition files alongside the `.js` files. This is what gives TypeScript users autocomplete when they use your package. Without this, users of `cipherllm` in TypeScript projects would get no type hints.

`"declarationMap": true` — Generates `.d.ts.map` files. These let IDE "Go to Definition" commands jump to your original `.ts` source even when using the compiled package. Very helpful for debugging.

`"strict": true` — Enables all strict type checks. This is a single flag that turns on: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and several others. It forces you to handle every possible `null`/`undefined` case explicitly.

`"skipLibCheck": true` — Skips type-checking `.d.ts` files from `node_modules`. Without this, TypeScript will fail to compile if any third-party package has slightly wrong types — which happens often with fast-moving packages.

`"esModuleInterop": true` — Allows `import x from 'y'` syntax for CommonJS modules that use `module.exports = ...`. Without this, you'd have to write `import * as x from 'y'` for CommonJS packages.

`"exclude": ["tests/**/*"]` — Tests are excluded from compilation. The `tests/` folder is only run by Jest directly — it doesn't get compiled into `dist/`.

---

## The `package.json` — Every Field That Matters

```json
{
  "name": "cipherllm",
  "version": "1.0.0",
  "main": "dist/src/lib.js",
  "types": "dist/src/lib.d.ts",
  "files": ["dist/src", "README.md", "docs/"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

`"main": "dist/src/lib.js"` — When a developer writes `require('cipherllm')`, Node.js loads this file. It's the compiled version of `src/lib.ts`.

`"types": "dist/src/lib.d.ts"` — When a TypeScript developer writes `import { CipherLLM } from 'cipherllm'`, TypeScript loads this file for type information. It's the generated type definitions from `src/lib.ts`.

`"files": [...]` — This is the most important field for npm publishing. It's a whitelist of what gets uploaded to npm. Without this, npm uploads everything — your `tests/`, your raw `src/` TypeScript, your `node_modules/`. With this field:
- `dist/src` — the compiled JavaScript and type definitions
- `README.md` — shown on the npm package page
- `docs/` — linked from README

Everything else (raw TypeScript source, tests, config files) stays off npm.

`"prepublishOnly"` — This script runs automatically before every `npm publish`. It first runs `tsc` to compile TypeScript, then runs all tests. If either fails, the publish is aborted. This makes it impossible to accidentally publish broken code.

---

## The `.gitignore`

```
node_modules/
dist/
.env
.env.local
.env.production
.DS_Store
*.tgz
```

`dist/` is gitignored but NOT npmignored. This is intentional and confuses people:
- Git tracks your source code (`src/`)
- npm publishes your compiled output (`dist/`)
- These are opposite things controlled by different files

The `files` field in `package.json` controls what goes to npm. The `.gitignore` controls what goes to git. `dist/` should be in `.gitignore` (auto-generated, no point tracking it) but should be published to npm (that's what users actually need).

`.env` is gitignored because it contains real API keys. The `.env.example` (a template with placeholder values) gets committed — the actual `.env` never does.

---

## The Types File — `src/types.ts`

Before writing any implementation, we defined all the shared TypeScript interfaces in one place:

```typescript
// src/types.ts

// A single PII match found in a prompt
export interface Detection {
  original: string;   // The actual value: "8234-5678-9012"
  type: string;       // The category: "AADHAAR"
  start?: number;     // Character position where it was found (optional, for future highlighting)
  end?: number;
}

// What cipher.chat() returns to the developer
export interface ChatResult {
  response: string;        // The final response with real data restored
  redactionCount: number;  // How many PII items were intercepted
}

// The interface every LLM provider must implement
export interface LLMProvider {
  send(prompt: string): Promise<string>;
}

// One entry in the audit log
export interface AuditEntry {
  timestamp: string;      // ISO 8601 datetime
  sessionId: string;      // Which session
  piiType: string;        // "AADHAAR", "EMAIL", etc.
  token: string;          // "[AADHAAR_1]"
  action: 'TOKENIZED' | 'REHYDRATED';
  // NEVER includes the actual PII value
}
```

Why define types first? Because it forces you to think about what data flows between layers before you write the logic. The `Detection` interface, for example, tells you exactly what the detection layer must produce and what the vault layer must consume. The contract is written before the code.

---

## Jest Configuration — `jest.config.js`

```javascript
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};
```

`ts-jest` is a transformer that intercepts TypeScript files when Jest tries to load them and compiles them on the fly. Without this, Jest would fail because it only understands `.js` files natively.

`testEnvironment: "node"` means tests run in a Node.js environment, not a browser environment (jsdom). Since we're building a Node.js library, this is correct.

`createDefaultPreset()` is `ts-jest`'s helper that reads your `tsconfig.json` and sets up the transform configuration to match. You don't need to configure TypeScript twice.

---

## What We Built vs What We Deliberately Skipped

| Feature | Decision | Reason |
|---|---|---|
| Regex detection | Built in Phase 1 | Fast, deterministic, covers 90% of Indian PII |
| NLP detection (`compromise`) | Built in Phase 1 | Catches names that regex can never catch |
| AES-256-GCM encryption | Built in Phase 1 | Security is not optional, even in MVP |
| Express server | Skipped for npm package | Library users don't need a server |
| spaCy Python microservice | Skipped | Requires Python — too much setup for a Node.js package |
| Dashboard | Skipped | UI is a separate concern from the library |
| Database (MongoDB) | Skipped | Vault stays in memory or encrypted local file |
| Docker | Skipped | Server deployment is a v2 concern |

The guiding principle: **build the smallest thing that does the one job perfectly.** The one job is `cipher.chat(prompt) → clean response`.

---

*Next: [Part 2 — Building the Detection Engine](./BUILD_02_DETECTION_ENGINE.md)*
