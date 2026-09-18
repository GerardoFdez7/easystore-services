import { NotFoundException } from '@nestjs/common';
import { Category } from '../../../aggregates/entities';
import ICategoryRepository from '../../../aggregates/repositories/category.interface';
import { Id } from '../../../aggregates/value-objects';

export async function findCategoryOrThrow(
  repository: ICategoryRepository,
  categoryId: Id,
  storeId: Id,
): Promise<Category> {
  const category = await repository.findById(categoryId, storeId);

  if (!category) {
    throw new NotFoundException(
      `Category with ID ${categoryId.getValue()} not found`,
    );
  }

  return category;
}
