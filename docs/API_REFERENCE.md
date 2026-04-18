# API Reference

## `CipherLLM`
The main orchestrator class.

### `constructor(provider: LLMProvider, logger?: AuditLogger)`
- `provider`: An instance of `OpenAIProvider`, `AnthropicProvider`, or `MockProvider`.
- `logger` (optional): An instance of `AuditLogger` for compliance tracking.

### `async chat(prompt: string, sessionId: string): Promise<ChatResult>`
Main method to send a prompt. Handles the full detection-redaction-call-rehydration cycle.
- Returns: `{ response: string, redactionCount: number }`.

### `clearSession(): void`
Clears the current session's vault.

---

## `TokenVault`
Handles token mapping and persistence.

### `tokenize(value: string, type: string): string`
Returns a token (e.g., `[PERSON_1]`) for a given value. If the value has been seen before, returns the same token.

### `save(filePath: string, passphrase: string): void`
Encrypts and saves the current mapping to disk.

### `load(filePath: string, passphrase: string): void`
Loads and decrypts a mapping from disk.

---

## `LLMProvider`
Interface for implementing additional AI models.

### `send(prompt: string): Promise<string>`
Sends the prompt to the model and returns the response.

---

## `AuditLogger`
Handles compliance logging.

### `log(entry: AuditEntry): void`
Appends a redaction/rehydration event to the audit log. Does NOT store PII.

### `getLogs(): AuditEntry[]`
Returns the full history of logs.
