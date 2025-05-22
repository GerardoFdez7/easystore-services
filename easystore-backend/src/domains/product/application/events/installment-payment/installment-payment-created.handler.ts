import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { InstallmentPaymentCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(InstallmentPaymentCreatedEvent)
export class InstallmentPaymentCreatedHandler
  implements IEventHandler<InstallmentPaymentCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: InstallmentPaymentCreatedEvent): void {
    this.logger.log(
      `InstallmentPayment created for variant with id: ${event.variant.get('id').getValue()} InstallmentPayment ID: ${event.installmentPaymentCreated.get('id').getValue()}`,
    );
  }
}
