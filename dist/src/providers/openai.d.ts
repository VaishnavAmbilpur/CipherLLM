import { LLMProvider } from './types';
export declare class OpenAIProvider implements LLMProvider {
    private client;
    readonly name = "openai";
    constructor(apiKey: string);
    send(prompt: string): Promise<string>;
}
//# sourceMappingURL=openai.d.ts.map