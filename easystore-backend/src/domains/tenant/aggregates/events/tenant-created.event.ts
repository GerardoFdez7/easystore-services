import { Tenant } from '../entities/tenant/tenant.entity';

export class TenantCreatedEvent {
  constructor(public readonly tenant: Tenant) {}
}
