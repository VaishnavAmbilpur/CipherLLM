# How We Built CipherLLM — Part 4: Providers, Re-hydration & The Gateway

> This document explains the LLM provider abstraction, the re-hydration engine (the hardest piece to get right), the AuditLogger, and the main `CipherLLM` class that ties everything together.

---

## The Provider Abstraction (`src/providers/`)

We needed to support OpenAI and Anthropic — two completely different APIs with different SDKs, different request formats, different response shapes. But the vault, the detection engine, and the re-hydration engine don't care which LLM they're talking to. They just need to send a string and get a string back.

This is the **Strategy Pattern** — define a common interface, then write one implementation per provider. The rest of the system only ever talks to the interface, never to specific providers.

### The Interface (`src/types.ts`)

```typescript
export interface LLMProvider {
  send(prompt: string): Promise<string>;
}
```

One method. Takes a string. Returns a string. That's the entire contract.

### OpenAI Provider (`src/providers/openai.ts`)

```typescript
import OpenAI from 'openai';
import { LLMProvider } from '../types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    if (!apiKey) throw new Error('OpenAI API key is required');
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async send(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned empty response');

    return content;
  }
}
```

**Why `gpt-4o` as default?** It's OpenAI's best general-purpose model as of 2026. The developer can override this in the constructor: `new OpenAIProvider(key, 'gpt-3.5-turbo')`.

**Why validate `apiKey` in constructor?** Fail fast. If the API key is missing, throw immediately when the object is created — not later when the first real request fails after 3 seconds.

### Anthropic Provider (`src/providers/anthropic.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from '../types';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-6') {
    if (!apiKey) throw new Error('Anthropic API key is required');
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async send(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    // Anthropic returns content blocks, not a simple string
    const block = response.content[0];
    if (block.type !== 'text') {
      throw new Error('Unexpected Anthropic response type: ' + block.type);
    }

    return block.text;
  }
}
```

**Note the difference:** OpenAI returns `response.choices[0].message.content` (a string). Anthropic returns `response.content[0].text` (inside a content block array). The provider abstraction hides this complexity from the rest of the system.

### Mock Provider (`src/providers/mock.ts`)

```typescript
import { LLMProvider } from '../types';

export class MockProvider implements LLMProvider {
  private response: string;
  public lastReceivedPrompt: string = '';

  constructor(mockResponse: string = 'Mock LLM response') {
    this.response = mockResponse;
  }

  async send(prompt: string): Promise<string> {
    // Store what we received — tests can inspect this
    this.lastReceivedPrompt = prompt;
    return this.response;
  }
}
```

The `MockProvider` is critical for testing. It lets us verify:
- "Was the PII removed before reaching the LLM?" → Check `mock.lastReceivedPrompt`
- "Did re-hydration restore the PII?" → Check the returned response

Without a mock provider, every test would make real API calls — costing money, requiring internet, and making tests slow and flaky.

---

## The Re-hydration Engine (`src/rehydration/rehydrate.ts`)

This is the most technically challenging piece of the library. The problem sounds simple — replace `[PERSON_1]` with `"Priya Sharma"` — but there are three edge cases that make it surprisingly tricky.

### Why Simple String Replace Fails

If you just do `response.replace('[PERSON_1]', 'Priya Sharma')`, it breaks in three ways:

**Problem 1 — LLMs mangle token case**

You sent `[PERSON_1]`. The LLM returns `[Person_1]` or `[person_1]` or `[ PERSON_1 ]`. All are the same token, but `===` string comparison fails. You need case-insensitive, whitespace-tolerant matching.

**Problem 2 — Partial token matches**

If you have both `[PERSON_1]` and `[PERSON_10]` in a response, and you naively replace `[PERSON_1]` first, you'd corrupt `[PERSON_10]` — it would become `"Priya Sharma0"`.

**Problem 3 — Token appears in a different grammatical form**

LLMs sometimes slightly rephrase things. They may write "PERSON_1's contract" or "[PERSON_1]s". These aren't exact token matches.

### The Solution — Sorted Fuzzy Regex

```typescript
// src/rehydration/rehydrate.ts

