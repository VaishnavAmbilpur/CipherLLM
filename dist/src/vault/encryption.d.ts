/**
 * Derives a 256-bit key from a passphrase and salt.
 */
export declare function deriveKey(passphrase: string, salt: Buffer): Buffer;
/**
 * Encrypts cleartext using a passphrase.
 */
export declare function encrypt(cleartext: string, passphrase: string): string;
/**
 * Decrypts ciphertext using a passphrase.
 */
export declare function decrypt(ciphertext: string, passphrase: string): string;
//# sourceMappingURL=encryption.d.ts.map