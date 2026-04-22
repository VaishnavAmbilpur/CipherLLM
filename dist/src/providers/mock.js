// src/providers/mock.ts — Local Mock for Testing
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * A "Fake" LLM provider used to safely test the privacy pipeline
 * without making expensive or leaky network calls.
 */
export class MockProvider {
    constructor(mockResponse = 'Mock LLM response') {
        this.lastReceivedPrompt = '';
        this.response = mockResponse;
    }
    send(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            // Store the incoming prompt so tests can verify it was redacted
            this.lastReceivedPrompt = prompt;
            return this.response;
        });
    }
}
