import { Id } from '@shared/aggregates/value-objects';
import { Store } from '../entities';

export interface StorePage {
  stores: Store[];
  total: number;
}
/** Persistence boundary for the Store aggregate. Every ownership lookup is tenant-qualified. */
export interface IStoreRepository {
  /** Persists a newly created Store. */
  create(store: Store): Promise<Store>;

  /** Persists an existing Store only when it belongs to the supplied Tenant. */
  update(id: Id, tenantId: Id, store: Store): Promise<Store>;

  /** Finds a Store by the composite Store/Tenant ownership key. */
  findByIdAndTenantId(id: Id, tenantId: Id): Promise<Store | null>;

  /** Finds the globally unique storefront domain. */
  findByDomain(domain: string): Promise<Store | null>;

  /** Returns a deterministic page of Stores owned by a Tenant. */
  findAllByTenantId(
    tenantId: Id,
    page: number,
    limit: number,
  ): Promise<StorePage>;
}
