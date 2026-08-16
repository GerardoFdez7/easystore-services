import { IWarrantyType, Warranty } from '../../../aggregates/entities';
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
    return Warranty.reconstitute({
      id: Id.create(persistenceWarranty.id),
      months: Months.create(persistenceWarranty.months),
      coverage: MediumDescription.create(persistenceWarranty.coverage),
      instructions: MediumDescription.create(persistenceWarranty.instructions),
      variantId: Id.create(persistenceWarranty.variantId),
    });
  }

  /**
   * Maps a WarrantyDTO to a domain entity model.
   * @param dto The Warranty tDTO.
   * @returns The mapped Warranty domain entity.
   */
  static toDto(warranty: Warranty): WarrantyDTO {
    return warranty.toDTO<WarrantyDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      months: entity.get('months')?.getValue(),
      coverage: entity.get('coverage')?.getValue(),
      instructions: entity.get('instructions')?.getValue(),
      variantId: entity.get('variantId')?.getValue(),
    }));
  }
}
