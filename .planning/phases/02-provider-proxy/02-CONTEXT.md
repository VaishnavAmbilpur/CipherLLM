# Context: Phase 2 — Provider Proxy

## <decisions>
- **Unified Interface:** Create an `LLMProvider` abstract class or interface to wrap different SDKs.
- **Provider Support:** Implement `OpenAIProvider` (using `openai` SDK) and `AnthropicProvider` (using `@anthropic-ai/sdk`).
- **Gateway:** Use Express.js to expose a POST `/v1/chat` endpoint that handles sanitization, provider calls, and re-hydration.
- **Session ID:** Client must provide a `sessionId` to maintain vault consistency across multi-turn chats.
</decisions>

## <specifics>
- **Endpoint Structure:**
  ```json
  POST /v1/chat
  {
    "message": "User prompt here",
    "provider": "openai",
    "sessionId": "abc-123"
  }
  ```
</specifics>

## <canonical_refs>
- [03_TECHSTACK.md](file:///c:/Users/Vaishnav%20Ambilpur/Desktop/CipherLLM/files/03_TECHSTACK.md)
</canonical_refs>

---
*Generated: 2026-04-14*
