import { LLMProvider } from '../types.js';
/**
 * Strategy implementation for OpenAI's Chat Completion API.
 */
export declare class OpenAIProvider implements LLMProvider {
    private client;
    private model;
    constructor(apiKey: string, model?: string);
    send(prompt: string): Promise<string>;
}
//# sourceMappingURL=openai.d.ts.map