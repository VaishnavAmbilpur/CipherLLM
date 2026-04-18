/**
 * Re-hydration Engine
 * 
 * Restores original sensitive values into the LLM's anonymized response.
 */

/**
 * Replaces all tokens in the response with their original values from the vault.
 * Handles case-insensitive matches to account for LLM mangling.
 */
export function rehydrate(response: string, vault: Map<string, string>): string {
  let rehydrated = response;

  for (const [token, originalValue] of vault.entries()) {
    // Escape brackets for regex
    const escapedToken = token.replace(/[[\]]/g, '\\$&');
    
    // Create a global, case-insensitive regex for the token
    // Also handles potential variations like spaces or underscores if they were somehow mangled
    // (though standard format is [TYPE_N])
    const regex = new RegExp(escapedToken, 'gi');
    
    rehydrated = rehydrated.replace(regex, originalValue);
  }

  return rehydrated;
}
