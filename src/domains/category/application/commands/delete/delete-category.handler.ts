import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '../../../aggregates/repositories/category.interface';
import { Id } from '../../../aggregates/value-objects';
import { CategoryMapper, CategoryDTO } from '../../mappers';
import { DeleteCategoryDTO } from './delete-category.dto';

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
    // Find the category by ID
    const category = await this.categoryRepository.findById(
      Id.create(command.id),
      Id.create(command.tenantId),
    );
    if (!category) {
      throw new NotFoundException(`Category with ID ${command.id} not found`);
    }

    // Delete the category using the domain method
    const deletedCategory = this.eventPublisher.mergeObjectContext(
      CategoryMapper.fromDeleteDto(category),
    );

    // Commit events to event bus
    deletedCategory.commit();

    // Return the category as DTO
    return CategoryMapper.toDto(category);
  }
}
