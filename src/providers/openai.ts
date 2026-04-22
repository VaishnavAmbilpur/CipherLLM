// src/providers/openai.ts — OpenAI Integration

import OpenAI from 'openai';
import { LLMProvider } from '../types.js';

/**
 * Strategy implementation for OpenAI's Chat Completion API.
 */
export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    if (!apiKey) throw new Error('OpenAI API key is required');
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async send(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned an empty response');

    return content;
  }
}

