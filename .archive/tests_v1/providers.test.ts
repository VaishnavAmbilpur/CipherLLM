import { OpenAIProvider } from '../src/providers/openai';
import { AnthropicProvider } from '../src/providers/anthropic';

// Simple mock for OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'OpenAI Mock Response' } }]
        })
      }
    }
  }));
});

// Simple mock for Anthropic
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Anthropic Mock Response' }]
      })
    }
  }));
});

describe('LLM Providers', () => {
  
  test('OpenAIProvider sends prompt and returns response', async () => {
    const provider = new OpenAIProvider('fake-key');
    const response = await provider.send('Hello');
    expect(response).toBe('OpenAI Mock Response');
    expect(provider.name).toBe('openai');
  });

  test('AnthropicProvider sends prompt and returns response', async () => {
    const provider = new AnthropicProvider('fake-key');
    const response = await provider.send('Hello');
    expect(response).toBe('Anthropic Mock Response');
    expect(provider.name).toBe('anthropic');
  });
});

