/**
 * Re-hydration Engine
 *
 * Restores original sensitive values into the LLM's anonymized response.
 */
/**
 * Replaces all tokens in the response with their original values from the vault.
 * Handles case-insensitive matches to account for LLM mangling.
 */
export declare function rehydrate(response: string, vault: Map<string, string>): string;
//# sourceMappingURL=rehydrate.d.ts.map