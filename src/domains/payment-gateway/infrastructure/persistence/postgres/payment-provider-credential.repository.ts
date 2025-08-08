import { Injectable } from '@nestjs/common';
import { PaymentProviderCredentialRepository } from '../../../aggregates/repositories/payment-provider-credential.interface';
import { PostgreService } from 'src/infrastructure/database/postgres.service';
import * as crypto from 'crypto';
import { PagaditoCredentials } from '../../providers/pagadito/pagadito.provider';
import { VisanetCredentials } from '../../providers/visanet/visanet.provider';
import { PaypalCredentials } from '../../providers/paypal/paypal.provider';

const encryptionKey =
  process.env.PAYMENT_CREDENTIALS_KEY ||
  'default_key_32byteslongforaes256demo!'; // 32 bytes
const ivLength = 12; // AES-GCM recommended IV length

function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey),
    iv,
  );
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return iv.toString('base64') + ':' + tag.toString('base64') + ':' + encrypted;
}

function decrypt(data: string): string {
  const [ivB64, tagB64, encrypted] = data.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey),
    iv,
  );
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

@Injectable()
export class PaymentProviderCredentialPostgresRepository
  implements PaymentProviderCredentialRepository
{
  constructor(private readonly prisma: PostgreService) {}

  async getCredentials(
    tenantId: string,
    providerType: string,
  ): Promise<PagaditoCredentials | VisanetCredentials | PaypalCredentials> {
    const record = await this.prisma.paymentProviderCredential.findFirst({
      where: { tenantId, provider: providerType },
    });
    if (!record) throw new Error('Provider credentials not found');
    const decrypted = decrypt(record.credentials);
    return JSON.parse(decrypted);
  }

  async saveCredentials(
    tenantId: string,
    providerType: string,
    credentials: any,
  ): Promise<void> {
    const encrypted = encrypt(JSON.stringify(credentials));
    await this.prisma.paymentProviderCredential.upsert({
      where: { tenantId_provider: { tenantId, provider: providerType } },
      update: { credentials: encrypted },
      create: { tenantId, provider: providerType, credentials: encrypted },
    });
  }
}
