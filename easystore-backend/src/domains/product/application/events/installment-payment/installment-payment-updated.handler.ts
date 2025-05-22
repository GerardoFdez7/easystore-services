import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { InstallmentPaymentUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(InstallmentPaymentUpdatedEvent)
export class InstallmentPaymentUpdatedHandler
  implements IEventHandler<InstallmentPaymentUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: InstallmentPaymentUpdatedEvent): void {
    this.logger.log(
      `InstallmentPayment updated for variant with id: ${event.variant.get('id').getValue()} InstallmentPayment ID: ${event.updatedInstallmentPayment.get('id').getValue()}`,
    );
  }
}
