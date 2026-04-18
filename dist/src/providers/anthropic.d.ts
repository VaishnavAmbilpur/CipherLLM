import { LLMProvider } from './types';
export declare class AnthropicProvider implements LLMProvider {
    private client;
    readonly name = "anthropic";
    constructor(apiKey: string);
    send(prompt: string): Promise<string>;
}
//# sourceMappingURL=anthropic.d.ts.map