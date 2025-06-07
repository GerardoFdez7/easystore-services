import {
  IWarrantyType,
  IWarrantyProps,
  Warranty,
  Entity,
} from '../../../aggregates/entities';
import {
  Id,
  Months,
  MediumDescription,
} from '../../../aggregates/value-objects';
import { WarrantyDTO } from '../';

/**
 * Centralized mapper for Warranty domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class WarrantyMapper {
  /**
   * Maps a persistence Warranty model to a WarrantyDTO.
   * @param persistenceWarranty The Persistence Warranty model to map.
   * @returns The mapped Warranty domain entity.
   */
  static fromPersistence(persistenceWarranty: IWarrantyType): Warranty {
    return Entity.fromPersistence<
      typeof persistenceWarranty,
      IWarrantyProps,
      Warranty
    >(Warranty, persistenceWarranty, (model) => ({
      id: Id.create(model.id),
      months: Months.create(model.months),
      coverage: MediumDescription.create(model.coverage),
      instructions: MediumDescription.create(model.instructions),
      variantId: Id.create(model.variantId),
    }));
  }

  /**
   * Maps a WarrantyDTO to a domain entity model.
   * @param dto The Warranty tDTO.
   * @returns The mapped Warranty domain entity.
   */
  static toDto(warranty: Warranty): WarrantyDTO {
    return warranty.toDTO<WarrantyDTO>((entity) => ({
      id: entity.get('id')?.getValue() || undefined,
      months: entity.get('months')?.getValue() || null,
      coverage: entity.get('coverage')?.getValue() || null,
      instructions: entity.get('instructions')?.getValue() || null,
      variantId: entity.get('variantId')?.getValue() || null,
    }));
  }
}
