/**
 * Token Vault
 *
 * Handles idempotent mapping between original sensitive values and anonymized tokens.
 */
export declare class TokenVault {
    private vault;
    private counters;
    constructor();
    /**
     * Tokenizes a value. If the value has been tokenized before, returns the same token.
     * Format: [TYPE_N]
     */
    tokenize(value: string, type: string): string;
    /**
     * Returns all mappings currently in the vault.
     */
    getAll(): Map<string, string>;
    /**
     * Clears the vault.
     */
    destroy(): void;
    /**
     * Persists the vault to disk (encrypted).
     */
    save(filePath: string, passphrase: string): void;
    /**
     * Loads the vault from disk (decrypted).
     */
    load(filePath: string, passphrase: string): void;
}
//# sourceMappingURL=vault.d.ts.map