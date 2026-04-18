/**
 * LLM Provider Interface
 */
export interface LLMProvider {
    /**
     * Sending a prompt to the LLM and returning the response text.
     */
    send(prompt: string): Promise<string>;
    /**
     * The name of the provider.
     */
    readonly name: string;
}
//# sourceMappingURL=types.d.ts.map