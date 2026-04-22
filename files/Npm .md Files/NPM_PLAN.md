# CipherLLM — npm-Only Plan

> **Goal:** Strip the project down to a clean, publishable npm library.
> No server. No dashboard. No Docker. Just `npm install cipherllm` and 3 lines of code.

---

## What We Are Keeping

```
cipherllm/
├── src/
│   ├── detection/        ← regex.ts + detector.ts
│   ├── vault/            ← vault.ts + crypto.ts
│   ├── providers/        ← openai.ts + anthropic.ts
│   ├── rehydration/      ← rehydrate.ts
│   ├── gateway/          ← proxy.ts  (CipherLLM class)
│   └── lib.ts            ← THE PUBLIC ENTRY POINT — exports everything
├── tests/                ← keep all tests
├── docs/                 ← keep all .md docs
├── package.json          ← needs changes (see below)
├── tsconfig.json         ← needs changes (see below)
├── jest.config.js        ← no change needed
├── .gitignore            ← needs changes (see below)
└── README.md             ← keep, minor update
```

## What Gets Removed / Ignored

```
src/index.ts              ← DELETE — this is the Express server entry point
                             The npm package does not need a server
dashboard/                ← DELETE or move out — Next.js dashboard is Phase 2
.env / .env.example       ← DELETE — consumers set their own env vars
```

---

## Change 1 — `package.json`

Remove server-only dependencies and fix the package metadata.

**Current problems:**
- `express`, `cors`, `axios`, `dotenv` are in `dependencies` — they install for every user of the package even though users don't need a server
- `keywords` is empty — nobody will find the package on npm
- `author` is empty
- `scripts` has `start` and `dev` which run the Express server — irrelevant for a library
- Missing `files` field — npm will publish everything including `tests/`, `src/` raw TypeScript, etc.
- Missing `repository` and `homepage` fields

**New `package.json`:**

```json
{
  "name": "cipherllm",
  "version": "1.0.0",
  "description": "Privacy-first LLM prompt gateway. Strips Indian PII (Aadhaar, PAN, UPI) before it reaches any AI provider and re-hydrates locally. DPDP Act 2023 compliant.",
  "main": "dist/src/lib.js",
  "types": "dist/src/lib.d.ts",
  "files": [
    "dist/src",
    "README.md",
    "docs/"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": [
    "llm", "privacy", "pii", "aadhaar", "pan",
    "dpdp", "india", "openai", "anthropic",
    "redaction", "tokenization", "security"
  ],
  "author": "CipherLLM",
  "license": "ISC",
  "type": "commonjs",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/cipherllm"
  },
  "homepage": "https://cipherllm.in",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.88.0",
    "compromise": "^14.15.0",
    "openai": "^6.34.0",
    "uuid": "^13.0.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "@types/node": "^25.6.0",
    "@types/supertest": "^7.2.0",
    "jest": "^30.3.0",
    "nodemon": "^3.1.14",
    "supertest": "^7.2.2",
    "ts-jest": "^29.4.9",
    "ts-node": "^10.9.2",
    "typescript": "^6.0.2"
  }
}
```

**What changed and why:**
- `express`, `cors`, `axios`, `dotenv` → **removed from dependencies entirely**. These are server tools. The library user provides their own API keys and setup. A developer who `npm install cipherllm` should not be forced to install Express.
- `typescript` → moved to `devDependencies`. It compiles your code — users of the package get the compiled `dist/` output, not TypeScript source.
- `files` → added. This tells npm exactly what to publish. Only `dist/src` (compiled JS), `README.md`, and `docs/`. Without this, npm publishes your `tests/`, raw `src/`, `node_modules` etc.
- `scripts` → removed `start` and `dev`. Added `prepublishOnly` which auto-runs build + test before every `npm publish` so you can never accidentally publish broken code.
- `keywords` → filled in. This is how developers find your package by searching on npmjs.com.
- `repository` + `homepage` → added. npm shows these links on your package page.

