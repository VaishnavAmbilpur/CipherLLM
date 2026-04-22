// src/providers/openai.ts — OpenAI Integration
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import OpenAI from 'openai';
/**
 * Strategy implementation for OpenAI's Chat Completion API.
 */
export class OpenAIProvider {
    constructor(apiKey, model = 'gpt-4o') {
        if (!apiKey)
            throw new Error('OpenAI API key is required');
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }
    send(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const response = yield this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2048,
            });
            const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!content)
                throw new Error('OpenAI returned an empty response');
            return content;
        });
    }
}
