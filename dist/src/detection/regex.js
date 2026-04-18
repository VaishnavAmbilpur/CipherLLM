"use strict";
/**
 * CipherLLM PII Regex Library
 *
 * Standardized patterns for detecting sensitive data.
 * Focused on Indian PII (Aadhaar, PAN, UPI, Phone) and Universal PII (Email, API Keys).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PII_PATTERNS = void 0;
exports.PII_PATTERNS = {
    // --- Indian Specific PII ---
    // Aadhaar: 12 digit number, often separated by spaces or hyphens.
    // Pattern: [2-9] followed by 11 digits. Supports optional separators.
    AADHAAR: /[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}/g,
    // PAN: 10-character alphanumeric string.
    // 5 letters, 4 digits, 1 letter.
    PAN: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
    // Phone (India): Mobile numbers starting with 6-9, optional +91 or 0 prefix.
    PHONE_IN: /(?:\+91|0)?[6-9]\d{9}/g,
    // UPI ID: vpa@bank_provider.
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Salary (Indian): ₹ symbol followed by numeric value with comma separators.
    SALARY_IN: /₹\s?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?/g,
    // UPI ID: vpa@bank_provider.
    UPI: /[a-zA-Z0-9._-]+@[a-zA-Z]{3,}/g,
    // Credit Card: 13-19 digit numbers (with spaces/hyphens).
    CREDIT_CARD: /\b(?:\d[\s-]?){13,19}\b/g,
    // API Keys / Secrets: Alphanumeric strings of 32+ characters.
    // This is a heuristic and may produce false positives.
    API_KEY: /[a-zA-Z0-9/+=]{32,}/g,
};
