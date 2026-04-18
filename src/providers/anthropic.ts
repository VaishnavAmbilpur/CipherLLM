import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './types';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  public readonly name = 'anthropic';

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async send(prompt: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      // Anthropic returns an array of content blocks, usually we want the text block
      const content = response.content[0];
      if (content?.type === 'text') {
        return content.text;
      }
      
      return '';
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error('Failed to fetch from Anthropic');
    }
  }
}
