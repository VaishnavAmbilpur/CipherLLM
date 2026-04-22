// src/vault/vault.ts — Tokenization Engine

import { v4 as uuidv4 } from 'uuid';

/**
 * Manages the mapping between sensitive PII and anonymous tokens.
 * Ensures consistent tokenization within a session.
 */
export class TokenVault {
  // token -> original value
  private vault = new Map<string, string>();
  
  // type -> counter (for [TYPE_1], [TYPE_2], etc.)
  private counters: Record<string, number> = {};
  
  public readonly sessionId: string;

  constructor() {
    this.sessionId = uuidv4();
  }

  /**
   * Assigns a token to a sensitive value.
   * If the value has already been tokenized, returns the existing token (Idempotency).
   */
  tokenize(value: string, type: string): string {
    // Check if we've seen this exact value before
    for (const [token, storedValue] of this.vault) {
      if (storedValue === value) return token;
    }

    // New value, increment counter and create token
    this.counters[type] = (this.counters[type] || 0) + 1;
    const count = this.counters[type];
    const token = `[${type}_${count}]`;

    this.vault.set(token, value);
    return token;
  }

  /**
   * Returns all mappings. Used by the re-hydration engine.
   */
  getAll(): Map<string, string> {
    return this.vault;
  }

  /**
   * Total number of unique sensitive items in the vault.
   */
  size(): number {
    return this.vault.size;
  }

  /**
   * Wipes the vault mappings. Permanent unless serialized and saved.
   */
  destroy(): void {
    this.vault.clear();
    this.counters = {};
  }

  /**
   * Serializes the vault for storage.
   */
  serialize(): Record<string, string> {
    return Object.fromEntries(this.vault);
  }

  /**
   * Loads a serialized vault state.
   */
  deserialize(data: Record<string, string>): void {
    this.vault.clear();
    for (const [token, value] of Object.entries(data)) {
      this.vault.set(token, value);
      
      // Update counters to prevent token collision on resume
      const match = token.match(/\[(\w+)_(\d+)\]/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2]);
        this.counters[type] = Math.max(this.counters[type] || 0, num);
      }
    }
  }
}

