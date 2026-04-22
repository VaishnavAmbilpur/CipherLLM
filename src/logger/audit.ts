// src/logger/audit.ts — Compliance Audit Infrastructure

import { AuditEntry, ComplianceReport } from '../types.js';

/**
 * Standard audit logger for privacy events.
 * Records metadata about interceptions and restorations.
 */
export class AuditLogger {
  private logs: AuditEntry[] = [];

  /**
   * Records a privacy event.
   * Ensures that NO actual PII values are leaked into logs.
   */
  log(entry: AuditEntry): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      sessionId: entry.sessionId,
      piiType: entry.piiType,
      token: entry.token,
      action: entry.action,
    });
  }

  /**
   * Retrieves all logs for the current session.
   */
  getLogs(): AuditEntry[] {
    return [...this.logs];
  }

  /**
   * Generates a structural summary report for compliance verification.
   */
  generateReport(): ComplianceReport {
    const typeCounts: Record<string, number> = {};
    const sessionSet = new Set<string>();

    for (const log of this.logs) {
      typeCounts[log.piiType] = (typeCounts[log.piiType] || 0) + 1;
      sessionSet.add(log.sessionId);
    }

    const topPIITypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    return {
      totalRedactions: this.logs.filter(l => l.action === 'TOKENIZED').length,
      uniqueTypes: Object.keys(typeCounts),
      sessionCount: sessionSet.size,
      topPIITypes,
    };
  }

  /**
   * Exports logs in JSONL format (JSON Lines), the standard for audit trails.
   */
  exportJSONL(): string {
    return this.logs.map(entry => JSON.stringify(entry)).join('\n');
  }
}
