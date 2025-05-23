import {
  Entity,
  ProductCategories,
  IProductCategoriesProps,
  IProductCategoriesType,
} from '../../../aggregates/entities';
import { Id } from '../../../aggregates/value-objects';
import { ProductCategoriesDTO } from '../';

/**
 * Centralized mapper for ProductCategories domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class ProductCategoriesMapper {
  /**
   * Maps a persistence ProductCategories model to a ProductCategoriesDTO.
   * @param persistenceProductCategories The Persistence ProductCategories model to map.
   * @returns The mapped ProductCategories domain entity.
   */
  static fromPersistence(
    persistenceProductCategories: IProductCategoriesType,
  ): ProductCategories {
    return Entity.fromPersistence<
      typeof persistenceProductCategories,
      IProductCategoriesProps,
      ProductCategories
    >(ProductCategories, persistenceProductCategories, (model) => ({
      id: Id.create(model.id),
      productId: Id.create(model.productId),
      categoryId: Id.create(model.categoryId),
    }));
  }

  /**
   * Maps a ProductCategoriesDTO to a domain entity model.
   * @param dto The ProductCategories tDTO.
   * @returns The mapped ProductCategories domain entity.
   */
  static toDto(productCategories: ProductCategories): ProductCategoriesDTO {
    return productCategories.toDTO<ProductCategoriesDTO>((entity) => ({
      id: entity.get('id')?.getValue() || null,
      productId: entity.get('productId')?.getValue() || null,
      categoryId: entity.get('categoryId')?.getValue() || null,
    }));
  }
}
