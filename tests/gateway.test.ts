import request from 'supertest';
import express from 'express';
// We need to re-create a test version of the app because the main one calls .listen()
import { OpenAIProvider } from '../src/providers/openai';
import { CipherLLM } from '../src/gateway/cipher';

// Mock the orchestrator to avoid real AI calls
jest.mock('../src/gateway/cipher');

const app = express();
app.use(express.json());

const sessions: any = {};

app.post('/v1/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!sessions[sessionId]) {
    sessions[sessionId] = new CipherLLM({} as any);
  }
  const result = await sessions[sessionId].chat(message);
  res.json(result);
});

describe('POST /v1/chat', () => {
  test('returns rehydrated response and redaction count', async () => {
    // Setup mock behavior
    (CipherLLM.prototype.chat as jest.Mock).mockResolvedValue({
      response: 'Hello John Doe',
      redactionCount: 1
    });

    const res = await request(app)
      .post('/v1/chat')
      .send({
        message: 'Hello [PERSON_1]',
        sessionId: 'test-session'
      });

    expect(res.status).toBe(200);
    expect(res.body.response).toBe('Hello John Doe');
    expect(res.body.redactionCount).toBe(1);
  });
});
