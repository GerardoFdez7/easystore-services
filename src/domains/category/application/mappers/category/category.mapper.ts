import {
  Category,
  ICategoryProps,
  ICategoryType,
  ICategoryBase,
} from '../../../aggregates/entities';
import {
  Id,
  Name,
  Media,
  ShortDescription,
} from '../../../aggregates/value-objects';
import { CategoryDTO, PaginatedCategoriesDTO } from './category.dto';
import { UpdateCategoryDTO } from '../../commands';

/**
 * Centralized mapper for Category domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class CategoryMapper {
  /**
   * Maps a persistence Category moodel to a domain Category entity
   * @param persistenceCategory The Persistence Category model
   * @returns The mapped Category domain entity
   */
  static fromPersistence(persistenceCategory: ICategoryType): Category {
    const categoryProps: ICategoryProps = {
      id: Id.create(persistenceCategory.id),
      name: Name.create(persistenceCategory.name),
      cover: Media.createCover(persistenceCategory.cover),
      description: persistenceCategory.description
        ? ShortDescription.create(persistenceCategory.description)
        : null,
      subCategories: (persistenceCategory.subCategories || []).map(
        (subCategory) => {
          const subCategoryEntity = Category.create(subCategory);
          return subCategoryEntity.getProps();
        },
      ),
      parentId: persistenceCategory.parentId
        ? Id.create(persistenceCategory.parentId)
        : null,
      tenantId: Id.create(persistenceCategory.tenantId),
      updatedAt: persistenceCategory.updatedAt,
      createdAt: persistenceCategory.createdAt,
    };
    return Category.reconstitute(categoryProps);
  }

  /**
   * Maps a Category domain entity to a CategoryDTO
   * @param category The category domain entity
   * @param fields Optional array of fields to include in the DTO
   * @returns The category DTO
   */
  static toDto(category: Category): CategoryDTO {
    return category.toDTO<CategoryDTO>((entity) => ({
      id: entity.get('id')?.getValue(),
      name: entity.get('name').getValue(),
      cover: entity.get('cover')?.getValue(),
      description: entity.get('description')?.getValue(),
      subCategories:
        entity.get('subCategories')?.map((subCategoryProps) => {
          const subCategoryEntity = Category.reconstitute(subCategoryProps);
          return CategoryMapper.toDto(subCategoryEntity);
        }) || [],
      parentId: entity.get('parentId')?.getValue(),
      tenantId: entity.get('tenantId').getValue(),
      updatedAt: entity.get('updatedAt'),
      createdAt: entity.get('createdAt'),
    }));
  }

  /**
   * Maps paginated category results from repository to PaginatedCategoriesDTO
   * @param paginatedResult The paginated result from repository
   * @returns The paginated categories DTO
   */
  static toPaginatedDto(paginatedResult: {
    categories: Category[];
    total: number;
    hasMore: boolean;
  }): PaginatedCategoriesDTO {
    return {
      categories: paginatedResult.categories.map((category) =>
        this.toDto(category),
      ),
      total: paginatedResult.total,
      hasMore: paginatedResult.hasMore,
    };
  }

  /**
   * Maps a CategoryDTO to a domain entity
   * @param dto The category DTO
   * @returns The mapped Category domain entity
   */
  static fromCreateDto(dto: ICategoryBase): Category {
    return Category.create({ ...dto });
  }

  /**
   * Maps an UpdateCategoryDTO to update an existing Category domain entity
   * @param existingCategory The existing category to update
   * @param dto The DTO containing the update data
   * @returns The updated Category domain entity
   */
  static fromUpdateDto(
    existingCategory: Category,
    dto: UpdateCategoryDTO,
  ): Category {
    return Category.update(existingCategory, dto.data);
  }

  /**
   * Maps a DeleteCategoryDTO to hard delete a Category
   * @param existingCategory The existing category to hard delete
   * @returns The deleted Category domain entity
   */
  static fromDeleteDto(existingCategory: Category): Category {
    return Category.delete(existingCategory);
  }
}
