import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TenantUpdatedEvent } from '../../../aggregates/events/tenant/tenant-updated.event';
import { LoggerService } from '@winston/winston.service';

@Injectable()
@EventsHandler(TenantUpdatedEvent)
export class TenantUpdatedHandler implements IEventHandler<TenantUpdatedEvent> {
  constructor(private readonly logger: LoggerService) {}

  handle(event: TenantUpdatedEvent): void {
    this.logger.log(
      `Tenant updated: ${event.tenant.get('ownerName').getValue()}, with id: ${event.tenant.get('id').getValue()}`,
    );
  }
}
