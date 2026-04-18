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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AnthropicProvider {
    constructor(apiKey) {
        this.name = 'anthropic';
        this.client = new sdk_1.default({ apiKey });
    }
    send(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.messages.create({
                    model: 'claude-3-5-sonnet-20240620',
                    max_tokens: 1024,
                    messages: [{ role: 'user', content: prompt }],
                });
                // Anthropic returns an array of content blocks, usually we want the text block
                const content = response.content[0];
                if ((content === null || content === void 0 ? void 0 : content.type) === 'text') {
                    return content.text;
                }
                return '';
            }
            catch (error) {
                console.error('Anthropic API Error:', error);
                throw new Error('Failed to fetch from Anthropic');
            }
        });
    }
}
exports.AnthropicProvider = AnthropicProvider;
