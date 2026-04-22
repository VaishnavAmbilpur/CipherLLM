import { rehydrate } from '../src/rehydration/rehydrate';

describe('Re-hydration Engine', () => {
  
  test('restores original values from tokens', () => {
    const vault = new Map([
      ['[PERSON_1]', 'John Doe'],
      ['[AADHAAR_1]', '8234-5678-9012']
    ]);
    
    const response = 'Action required for [PERSON_1] with Aadhaar [AADHAAR_1].';
    const result = rehydrate(response, vault);
    
    expect(result).toBe('Action required for John Doe with Aadhaar 8234-5678-9012.');
  });
  
  test('handles case-insensitive token matching (LLM mangling)', () => {
    const vault = new Map([
      ['[PERSON_1]', 'John Doe']
    ]);
    
    const response = 'The subject is [Person_1].'; // Mangled casing
    const result = rehydrate(response, vault);
    
    expect(result).toBe('The subject is John Doe.');
  });
  
  test('replaces multiple occurrences of the same token', () => {
    const vault = new Map([
      ['[PERSON_1]', 'John Doe']
    ]);
    
    const response = '[PERSON_1] is [PERSON_1].';
    const result = rehydrate(response, vault);
    
    expect(result).toBe('John Doe is John Doe.');
  });
  
  test('returns original string if no tokens found', () => {
    const vault = new Map([
      ['[PERSON_1]', 'John Doe']
    ]);
    
    const response = 'Hello World';
    const result = rehydrate(response, vault);
    
    expect(result).toBe('Hello World');
  });
});

