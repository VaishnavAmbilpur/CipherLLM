# Research: Technical Stack

## Primary Runtime
- **Node.js (v18+)**: Chosen for its async performance and excellent community support for LLM SDKs (OpenAI, Anthropic).

## Languages & Frameworks
- **TypeScript**: Mandatory for type safety in a security-conscious application.
- **Express.js**: Lightweight and flexible for building the proxy gateway.

## Security & Encryption
- **AES-256-GCM**: Advanced Encryption Standard with Galois/Counter Mode for both confidentiality and integrity of the local vault. Use Node's built-in `crypto` module.
- **PBKDF2**: Password-Based Key Derivation Function 2 for deriving encryption keys from user passphrases.

## PII Detection & NLP
- **`compromise`**: Lightweight, JavaScript-native NLP library for NER (Named Entity Recognition). Minimal footprint, runs in-process.

## Frontend (Phase 2)
- **Next.js 14**: React framework with App Router for the monitoring dashboard.
- **Tailwind CSS**: Utility-first CSS for premium styling.
- **Recharts**: For visualizing redaction trends and analytics.

## Infrastructure & Distribution
- **Docker**: For enterprise self-hosting (Mode 2).
- **npm**: Distribution as a reusable library (Mode 1).
- **Railway/Render**: Recommended for Cloud SaaS deployment (Mode 3).

---
*Last updated: 2026-04-14*
