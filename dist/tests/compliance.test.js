"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../src/compliance/logger");
const report_1 = require("../src/compliance/report");
const cipher_1 = require("../src/gateway/cipher");
const mock_1 = require("../src/providers/mock");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe('Phase 7: Compliance & Reporting', () => {
    const TEST_LOG = path_1.default.join(__dirname, 'test_audit.log');
    let logger;
    beforeEach(() => {
        logger = new logger_1.AuditLogger(TEST_LOG);
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
        const rawContent = fs_1.default.readFileSync(TEST_LOG, 'utf8');
        expect(rawContent).not.toContain('8234'); // No raw value
    });
    test('generateReport aggregates statistics correctly', () => {
        logger.log({ sessionId: 's1', piiType: 'PERSON', token: '[P1]', action: 'redact' });
        logger.log({ sessionId: 's1', piiType: 'EMAIL', token: '[E1]', action: 'redact' });
        logger.log({ sessionId: 's2', piiType: 'PERSON', token: '[P1]', action: 'redact' });
        const report = (0, report_1.generateReport)(logger);
        expect(report.totalRedactions).toBe(3);
        expect(report.sessionCount).toBe(2);
        expect(report.uniqueTypes).toContain('PERSON');
        expect(report.uniqueTypes).toContain('EMAIL');
        expect(report.topPIITypes[0].type).toBe('PERSON');
        expect(report.topPIITypes[0].count).toBe(2);
    });
    test('CipherLLM automatically logs events during chat', () => __awaiter(void 0, void 0, void 0, function* () {
        const cipher = new cipher_1.CipherLLM(new mock_1.MockProvider(), logger);
        yield cipher.chat('My email is mark@meta.com', 'user-123');
        const logs = logger.getLogs();
        expect(logs.length).toBeGreaterThanOrEqual(1);
        expect(logs[0].sessionId).toBe('user-123');
        expect(logs[0].piiType).toBe('EMAIL');
    }));
});
