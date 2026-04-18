"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveKey = deriveKey;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Security Module for CipherLLM
 * Handles AES-256-GCM encryption and PBKDF2 key derivation.
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
/**
 * Derives a 256-bit key from a passphrase and salt.
 */
function deriveKey(passphrase, salt) {
    return crypto_1.default.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}
/**
 * Encrypts cleartext using a passphrase.
 */
function encrypt(cleartext, passphrase) {
    const salt = crypto_1.default.randomBytes(SALT_LENGTH);
    const key = deriveKey(passphrase, salt);
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(cleartext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Format: salt:iv:tag:encrypted (all base64)
    return [
        salt.toString('base64'),
        iv.toString('base64'),
        tag.toString('base64'),
        encrypted.toString('base64')
    ].join(':');
}
/**
 * Decrypts ciphertext using a passphrase.
 */
function decrypt(ciphertext, passphrase) {
    const [saltB64, ivB64, tagB64, dataB64] = ciphertext.split(':');
    if (!saltB64 || !ivB64 || !tagB64 || !dataB64) {
        throw new Error('Invalid ciphertext format');
    }
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const key = deriveKey(passphrase, salt);
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
}
