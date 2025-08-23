import { ITenantType } from '../../../aggregates/entities';

type UpdatableTenantFields = Partial<
  Omit<ITenantType, 'id' | 'authIdentityId' | 'createdAt' | 'updatedAt'>
>;

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
