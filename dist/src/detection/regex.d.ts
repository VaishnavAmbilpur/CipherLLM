import { Detection } from '../types.js';
/**
 * Registry of regex patterns for structured PII.
 * Focuses primarily on Indian-market identifiers (Aadhaar, PAN, UPI).
 */
export declare const PII_PATTERNS: Record<string, RegExp>;
/**
 * Scans text for structured PII using the pattern library.
 */
export declare function detectWithRegex(text: string): Detection[];
//# sourceMappingURL=regex.d.ts.map