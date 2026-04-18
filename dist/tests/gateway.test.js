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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cipher_1 = require("../src/gateway/cipher");
// Mock the orchestrator to avoid real AI calls
jest.mock('../src/gateway/cipher');
const app = (0, express_1.default)();
app.use(express_1.default.json());
const sessions = {};
app.post('/v1/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, sessionId } = req.body;
    if (!sessions[sessionId]) {
        sessions[sessionId] = new cipher_1.CipherLLM({});
    }
    const result = yield sessions[sessionId].chat(message);
    res.json(result);
}));
describe('POST /v1/chat', () => {
    test('returns rehydrated response and redaction count', () => __awaiter(void 0, void 0, void 0, function* () {
        // Setup mock behavior
        cipher_1.CipherLLM.prototype.chat.mockResolvedValue({
            response: 'Hello John Doe',
            redactionCount: 1
        });
        const res = yield (0, supertest_1.default)(app)
            .post('/v1/chat')
            .send({
            message: 'Hello [PERSON_1]',
            sessionId: 'test-session'
        });
        expect(res.status).toBe(200);
        expect(res.body.response).toBe('Hello John Doe');
        expect(res.body.redactionCount).toBe(1);
    }));
});
