/**
 * Manages the mapping between sensitive PII and anonymous tokens.
 * Ensures consistent tokenization within a session.
 */
export declare class TokenVault {
    private vault;
    private counters;
    readonly sessionId: string;
    constructor();
    /**
     * Assigns a token to a sensitive value.
     * If the value has already been tokenized, returns the existing token (Idempotency).
     */
    tokenize(value: string, type: string): string;
    /**
     * Returns all mappings. Used by the re-hydration engine.
     */
    getAll(): Map<string, string>;
    /**
     * Total number of unique sensitive items in the vault.
     */
    size(): number;
    /**
     * Wipes the vault mappings. Permanent unless serialized and saved.
     */
    destroy(): void;
    /**
     * Serializes the vault for storage.
     */
    serialize(): Record<string, string>;
    /**
     * Loads a serialized vault state.
     */
    deserialize(data: Record<string, string>): void;
}
//# sourceMappingURL=vault.d.ts.map