import { AuditEntry, AuditLogger } from './logger';

/**
 * Compliance Report Generator
 */

export interface ComplianceStats {
  totalRedactions: number;
  uniqueTypes: string[];
  sessionCount: number;
  topPIITypes: Array<{ type: string, count: number }>;
}

export function generateReport(logger: AuditLogger): ComplianceStats {
  const logs = logger.getLogs();
  
  const typeCounts: Record<string, number> = {};
  const sessions = new Set<string>();
  
  logs.forEach(log => {
    typeCounts[log.piiType] = (typeCounts[log.piiType] || 0) + 1;
    sessions.add(log.sessionId);
  });

  const topPIITypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRedactions: logs.filter(l => l.action === 'redact').length,
    uniqueTypes: Object.keys(typeCounts),
    sessionCount: sessions.size,
    topPIITypes
  };
}
