# Research: Architecture

## Component Overview
The system follows a Proxy pattern where CipherLLM intercepts request/response flows.

### 1. Detection Layer
- **Regex Engine**: Sequential check of high-speed PII patterns.
- **NLP Engine**: Contextual analysis using `compromise`.

### 2. Vault Layer (TokenVault)
- **Token Map**: In-memory map during active sessions.
- **Encryption Engine**: Handles AES-256 wrapping for storage.

### 3. Proxy & Provider Layer
- **統一 Interface**: A wrapper around various LLM SDKs.
- **Replacement logic**: Swaps PII for tokens in the prompt.
- **Restoration logic**: Swaps tokens for PII in the response.

### 4. Gateway Layer
- **Express API**: Exposes endpoints for client applications.
- **Session Manager**: Manages Vault lifecycle per conversation.

## Suggested Build Order
1. **Core Utilities**: Regex patterns and TokenVault logic.
2. **Detection Engine**: Integration of Regex + NLP.
3. **Provider Wrapper**: Abstraction classes for OpenAI/Anthropic.
4. **Express Gateway**: Bringing it all together into an API.

---
*Last updated: 2026-04-14*
