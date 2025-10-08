import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsEncryptionService {
  private readonly logger = new Logger(CredentialsEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 32; // 256 bits

  constructor() {
    this.validateEnvironmentVariables();
  }

  private validateEnvironmentVariables(): void {
    const encryptionKey = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
    const salt = process.env.PAYMENT_CREDENTIALS_SALT;

    if (!encryptionKey) {
      this.logger.error(
        'PAYMENT_CREDENTIALS_ENCRYPTION_KEY environment variable is required for secure credential encryption',
      );
      throw new Error('PAYMENT_CREDENTIALS_ENCRYPTION_KEY is required');
    }

    if (!salt) {
      this.logger.error(
        'PAYMENT_CREDENTIALS_SALT environment variable is required for secure credential encryption',
      );
      throw new Error('PAYMENT_CREDENTIALS_SALT is required');
    }

    this.logger.log(
      'Payment credentials encryption service initialized successfully',
    );
  }

  private getEncryptionKey(): Buffer {
    const key = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
    const salt = process.env.PAYMENT_CREDENTIALS_SALT;

    // Derive key using PBKDF2 for additional security
    return crypto.pbkdf2Sync(key, salt, 100000, this.keyLength, 'sha512');
  }

  /**
   * Encrypts credentials using AES-256-GCM with PBKDF2 key derivation
   * @param credentials - Plain text credentials to encrypt
   * @returns Encrypted credentials in format: salt:iv:tag:encryptedData
   */
  encrypt(credentials: Record<string, unknown>): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);

      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key, iv);
      cipher.setAAD(salt); // Additional authenticated data

      // Encrypt the credentials
      const credentialsJson = JSON.stringify(credentials);
      let encrypted = cipher.update(credentialsJson, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine salt, iv, tag, and encrypted data
      return `${salt.toString('base64')}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
    } catch (error) {
      throw new Error(
        `Failed to encrypt credentials: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Decrypts credentials using AES-256-GCM
   * @param encryptedCredentials - Encrypted credentials in format: salt:iv:tag:encryptedData
   * @returns Decrypted credentials object
   */
  decrypt(encryptedCredentials: string): Record<string, unknown> {
    try {
      const parts = encryptedCredentials.split(':');
      if (parts.length !== 4) {
        throw new Error('Invalid encrypted credentials format');
      }

      const [saltB64, ivB64, tagB64, encryptedData] = parts;

      const key = this.getEncryptionKey();
      const salt = Buffer.from(saltB64, 'base64');
      const iv = Buffer.from(ivB64, 'base64');
      const tag = Buffer.from(tagB64, 'base64');

      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, key, iv);
      decipher.setAAD(salt); // Set additional authenticated data
      decipher.setAuthTag(tag); // Set authentication tag

      // Decrypt the data
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted) as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `Failed to decrypt credentials: ${(error as Error).message}`,
      );
    }
  }
}
