import { LLMProvider } from '../types.js';
/**
 * Strategy implementation for Anthropic's Messages API (Claude).
 */
export declare class AnthropicProvider implements LLMProvider {
    private client;
    private model;
    constructor(apiKey: string, model?: string);
    send(prompt: string): Promise<string>;
}
//# sourceMappingURL=anthropic.d.ts.map