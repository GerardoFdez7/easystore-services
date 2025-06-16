import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import ICategoryRepository from '../../../aggregates/repositories/category.interface';
import { Id } from '../../../aggregates/value-objects';
import { CategoryMapper, PaginatedCategoriesDTO } from '../../mappers';
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
    const { tenantId, options } = query;
    const {
      page,
      limit,
      name,
      parentId,
      includeSubcategories,
      sortBy,
      sortOrder,
    } = options || {};

    // Validate pagination parameters
    if (page !== undefined && page < 1) {
      throw new BadRequestException(
        'Page must be a positive number if provided',
      );
    }
    if (limit !== undefined && limit < 1) {
      throw new BadRequestException(
        'Limit must be a positive number if provided',
      );
    }

    // Find all categories with pagination and optional filtering
    const result = await this.categoryRepository.findAll(Id.create(tenantId), {
      page,
      limit,
      name,
      parentId: parentId ? Id.create(parentId) : undefined,
      includeSubcategories,
      sortBy,
      sortOrder,
    });

    if (!result || result.total === 0) {
      throw new NotFoundException(`No categories found`);
    }

    return CategoryMapper.toPaginatedDto(result);
  }
}
