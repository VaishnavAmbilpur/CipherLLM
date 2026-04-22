// src/rehydration/rehydrate.ts — Intelligent Token Restoration

/**
 * Replaces anonymous tokens in LLM responses with their original sensitive values.
 * Handles case-mangling, whitespace variation, and partial token matches.
 */
export function rehydrate(
  response: string,
  vault: Map<string, string>
): string {
  let result = response;

  // IMPORTANT: Sort tokens by length descending.
  // This prevents "[PERSON_1]" from matching inside "[PERSON_10]".
  const sortedTokens = Array.from(vault.keys()).sort(
    (a, b) => b.length - a.length
  );

  for (const token of sortedTokens) {
    const original = vault.get(token)!;

    /**
     * Build a fuzzy regex for the token.
     * Escapes [ and ] characters.
     * Allows underscores (_) to optionally match a space (e.g., [PERSON 1]).
     */
    const escaped = token
      .replace(/[[\]]/g, '\\$&')
      .replace(/_/g, '[_\\s]?');

    const pattern = new RegExp(escaped, 'gi'); // Global and Case-Insensitive
    result = result.replace(pattern, original);
  }

  return result;
}

