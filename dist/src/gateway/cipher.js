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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CipherLLM = void 0;
const regex_1 = require("../detection/regex");
const vault_1 = require("../vault/vault");
const rehydrate_1 = require("../rehydration/rehydrate");
const logger_1 = require("../compliance/logger");
class CipherLLM {
    constructor(provider, logger) {
        this.vault = new vault_1.TokenVault();
        this.provider = provider;
        this.logger = logger || new logger_1.AuditLogger();
    }
    /**
     * Orchestrates the privacy-preserved chat flow.
     */
    chat(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, sessionId = 'default') {
            let sanitizedPrompt = prompt;
            let redactionCount = 0;
            // Regex Detection & Tokenization
            for (const [type, regex] of Object.entries(regex_1.PII_PATTERNS)) {
                regex.lastIndex = 0;
                const matches = prompt.match(regex);
                if (matches) {
                    for (const match of matches) {
                        const token = this.vault.tokenize(match, type);
                        sanitizedPrompt = sanitizedPrompt.split(match).join(token);
                        redactionCount++;
                        this.logger.log({
                            sessionId,
                            piiType: type,
                            token,
                            action: 'redact'
                        });
                    }
                }
            }
            // NLP Intelligence Layer (Phase 4)
            const { extractEntities } = require('../detection/nlp');
            const nlpEntities = extractEntities(sanitizedPrompt);
            for (const entity of nlpEntities) {
                const token = this.vault.tokenize(entity.text, entity.type);
                sanitizedPrompt = sanitizedPrompt.split(entity.text).join(token);
                redactionCount++;
                this.logger.log({
                    sessionId,
                    piiType: entity.type,
                    token,
                    action: 'redact'
                });
            }
            // Send to LLM
            const rawResponse = yield this.provider.send(sanitizedPrompt);
            // Re-hydration
            const rehydratedResponse = (0, rehydrate_1.rehydrate)(rawResponse, this.vault.getAll());
            return {
                response: rehydratedResponse,
                redactionCount: redactionCount
            };
        });
    }
    /**
     * Clears the current session data.
     */
    clearSession() {
        this.vault.destroy();
    }
}
exports.CipherLLM = CipherLLM;
