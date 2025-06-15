import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateCategoryDTO } from './update-category.dto';
import { ICategoryRepository } from '../../../aggregates/repositories/category.interface';
import { CategoryMapper, CategoryDTO } from '../../mappers';
import { Id } from '../../../aggregates/value-objects';

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
    const category = await this.categoryRepository.findById(
      categoryId,
      tenantId,
    );
    if (!category) {
      throw new NotFoundException(`Category with ID ${command.id} not found`);
    }

    // Update the category using the domain method
    const updatedCategory = this.eventPublisher.mergeObjectContext(
      CategoryMapper.fromUpdateDto(category, command),
    );

    // Persist through repository
    await this.categoryRepository.update(categoryId, tenantId, updatedCategory);

    // Commit events to event bus
    updatedCategory.commit();

    // Return the category as DTO
    return CategoryMapper.toDto(category);
  }
}
