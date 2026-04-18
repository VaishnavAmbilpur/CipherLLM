/**
 * Compliance Audit Logger
 *
 * Logs redaction events without storing the actual PII values.
 * This ensures the audit logs themselves are compliant with DPDP/GDPR.
 */
export interface AuditEntry {
    timestamp: string;
    sessionId: string;
    piiType: string;
    token: string;
    action: 'redact' | 'rehydrate';
}
export declare class AuditLogger {
    private logPath;
    constructor(logPath?: string);
    /**
     * Logs a redaction event.
     */
    log(entry: Omit<AuditEntry, 'timestamp'>): void;
    /**
     * Reads all logs.
     */
    getLogs(): AuditEntry[];
    /**
     * Clears audit logs.
     */
    clear(): void;
}
//# sourceMappingURL=logger.d.ts.map