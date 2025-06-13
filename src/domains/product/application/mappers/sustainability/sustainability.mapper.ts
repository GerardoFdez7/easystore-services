import {
  Entity,
  Sustainability,
  ISustainabilityProps,
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
    return Entity.fromPersistence<
      typeof persistenceSustainability,
      ISustainabilityProps,
      Sustainability
    >(Sustainability, persistenceSustainability, (model) => ({
      id: Id.create(model.id),
      certification: model.certification
        ? Certification.create(model.certification)
        : null,
      recycledPercentage: RecycledPercentage.create(model.recycledPercentage),
      productId: Id.create(model.productId),
    }));
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
