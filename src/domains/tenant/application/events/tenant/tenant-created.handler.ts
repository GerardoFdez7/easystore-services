import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TenantCreatedEvent } from '../../../aggregates/events/tenant-created.event';
import { LoggerService } from '@winston/winston.service';

@Injectable()
@EventsHandler(TenantCreatedEvent)
export class TenantCreatedHandler implements IEventHandler<TenantCreatedEvent> {
  constructor(private readonly logger: LoggerService) {}

  handle(event: TenantCreatedEvent): void {
    // Here we can implement side effects when a tenant is created
    // For example: send welcome email, create default settings, etc.
    this.logger.log(
      `Tenant created: ${event.tenant.get('ownerName').getValue()}, with id: ${event.tenant.get('id').getValue()}`,
    );
  }
}
