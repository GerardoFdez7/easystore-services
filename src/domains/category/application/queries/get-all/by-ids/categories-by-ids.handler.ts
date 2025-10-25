import ICategoryRepository from '../../../../aggregates/repositories/category.interface';
import { GetCategoriesByIdsDTO } from './categories-by-ids.dto';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Id } from '../../../../aggregates/value-objects';
import { CategoryDTO } from '@shared/dtos';

@QueryHandler(GetCategoriesByIdsDTO)
export class GetCategoriesByIdsHandler
  implements IQueryHandler<GetCategoriesByIdsDTO>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoriesByIdsDTO): Promise<CategoryDTO[]> {
    const { categoriesIds, tenantId } = query;

    // Validate input
    if (!categoriesIds || categoriesIds.length === 0) {
      return [];
    }

    // Create value objects for IDs
    const idsVO = categoriesIds.map((id) => Id.create(id));
    const tenantIdVO = Id.create(tenantId);

    // Find categories by IDs
    const categories = await this.categoryRepository.findByIds(
      idsVO,
      tenantIdVO,
    );

    if (!categories || categories.length === 0) {
      return [];
    }

    return categories.map((category) => {
      const props = category.getProps();
      return {
        categoryId: props.id.getValue(),
        categoryName: props.name.getValue(),
        categoryDescription: props.description?.getValue() || null,
        categoryCover: props.cover.getValue(),
      };
    });
  }
}
