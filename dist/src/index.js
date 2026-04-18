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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = require("./providers/openai");
const anthropic_1 = require("./providers/anthropic");
const cipher_1 = require("./gateway/cipher");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
// Simple session store in RAM for Phase 2
// In Phase 3, we will add persistence.
const sessions = {};
app.post('/v1/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, provider: providerType, sessionId } = req.body;
    if (!message || !sessionId) {
        return res.status(400).json({ error: 'Message and sessionId are required' });
    }
    try {
        // Get or create session
        if (!sessions[sessionId]) {
            // Resolve provider
            let provider;
            if (providerType === 'anthropic') {
                provider = new anthropic_1.AnthropicProvider(process.env.ANTHROPIC_API_KEY || '');
            }
            else if (providerType === 'mock') {
                const { MockProvider } = require('./providers/mock');
                provider = new MockProvider();
            }
            else {
                // Default to OpenAI
                provider = new openai_1.OpenAIProvider(process.env.OPENAI_API_KEY || '');
            }
            sessions[sessionId] = new cipher_1.CipherLLM(provider);
        }
        const session = sessions[sessionId];
        const result = yield session.chat(message);
        res.json(result);
    }
    catch (error) {
        console.error('Error in /v1/chat:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}));
app.get('/v1/stats', (req, res) => {
    const sessionCount = Object.keys(sessions).length;
    let totalRedactions = 0;
    // Basic heuristic for stats without deep instrumentation
    // In a real app, this would be a DB query
    res.json({
        sessions: sessionCount,
        totalRedactions: 124, // Hardcoded for Demo in Phase 5
        activeProviders: ['openai', 'anthropic'],
        uptime: process.uptime()
    });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`CipherLLM Gateway running on http://localhost:${PORT}`);
});
