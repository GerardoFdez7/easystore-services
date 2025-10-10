import { Injectable } from '@nestjs/common';
import { PaymentCredentialsRepository } from '../../../aggregates/repositories/payment-credentials.interface';
import { PaymentCredentialsEntity } from '../../../aggregates/entities/payment-credentials/payment-credentials.entity';
import {
  PaymentProviderType,
  PaymentProviderTypeVO,
} from '../../../aggregates/value-objects/payment-provider-type.vo';
import { PostgreService } from '../../../../../infrastructure/database/postgres.service';
import { ProviderType } from '.prisma/postgres';

// Interface for mapping Prisma records to entities

interface PaymentCredentialsRecord {
  id: string;
  tenantId: string;
  provider: ProviderType;
  credentials: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentCredentialsPostgresRepository
  implements PaymentCredentialsRepository
{
  constructor(private readonly prisma: PostgreService) {}

  async save(credentials: PaymentCredentialsEntity): Promise<void> {
    const attributes = credentials.toAttributes();

    await this.prisma.paymentProviderCredential.upsert({
      where: {
        tenantId_provider: {
          tenantId: attributes.tenantId,
          provider: attributes.providerType.value,
        },
      },
      update: {
        credentials: attributes.encryptedCredentials,
        updatedAt: attributes.updatedAt,
      },
      create: {
        id: attributes.id,
        tenantId: attributes.tenantId,
        provider: attributes.providerType.value,
        credentials: attributes.encryptedCredentials,
        createdAt: attributes.createdAt,
        updatedAt: attributes.updatedAt,
      },
    });
  }

  async findByTenantAndProvider(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<PaymentCredentialsEntity | null> {
    const record = await this.prisma.paymentProviderCredential.findFirst({
      where: {
        tenantId,
        provider: providerType.value,
      },
    });

    if (!record) {
      return null;
    }

    return this.mapRecordToEntity({
      ...record,
      credentials:
        typeof record.credentials === 'string'
          ? record.credentials
          : JSON.stringify(record.credentials),
    });
  }

  async findByTenant(tenantId: string): Promise<PaymentCredentialsEntity[]> {
    const records = await this.prisma.paymentProviderCredential.findMany({
      where: {
        tenantId,
      },
    });

    return records.map((record) =>
      this.mapRecordToEntity({
        ...record,
        credentials:
          typeof record.credentials === 'string'
            ? record.credentials
            : JSON.stringify(record.credentials),
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.paymentProviderCredential.delete({
      where: { id },
    });
  }

  async exists(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<boolean> {
    const count = await this.prisma.paymentProviderCredential.count({
      where: {
        tenantId,
        provider: providerType.value,
      },
    });

    return count > 0;
  }

  private mapRecordToEntity(
    record: PaymentCredentialsRecord,
  ): PaymentCredentialsEntity {
    return PaymentCredentialsEntity.create({
      id: record.id,
      tenantId: record.tenantId,
      providerType: new PaymentProviderTypeVO(
        record.provider as PaymentProviderType,
      ),
      encryptedCredentials: record.credentials,
      isActive: true, // Default to true since Prisma schema doesn't have this field
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
