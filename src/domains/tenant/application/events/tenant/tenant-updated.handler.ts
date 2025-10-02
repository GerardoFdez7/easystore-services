import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TenantUpdatedEvent } from '../../../aggregates/events/tenant/tenant-updated.event';

@Injectable()
@EventsHandler(TenantUpdatedEvent)
export class TenantUpdatedHandler implements IEventHandler<TenantUpdatedEvent> {
  handle(event: TenantUpdatedEvent): void {
    logger.log(
      `Tenant updated: ${event.tenant.get('ownerName').getValue()}, with id: ${event.tenant.get('id').getValue()}`,
    );
  }
}
