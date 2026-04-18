import { TokenVault } from '../src/vault/vault';

describe('TokenVault', () => {
  let vault: TokenVault;

  beforeEach(() => {
    vault = new TokenVault();
  });

  test('generates unique tokens for different values', () => {
    const t1 = vault.tokenize('John Doe', 'PERSON');
    const t2 = vault.tokenize('Jane Smith', 'PERSON');
    expect(t1).toBe('[PERSON_1]');
    expect(t2).toBe('[PERSON_2]');
    expect(t1).not.toBe(t2);
  });

  test('returns the same token for the same value (idempotency)', () => {
    const t1 = vault.tokenize('8234-5678-9012', 'AADHAAR');
    const t2 = vault.tokenize('8234-5678-9012', 'AADHAAR');
    expect(t1).toBe('[AADHAAR_1]');
    expect(t2).toBe('[AADHAAR_1]');
    expect(t1).toBe(t2);
  });

  test('maintains separate counters for different types', () => {
    const t1 = vault.tokenize('John Doe', 'PERSON');
    const t2 = vault.tokenize('8234-5678-9012', 'AADHAAR');
    expect(t1).toBe('[PERSON_1]');
    expect(t2).toBe('[AADHAAR_1]');
  });

  test('getAll returns a copy of the mapping', () => {
    vault.tokenize('John Doe', 'PERSON');
    const all = vault.getAll();
    expect(all.size).toBe(1);
    expect(all.get('[PERSON_1]')).toBe('John Doe');
  });

  test('destroy clears all data', () => {
    vault.tokenize('John Doe', 'PERSON');
    vault.destroy();
    expect(vault.getAll().size).toBe(0);
    // Counter should also reset
    expect(vault.tokenize('Jane Doe', 'PERSON')).toBe('[PERSON_1]');
  });
});
