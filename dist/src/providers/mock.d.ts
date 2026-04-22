import { LLMProvider } from '../types.js';
/**
 * A "Fake" LLM provider used to safely test the privacy pipeline
 * without making expensive or leaky network calls.
 */
export declare class MockProvider implements LLMProvider {
    private response;
    lastReceivedPrompt: string;
    constructor(mockResponse?: string);
    send(prompt: string): Promise<string>;
}
//# sourceMappingURL=mock.d.ts.map