import { Injectable, Inject } from '@nestjs/common';
import { PaymentCredentialsRepository } from '../../aggregates/repositories/payment-credentials.interface';
import { PaymentProviderTypeVO } from '../../aggregates/value-objects/payment-provider-type.vo';
import { CredentialsEncryptionService } from '../../infrastructure/encryption/credentials-encryption.service';

@Injectable()
export class PaymentCredentialsService {
  constructor(
    @Inject('PaymentCredentialsRepository')
    private readonly repository: PaymentCredentialsRepository,
    private readonly encryptionService: CredentialsEncryptionService,
  ) {}

  /**
   * Gets decrypted credentials for a specific tenant and provider
   * @param tenantId - The tenant ID
   * @param providerType - The payment provider type
   * @returns Decrypted credentials object
   */
  async getDecryptedCredentials(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<Record<string, unknown>> {
    const credentials = await this.repository.findByTenantAndProvider(
      tenantId,
      providerType,
    );

    if (!credentials) {
      throw new Error(
        `Payment credentials for provider ${providerType.value} not found for tenant ${tenantId}`,
      );
    }

    const attributes = credentials.toAttributes();
    return this.encryptionService.decrypt(attributes.encryptedCredentials);
  }

  /**
   * Checks if credentials exist for a tenant and provider
   * @param tenantId - The tenant ID
   * @param providerType - The payment provider type
   * @returns true if credentials exist, false otherwise
   */
  async hasCredentials(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<boolean> {
    return this.repository.exists(tenantId, providerType);
  }

  /**
   * Gets all available providers for a tenant
   * @param tenantId - The tenant ID
   * @returns Array of provider types that have credentials
   */
  async getAvailableProviders(
    tenantId: string,
  ): Promise<PaymentProviderTypeVO[]> {
    const credentialsList = await this.repository.findByTenant(tenantId);
    return credentialsList.map(
      (credentials) => credentials.toAttributes().providerType,
    );
  }
}
