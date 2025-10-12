import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsEncryptionService {
  private readonly logger = new Logger(CredentialsEncryptionService.name);

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

  /**
   * Encrypts credentials using AES-256-CBC
   * @param credentials - Plain text credentials to encrypt
   * @returns Encrypted credentials in base64 format
   */
  encrypt(credentials: Record<string, unknown>): string {
    try {
      const key = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
      const salt = process.env.PAYMENT_CREDENTIALS_SALT;

      // Derive key using PBKDF2
      const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

      // Generate random IV
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);

      // Encrypt the credentials
      const credentialsJson = JSON.stringify(credentials);
      let encrypted = cipher.update(credentialsJson, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Combine IV and encrypted data
      return `${iv.toString('base64')}:${encrypted}`;
    } catch (error) {
      throw new Error(
        `Failed to encrypt credentials: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Decrypts credentials using AES-256-CBC
   * @param encryptedCredentials - Encrypted credentials in format: iv:encryptedData
   * @returns Decrypted credentials object
   */
  decrypt(encryptedCredentials: string): Record<string, unknown> {
    try {
      const parts = encryptedCredentials.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted credentials format');
      }

      const [ivB64, encryptedData] = parts;

      const key = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY;
      const salt = process.env.PAYMENT_CREDENTIALS_SALT;

      // Derive key using PBKDF2
      const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

      // Get IV
      const iv = Buffer.from(ivB64, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);

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
