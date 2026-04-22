// src/gateway/cipher.ts — The CipherLLM Orchestrator

import { detect } from '../detection/detector.js';
import { TokenVault } from '../vault/vault.js';
import { rehydrate } from '../rehydration/rehydrate.js';
import { AuditLogger } from '../logger/audit.js';
import { LLMProvider, ChatResult } from '../types.js';

/**
 * The main gateway entry point. orchestrates the 5-layer privacy lifecycle.
 */
export class CipherLLM {
  private provider: LLMProvider;
  private logger: AuditLogger | null;

  // Session management: sessionId -> TokenVault
  private sessions = new Map<string, TokenVault>();

  constructor(provider: LLMProvider, logger?: AuditLogger) {
    this.provider = provider;
    this.logger = logger ?? null;
  }

  /**
   * Processes a prompt through the privacy pipeline.
   * 1. Detect PII (with positions)
   * 2. Tokenize and Sanitize (End-to-Start replacement)
   * 3. Forward to LLM
   * 4. Re-hydrate and Restore
   */
  async chat(prompt: string, sessionId: string): Promise<ChatResult> {
    
    // 1. Session Retrieval
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new TokenVault());
    }
    const vault = this.sessions.get(sessionId)!;

    // 2. Intelligence Layer: PII Detection
    // Returns results sorted in REVERSE order by position
    const detections = detect(prompt);

    // 3. Sanitization (End-to-Start)
    let sanitized = prompt;
    for (const d of detections) {
      if (d.start !== undefined && d.end !== undefined) {
        const token = vault.tokenize(d.original, d.type);
        
        // Replace exactly at the detected positions
        sanitized = sanitized.slice(0, d.start) + token + sanitized.slice(d.end);

        // Audit: Trace Tokenization
        this.logger?.log({
          timestamp: new Date().toISOString(),
          sessionId,
          piiType: d.type,
          token,
          action: 'TOKENIZED',
        });
      }
    }

    // 4. External LLM Communication (Clean Prompt)
    const rawResponse = await this.provider.send(sanitized);

    // 5. Intelligent Re-hydration
    const finalResponse = rehydrate(rawResponse, vault.getAll());

    // 6. Audit: Trace Restoration
    for (const [token] of vault.getAll()) {
      if (rawResponse.toLowerCase().includes(token.toLowerCase())) {
        this.logger?.log({
          timestamp: new Date().toISOString(),
          sessionId,
          piiType: token.match(/\[(\w+)_\d+\]/)?.[1] ?? 'UNKNOWN',
          token,
          action: 'REHYDRATED',
        });
      }
    }

    return {
      response: finalResponse,
      redactionCount: detections.length,
    };
  }

  /**
   * Manually clears the privacy vault for a specific session.
   */
  clearSession(sessionId: string): void {
    const vault = this.sessions.get(sessionId);
    if (vault) {
      vault.destroy();
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Emergency wipe of all active session data.
   */
  clearAllSessions(): void {
    for (const vault of this.sessions.values()) {
      vault.destroy();
    }
    this.sessions.clear();
  }
}
