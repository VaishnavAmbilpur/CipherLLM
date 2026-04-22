/**
 * A single PII match found in a prompt
 */
export interface Detection {
    original: string;
    type: string;
    start?: number;
    end?: number;
}
/**
 * What CipherLLM returns to the developer
 */
export interface ChatResult {
    response: string;
    redactionCount: number;
}
/**
 * The interface every LLM provider must implement
 */
export interface LLMProvider {
    send(prompt: string): Promise<string>;
}
/**
 * One entry in the audit log
 */
export interface AuditEntry {
    timestamp: string;
    sessionId: string;
    piiType: string;
    token: string;
    action: 'TOKENIZED' | 'REHYDRATED';
}
/**
 * A summary report for compliance auditing
 */
export interface ComplianceReport {
    totalRedactions: number;
    uniqueTypes: string[];
    sessionCount: number;
    topPIITypes: {
        type: string;
        count: number;
    }[];
}
//# sourceMappingURL=types.d.ts.map