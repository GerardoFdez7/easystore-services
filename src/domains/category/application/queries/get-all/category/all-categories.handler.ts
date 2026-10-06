import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import ICategoryRepository from '../../../../aggregates/repositories/category.interface';
import { Id } from '../../../../aggregates/value-objects';
import { CategoryMapper, PaginatedCategoriesDTO } from '../../../mappers';
import { GetAllCategoriesDTO } from './all-categories.dto';

@QueryHandler(GetAllCategoriesDTO)
export class GetAllCategoriesHandler
  implements IQueryHandler<GetAllCategoriesDTO>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetAllCategoriesDTO): Promise<PaginatedCategoriesDTO> {
    const { storeId, options } = query;
    const {
      page,
      limit,
      name,
      parentId,
      includeSubcategories,
      sortBy,
      sortOrder,
    } = options || {};

    // Find all categories with pagination and optional filtering
    const result = await this.categoryRepository.findAll(Id.create(storeId), {
      page,
      limit,
      name,
      parentId: parentId ? Id.create(parentId) : undefined,
      includeSubcategories,
      sortBy,
      sortOrder,
    });

    return CategoryMapper.toPaginatedDto(result);
  }
}
