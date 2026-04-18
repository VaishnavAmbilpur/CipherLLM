import OpenAI from 'openai';
import { LLMProvider } from './types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  public readonly name = 'openai';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async send(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to fetch from OpenAI');
    }
  }
}
