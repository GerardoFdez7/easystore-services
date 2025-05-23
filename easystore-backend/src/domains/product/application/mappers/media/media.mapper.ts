import { Entity } from '@domains/entity.base';
import { Media, IMediaProps, IMediaType } from '../../../aggregates/entities';
import {
  Id,
  Url,
  Position,
  MediaType,
} from '../../../aggregates/value-objects';
import { MediaDTO } from '../';

/**
 * Centralized mapper for Media domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class MediaMapper {
  /**
   * Maps a persistence Media model to a MediaDTO.
   * @param persistenceMedia The Persistence Media model to map.
   * @returns The mapped Media domain entity.
   */
  static fromPersistence(persistenceMedia: IMediaType): Media {
    return Entity.fromPersistence<typeof persistenceMedia, IMediaProps, Media>(
      Media,
      persistenceMedia,
      (model) => ({
        id: Id.create(model.id),
        url: Url.create(model.url),
        position: Position.create(model.position),
        mediaType: MediaType.create(model.mediaType),
        productId: model.productId ? Id.create(model.productId) : null,
        variantId: model.variantId ? Id.create(model.variantId) : null,
      }),
    );
  }

  /**
   * Maps a MediaDTO to a domain entity model.
   * @param dto The Media tDTO.
   * @returns The mapped Media domain entity.
   */
  static toDto(media: Media): MediaDTO {
    return media.toDTO<MediaDTO>((entity) => ({
      id: entity.get('id')?.getValue() || null,
      url: entity.get('url')?.getValue() || null,
      position: entity.get('position')?.getValue() || null,
      mediaType: entity.get('mediaType')?.getValue() || null,
      productId: entity.get('productId')?.getValue() || null,
      variantId: entity.get('variantId')?.getValue() || null,
    }));
  }
}
