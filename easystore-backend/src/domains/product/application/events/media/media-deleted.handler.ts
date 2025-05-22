import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { MediaDeletedEvent } from '../../../aggregates/events';
import { Product, Variant } from '../../../aggregates/entities';

@Injectable()
@EventsHandler(MediaDeletedEvent)
export class MediaDeletedHandler implements IEventHandler<MediaDeletedEvent> {
  constructor(private readonly logger: LoggerService) {}

  handle(event: MediaDeletedEvent): void {
    const entity = event.product;
    const deletedMedia = event.deletedMedia;

    if (entity instanceof Product) {
      this.logger.warn(
        `Media deleted for product: ${entity.get('name').getValue()} (ID: ${entity.get('id').getValue()}), Media ID: ${deletedMedia.get('id').getValue()}`,
      );
    } else if (entity instanceof Variant) {
      this.logger.warn(
        `Media deleted for variant (ID: ${entity.get('id').getValue()}), Media ID: ${deletedMedia.get('id').getValue()}`,
      );
    } else {
      this.logger.error(
        `Media deleted event received without entity for 'product' or 'variant'. Media ID: ${deletedMedia.get('id').getValue()}`,
      );
    }
  }
}
