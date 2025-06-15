import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '../../../aggregates/repositories/category.interface';
import { Id } from '../../../aggregates/value-objects';
import { CategoryMapper, CategoryDTO } from '../../mappers';
import { GetCategoryByIdDTO } from './id-category.dto';

@QueryHandler(GetCategoryByIdDTO)
export class GetCategoryByIdHandler
  implements IQueryHandler<GetCategoryByIdDTO>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoryByIdDTO): Promise<CategoryDTO> {
    // Find the category by ID
    const category = await this.categoryRepository.findById(
      Id.create(query.id),
      Id.create(query.tenantId),
    );
    if (!category) {
      throw new NotFoundException(`Category with ID ${query.id} not found`);
    }

    return CategoryMapper.toDto(category);
  }
}
