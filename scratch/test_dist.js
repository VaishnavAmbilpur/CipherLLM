const { CipherLLM, MockProvider } = require('../dist/src/lib');

/**
 * Distribution Verification Script
 * Simulates an external project importing 'cipherllm' from dist.
 */
async function verifyDist() {
  console.log('📦 Testing ' + 'cipherllm' + ' library from dist folder...');
  
  try {
    const provider = new MockProvider();
    const cipher = new CipherLLM(provider);

    const testPrompt = "Email sent to mark@meta.com regarding the Aadhaar 8234 5678 9012.";
    console.log(`\nInput:  ${testPrompt}`);

    const result = await cipher.chat(testPrompt);
    
    console.log(`\nOutput: ${result.response}`);
    console.log(`Redactions: ${result.redactionCount}`);

    if (result.response.includes('mark@meta.com') && result.response.includes('8234 5678 9012')) {
      console.log('\n✅ DISTRIBUTION TEST SUCCESS: Library correctly exported and functional!');
    } else {
      console.log('\n❌ DISTRIBUTION TEST FAILED: Re-hydration failed in built library.');
    }
  } catch (error) {
    console.error('Library verification failed:', error);
    process.exit(1);
  }
}

verifyDist();
