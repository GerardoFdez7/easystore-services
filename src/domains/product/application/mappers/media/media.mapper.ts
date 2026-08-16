import { Media, IMediaType } from '../../../aggregates/entities';
import {
  Id,
  Media as MediaVO,
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
    return Media.reconstitute({
      id: Id.create(persistenceMedia.id),
      url: MediaVO.create(persistenceMedia.url),
      position: Position.create(persistenceMedia.position),
      mediaType: MediaType.create(persistenceMedia.mediaType),
      productId: persistenceMedia.productId
        ? Id.create(persistenceMedia.productId)
        : null,
      variantId: persistenceMedia.variantId
        ? Id.create(persistenceMedia.variantId)
        : null,
    });
  }

  /**
   * Maps a MediaDTO to a domain entity model.
   * @param dto The Media tDTO.
   * @returns The mapped Media domain entity.
   */
  static toDto(media: Media): MediaDTO {
    return media.toDTO<MediaDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      url: entity.get('url')?.getValue(),
      position: entity.get('position')?.getValue(),
      mediaType: entity.get('mediaType')?.getValue(),
      productId: entity.get('productId')?.getValue(),
      variantId: entity.get('variantId')?.getValue(),
    }));
  }
}
