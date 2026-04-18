import { LLMProvider } from '../providers/types';
import { AuditLogger } from '../compliance/logger';
export declare class CipherLLM {
    private vault;
    private provider;
    private logger;
    constructor(provider: LLMProvider, logger?: AuditLogger);
    /**
     * Orchestrates the privacy-preserved chat flow.
     */
    chat(prompt: string, sessionId?: string): Promise<{
        response: string;
        redactionCount: number;
    }>;
    /**
     * Clears the current session data.
     */
    clearSession(): void;
}
//# sourceMappingURL=cipher.d.ts.map