export function rehydrate(
  response: string,
  vault: Map<string, string>
): string {
  let result = response;

  // STEP 1: Sort tokens by length, longest first
  // This prevents [PERSON_1] from matching inside [PERSON_10]
  const sortedTokens = Array.from(vault.keys()).sort(
    (a, b) => b.length - a.length
  );

  for (const token of sortedTokens) {
    const original = vault.get(token)!;

    // STEP 2: Build a fuzzy regex from the token
    //
    // Token: [PERSON_1]
    // We need to match:
    //   [PERSON_1]    ← exact
    //   [Person_1]    ← different case
    //   [person_1]    ← all lowercase
    //   [ PERSON_1 ]  ← with spaces
    //
    // token.replace(/[[\]]/g, '\\$&')
    //   Escapes [ and ] so they're treated as literal characters in regex
    //   [PERSON_1] → \[PERSON_1\]
    //
    // .replace(/_/g, '[_\\s]?')
    //   Makes underscores optionally match a space too
    //   \[PERSON[_\s]?1\]  matches [PERSON_1] and [PERSON 1]
    //
    // The 'gi' flags: g = find all matches, i = case-insensitive

    const escaped = token
      .replace(/[[\]]/g, '\\$&')
      .replace(/_/g, '[_\\s]?');

    const pattern = new RegExp(escaped, 'gi');

    result = result.replace(pattern, original);
  }

  return result;
}
```

### Walking Through a Real Example

Input response from LLM:
```
"The contract for [Person_1] specifies [salary_1] per year.
Please email [Person_1] at [EMAIL_1] to confirm."
```

Vault:
```
[PERSON_1]  → "Priya Sharma"
[SALARY_1]  → "₹18,50,000"
[EMAIL_1]   → "priya@techcorp.in"
```

Step 1 — Sort by length: `[SALARY_1]` (10), `[PERSON_1]` (10), `[EMAIL_1]` (9). (Length ties don't matter; what matters is longer tokens come before shorter ones of the same prefix.)

Step 2 — Replace `[SALARY_1]` → regex `/\[SALARY[_\s]?1\]/gi` → matches `[salary_1]` (case-insensitive) → replaced with `"₹18,50,000"`.

Step 3 — Replace `[PERSON_1]` → regex `/\[PERSON[_\s]?1\]/gi` → matches `[Person_1]` twice → both replaced with `"Priya Sharma"`.

Step 4 — Replace `[EMAIL_1]` → exact match → replaced with `"priya@techcorp.in"`.

Final output:
```
"The contract for Priya Sharma specifies ₹18,50,000 per year.
Please email Priya Sharma at priya@techcorp.in to confirm."
```

---

## The Audit Logger (`src/logger/audit.ts`)

```typescript
import { AuditEntry } from '../types';

export class AuditLogger {
  private logs: AuditEntry[] = [];

  log(entry: AuditEntry): void {
    // Validate that no actual PII values snuck in
    // AuditEntry type enforces this at compile time,
    // but we double-check at runtime too
    this.logs.push({
      timestamp: new Date().toISOString(),
      sessionId: entry.sessionId,
      piiType: entry.piiType,
      token: entry.token,
      action: entry.action,
      // Notice: 'original' value is NOT stored here — intentionally
    });
  }

  getLogs(): AuditEntry[] {
    return [...this.logs]; // Return a copy, not the original array
  }

  generateReport(): ComplianceReport {
    const typeCounts: Record<string, number> = {};
    const sessionSet = new Set<string>();

    for (const log of this.logs) {
      typeCounts[log.piiType] = (typeCounts[log.piiType] || 0) + 1;
      sessionSet.add(log.sessionId);
    }

    const topPIITypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    return {
      totalRedactions: this.logs.filter(l => l.action === 'TOKENIZED').length,
      uniqueTypes: Object.keys(typeCounts),
      sessionCount: sessionSet.size,
      topPIITypes,
    };
  }

