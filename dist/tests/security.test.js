"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const encryption_1 = require("../src/vault/encryption");
const vault_1 = require("../src/vault/vault");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe('Phase 3: Security & Storage', () => {
    const PASSPHRASE = 'super-secret-password';
    describe('Encryption Module', () => {
        test('encrypts and decrypts correctly', () => {
            const original = 'Hello Secret World';
            const ciphertext = (0, encryption_1.encrypt)(original, PASSPHRASE);
            expect(ciphertext).toContain(':');
            expect(ciphertext).not.toContain(original);
            const decrypted = (0, encryption_1.decrypt)(ciphertext, PASSPHRASE);
            expect(decrypted).toBe(original);
        });
        test('throws error on wrong passphrase', () => {
            const ciphertext = (0, encryption_1.encrypt)('secret', PASSPHRASE);
            expect(() => (0, encryption_1.decrypt)(ciphertext, 'wrong-password')).toThrow();
        });
    });
    describe('TokenVault Persistence', () => {
        const TEST_FILE = path_1.default.join(__dirname, 'test_vault.vault');
        afterEach(() => {
            if (fs_1.default.existsSync(TEST_FILE))
                fs_1.default.unlinkSync(TEST_FILE);
        });
        test('saves and loads encrypted vault from disk', () => {
            const v1 = new vault_1.TokenVault();
            v1.tokenize('John Doe', 'PERSON');
            v1.tokenize('8234-5678-9012', 'AADHAAR');
            v1.save(TEST_FILE, PASSPHRASE);
            expect(fs_1.default.existsSync(TEST_FILE)).toBe(true);
            const fileContent = fs_1.default.readFileSync(TEST_FILE, 'utf8');
            expect(fileContent).not.toContain('John Doe'); // Verify encryption on disk
            const v2 = new vault_1.TokenVault();
            v2.load(TEST_FILE, PASSPHRASE);
            expect(v2.getAll().get('[PERSON_1]')).toBe('John Doe');
            expect(v2.getAll().get('[AADHAAR_1]')).toBe('8234-5678-9012');
        });
    });
});
