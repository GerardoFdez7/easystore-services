import { ITenantBase } from '../../../aggregates/entities';

type UpdatableTenantFields = Partial<Omit<ITenantBase, 'authIdentityId'>>;

/**
 * Data Transfer Object for updating a Tenant
 * Makes all fields from ITenantType optional except those that should not be updated
 */
export class UpdateTenantDTO {
  constructor(
    public readonly id: string,
    public readonly data: UpdatableTenantFields,
  ) {}
}
