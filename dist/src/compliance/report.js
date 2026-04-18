"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
function generateReport(logger) {
    const logs = logger.getLogs();
    const typeCounts = {};
    const sessions = new Set();
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
