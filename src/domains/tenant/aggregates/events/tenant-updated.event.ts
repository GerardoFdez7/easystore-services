import { Tenant } from '../entities/tenant/tenant.entity';

export class TenantUpdatedEvent {
  constructor(public readonly tenant: Tenant) {}
}
