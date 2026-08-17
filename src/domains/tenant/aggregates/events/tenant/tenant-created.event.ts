import { IEvent } from '@nestjs/cqrs';
import { Tenant } from '../../entities/tenant/tenant.entity';

export class TenantCreatedEvent implements IEvent {
  constructor(public readonly tenant: Tenant) {}
}
