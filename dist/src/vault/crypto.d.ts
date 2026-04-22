/**
 * Encrypts a vault Record into an authenticated hex string.
 * Format: salt:iv:tag:ciphertext (all hex)
 */
export declare function encryptVault(data: Record<string, string>, passphrase: string): string;
/**
 * Decrypts an authenticated hex string back into a vault Record.
 * Verifies integrity using the GCM auth tag.
 */
export declare function decryptVault(encryptedString: string, passphrase: string): Record<string, string>;
//# sourceMappingURL=crypto.d.ts.map