"use strict";
/**
 * Token Vault
 *
 * Handles idempotent mapping between original sensitive values and anonymized tokens.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVault = void 0;
class TokenVault {
    constructor() {
        this.vault = new Map();
        this.counters = {};
    }
    /**
     * Tokenizes a value. If the value has been tokenized before, returns the same token.
     * Format: [TYPE_N]
     */
    tokenize(value, type) {
        // Check if value already exists in vault
        for (const [token, storedValue] of this.vault.entries()) {
            if (storedValue === value) {
                return token;
            }
        }
        // Increment counter for this type
        const count = (this.counters[type] || 0) + 1;
        this.counters[type] = count;
        // Generate token
        const token = `[${type.toUpperCase()}_${count}]`;
        // Store in vault
        this.vault.set(token, value);
        return token;
    }
    /**
     * Returns all mappings currently in the vault.
     */
    getAll() {
        return new Map(this.vault);
    }
    /**
     * Clears the vault.
     */
    destroy() {
        this.vault.clear();
        this.counters = {};
    }
    /**
     * Persists the vault to disk (encrypted).
     */
    save(filePath, passphrase) {
        const fs = require('fs');
        const { encrypt } = require('./encryption');
        const data = JSON.stringify({
            vault: Array.from(this.vault.entries()),
            counters: this.counters
        });
        const encryptedData = encrypt(data, passphrase);
        fs.writeFileSync(filePath, encryptedData);
    }
    /**
     * Loads the vault from disk (decrypted).
     */
    load(filePath, passphrase) {
        const fs = require('fs');
        const { decrypt } = require('./encryption');
        if (!fs.existsSync(filePath)) {
            throw new Error('Vault file not found');
        }
        const encryptedData = fs.readFileSync(filePath, 'utf8');
        const decryptedData = decrypt(encryptedData, passphrase);
        const parsed = JSON.parse(decryptedData);
        this.vault = new Map(parsed.vault);
        this.counters = parsed.counters;
    }
}
exports.TokenVault = TokenVault;
