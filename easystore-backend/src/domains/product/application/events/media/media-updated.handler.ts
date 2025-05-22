import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { MediaUpdatedEvent } from '../../../aggregates/events';
import { Product, Variant } from '../../../aggregates/entities';

@Injectable()
@EventsHandler(MediaUpdatedEvent)
export class MediaUpdatedHandler implements IEventHandler<MediaUpdatedEvent> {
  constructor(private readonly logger: LoggerService) {}

  handle(event: MediaUpdatedEvent): void {
    const entity = event.product;
    const updatedMedia = event.updatedMedia;

    if (entity instanceof Product) {
      this.logger.log(
        `Media updated for product: ${entity.get('name').getValue()} (ID: ${entity.get('id').getValue()}), Media ID: ${updatedMedia.get('id').getValue()}`,
      );
    } else if (entity instanceof Variant) {
      this.logger.log(
        `Media updated for variant (ID: ${entity.get('id').getValue()}), Media ID: ${updatedMedia.get('id').getValue()}`,
      );
    } else {
      this.logger.error(
        `Media updated event received without entity for 'product' or 'variant'. Media ID: ${updatedMedia.get('id').getValue()}`,
      );
    }
  }
}
