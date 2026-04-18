import { LLMProvider } from './types';
export declare class MockProvider implements LLMProvider {
    readonly name = "mock";
    send(prompt: string): Promise<string>;
}
//# sourceMappingURL=mock.d.ts.map