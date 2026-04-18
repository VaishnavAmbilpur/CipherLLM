import { AuditLogger } from '../src/compliance/logger';
import { generateReport } from '../src/compliance/report';
import { CipherLLM } from '../src/gateway/cipher';
import { MockProvider } from '../src/providers/mock';
import fs from 'fs';
import path from 'path';

describe('Phase 7: Compliance & Reporting', () => {
  const TEST_LOG = path.join(__dirname, 'test_audit.log');
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger(TEST_LOG);
  });

  afterEach(() => {
    logger.clear();
  });

  test('AuditLogger stores redaction events without PII values', () => {
    logger.log({
      sessionId: 'sess-001',
      piiType: 'AADHAAR',
      token: '[AADHAAR_1]',
      action: 'redact'
    });

    const logs = logger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].piiType).toBe('AADHAAR');
    expect(logs[0].token).toBe('[AADHAAR_1]');
    
    // Verify file content
    const rawContent = fs.readFileSync(TEST_LOG, 'utf8');
    expect(rawContent).not.toContain('8234'); // No raw value
  });

  test('generateReport aggregates statistics correctly', () => {
    logger.log({ sessionId: 's1', piiType: 'PERSON', token: '[P1]', action: 'redact' });
    logger.log({ sessionId: 's1', piiType: 'EMAIL', token: '[E1]', action: 'redact' });
    logger.log({ sessionId: 's2', piiType: 'PERSON', token: '[P1]', action: 'redact' });

    const report = generateReport(logger);
    
    expect(report.totalRedactions).toBe(3);
    expect(report.sessionCount).toBe(2);
    expect(report.uniqueTypes).toContain('PERSON');
    expect(report.uniqueTypes).toContain('EMAIL');
    expect(report.topPIITypes[0].type).toBe('PERSON');
    expect(report.topPIITypes[0].count).toBe(2);
  });

  test('CipherLLM automatically logs events during chat', async () => {
    const cipher = new CipherLLM(new MockProvider(), logger);
    await cipher.chat('My email is mark@meta.com', 'user-123');
    
    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].sessionId).toBe('user-123');
    expect(logs[0].piiType).toBe('EMAIL');
  });
});
