import crypto from 'crypto';

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
export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts cleartext using a passphrase.
 */
export function encrypt(cleartext: string, passphrase: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(passphrase, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
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
export function decrypt(ciphertext: string, passphrase: string): string {
  const [saltB64, ivB64, tagB64, dataB64] = ciphertext.split(':');
  
  if (!saltB64 || !ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid ciphertext format');
  }

  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
