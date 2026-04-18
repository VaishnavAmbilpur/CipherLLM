import { LLMProvider } from './types';

export class MockProvider implements LLMProvider {
  public readonly name = 'mock';

  async send(prompt: string): Promise<string> {
    // Return a response that repeats some tokens to test re-hydration
    // he system should have tokenized names and numbers
    return `Analysis for prompt: ${prompt}\n\nThe data shows that [AADHAAR_1] belongs to [PERSON_1] who earns [SALARY_IN_1].`;
  }
}
