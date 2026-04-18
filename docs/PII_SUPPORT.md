# PII Support & Detection

CipherLLM uses a dual-engine approach to identify sensitive data.

## 1. Regex Engine (Deterministic)
High-precision patterns for structured data.

| PII Type | Context | Description |
| :--- | :--- | :--- |
| **AADHAAR** | India | 12-digit UID numbers. Supports spaces/hyphens. |
| **PAN** | India | 10-character Alphanumeric Card Number. |
| **UPI** | India | Unified Payment Interface IDs (vpa@bank). |
| **EMAIL** | Universal | Standard email patterns. |
| **PHONE_IN** | India | Mobile numbers starting with 6-9, with +91/0 prefixes. |
| **SALARY_IN** | India | Currency notations (₹ 45,00,000). |
| **CREDIT_CARD**| Universal | 13-19 digit card numbers (Luhn check planned). |
| **API_KEY** | Universal | High-entropy 32+ character secrets. |

## 2. NLP Engine (Intelligence)
Using `compromise` for contextual entities.

| Entity Type | Examples |
| :--- | :--- |
| **PERSON** | "Bill Gates", "Narendra Modi", "Sundar Pichai" |
| **ORG** | "Microsoft", "Google", "Amazon" |
| **LOCATION** | "Mumbai", "London", "San Francisco" |

### How to Add Custom Patterns
Add your regex to `src/detection/regex.ts` and ensure it has the `g` flag enabled.

```typescript
export const PII_PATTERNS = {
  // ...
  MY_CUSTOM_ID: /[A-Z]{3}-\d{5}/g
}
```
