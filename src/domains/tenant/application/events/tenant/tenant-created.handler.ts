import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TenantCreatedEvent } from '../../../aggregates/events/tenant/tenant-created.event';

@Injectable()
@EventsHandler(TenantCreatedEvent)
export class TenantCreatedHandler implements IEventHandler<TenantCreatedEvent> {
  handle(event: TenantCreatedEvent): void {
    // Here we can implement side effects when a tenant is created
    // For example: send welcome email, create default settings, etc.
    logger.log(
      `Tenant created: ${event.tenant.get('ownerName').getValue()}, with id: ${event.tenant.get('id').getValue()}`,
    );
  }
}