  // Export as JSONL (JSON Lines) — one JSON object per line
  // Standard format for compliance audit logs
  exportJSONL(): string {
    return this.logs.map(entry => JSON.stringify(entry)).join('\n');
  }
}
```

**Why JSONL format?** JSON Lines (one JSON object per newline) is the standard format for log files because:
- Easy to append new entries (just add a new line)
- Easy to stream (read line by line without loading the whole file)
- Compatible with every log analysis tool (Splunk, ELK, CloudWatch)
- Each line is independently parseable — a corrupt line doesn't break the whole file

---

## The Main Gateway — `CipherLLM` Class (`src/gateway/proxy.ts`)

This is the orchestrator. It holds a reference to all the other components and runs them in the correct order.

```typescript
// src/gateway/proxy.ts

import { detect } from '../detection/detector';
import { TokenVault } from '../vault/vault';
import { rehydrate } from '../rehydration/rehydrate';
import { AuditLogger } from '../logger/audit';
import { LLMProvider, ChatResult } from '../types';

export class CipherLLM {
  private provider: LLMProvider;
  private logger: AuditLogger | null;

  // One vault per session ID
  private sessions = new Map<string, TokenVault>();

  constructor(provider: LLMProvider, logger?: AuditLogger) {
    this.provider = provider;
    this.logger = logger ?? null;
  }

  async chat(prompt: string, sessionId: string): Promise<ChatResult> {

    // ── STEP 1: Get or create the vault for this session ──────────────
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new TokenVault());
    }
    const vault = this.sessions.get(sessionId)!;

    // ── STEP 2: Detect all PII in the prompt ──────────────────────────
    const detections = detect(prompt);

    // ── STEP 3: Sanitize the prompt ───────────────────────────────────
    let sanitized = prompt;

    // Detections are sorted end-to-start (see Part 2)
    // We replace from the end so character positions stay valid
    for (const detection of detections) {
      const token = vault.tokenize(detection.original, detection.type);
      sanitized = sanitized.replace(detection.original, token);

      // Log the redaction event (metadata only — never the original value)
      this.logger?.log({
        timestamp: new Date().toISOString(),
        sessionId,
        piiType: detection.type,
        token,
        action: 'TOKENIZED',
      });
    }

    // ── STEP 4: Send sanitized prompt to LLM ─────────────────────────
    // At this point, 'sanitized' has NO real PII in it
    // e.g., "Contract for [PERSON_1], Aadhaar [AADHAAR_1], salary [SALARY_1]"
    const rawResponse = await this.provider.send(sanitized);

    // ── STEP 5: Re-hydrate the response ──────────────────────────────
    const finalResponse = rehydrate(rawResponse, vault.getAll());

    // ── STEP 6: Log re-hydration events ──────────────────────────────
    for (const [token] of vault.getAll()) {
      if (rawResponse.includes(token) || 
          rawResponse.toLowerCase().includes(token.toLowerCase())) {
        this.logger?.log({
          timestamp: new Date().toISOString(),
          sessionId,
          piiType: token.match(/\[(\w+)_\d+\]/)?.[1] ?? 'UNKNOWN',
          token,
          action: 'REHYDRATED',
        });
      }
    }

    return {
      response: finalResponse,
      redactionCount: detections.length,
    };
  }

  // Manually clear a session's vault
  clearSession(sessionId: string): void {
    const vault = this.sessions.get(sessionId);
    if (vault) {
      vault.destroy();
      this.sessions.delete(sessionId);
    }
  }

  // Clear all sessions
  clearAllSessions(): void {
    for (const vault of this.sessions.values()) {
      vault.destroy();
    }
    this.sessions.clear();
  }
}
```

---

## The Public Entry Point (`src/lib.ts`)

This file is the ONLY public API surface. Everything the library exports must go through here.

```typescript
// src/lib.ts
// This is what users get when they write:
// import { CipherLLM } from 'cipherllm';

