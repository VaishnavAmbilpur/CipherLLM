"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("../src/providers/openai");
const anthropic_1 = require("../src/providers/anthropic");
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
    test('OpenAIProvider sends prompt and returns response', () => __awaiter(void 0, void 0, void 0, function* () {
        const provider = new openai_1.OpenAIProvider('fake-key');
        const response = yield provider.send('Hello');
        expect(response).toBe('OpenAI Mock Response');
        expect(provider.name).toBe('openai');
    }));
    test('AnthropicProvider sends prompt and returns response', () => __awaiter(void 0, void 0, void 0, function* () {
        const provider = new anthropic_1.AnthropicProvider('fake-key');
        const response = yield provider.send('Hello');
        expect(response).toBe('Anthropic Mock Response');
        expect(provider.name).toBe('anthropic');
    }));
});
