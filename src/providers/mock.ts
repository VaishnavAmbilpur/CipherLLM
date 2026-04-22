// src/providers/mock.ts — Local Mock for Testing

import { LLMProvider } from '../types.js';

/**
 * A "Fake" LLM provider used to safely test the privacy pipeline 
 * without making expensive or leaky network calls.
 */
export class MockProvider implements LLMProvider {
  private response: string;
  public lastReceivedPrompt: string = '';

  constructor(mockResponse: string = 'Mock LLM response') {
    this.response = mockResponse;
  }

  async send(prompt: string): Promise<string> {
    // Store the incoming prompt so tests can verify it was redacted
    this.lastReceivedPrompt = prompt;
    return this.response;
  }
}

