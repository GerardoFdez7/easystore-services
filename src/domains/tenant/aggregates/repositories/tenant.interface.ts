import { Domain } from '../value-objects/tenant/domain.vo';
import { Tenant } from '../entities/tenant/tenant.entity';
import { Id } from '@shared/value-objects';

/**
 * Repository interface for Tenant aggregate.
 * Defines contract for tenant persistence operations.
 */
export interface ITenantRepository {
  /**
   * Creates a new tenant entity.
   * @param tenant The tenant entity to create.
   * @returns The created tenant entity.
   */
  create(tenant: Tenant): Promise<Tenant>;

  /**
   * Updates an existing tenant entity.
   * @param id The unique identifier of the tenant.
   * @param tenant The tenant entity to update.
   * @returns The updated tenant entity.
   */
  update(id: Id, tenant: Tenant): Promise<Tenant>;

  /**
   * Deletes a tenant by its unique identifier.
   * @param id The unique identifier of the tenant.
   */
  delete(id: Id): Promise<void>;

  /**
   * Finds a tenant by its auth identity ID.
   * @param authIdentityId The auth identity ID to search for.
   * @returns The tenant entity or null if not found.
   */
  findByAuthIdentityId(authIdentityId: Id): Promise<Tenant | null>;

  /**
   * Finds a tenant by its ID.
   * @param id The unique identifier of the tenant.
   * @returns The tenant entity or null if not found.
   */
  findById(id: Id): Promise<Tenant | null>;

  /**
   * Retrieves the tenant ID associated with a given domain.
   * @param domain The domain to search for.
   * @returns A promise that resolves to the tenant ID string if found, otherwise null.
   */
  getTenantIdByDomain(domain: Domain): Promise<string | null>;
}