export { CipherLLM } from './gateway/proxy';
export { TokenVault } from './vault/vault';
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { MockProvider } from './providers/mock';
export { AuditLogger } from './logger/audit';

// Export types so TypeScript users get full type information
export type {
  LLMProvider,
  ChatResult,
  Detection,
  AuditEntry,
} from './types';

// Internal functions (detect, rehydrate, encryptVault, etc.)
// are NOT exported here. They're implementation details.
```

---

## Integration Test — The Full Pipeline (`tests/integration.test.ts`)

```typescript
import { CipherLLM, OpenAIProvider, MockProvider, AuditLogger } from '../src/lib';

describe('Full Pipeline Integration', () => {

  test('complete redaction and rehydration cycle', async () => {
    // MockProvider returns whatever we configure it to return
    // We simulate the LLM returning a response that uses the tokens
    const mockResponse = "The contract for [PERSON_1] specifies [SALARY_1] per year.";
    const mock = new MockProvider(mockResponse);
    const cipher = new CipherLLM(mock);

    const prompt = "Summarize contract for Priya Sharma, salary ₹18,50,000";
    const result = await cipher.chat(prompt, 'test-session');

    // 1. The LLM should NEVER have received real PII
    expect(mock.lastReceivedPrompt).not.toContain('Priya Sharma');
    expect(mock.lastReceivedPrompt).not.toContain('₹18,50,000');

    // 2. The LLM should have received tokens
    expect(mock.lastReceivedPrompt).toContain('[PERSON_1]');
    expect(mock.lastReceivedPrompt).toContain('[SALARY_1]');

    // 3. The final response should have real data restored
    expect(result.response).toContain('Priya Sharma');
    expect(result.response).toContain('₹18,50,000');

    // 4. The redaction count should be correct
    expect(result.redactionCount).toBeGreaterThanOrEqual(2);
  });

  test('multi-turn conversation — vault persists between messages', async () => {
    const mock = new MockProvider('[PERSON_1] confirmed receipt.');
    const cipher = new CipherLLM(mock);
    const SESSION = 'multi-turn-test';

    // Turn 1: introduce Priya
    await cipher.chat("Hello, I am Priya Sharma", SESSION);

    // Turn 2: refer to her again — should use same token
    const turn1Prompt = mock.lastReceivedPrompt;
    await cipher.chat("Please confirm the above for her", SESSION);

    // Both messages should use [PERSON_1] for Priya — same session, same vault
    expect(turn1Prompt).toContain('[PERSON_1]');
  });

  test('audit logger records events without storing PII', async () => {
    const logger = new AuditLogger();
    const mock = new MockProvider('Response for [AADHAAR_1]');
    const cipher = new CipherLLM(mock, logger);

    await cipher.chat("Aadhaar: 8234-5678-9012", 'audit-test');

    const logs = logger.getLogs();
    const tokenizedLog = logs.find(l => l.action === 'TOKENIZED');

    expect(tokenizedLog).toBeDefined();
    expect(tokenizedLog!.piiType).toBe('AADHAAR');
    expect(tokenizedLog!.token).toBe('[AADHAAR_1]');

    // The actual Aadhaar number must NEVER appear in any log
    const logString = JSON.stringify(logs);
    expect(logString).not.toContain('8234-5678-9012');
  });

  test('different sessions have isolated vaults', async () => {
    const mock = new MockProvider('[EMAIL_1]');
    const cipher = new CipherLLM(mock);

    await cipher.chat("Contact: alice@example.com", 'session-alice');
    await cipher.chat("Contact: bob@example.com", 'session-bob');

    // Both sessions independently tokenized their own email as [EMAIL_1]
    // They don't interfere with each other
    expect(mock.lastReceivedPrompt).toContain('[EMAIL_1]');
  });
});
```

---

*Next: [Part 5 — Publishing to npm](./BUILD_05_PUBLISHING_TO_NPM.md)*
