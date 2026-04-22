# How We Built CipherLLM — Part 2: The Detection Engine

> This document explains how we built the PII detection system — the regex patterns, the NLP layer, how they work together, and why each decision was made.

---

## The Detection Engine's Job

The detection engine receives a raw text string. It returns a list of every PII item found — each with the original value and what type it is:

```typescript
detect("Contract for Priya Sharma, Aadhaar 8234-5678-9012, salary ₹18,50,000")

// Returns:
[
  { original: "Priya Sharma",    type: "PERSON"   },
  { original: "8234-5678-9012", type: "AADHAAR"  },
  { original: "₹18,50,000",     type: "SALARY_IN" }
]
```

The engine doesn't tokenize, doesn't encrypt, doesn't call any LLM. It only finds things. That separation of concerns is intentional — it means you can test detection completely independently of everything else.

---

## Why Two Detection Methods

There are fundamentally two categories of PII:

**Structured PII** — has a defined, consistent format:
- Aadhaar number: always 12 digits, possibly separated by spaces or hyphens
- PAN card: always 5 letters + 4 digits + 1 letter (e.g., `ABCDE1234F`)
- Email: always `something@something.tld`
- Indian salary: always starts with `₹`

For structured PII, regex is perfect — fast, deterministic, zero false positives when the pattern is well-written.

**Unstructured PII** — has no consistent format:
- Person names: "Priya Sharma", "Vangala Varshith Reddy", "Rahul" — no pattern
- Organization names: "Infosys", "HDFC Bank", "Tata Consultancy Services"
- Locations: "Mumbai", "Bengaluru", "sector 14 Gurgaon"

For unstructured PII, you need NLP (Natural Language Processing) — software that understands context, not just pattern matching.

This is why we built two engines and run both on every prompt.

---

## Layer 1A — Regex Engine (`src/detection/regex.ts`)

### The Pattern Library

```typescript
export const PII_PATTERNS: Record<string, RegExp> = {

  // ═══════════════════════════════════
  // INDIAN PII — Our Competitive Moat
  // ═══════════════════════════════════

  AADHAAR: /\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
  /*
   * Matches: 8234-5678-9012  |  8234 5678 9012  |  823456789012
   * [\s-]?  means: optionally match a space OR hyphen between groups
   * {4} means exactly 4 digits
   * The /g flag means find ALL matches, not just the first one
   */

  PAN: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
  /*
   * Matches: ABCDE1234F  (the only valid PAN format)
   * [A-Z]{5}  = exactly 5 uppercase letters
   * [0-9]{4}  = exactly 4 digits
   * [A-Z]{1}  = exactly 1 uppercase letter
   * Note: no /i flag — PANs are always uppercase
   */

  PHONE_IN: /(\+91|0)?[6-9]\d{9}/g,
  /*
   * Matches: +919876543210  |  09876543210  |  9876543210
   * (\+91|0)?  = optionally starts with +91 or 0
   * [6-9]      = first digit must be 6, 7, 8, or 9 (Indian mobile range)
   * \d{9}      = followed by exactly 9 more digits
   * This prevents matching landlines and invalid numbers
   */

  UPI: /[a-zA-Z0-9._-]+@[a-zA-Z]{3,}/g,
  /*
   * Matches: priya@okaxis  |  9876543210@paytm  |  john.doe@ybl
   * UPI IDs have the format: identifier@provider
   * [a-zA-Z]{3,} = provider name must be at least 3 letters
   * Note: EMAIL pattern also catches some UPIs — deduplication handles this
   */

  SALARY_IN: /₹\s?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?/g,
  /*
   * Matches: ₹18,50,000  |  ₹ 45,00,000  |  ₹1850000  |  ₹18,50,000.50
   * ₹         = the Rupee symbol (not just the letter R)
   * \s?        = optional space after the symbol
   * \d{1,3}    = 1-3 digits before first comma
   * (?:,\d{2,3})* = zero or more groups of comma + 2-3 digits (Indian numbering)
   * (?:\.\d{1,2})? = optional decimal point + 1-2 digits
   * This matches both lakh notation (₹18,50,000) and crore notation (₹1,80,00,000)
   */

  VOTER_ID: /[A-Z]{3}[0-9]{7}/g,
  /*
   * Matches: ABC1234567
   * Indian Voter ID format: 3 uppercase letters + 7 digits
   */

  // ══════════════════════════
  // UNIVERSAL PII
  // ══════════════════════════

  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /*
   * Standard email regex. The key parts:
   * [a-zA-Z0-9._%+-]+  = local part (before @): letters, digits, dots, etc.
   * @                   = the @ symbol
   * [a-zA-Z0-9.-]+      = domain name
   * \.[a-zA-Z]{2,}      = TLD: dot + at least 2 letters (.com, .in, .org)
   */

  SSN: /\d{3}-\d{2}-\d{4}/g,
  /*
   * US Social Security Number: 123-45-6789
   * Included for US users of the package
   */

  CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  /*
   * Matches: 4111 1111 1111 1111  |  4111-1111-1111-1111  |  4111111111111111
   * \b = word boundary — prevents matching numbers that are part of longer strings
   * [\s-]? = optional space or hyphen between groups
   */

  API_KEY: /[a-zA-Z0-9_-]{32,}/g,
  /*
   * Matches any string of 32+ alphanumeric characters
   * This catches OpenAI keys (sk-...), AWS keys, GitHub tokens, etc.
   * 32 characters is the minimum length for any real secret key
   * WARNING: This pattern has false positives (long base64 strings, hashes)
   * In production, this should be combined with context checks (e.g., "key:", "token:")
   */
};
```

