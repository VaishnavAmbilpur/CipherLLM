import { PII_PATTERNS } from '../src/detection/regex';

describe('PII Detection Patterns', () => {
  
  describe('Indian PII', () => {
    
    test('detects Aadhaar numbers', () => {
      const regex = PII_PATTERNS.AADHAAR;
      regex.lastIndex = 0; expect(regex.test('8234-5678-9012')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('8234 5678 9012')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('823456789012')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('1234-5678-9012')).toBe(false); // Should start with 2-9
    });
    
    test('detects PAN numbers', () => {
      const regex = PII_PATTERNS.PAN;
      regex.lastIndex = 0; expect(regex.test('ABCDE1234F')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('abcde1234f')).toBe(false); // Case sensitive in current regex
      regex.lastIndex = 0; expect(regex.test('ABCD12345F')).toBe(false); // Wrong format
    });
    
    test('detects Indian Phone numbers', () => {
      const regex = PII_PATTERNS.PHONE_IN;
      regex.lastIndex = 0; expect(regex.test('9123456789')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('+919123456789')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('09123456789')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('5123456789')).toBe(false); // Starts with 5
    });
    
    test('detects UPI IDs', () => {
      const regex = PII_PATTERNS.UPI;
      regex.lastIndex = 0; expect(regex.test('john.doe@okaxis')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('user@paytm')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('invalid-upi')).toBe(false);
    });
    
    test('detects Indian Salary notations', () => {
      const regex = PII_PATTERNS.SALARY_IN;
      regex.lastIndex = 0; expect(regex.test('₹18,50,000')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('₹ 45,00,000')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('₹1,200.50')).toBe(true);
    });
    
  });
  
  describe('Universal PII', () => {
    
    test('detects Emails', () => {
      const regex = PII_PATTERNS.EMAIL;
      regex.lastIndex = 0; expect(regex.test('priya@techcorp.in')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('user.name+label@example.com')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('invalid-email')).toBe(false);
    });
    
    test('detects Credit Cards', () => {
      const regex = PII_PATTERNS.CREDIT_CARD;
      regex.lastIndex = 0; expect(regex.test('1234-5678-9012-3456')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('1234567890123456')).toBe(true);
    });
    
    test('detects API Keys', () => {
      const regex = PII_PATTERNS.API_KEY;
      regex.lastIndex = 0; expect(regex.test('sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789')).toBe(true);
      regex.lastIndex = 0; expect(regex.test('short-string')).toBe(false);
    });
    
  });
});
