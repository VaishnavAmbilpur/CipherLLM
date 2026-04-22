// src/gateway/proxy.ts — The CipherLLM Orchestrator
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { detect } from '../detection/detector.js';
import { TokenVault } from '../vault/vault.js';
import { rehydrate } from '../rehydration/rehydrate.js';
/**
 * The main gateway entry point. orchestrates the 5-layer privacy lifecycle.
 */
export class CipherLLM {
    constructor(provider, logger) {
        // Session management: sessionId -> TokenVault
        this.sessions = new Map();
        this.provider = provider;
        this.logger = logger !== null && logger !== void 0 ? logger : null;
    }
    /**
     * Processes a prompt through the privacy pipeline.
     * 1. Detect PII
     * 2. Tokenize and Sanitize
     * 3. Forward to LLM
     * 4. Re-hydrate and Restore
     */
    chat(prompt, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // 1. Session Retrieval
            if (!this.sessions.has(sessionId)) {
                this.sessions.set(sessionId, new TokenVault());
            }
            const vault = this.sessions.get(sessionId);
            // 2. Intelligence Layer: PII Detection
            const detections = detect(prompt);
            // 3. Sanitization
            let sanitized = prompt;
            for (const detection of detections) {
                const token = vault.tokenize(detection.original, detection.type);
                sanitized = sanitized.replace(detection.original, token);
                // Audit: Trace Tokenization
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.log({
                    timestamp: new Date().toISOString(),
                    sessionId,
                    piiType: detection.type,
                    token,
                    action: 'TOKENIZED',
                });
            }
            // 4. External LLM Communication (Clean Prompt)
            const rawResponse = yield this.provider.send(sanitized);
            // 5. Intelligent Re-hydration
            const finalResponse = rehydrate(rawResponse, vault.getAll());
            // 6. Audit: Trace Restoration
            for (const [token] of vault.getAll()) {
                // Fuzzy check to see if the LLM mentioned any of our tokens
                if (rawResponse.toLowerCase().includes(token.toLowerCase())) {
                    (_b = this.logger) === null || _b === void 0 ? void 0 : _b.log({
                        timestamp: new Date().toISOString(),
                        sessionId,
                        piiType: (_d = (_c = token.match(/\[(\w+)_\d+\]/)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : 'UNKNOWN',
                        token,
                        action: 'REHYDRATED',
                    });
                }
            }
            return {
                response: finalResponse,
                redactionCount: detections.length,
            };
        });
    }
    /**
     * Manually clears the privacy vault for a specific session.
     */
    clearSession(sessionId) {
        const vault = this.sessions.get(sessionId);
        if (vault) {
            vault.destroy();
            this.sessions.delete(sessionId);
        }
    }
    /**
     * Emergency wipe of all active session data.
     */
    clearAllSessions() {
        for (const vault of this.sessions.values()) {
            vault.destroy();
        }
        this.sessions.clear();
    }
}
