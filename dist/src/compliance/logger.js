"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AuditLogger {
    constructor(logPath = '.cipherllm/audit.log') {
        this.logPath = logPath;
        const dir = path_1.default.dirname(this.logPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    /**
     * Logs a redaction event.
     */
    log(entry) {
        const fullEntry = Object.assign(Object.assign({}, entry), { timestamp: new Date().toISOString() });
        fs_1.default.appendFileSync(this.logPath, JSON.stringify(fullEntry) + '\n');
    }
    /**
     * Reads all logs.
     */
    getLogs() {
        if (!fs_1.default.existsSync(this.logPath))
            return [];
        const content = fs_1.default.readFileSync(this.logPath, 'utf8');
        return content
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => JSON.parse(line));
    }
    /**
     * Clears audit logs.
     */
    clear() {
        if (fs_1.default.existsSync(this.logPath)) {
            fs_1.default.unlinkSync(this.logPath);
        }
    }
}
exports.AuditLogger = AuditLogger;
