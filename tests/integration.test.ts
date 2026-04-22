// tests/integration.test.ts — Full Pipeline Integration

import { CipherLLM, OpenAIProvider, MockProvider, AuditLogger } from '../src/lib.js';

describe('Full Pipeline Integration', () => {

  test('complete redaction and rehydration cycle', async () => {
    const mockResponse = "The contract for [PERSON_1] specifies [SALARY_IN_1] per year.";
    const mock = new MockProvider(mockResponse);
    const cipher = new CipherLLM(mock);

    const prompt = "Summarize contract for Priya Sharma, salary ₹18,50,000";
    const result = await cipher.chat(prompt, 'test-session');

    // 1. The LLM should NEVER have received real PII
    expect(mock.lastReceivedPrompt).not.toContain('Priya Sharma');
    expect(mock.lastReceivedPrompt).not.toContain('₹18,50,000');

    // 2. The LLM should have received tokens
    expect(mock.lastReceivedPrompt).toContain('[PERSON_1]');
    expect(mock.lastReceivedPrompt).toContain('[SALARY_IN_1]');

    // 3. The final response should have real data restored
    expect(result.response).toContain('Priya Sharma');
    expect(result.response).toContain('₹18,50,000');

    // 4. The redaction count should be correct
    expect(result.redactionCount).toBeGreaterThanOrEqual(2);
  });

  test('multi-turn conversation — vault persists between messages', async () => {
    const mock = new MockProvider('[PERSON_1] confirmed receipt.');
    const cipher = new CipherLLM(mock);
    const SESSION = 'multi-turn-test';

    // Turn 1: introduce Priya
    await cipher.chat("Hello, I am Priya Sharma", SESSION);

    // Turn 2: refer to her again — should use same token
    const turn1Prompt = mock.lastReceivedPrompt;
    await cipher.chat("Please confirm the above for her", SESSION);

    // Both messages should use [PERSON_1] for Priya — same session, same vault
    expect(turn1Prompt).toContain('[PERSON_1]');
  });

  test('audit logger records events without storing PII', async () => {
    const logger = new AuditLogger();
    const mock = new MockProvider('Response for [AADHAAR_1]');
    const cipher = new CipherLLM(mock, logger);

    await cipher.chat("Aadhaar: 8234-5678-9012", 'audit-test');

    const logs = logger.getLogs();
    const tokenizedLog = logs.find(l => l.action === 'TOKENIZED');

    expect(tokenizedLog).toBeDefined();
    expect(tokenizedLog!.piiType).toBe('AADHAAR');
    expect(tokenizedLog!.token).toBe('[AADHAAR_1]');

    // The actual Aadhaar number must NEVER appear in any log
    const logString = JSON.stringify(logs);
    expect(logString).not.toContain('8234-5678-9012');
  });

  test('different sessions have isolated vaults', async () => {
    const mock = new MockProvider('[UPI_1]');
    const cipher = new CipherLLM(mock);

    await cipher.chat("Contact: alice@example.com", 'session-alice');
    await cipher.chat("Contact: bob@example.com", 'session-bob');

    // Both sessions independently tokenized their own email as [UPI_1]
    expect(mock.lastReceivedPrompt).toContain('[UPI_1]');
  });
});
