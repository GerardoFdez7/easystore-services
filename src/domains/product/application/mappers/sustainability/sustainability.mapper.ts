import {
  Sustainability,
  ISustainabilityType,
} from '../../../aggregates/entities';
import {
  Id,
  Certification,
  RecycledPercentage,
} from '../../../aggregates/value-objects';
import { SustainabilityDTO } from '../';

/**
 * Centralized mapper for Sustainability domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class SustainabilityMapper {
  /**
   * Maps a persistence Sustainability model to a SustainabilityDTO.
   * @param persistenceSustainability The Persistence Sustainability model to map.
   * @returns The mapped Sustainability domain entity.
   */
  static fromPersistence(
    persistenceSustainability: ISustainabilityType,
  ): Sustainability {
    return Sustainability.reconstitute({
      id: Id.create(persistenceSustainability.id),
      certification: persistenceSustainability.certification
        ? Certification.create(persistenceSustainability.certification)
        : null,
      recycledPercentage: RecycledPercentage.create(
        persistenceSustainability.recycledPercentage,
      ),
      productId: Id.create(persistenceSustainability.productId),
    });
  }

  /**
   * Maps a SustainabilityDTO to a domain entity model.
   * @param dto The Sustainability tDTO.
   * @returns The mapped Sustainability domain entity.
   */
  static toDto(sustainability: Sustainability): SustainabilityDTO {
    return sustainability.toDTO<SustainabilityDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      certification: entity.get('certification')?.getValue(),
      recycledPercentage: entity.get('recycledPercentage')?.getValue(),
      productId: entity.get('productId')?.getValue(),
    }));
  }
}