### Running the Regex Engine

```typescript
// src/detection/regex.ts

export interface Detection {
  original: string;
  type: string;
}

export function detectWithRegex(text: string): Detection[] {
  const detections: Detection[] = [];
  const seen = new Set<string>(); // prevents duplicate detections

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    // Reset the lastIndex — critical for /g flag patterns
    // Without this, alternating calls to the same regex give wrong results
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value = match[0];

      // Deduplicate — if the same value was already caught by another pattern
      // (e.g., a UPI ID also matching EMAIL), only keep the first detection
      if (!seen.has(value)) {
        seen.add(value);
        detections.push({ original: value, type });
      }
    }
  }

  return detections;
}
```

**Critical detail about the `/g` flag and `lastIndex`:**

When a regex has the `/g` (global) flag, JavaScript keeps track of where the last match ended using the `lastIndex` property. This allows `exec()` to find the next match each time it's called. But this creates a bug: if you use the same regex object again on a different string without resetting `lastIndex`, it starts searching from where it left off.

We call `pattern.lastIndex = 0` before each `while` loop to reset this. Without it, detection would fail on every second call.

---

## Layer 1B — NLP Engine (`src/detection/detector.ts`)

The regex engine is blind to names. `"Priya Sharma"` has no consistent pattern — it's just two capitalized words. You cannot write a regex that catches all Indian names without also catching millions of false positives.

We use the `compromise` library for Named Entity Recognition (NER):

```typescript
// src/detection/detector.ts

import nlp from 'compromise';
import { Detection } from '../types';

export function detectWithNLP(text: string): Detection[] {
  const entities: Detection[] = [];

  // compromise parses the text into a document model
  const doc = nlp(text);

  // .people() returns all noun phrases that compromise identifies as person names
  doc.people().forEach(person => {
    const name = person.text();
    if (name.trim().length > 1) { // ignore single-character matches
      entities.push({ original: name, type: 'PERSON' });
    }
  });

  // .organizations() returns company names, institutions, etc.
  doc.organizations().forEach(org => {
    const name = org.text();
    if (name.trim().length > 1) {
      entities.push({ original: name, type: 'ORG' });
    }
  });

  // .places() returns cities, countries, addresses
  doc.places().forEach(place => {
    const name = place.text();
    if (name.trim().length > 1) {
      entities.push({ original: name, type: 'LOCATION' });
    }
  });

  return entities;
}
```

