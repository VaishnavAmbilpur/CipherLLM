import { CipherLLM } from '../src/gateway/cipher';
import { MockProvider } from '../src/providers/mock';

/**
 * In-process Verification of Phase 2 logic
 */
async function testLogic() {
  console.log('🧪 Testing CipherLLM Orchestration Logic (Phase 2)...');
  
  const provider = new MockProvider();
  const cipher = new CipherLLM(provider);

  const testMessage = "Summarize the contract for Priya Sharma, Aadhaar 8234-5678-9012, email priya@techcorp.in, salary ₹18,50,000.";
  
  console.log(`\n1. Original Prompt: ${testMessage}`);
  
  const result = await cipher.chat(testMessage);
  
  console.log(`\n2. Redactions Found: ${result.redactionCount}`);
  console.log(`\n3. Final Rehydrated Response:\n${result.response}`);

  // Validation
  const hasName = result.response.includes('Priya Sharma');
  const hasAadhaar = result.response.includes('8234-5678-9012');
  const hasSalary = result.response.includes('₹18,50,000');
  
  if (hasName && hasAadhaar && hasSalary) {
    console.log('\n✅ VERIFICATION COMPLETE: Phase 2 orchestration and re-hydration is working correctly!');
  } else {
    console.log('\n❌ VERIFICATION FAILED: Some data was not re-hydrated correctly.');
    if (!hasName) console.log('- Missing Name');
    if (!hasAadhaar) console.log('- Missing Aadhaar');
    if (!hasSalary) console.log('- Missing Salary');
  }
}

testLogic();
