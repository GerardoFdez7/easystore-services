import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { InstallmentPaymentDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(InstallmentPaymentDeletedEvent)
export class InstallmentPaymentDeletedHandler
  implements IEventHandler<InstallmentPaymentDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: InstallmentPaymentDeletedEvent): void {
    this.logger.warn(
      `InstallmentPayment deleted for variant with id: ${event.variant.get('id').getValue()} InstallmentPayment ID: ${event.deletedInstallmentPayment.get('id').getValue()}`,
    );
  }
}
