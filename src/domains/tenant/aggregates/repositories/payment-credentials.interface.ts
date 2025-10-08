import { PaymentCredentialsEntity } from '../entities/payment-credentials/payment-credentials.entity';
import { PaymentProviderTypeVO } from '../value-objects/payment-provider-type.vo';

export interface PaymentCredentialsRepository {
  /**
   * Saves or updates payment credentials for a tenant and provider
   * @param credentials - The payment credentials entity to save
   */
  save(credentials: PaymentCredentialsEntity): Promise<void>;

  /**
   * Finds payment credentials by tenant ID and provider type
   * @param tenantId - The tenant ID
   * @param providerType - The payment provider type
   * @returns The payment credentials entity or null if not found
   */
  findByTenantAndProvider(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<PaymentCredentialsEntity | null>;

  /**
   * Finds all active payment credentials for a tenant
   * @param tenantId - The tenant ID
   * @returns Array of payment credentials entities
   */
  findByTenant(tenantId: string): Promise<PaymentCredentialsEntity[]>;

  /**
   * Deletes payment credentials by ID
   * @param id - The credentials ID
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if credentials exist for a tenant and provider
   * @param tenantId - The tenant ID
   * @param providerType - The payment provider type
   * @returns true if credentials exist, false otherwise
   */
  exists(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<boolean>;
}
