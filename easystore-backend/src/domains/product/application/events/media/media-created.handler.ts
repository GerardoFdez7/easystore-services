import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { Product, Variant } from '../../../aggregates/entities';
import { MediaCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(MediaCreatedEvent)
export class MediaCreatedHandler implements IEventHandler<MediaCreatedEvent> {
  constructor(private readonly logger: LoggerService) {}

  handle(event: MediaCreatedEvent): void {
    if (event.product instanceof Product) {
      this.logger.log(
        `Media created for product: ${event.product.get('name').getValue()} (ID: ${event.product.get('id').getValue()}), Media ID: ${event.mediaCreated.get('id').getValue()}`,
      );
    } else if (event.product instanceof Variant) {
      this.logger.log(
        `Media created for variant (ID: ${event.product.get('id').getValue()}), Media ID: ${event.mediaCreated.get('id').getValue()}`,
      );
    } else {
      this.logger.error(
        `Media created event received without entity for 'product' or 'variant'. Media ID: ${event.mediaCreated.get('id').getValue()}`,
      );
    }
  }
}
