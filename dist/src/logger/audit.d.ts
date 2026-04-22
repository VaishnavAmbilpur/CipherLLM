import { AuditEntry, ComplianceReport } from '../types.js';
/**
 * Standard audit logger for privacy events.
 * Records metadata about interceptions and restorations.
 */
export declare class AuditLogger {
    private logs;
    /**
     * Records a privacy event.
     * Ensures that NO actual PII values are leaked into logs.
     */
    log(entry: AuditEntry): void;
    /**
     * Retrieves all logs for the current session.
     */
    getLogs(): AuditEntry[];
    /**
     * Generates a structural summary report for compliance verification.
     */
    generateReport(): ComplianceReport;
    /**
     * Exports logs in JSONL format (JSON Lines), the standard for audit trails.
     */
    exportJSONL(): string;
}
//# sourceMappingURL=audit.d.ts.map