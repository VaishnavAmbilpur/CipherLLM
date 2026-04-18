import { PII_PATTERNS } from '../detection/regex';
import { TokenVault } from '../vault/vault';
import { rehydrate } from '../rehydration/rehydrate';
import { LLMProvider } from '../providers/types';
import { AuditLogger } from '../compliance/logger';

export class CipherLLM {
  private vault: TokenVault;
  private provider: LLMProvider;
  private logger: AuditLogger;

  constructor(provider: LLMProvider, logger?: AuditLogger) {
    this.vault = new TokenVault();
    this.provider = provider;
    this.logger = logger || new AuditLogger();
  }

  /**
   * Orchestrates the privacy-preserved chat flow.
   */
  async chat(prompt: string, sessionId: string = 'default'): Promise<{ response: string; redactionCount: number }> {
    let sanitizedPrompt = prompt;
    let redactionCount = 0;

    // Regex Detection & Tokenization
    for (const [type, regex] of Object.entries(PII_PATTERNS) as [string, RegExp][]) {
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
    const rawResponse = await this.provider.send(sanitizedPrompt);

    // Re-hydration
    const rehydratedResponse = rehydrate(rawResponse, this.vault.getAll());

    return {
      response: rehydratedResponse,
      redactionCount: redactionCount
    };
  }

  /**
   * Clears the current session data.
   */
  clearSession(): void {
    this.vault.destroy();
  }
}
