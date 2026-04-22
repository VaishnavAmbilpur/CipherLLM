// src/vault/crypto.ts — Authenticated Encryption (AES-256-GCM)

import crypto from 'crypto';

const SALT_BYTES = 16;
const IV_BYTES = 12;     // Standard for GCM
const TAG_BYTES = 16;    // Standard for GCM
const KEY_BYTES = 32;    // 256-bit key
const PBKDF2_ITERATIONS = 100000;

/**
 * Derives a cryptographic key from a passphrase and random salt.
 * Uses PBKDF2 with 100,000 rounds to slow down brute-force attacks.
 */
function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    passphrase,
    salt,
    PBKDF2_ITERATIONS,
    KEY_BYTES,
    'sha256'
  );
}

/**
 * Encrypts a vault Record into an authenticated hex string.
 * Format: salt:iv:tag:ciphertext (all hex)
 */
export function encryptVault(
  data: Record<string, string>,
  passphrase: string
): string {
  const salt = crypto.randomBytes(SALT_BYTES);
  const iv = crypto.randomBytes(IV_BYTES);
  const key = deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(data);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex')
  ].join(':');
}

/**
 * Decrypts an authenticated hex string back into a vault Record.
 * Verifies integrity using the GCM auth tag.
 */
export function decryptVault(
  encryptedString: string,
  passphrase: string
): Record<string, string> {
  const parts = encryptedString.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid vault storage format');
  }

  const [saltHex, ivHex, authTagHex, dataHex] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(dataHex, 'hex');

  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (err) {
    throw new Error('Decryption failed: Incorrect passphrase or tampered vault data.');
  }
}

