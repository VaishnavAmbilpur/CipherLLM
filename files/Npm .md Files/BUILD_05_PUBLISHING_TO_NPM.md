# How We Built CipherLLM — Part 5: Publishing to npm

> This document explains everything about packaging and publishing — what npm actually uploads, how versioning works, what the package page looks like, and how to verify the publish worked correctly.

---

## What npm Publishing Actually Does

When you run `npm publish`, npm:

1. Reads `package.json` to find the `files` field
2. Packages exactly those files into a `.tgz` archive
3. Uploads the archive to the npm registry at `registry.npmjs.org`
4. Makes it available at `https://www.npmjs.com/package/cipherllm`
5. Allows anyone to `npm install cipherllm` globally

From that moment, any developer on Earth can add CipherLLM to their project. This is why getting the `files` field right matters so much — you control exactly what ships.

---

## What Gets Published vs What Stays in Git

This confuses a lot of developers. Git and npm are completely separate:

| File / Folder | In Git? | On npm? | Why |
|---|---|---|---|
| `src/` | Yes | No | Source TypeScript — git tracks it, npm doesn't need it |
| `dist/src/` | No (gitignored) | Yes | Compiled JS — npm needs it, git doesn't |
| `tests/` | Yes | No | Tests help development, users don't need them |
| `README.md` | Yes | Yes | Shown on the npm package page |
| `docs/` | Yes | Yes | Linked from README |
| `package.json` | Yes | Yes | npm requires it |
| `tsconfig.json` | Yes | No | Build tool config — irrelevant to users |
| `jest.config.js` | Yes | No | Test config — irrelevant to users |
| `.env` | No (gitignored) | No | Contains secrets — never goes anywhere |
| `node_modules/` | No (gitignored) | No | Reinstalled fresh by each user |

The `files` field in `package.json` is the whitelist for npm:

```json
"files": [
  "dist/src",
  "README.md",
  "docs/"
]
```

The `.gitignore` is the blocklist for git. They serve opposite purposes.

---

## The Build Step

Before publishing, TypeScript must be compiled to JavaScript:

```bash
npm run build
```

This runs `tsc` (TypeScript Compiler), which reads `tsconfig.json` and:
- Takes every `.ts` file in `src/`
- Compiles it to `.js` in `dist/src/`
- Generates `.d.ts` type definition files in `dist/src/`
- Generates `.d.ts.map` source map files in `dist/src/`

After a successful build, `dist/src/` contains:

```
dist/src/
├── lib.js           ← compiled entry point
├── lib.d.ts         ← type definitions for TypeScript users
├── lib.d.ts.map     ← source map
├── types.js
├── types.d.ts
├── detection/
│   ├── regex.js
│   ├── regex.d.ts
│   ├── detector.js
│   └── detector.d.ts
├── vault/
│   ├── vault.js
│   ├── vault.d.ts
│   ├── crypto.js
│   └── crypto.d.ts
├── providers/
│   ├── openai.js
│   ├── anthropic.js
│   └── mock.js
├── rehydration/
│   └── rehydrate.js
├── logger/
│   └── audit.js
└── gateway/
    └── proxy.js
```

This is what users actually download when they `npm install cipherllm`. Not your TypeScript source — the compiled JavaScript. TypeScript users also get the `.d.ts` files, which is what gives them autocomplete.

---

## The `prepublishOnly` Script

```json
"scripts": {
  "build": "tsc",
  "test": "jest",
  "prepublishOnly": "npm run build && npm test"
}
```

`prepublishOnly` is a lifecycle hook that npm runs automatically before packaging. It runs before `npm publish` and before `npm pack`. If it fails, the publish is cancelled.

This means:
- If `tsc` fails (TypeScript errors) → publish cancelled
- If `jest` fails (any test fails) → publish cancelled
- Only if both pass does the package upload

This makes it impossible to publish broken code. The protection is automatic.

---

## Verifying Before Publishing — `npm pack --dry-run`

Before actually uploading, always run:

```bash
npm pack --dry-run
```

This simulates the publish without uploading anything. It prints every file that would be in the package:

```
npm notice 📦  cipherllm@1.0.0
npm notice === Tarball Contents ===
npm notice 1.1kB  README.md
npm notice 892B   docs/API_REFERENCE.md
npm notice 743B   docs/COMPLIANCE.md
npm notice 1.2kB  docs/PII_SUPPORT.md
npm notice 980B   docs/SECURITY.md
npm notice 2.1kB  dist/src/lib.js
npm notice 834B   dist/src/lib.d.ts
npm notice 3.4kB  dist/src/gateway/proxy.js
npm notice 1.1kB  dist/src/detection/regex.js
npm notice ...
npm notice === Tarball Details ===
npm notice name:          cipherllm
npm notice version:       1.0.0
npm notice filename:      cipherllm-1.0.0.tgz
npm notice total files:   23
```

**What to check:**
- `src/` TypeScript files should NOT be listed
- `tests/` should NOT be listed
- `node_modules/` should NOT be listed
- `dist/src/` JS files SHOULD be listed
- `README.md` and `docs/` SHOULD be listed

If you see `src/*.ts` files listed, your `files` field in `package.json` needs fixing.

---

## The Publish Commands

### First-time setup

```bash
# Create an account at npmjs.com first, then:
npm login
# Follow the prompts:
# Username: your-username
# Password: ••••••••
# Email: your@email.com
# OTP: 123456 (from your email)
```

### Publish

```bash
npm publish --access public
```

`--access public` is required for scoped packages (like `@yourname/cipherllm`). For unscoped packages like `cipherllm`, it's optional but harmless.

After a few seconds:
```
npm notice 📦  cipherllm@1.0.0
npm notice Publishing to https://registry.npmjs.org/
+ cipherllm@1.0.0
```

The package is now live.

---

## Verifying the Publish Worked

### Check 1 — View the package page

Go to `https://www.npmjs.com/package/cipherllm`. You should see:
- The README rendered as the package description
- Install command: `npm i cipherllm`
- Version: `1.0.0`
- Weekly downloads (starts at 0)
- Dependencies listed

### Check 2 — Install from scratch

In a completely separate directory (not your project):

```bash
mkdir /tmp/test-cipherllm
cd /tmp/test-cipherllm
npm init -y
npm install cipherllm
```

Then create a test file:

```javascript
// test.js
const { CipherLLM, MockProvider } = require('cipherllm');

const mock = new MockProvider("Response for [AADHAAR_1]");
const cipher = new CipherLLM(mock);

async function main() {
  const result = await cipher.chat(
    "Aadhaar: 8234-5678-9012",
    "test-session"
  );
  console.log("LLM received:", mock.lastReceivedPrompt);
  console.log("User sees:", result.response);
  console.log("Redactions:", result.redactionCount);
}

main();
```

Run it:
```bash
node test.js
```

Expected output:
```
LLM received: Aadhaar: [AADHAAR_1]
User sees: Response for 8234-5678-9012
Redactions: 1
```

If this works, the package is publishing and installing correctly.

### Check 3 — TypeScript users get types

```typescript
// test.ts
import { CipherLLM, MockProvider, ChatResult } from 'cipherllm';
// TypeScript should autocomplete all of the above
// and show type errors for incorrect usage
```

---

## Versioning — Semantic Versioning (SemVer)

npm uses Semantic Versioning: `MAJOR.MINOR.PATCH`

| Change Type | Example | Command |
|---|---|---|
| Bug fix — nothing breaks | Fixed Aadhaar regex false positive | `npm version patch` → 1.0.1 |
| New feature — nothing breaks | Added Voter ID detection | `npm version minor` → 1.1.0 |
| Breaking change — code breaks | Renamed `cipher.chat()` to `cipher.send()` | `npm version major` → 2.0.0 |

Running `npm version patch` automatically:
1. Updates `version` in `package.json`
2. Creates a git commit with the message `"1.0.1"`
3. Creates a git tag `v1.0.1`

Then publish:
```bash
npm publish --access public
```

### CipherLLM Version Roadmap

