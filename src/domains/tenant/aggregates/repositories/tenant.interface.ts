import { Tenant } from '../entities/tenant/tenant.entity';
import { Id } from '@shared/aggregates/value-objects';

export interface ITenantLoginContext {
  tenantId: string;
  storeId: string;
}

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

  /** Resolves an owner's Tenant and tenant-owned default Store atomically. */
  resolveLoginContext(authIdentityId: Id): Promise<ITenantLoginContext | null>;
}
