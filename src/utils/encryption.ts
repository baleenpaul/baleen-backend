import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'baleen-encryption-key-change-in-production-32chars!';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt a token for storage
 */
export function encryptToken(token: string): string {
  try {
    // Use first 32 chars of key as AES-256 requires 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(token, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted token (IV is not secret, just prevents pattern matching)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Failed to encrypt token: ${error}`);
  }
}

/**
 * Decrypt a stored token
 */
export function decryptToken(encrypted: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const parts = encrypted.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt token: ${error}`);
  }
}
