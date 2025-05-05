import { Tenant } from '../entities/tenant.entity';
import { Id, Email, BusinessName } from '../value-objects/index';

/**
 * Repository interface for Tenant aggregate.
 * Defines contract for tenant persistence operations.
 */
export interface ITenantRepository {
  /**
   * Saves a tenant entity (create or update).
   * @param tenant The tenant entity to save.
   * @returns The saved tenant entity.
   */
  save(tenant: Tenant): Promise<Tenant>;

  /**
   * Deletes a tenant by its unique identifier.
   * @param id The unique identifier of the tenant.
   */
  delete(id: Id): Promise<void>;

  /**
   * Finds a tenant by email address.
   * @param email The email address of the tenant.
   * @returns The tenant entity or null if not found.
   */
  findByEmail(email: Email): Promise<Tenant | null>;

  /**
   * Finds a tenant by business name.
   * @param businessName The business name of the tenant.
   * @returns The tenant entity or null if not found.
   */
  findByBusinessName(businessName: BusinessName): Promise<Tenant | null>;
}
