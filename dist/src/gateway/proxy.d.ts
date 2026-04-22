import { AuditLogger } from '../logger/audit.js';
import { LLMProvider, ChatResult } from '../types.js';
/**
 * The main gateway entry point. orchestrates the 5-layer privacy lifecycle.
 */
export declare class CipherLLM {
    private provider;
    private logger;
    private sessions;
    constructor(provider: LLMProvider, logger?: AuditLogger);
    /**
     * Processes a prompt through the privacy pipeline.
     * 1. Detect PII
     * 2. Tokenize and Sanitize
     * 3. Forward to LLM
     * 4. Re-hydrate and Restore
     */
    chat(prompt: string, sessionId: string): Promise<ChatResult>;
    /**
     * Manually clears the privacy vault for a specific session.
     */
    clearSession(sessionId: string): void;
    /**
     * Emergency wipe of all active session data.
     */
    clearAllSessions(): void;
}
//# sourceMappingURL=proxy.d.ts.map