import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import ICategoryRepository from '../../../aggregates/repositories/category.interface';
import { CreateCategoryDTO } from './create-category.dto';
import { CategoryMapper, CategoryDTO } from '../../mappers';

@CommandHandler(CreateCategoryDTO)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryDTO>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateCategoryDTO): Promise<CategoryDTO> {
    // Mapper to create the domain entity
    const category = this.eventPublisher.mergeObjectContext(
      CategoryMapper.fromCreateDto(command.data),
    );

    // Persist through repository
    await this.categoryRepository.create(category);

    // Commit events to event bus
    category.commit();

    // Return the category as DTO
    return CategoryMapper.toDto(category);
  }
}
