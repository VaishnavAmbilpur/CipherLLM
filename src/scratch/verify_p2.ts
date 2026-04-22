import { CipherLLM, MockProvider } from '../lib.js';

async function verify() {
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
    const result = await cipher.chat(prompt, SESSION);
    console.log(`Response: ${result.response}`);
    console.log(`Redactions: ${result.redactionCount}`);
    
    if (result.response.includes('Priya Sharma')) {
      console.log('✅ Success! Module resolved and PII re-hydrated correctly.');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

verify();
