import fs from 'fs';
import path from 'path';

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

export class AuditLogger {
  private logPath: string;

  constructor(logPath: string = '.cipherllm/audit.log') {
    this.logPath = logPath;
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Logs a redaction event.
   */
  log(entry: Omit<AuditEntry, 'timestamp'>): void {
    const fullEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    fs.appendFileSync(this.logPath, JSON.stringify(fullEntry) + '\n');
  }

  /**
   * Reads all logs.
   */
  getLogs(): AuditEntry[] {
    if (!fs.existsSync(this.logPath)) return [];
    
    const content = fs.readFileSync(this.logPath, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => JSON.parse(line));
  }

  /**
   * Clears audit logs.
   */
  clear(): void {
    if (fs.existsSync(this.logPath)) {
      fs.unlinkSync(this.logPath);
    }
  }
}