### How `compromise` Works Internally

`compromise` is a rule-based NLP library that uses a combination of:
1. A built-in lexicon of ~150,000 known English words tagged by type
2. Capitalization patterns — "Priya Sharma" matches `Capital Capital` which is a strong person name signal
3. Suffix patterns — words ending in `-son`, `-berg`, `-pur` are likely names
4. Contextual rules — words after "Mr.", "Ms.", "Dr." are names

It does NOT use a neural network or make any API calls. Everything runs locally in the Node.js process. This is critical for a privacy tool — we cannot send prompts to an NLP cloud service to detect PII.

**Limitation:** `compromise` is trained on English text and Western name patterns. It struggles with names like "Vangala Varshith Reddy" or "Krishnamurthy" because they don't match its pattern rules. This is a known limitation documented in `PII_SUPPORT.md`. The spaCy Python microservice (Phase 2) solves this for Indian names.

---

## The Combined Detector (`src/detection/detector.ts`)

The main `detect()` function runs both engines and merges the results:

```typescript
// src/detection/detector.ts

import { detectWithRegex } from './regex';
import { detectWithNLP } from './nlp';
import { Detection } from '../types';

export function detect(text: string): Detection[] {
  // Run both engines
  const regexResults = detectWithRegex(text);
  const nlpResults = detectWithNLP(text);

  // Merge — start with regex results (higher precision)
  const allDetections = [...regexResults];
  const seenValues = new Set(regexResults.map(d => d.original));

  // Add NLP results that weren't already caught by regex
  for (const detection of nlpResults) {
    if (!seenValues.has(detection.original)) {
      allDetections.push(detection);
      seenValues.add(detection.original);
    }
  }

  // Sort by position in text — replace from the end backwards
  // This prevents character position shifting when we replace values
  // (replacing "Priya" at position 10 doesn't shift "8234" at position 50)
  allDetections.sort((a, b) => {
    const posA = text.indexOf(a.original);
    const posB = text.indexOf(b.original);
    return posB - posA; // descending — process end of string first
  });

  return allDetections;
}
```

**Why sort in reverse order?**

When you replace text, the character positions of everything after the replacement shift. If the original text is:

```
"Hello Priya, your Aadhaar is 8234-5678-9012"
 0     6     13    19        30
```

If you replace `"Priya"` (position 6) with `"[PERSON_1]"` first, the text becomes:

```
"Hello [PERSON_1], your Aadhaar is 8234-5678-9012"
 0     6          17    23        34
```

Now `"8234-5678-9012"` is at position 34, not 30. If you stored position 30, you'd replace the wrong characters.

The fix is to always process matches from the end of the string backwards. Replacing something at position 30 doesn't affect anything at position 6. So we sort in descending order of position.

---

## Writing Tests for Detection (`tests/detection.test.ts`)

Every pattern needs a test. Every edge case needs a test.