---

## Change 2 — `tsconfig.json`

**Current problem:** `rootDir` is `./` which means TypeScript includes the root-level config files and the `tests/` folder inside the compiled output. The `dist/` folder ends up messy.

**New `tsconfig.json`:**

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

**What changed and why:**
- `rootDir` → changed from `./` to `./src`. Only your library source compiles.
- `outDir` → changed to `./dist/src`. The compiled files land in `dist/src/lib.js` which matches `main` in `package.json`.
- `include` → now only `src/**/*`. Tests are excluded from the compiled output.
- `exclude` → explicitly excludes `tests/`, `node_modules`, `dist`.

---

## Change 3 — `.gitignore`

Replace the current one-liner with a proper Node.js gitignore:

```
# Dependencies
node_modules/

# Build output — commit src, never dist
dist/

# Environment files — NEVER commit API keys
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# npm publish artifact
*.tgz
```

**Why `dist/` is gitignored:** Your `src/` TypeScript is the source of truth. `dist/` is auto-generated by `npm run build`. It should not be in git — but it WILL be published to npm (that's what the `files` field in `package.json` controls). Git ≠ npm publish.

---

## Change 4 — Delete `src/index.ts`

The current `src/index.ts` is an Express server. It starts a web server, listens on a port, and handles HTTP requests. **None of that belongs in an npm library.**

Delete it. The entry point for the library is `src/lib.ts` — which already exists and exports `CipherLLM`, `TokenVault`, `OpenAIProvider`, `AnthropicProvider`, and `AuditLogger`.

The `main` field in `package.json` already points to `dist/src/lib.js`. You do not need `index.ts`.

---

## Change 5 — `src/lib.ts` Must Export Everything Public

Make sure `src/lib.ts` cleanly exports all the things a developer needs. It should look like this:

```typescript
// src/lib.ts — the only public API of the package

export { CipherLLM } from './gateway/proxy';
export { TokenVault } from './vault/vault';
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { AuditLogger } from './logger/audit';
export type { ChatResult, LLMProvider, Detection } from './types';
```

This is the contract between your library and the developers who install it. Everything else (`detect()`, `rehydrate()`, vault internals) are implementation details — they stay internal and don't need to be exported.

---

## Change 6 — Update `README.md`

Remove all mentions of running a server (`npm start`, `http://localhost:3000`, curl commands). The README should only show library usage. The current README is almost correct — just remove the "Running the Gateway (Server)" section and the Architecture section that mentions the Express proxy layer.

The README is what developers see on npmjs.com. Keep it focused on:
1. Install
2. Basic usage (3-5 lines of code)
3. Link to full docs

---

## How to Publish on npm

Once all changes above are made:

### Step 1 — Create an npm account
Go to [npmjs.com](https://www.npmjs.com) → Sign Up. Use your real name or "cipherllm" as the username.

### Step 2 — Login from terminal
```bash
npm login
# Enter your username, password, and email
# You'll get an OTP on your email — enter it
```

### Step 3 — Build and test
```bash
npm run build
# Should produce dist/src/lib.js with no TypeScript errors

npm test
# All tests must pass — prepublishOnly enforces this anyway
```

### Step 4 — Check what will be published (dry run)
```bash
npm pack --dry-run
```
This prints every file that will go into the package. You should see only:
- `dist/src/...` files
- `README.md`
- `docs/...` files

If you see `src/`, `tests/`, `node_modules/` — the `files` field in `package.json` is wrong.

### Step 5 — Publish
```bash
npm publish --access public
```

Your package is now live at `https://www.npmjs.com/package/cipherllm`.

### Step 6 — Verify the install works from scratch
In a completely separate folder (not your project):
```bash
mkdir test-install && cd test-install
npm install cipherllm
node -e "const { CipherLLM } = require('cipherllm'); console.log('Works:', typeof CipherLLM)"
```

### Version Updates (future)
```bash
# Bug fix:
npm version patch    # 1.0.0 → 1.0.1

# New feature (NLP added):
npm version minor    # 1.0.0 → 1.1.0

# Then publish again:
npm publish --access public
```

---

## The Marketing Website — cipherllm.in

A single HTML page. No framework. No backend. Just a static site hosted free on Vercel or Netlify.

### What the website must do

One job: convince a developer to run `npm install cipherllm` in the next 5 minutes.

### Page Structure (top to bottom)

**Section 1 — Hero**
```
[LOCK ICON]  CipherLLM

Your prompts are leaking.
We fix that.

npm install cipherllm

[See how it works ↓]
```

**Section 2 — The Problem (2 columns)**
```
BEFORE CipherLLM                    AFTER CipherLLM

"Summarize the contract for         "Summarize the contract for
 Priya Sharma,                       [PERSON_1],
 Aadhaar 8234-5678-9012,             Aadhaar [AADHAAR_1],
 salary ₹18,50,000"                  salary [SALARY_1]"

     ↓ Goes to OpenAI                    ↓ Goes to OpenAI
   ⚠️ Real data exposed               ✅ Real data never left
```

**Section 3 — 3 Feature Cards**
```
[SHIELD]                [INDIA]                 [CODE]
Indian-first PII        DPDP Act 2023           3 lines of code
Aadhaar, PAN, UPI,      Compliance audit        No config.
₹ salary, Voter ID      logs built in.          No server.
detected natively.                              Just install.
```

**Section 4 — Code Example**
```typescript
import { CipherLLM, OpenAIProvider } from 'cipherllm';

const cipher = new CipherLLM(new OpenAIProvider(process.env.OPENAI_API_KEY));
const result = await cipher.chat("Contract for Priya, Aadhaar 8234-5678-9012", 'session-1');

// result.response → "Contract for Priya, Aadhaar 8234-5678-9012..."
// OpenAI received  → "Contract for [PERSON_1], Aadhaar [AADHAAR_1]..."
```

**Section 5 — What Gets Detected (table)**

| Type | Example | Detected As |
|---|---|---|
| Aadhaar | 8234-5678-9012 | [AADHAAR_1] |
| PAN | ABCDE1234F | [PAN_1] |
| UPI ID | priya@okaxis | [UPI_1] |
| ₹ Salary | ₹18,50,000 | [SALARY_1] |
| Person Name | Priya Sharma | [PERSON_1] |
| Email | priya@corp.in | [EMAIL_1] |

**Section 6 — Compliance Banner**
```
DPDP Act 2023 ✓     GDPR ✓     HIPAA ✓
```

**Section 7 — Footer**
```
npm install cipherllm

[GitHub]  [npm]  [Docs]
```

### How to Host It Free

1. Write the page as a single `index.html` file
2. Push to a GitHub repo
3. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
4. Deploy. Vercel gives you a free URL like `cipherllm.vercel.app`
5. Buy `cipherllm.in` on Namecheap (~₹800/year) and point it to Vercel

Total cost to launch the website: ₹800/year for the domain. Everything else is free.

---

## Summary — Everything You Need to Do

| # | What | File | Effort |
|---|---|---|---|
| 1 | Update package metadata + remove server deps | `package.json` | 10 min |
| 2 | Fix rootDir and exclude tests from compile | `tsconfig.json` | 5 min |
| 3 | Expand gitignore | `.gitignore` | 2 min |
| 4 | Delete the Express server entry point | `src/index.ts` | 1 min |
| 5 | Verify lib.ts exports are clean | `src/lib.ts` | 10 min |
| 6 | Remove server section from README | `README.md` | 5 min |
| 7 | Create npm account + publish | Terminal | 15 min |
| 8 | Build the landing page | `index.html` | 2–3 hours |
| 9 | Deploy website on Vercel | Vercel UI | 10 min |

**Total time from now to live on npm: under 1 hour.**
**Total time from now to live website: 1 day.**
