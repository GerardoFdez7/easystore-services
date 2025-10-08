import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPaymentCredentialsDto } from './get-payment-credentials.dto';
import { PaymentCredentialsRepository } from '../../../aggregates/repositories/payment-credentials.interface';
import { PaymentCredentialsEntity } from '../../../aggregates/entities/payment-credentials/payment-credentials.entity';
import { CredentialsEncryptionService } from '../../../infrastructure/encryption/credentials-encryption.service';

export class GetPaymentCredentialsQuery {
  constructor(public readonly dto: GetPaymentCredentialsDto) {}
}

export interface PaymentCredentialsResponse {
  id: string;
  tenantId: string;
  providerType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Note: We don't return the actual credentials for security reasons
}

@QueryHandler(GetPaymentCredentialsQuery)
@Injectable()
export class GetPaymentCredentialsHandler
  implements IQueryHandler<GetPaymentCredentialsQuery>
{
  constructor(
    @Inject('PaymentCredentialsRepository')
    private readonly repository: PaymentCredentialsRepository,
    private readonly encryptionService: CredentialsEncryptionService,
  ) {}

  async execute(
    query: GetPaymentCredentialsQuery,
  ): Promise<PaymentCredentialsResponse | PaymentCredentialsResponse[]> {
    const { dto } = query;

    if (dto.providerType) {
      // Get specific provider credentials
      const credentials = await this.repository.findByTenantAndProvider(
        dto.tenantId,
        dto.providerType,
      );

      if (!credentials) {
        return null;
      }

      return this.mapToResponse(credentials);
    } else {
      // Get all credentials for tenant
      const credentialsList = await this.repository.findByTenant(dto.tenantId);
      return credentialsList.map((credentials) =>
        this.mapToResponse(credentials),
      );
    }
  }

  private mapToResponse(
    credentials: PaymentCredentialsEntity,
  ): PaymentCredentialsResponse {
    const attributes = credentials.toAttributes();

    return {
      id: attributes.id,
      tenantId: attributes.tenantId,
      providerType: attributes.providerType.toString(),
      isActive: attributes.isActive,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  }
}
