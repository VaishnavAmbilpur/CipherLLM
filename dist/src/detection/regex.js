// src/detection/regex.ts — Structured PII Detection
/**
 * Registry of regex patterns for structured PII.
 * Focuses primarily on Indian-market identifiers (Aadhaar, PAN, UPI).
 */
export const PII_PATTERNS = {
    // --- INDIAN PII ---
    AADHAAR: /\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
    PAN: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
    PHONE_IN: /(\+91|0)?[6-9]\d{9}/g,
    UPI: /[a-zA-Z0-9._-]+@[a-zA-Z]{3,}/g,
    SALARY_IN: /₹\s?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?/g,
    VOTER_ID: /[A-Z]{3}[0-9]{7}/g,
    // --- UNIVERSAL PII ---
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    SSN: /\d{3}-\d{2}-\d{4}/g,
    CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    API_KEY: /[a-zA-Z0-9_-]{32,}/g,
};
/**
 * Scans text for structured PII using the pattern library.
 */
export function detectWithRegex(text) {
    const detections = [];
    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
        // Crucial: reset lastIndex for global patterns
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const value = match[0];
            detections.push({
                original: value,
                type,
                start: match.index,
                end: match.index + value.length
            });
        }
    }
    return detections;
}
