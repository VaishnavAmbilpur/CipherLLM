var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CipherLLM, MockProvider } from '../lib.js';
function verify() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- CipherLLM Integration Test ---');
        // 1. Initialize
        const provider = new MockProvider("Hello [PERSON_1], your email [EMAIL_1] is verified.");
        const cipher = new CipherLLM(provider);
        // 2. Test Input
        const prompt = "Hello Priya Sharma, your email priya@techcorp.in is verified.";
        const SESSION = "test-session-123";
        console.log(`Original: ${prompt}`);
        // 3. Process
        try {
            const result = yield cipher.chat(prompt, SESSION);
            console.log(`Response: ${result.response}`);
            console.log(`Redactions: ${result.redactionCount}`);
            if (result.response.includes('Priya Sharma')) {
                console.log('✅ Success! Module resolved and PII re-hydrated correctly.');
            }
        }
        catch (err) {
            console.error('❌ Error:', err);
        }
    });
}
verify();
