// src/providers/anthropic.ts — Anthropic Integration
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Anthropic from '@anthropic-ai/sdk';
/**
 * Strategy implementation for Anthropic's Messages API (Claude).
 */
export class AnthropicProvider {
    constructor(apiKey, model = 'claude-sonnet-4-6') {
        if (!apiKey)
            throw new Error('Anthropic API key is required');
        this.client = new Anthropic({ apiKey });
        this.model = model;
    }
    send(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.messages.create({
                model: this.model,
                max_tokens: 2048,
                messages: [{ role: 'user', content: prompt }],
            });
            const block = response.content[0];
            if (block.type !== 'text') {
                throw new Error(`Unexpected Anthropic response type: ${block.type}`);
            }
            return block.text;
        });
    }
}
