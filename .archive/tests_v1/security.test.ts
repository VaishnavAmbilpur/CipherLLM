import { encrypt, decrypt } from '../src/vault/encryption';
import { TokenVault } from '../src/vault/vault';
import fs from 'fs';
import path from 'path';

describe('Phase 3: Security & Storage', () => {
  const PASSPHRASE = 'super-secret-password';
  
  describe('Encryption Module', () => {
    test('encrypts and decrypts correctly', () => {
      const original = 'Hello Secret World';
      const ciphertext = encrypt(original, PASSPHRASE);
      
      expect(ciphertext).toContain(':');
      expect(ciphertext).not.toContain(original);
      
      const decrypted = decrypt(ciphertext, PASSPHRASE);
      expect(decrypted).toBe(original);
    });

    test('throws error on wrong passphrase', () => {
      const ciphertext = encrypt('secret', PASSPHRASE);
      expect(() => decrypt(ciphertext, 'wrong-password')).toThrow();
    });
  });

  describe('TokenVault Persistence', () => {
    const TEST_FILE = path.join(__dirname, 'test_vault.vault');

    afterEach(() => {
      if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
    });

    test('saves and loads encrypted vault from disk', () => {
      const v1 = new TokenVault();
      v1.tokenize('John Doe', 'PERSON');
      v1.tokenize('8234-5678-9012', 'AADHAAR');
      
      v1.save(TEST_FILE, PASSPHRASE);
      expect(fs.existsSync(TEST_FILE)).toBe(true);
      
      const fileContent = fs.readFileSync(TEST_FILE, 'utf8');
      expect(fileContent).not.toContain('John Doe'); // Verify encryption on disk

      const v2 = new TokenVault();
      v2.load(TEST_FILE, PASSPHRASE);
      
      expect(v2.getAll().get('[PERSON_1]')).toBe('John Doe');
      expect(v2.getAll().get('[AADHAAR_1]')).toBe('8234-5678-9012');
    });
  });
});