```
1.0.0  → Current — Regex + NLP detection, vault, re-hydration, OpenAI + Anthropic
1.1.0  → Add Voter ID, IFSC code, Passport number patterns
1.2.0  → Better Indian name detection (compromise plugin for Hindi names)
1.3.0  → Configurable redaction — let users choose which PII types to detect
2.0.0  → Breaking: new configuration API + persistent vault improvements
```

---

## What Developers See on Their End

When a developer `npm install cipherllm` and imports from the package:

**In VS Code (TypeScript):**
```typescript
import { CipherLLM } from 'cipherllm';
//              ↑
//   Hovering shows:
//   class CipherLLM
//   constructor(provider: LLMProvider, logger?: AuditLogger)
//   chat(prompt: string, sessionId: string): Promise<ChatResult>
```

The IDE reads `dist/src/lib.d.ts` and shows full type information, parameter names, return types, and JSDoc comments. This is why `"declaration": true` in tsconfig matters.

**In a plain JavaScript project (no TypeScript):**
```javascript
const { CipherLLM, MockProvider } = require('cipherllm');
// Works — the compiled .js files are CommonJS modules
```

---

## Common Publish Mistakes and How to Avoid Them

**Mistake 1 — Publishing with failing tests**

The `prepublishOnly` script prevents this. But if you add `--ignore-scripts` to the publish command, it bypasses it. Never do this.

**Mistake 2 — Forgetting to build**

If `dist/` doesn't exist or is outdated, users install old code or get missing file errors. The `prepublishOnly` script runs `npm run build` first, so this is handled automatically.

**Mistake 3 — Publishing a `.env` file**

Add `.env` to `.gitignore`. npm respects `.gitignore` when the `files` field is not set, but since we use `files`, only listed files are published anyway. Belt and suspenders.

**Mistake 4 — Publishing the wrong version**

Run `npm pack --dry-run` and manually check the file list and version number before every publish.

**Mistake 5 — Publishing `node_modules/`**

This never happens if `files` is set correctly. But if `files` is missing from `package.json`, npm will publish everything including `node_modules/` which is thousands of files. The `npm pack --dry-run` check catches this.

---

## npm Package Page — What Makes It Look Professional

The npm package page is generated from your `README.md`. Everything on the page comes from:

1. **Title:** The `name` field in `package.json`
2. **Version badge:** The `version` field
3. **Description:** The `description` field in `package.json` (shown in search results)
4. **README content:** Your `README.md` rendered as HTML
5. **Install command:** Auto-generated from the package name
6. **Links sidebar:** `repository`, `homepage`, `bugs` fields in `package.json`
7. **Keywords:** Shown as tags, used for search

A package with a good README, clear keywords, and links to GitHub appears significantly more trustworthy than one with an empty README and no metadata. This affects download numbers.

---

## Summary — The Complete Publish Checklist

```
Before every publish:

[ ] All tests passing:  npm test
[ ] Build is fresh:     npm run build
[ ] Dry run clean:      npm pack --dry-run
    - No src/*.ts files in the list
    - No tests/ in the list
    - dist/src/ files present
    - README.md present
[ ] Version is correct: check package.json version field
[ ] Logged in to npm:   npm whoami

To publish:
[ ] npm publish --access public

After publishing:
[ ] Check npmjs.com/package/cipherllm page loads
[ ] Fresh install test in separate directory works
[ ] TypeScript autocomplete works
[ ] Commit and tag the release in git:
    git tag v1.0.0
    git push origin v1.0.0
```

---

*This completes the technical documentation for CipherLLM's npm package build.*

*See also:*
- *[Part 1 — Project Setup & Architecture](./BUILD_01_PROJECT_SETUP.md)*
- *[Part 2 — The Detection Engine](./BUILD_02_DETECTION_ENGINE.md)*
- *[Part 3 — The Token Vault & Encryption](./BUILD_03_VAULT_AND_ENCRYPTION.md)*
- *[Part 4 — Providers, Re-hydration & The Gateway](./BUILD_04_PROVIDERS_AND_GATEWAY.md)*
