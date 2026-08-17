import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateCategoryDTO } from './update-category.dto';
import ICategoryRepository from '../../../aggregates/repositories/category.interface';
import { CategoryMapper, CategoryDTO } from '../../mappers';
import { Id } from '../../../aggregates/value-objects';
import { findCategoryOrThrow } from '../shared/find-category-or-throw';

@CommandHandler(UpdateCategoryDTO)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryDTO>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateCategoryDTO): Promise<CategoryDTO> {
    // Value objects
    const categoryId = Id.create(command.id);
    const tenantId = Id.create(command.tenantId);

    // Find the category by ID
    const category = await findCategoryOrThrow(
      this.categoryRepository,
      categoryId,
      tenantId,
    );

    // Update the category using the domain method
    const updatedCategory = this.eventPublisher.mergeObjectContext(
      CategoryMapper.fromUpdateDto(category, command),
    );

    // Persist through repository
    await this.categoryRepository.update(categoryId, tenantId, updatedCategory);

    // Commit events to event bus
    updatedCategory.commit();

    // Return the category as DTO
    return CategoryMapper.toDto(updatedCategory);
  }
}