```typescript
describe('Regex Detection — Indian PII', () => {

  test('detects Aadhaar with hyphens', () => {
    const result = detect("Aadhaar: 8234-5678-9012");
    expect(result).toContainEqual({ original: '8234-5678-9012', type: 'AADHAAR' });
  });

  test('detects Aadhaar with spaces', () => {
    const result = detect("UID: 8234 5678 9012");
    expect(result).toContainEqual({ original: '8234 5678 9012', type: 'AADHAAR' });
  });

  test('detects Aadhaar without separators', () => {
    const result = detect("823456789012");
    expect(result).toContainEqual({ original: '823456789012', type: 'AADHAAR' });
  });

  test('detects PAN card', () => {
    const result = detect("PAN: ABCDE1234F");
    expect(result).toContainEqual({ original: 'ABCDE1234F', type: 'PAN' });
  });

  test('does NOT detect invalid PAN (lowercase)', () => {
    const result = detect("PAN: abcde1234f");
    expect(result).not.toContainEqual(expect.objectContaining({ type: 'PAN' }));
  });

  test('detects Indian salary with lakh notation', () => {
    const result = detect("Salary: ₹18,50,000");
    expect(result).toContainEqual({ original: '₹18,50,000', type: 'SALARY_IN' });
  });

  test('detects Indian salary with crore notation', () => {
    const result = detect("CTC: ₹1,80,00,000");
    expect(result).toContainEqual({ original: '₹1,80,00,000', type: 'SALARY_IN' });
  });

  test('detects email address', () => {
    const result = detect("Contact: priya@techcorp.in");
    expect(result).toContainEqual({ original: 'priya@techcorp.in', type: 'EMAIL' });
  });

  test('detects Indian mobile number with +91', () => {
    const result = detect("Call +919876543210");
    expect(result).toContainEqual(expect.objectContaining({ type: 'PHONE_IN' }));
  });

  test('does NOT detect landline numbers', () => {
    const result = detect("Call 011-23456789");
    expect(result).not.toContainEqual(expect.objectContaining({ type: 'PHONE_IN' }));
  });
});

describe('Regex Detection — Universal PII', () => {

  test('detects credit card with spaces', () => {
    const result = detect("Card: 4111 1111 1111 1111");
    expect(result).toContainEqual(expect.objectContaining({ type: 'CREDIT_CARD' }));
  });

  test('detects API key', () => {
    const result = detect("Key: sk-proj-abcdefghijklmnopqrstuvwxyz1234567890");
    expect(result).toContainEqual(expect.objectContaining({ type: 'API_KEY' }));
  });
});

describe('NLP Detection', () => {

  test('detects Western person name', () => {
    const result = detect("This is for John Smith");
    expect(result).toContainEqual(expect.objectContaining({ type: 'PERSON' }));
  });

  test('detects organization name', () => {
    const result = detect("Employee at Microsoft");
    expect(result).toContainEqual(expect.objectContaining({ type: 'ORG' }));
  });
});

describe('Combined Detection — Full Prompts', () => {

  test('detects multiple PII types in one prompt', () => {
    const prompt = "Priya Sharma (priya@techcorp.in) has Aadhaar 8234-5678-9012 and salary ₹18,50,000";
    const result = detect(prompt);

    const types = result.map(d => d.type);
    expect(types).toContain('EMAIL');
    expect(types).toContain('AADHAAR');
    expect(types).toContain('SALARY_IN');
  });

  test('same value detected only once even if it appears twice', () => {
    const prompt = "Contact priya@techcorp.in and reach priya@techcorp.in again";
    const result = detect(prompt);
    const emails = result.filter(d => d.original === 'priya@techcorp.in');
    expect(emails).toHaveLength(1);
  });
});
```

The rule we followed: **write the failing test first, then write the code that makes it pass.** This is Test-Driven Development (TDD). It forces you to think about exactly what the code should do before you write it.

---

## Edge Cases We Had to Handle

**Edge Case 1 — Email vs UPI overlap**

A UPI ID like `priya@okaxis` matches both the `EMAIL` pattern and the `UPI` pattern. Our deduplication in the combined detector ensures it's only tokenized once. We keep the first match (regex runs in order, so whichever pattern runs first wins).

**Edge Case 2 — Aadhaar inside a larger number**

The number `12345678901234` contains `1234-5678-9012` (an Aadhaar) but is a 14-digit number, not an Aadhaar. The regex `\d{4}[\s-]?\d{4}[\s-]?\d{4}` would incorrectly match a substring of it.

Fix: Use word boundaries or check that the match isn't surrounded by more digits. This is tracked as a known issue — a future version adds lookahead/lookbehind assertions.

**Edge Case 3 — API keys producing too many false positives**

The API key pattern `/[a-zA-Z0-9_-]{32,}/g` catches real API keys but also catches base64-encoded images, UUIDs without hyphens, and long hash strings. In v2.0, we'll add context detection — only flag it as an API key if it appears after words like "key:", "token:", "secret:", "api_key=".

---

*Next: [Part 3 — The Token Vault & Encryption](./BUILD_03_VAULT_AND_ENCRYPTION.md)*
