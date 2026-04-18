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
exports.MockProvider = void 0;
class MockProvider {
    constructor() {
        this.name = 'mock';
    }
    send(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return a response that repeats some tokens to test re-hydration
            // he system should have tokenized names and numbers
            return `Analysis for prompt: ${prompt}\n\nThe data shows that [AADHAAR_1] belongs to [PERSON_1] who earns [SALARY_IN_1].`;
        });
    }
}
exports.MockProvider = MockProvider;
