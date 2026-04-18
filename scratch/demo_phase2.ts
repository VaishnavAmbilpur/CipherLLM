import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';

/**
 * Manual Verification Script for Phase 2
 * Tests the end-to-end flow: Prompt -> Sanitization -> Mock LLM -> Re-hydration
 */

async function runDemo() {
  console.log('🚀 Starting CipherLLM Gateway for demo...');
  
  // Start the server in the background
  const server = spawn('npx', ['ts-node', 'src/index.ts'], {
    env: { ...process.env, PORT: '3001', OPENAI_API_KEY: 'mock-key' },
    shell: true
  });

  server.stdout.on('data', (data) => console.log(`[Server]: ${data}`));
  server.stderr.on('data', (data) => console.error(`[Server Error]: ${data}`));

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n💬 Sending test request with PII...');
  const testMessage = "Summarize the contract for Priya Sharma, Aadhaar 8234-5678-9012, email priya@techcorp.in, salary ₹18,50,000.";
  
  try {
    const response = await axios.post('http://localhost:3001/v1/chat', {
      message: testMessage,
      sessionId: 'demo-session-001',
      provider: 'mock'
    });

    console.log('\n--- Results ---');
    console.log(`Original Prompt: ${testMessage}`);
    console.log(`Final Response:  ${response.data.response}`);
    console.log(`Redactions:      ${response.data.redactionCount}`);
    
    // Check if the response actually has the re-hydrated data
    if (response.data.response.includes('Priya Sharma') && response.data.response.includes('₹18,50,000')) {
      console.log('\n✅ SUCCESS: Phase 2 is working perfectly!');
    } else {
      console.log('\n❌ FAILURE: Re-hydration might have failed.');
    }

  } catch (error: any) {
    console.error('Error during demo request:', error.message);
  } finally {
    server.kill();
    process.exit(0);
  }
}

runDemo();
