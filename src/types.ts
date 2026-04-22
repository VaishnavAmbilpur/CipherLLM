// src/types.ts — Public Interface Definitions

/**
 * A single PII match found in a prompt
 */
export interface Detection {
  original: string;   // The actual sensitive value (e.g., "8234-5678-9012")
  type: string;       // The category (e.g., "AADHAAR")
  start?: number;     // Character position (optional)
  end?: number;
}

/**
 * What CipherLLM returns to the developer
 */
export interface ChatResult {
  response: string;        // The final response with real data re-hydrated
  redactionCount: number;  // How many PII items were intercepted
}

/**
 * The interface every LLM provider must implement
 */
export interface LLMProvider {
  send(prompt: string): Promise<string>;
}

/**
 * One entry in the audit log
 */
export interface AuditEntry {
  timestamp: string;      // ISO 8601 datetime
  sessionId: string;      // Unique session ID
  piiType: string;        // "AADHAAR", "EMAIL", etc.
  token: string;          // "[AADHAAR_1]"
  action: 'TOKENIZED' | 'REHYDRATED';
  // Note: 'original' value is NEVER stored here for security reasons.
}

/**
 * A summary report for compliance auditing
 */
export interface ComplianceReport {
  totalRedactions: number;
  uniqueTypes: string[];
  sessionCount: number;
  topPIITypes: { type: string; count: number }[];
}

