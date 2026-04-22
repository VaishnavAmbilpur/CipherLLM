/**
 * Layer 1: Detection
 */
export { detect } from './detection/detector.js';
export { PII_PATTERNS } from './detection/regex.js';
/**
 * Layer 2: Vault & Security
 */
export { TokenVault } from './vault/vault.js';
export { encryptVault, decryptVault } from './vault/crypto.js';
/**
 * Layer 3: Providers (Strategies)
 */
export { OpenAIProvider } from './providers/openai.js';
export { AnthropicProvider } from './providers/anthropic.js';
export { MockProvider } from './providers/mock.js';
/**
 * Layer 5: Compliance
 */
export { AuditLogger } from './logger/audit.js';
/**
 * Main Gateway (Orchestrator)
 */
export { CipherLLM } from './gateway/cipher.js';
/**
 * Public Types
 */
export type { Detection, ChatResult, LLMProvider, AuditEntry, ComplianceReport } from './types.js';
//# sourceMappingURL=lib.d.ts.map