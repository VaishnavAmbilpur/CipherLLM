import { AuditLogger } from './logger';
/**
 * Compliance Report Generator
 */
export interface ComplianceStats {
    totalRedactions: number;
    uniqueTypes: string[];
    sessionCount: number;
    topPIITypes: Array<{
        type: string;
        count: number;
    }>;
}
export declare function generateReport(logger: AuditLogger): ComplianceStats;
//# sourceMappingURL=report.d.ts.map