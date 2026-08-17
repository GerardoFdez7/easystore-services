import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import ICategoryRepository from '../../../aggregates/repositories/category.interface';
import { Id } from '../../../aggregates/value-objects';
import { CategoryMapper, CategoryDTO } from '../../mappers';
import { DeleteCategoryDTO } from './delete-category.dto';
import { findCategoryOrThrow } from '../shared/find-category-or-throw';

@CommandHandler(DeleteCategoryDTO)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryDTO>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteCategoryDTO): Promise<CategoryDTO> {
    // Value objects
    const categoryId = Id.create(command.id);
    const tenantId = Id.create(command.tenantId);

    // Find the category by ID
    const category = await findCategoryOrThrow(
      this.categoryRepository,
      categoryId,
      tenantId,
    );

    // Delete the category using the domain method
    const deletedCategory = this.eventPublisher.mergeObjectContext(
      CategoryMapper.fromDeleteDto(category),
    );

    // Delete through repository
    await this.categoryRepository.delete(categoryId, tenantId);

    // Commit events to event bus
    deletedCategory.commit();

    // Return the category as DTO
    return CategoryMapper.toDto(category);
  }
}
