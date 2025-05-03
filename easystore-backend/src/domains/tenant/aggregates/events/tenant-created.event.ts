import { Tenant } from '../entities/tenant.entity';

export class TenantCreatedEvent {
  constructor(public readonly tenant: Tenant) {}
}
