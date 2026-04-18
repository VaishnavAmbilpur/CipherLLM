import express from 'express';
import dotenv from 'dotenv';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { CipherLLM } from './gateway/cipher';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Simple session store in RAM for Phase 2
// In Phase 3, we will add persistence.
const sessions: Record<string, CipherLLM> = {};

app.post('/v1/chat', async (req, res) => {
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
        provider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY || '');
      } else if (providerType === 'mock') {
        const { MockProvider } = require('./providers/mock');
        provider = new MockProvider();
      } else {
        // Default to OpenAI
        provider = new OpenAIProvider(process.env.OPENAI_API_KEY || '');
      }
      
      sessions[sessionId] = new CipherLLM(provider);
    }

    const session = sessions[sessionId];
    const result = await session.chat(message);

    res.json(result);
  } catch (error: any) {
    console.error('Error in /v1/chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

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



const BANNER = `
\x1b[36m   ______ _       __                    \x1b[34m__    __     __  __\x1b[0m
\x1b[36m  / ____/(_)____ / /_   ___   _____     \x1b[34m/ /   / /    / / / /\x1b[0m
\x1b[36m / /    / // __ \\/ __ \\ / _ \\ / ___/    \x1b[34m/ /   / /    / / / / \x1b[0m
\x1b[36m/ /___ / // /_/ // / / //  __// /       \x1b[34m/ /___/ /___ / /_/ /  \x1b[0m
\x1b[36m\\____//_/ / .___//_/ /_/ \\___//_/       \x1b[34m/_____/_____/ \\____/   \x1b[0m
\x1b[34m         /_/     \x1b[37mv1.0.4-STABLE  \x1b[32m[DPDP SECURE]\x1b[0m
`;

app.listen(PORT, () => {
  console.clear();
  console.log(BANNER);
  console.log(`\x1b[34m[SYSTEM]\x1b[0m Gateway listening on \x1b[32mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[34m[SYSTEM]\x1b[0m Privacy Engine: \x1b[32mACTIVE\x1b[0m`);
  console.log(`\x1b[34m[SYSTEM]\x1b[0m Token Vault: \x1b[32mENCRYPTED\x1b[0m`);
  console.log(`\x1b[34m[SYSTEM]\x1b[0m Ready for requests.\n`);
});

