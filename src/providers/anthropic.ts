// src/providers/anthropic.ts — Anthropic Integration

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from '../types.js';

/**
 * Strategy implementation for Anthropic's Messages API (Claude).
 */
export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-6') {
    if (!apiKey) throw new Error('Anthropic API key is required');
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async send(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content[0];
    if (block.type !== 'text') {
      throw new Error(`Unexpected Anthropic response type: ${block.type}`);
    }

    return block.text;
  }
}

