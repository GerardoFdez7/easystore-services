import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { ArchiveVariantDTO } from './archive-variant.dto';

@CommandHandler(ArchiveVariantDTO)
export class ArchiveVariantHandler
  implements ICommandHandler<ArchiveVariantDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ArchiveVariantDTO): Promise<ProductDTO> {
    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(command.tenantId),
      Id.create(command.productId),
    );
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${command.productId} not found`,
      );
    }

    // Call the domain entity method to soft delete the variant
    const deletedVariant = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromArchiveVariantDto(product, command.id),
    );

    // Save the updated variant
    await this.productRepository.update(
      Id.create(command.tenantId),
      Id.create(command.productId),
      deletedVariant,
    );

    // Commit events to event bus
    deletedVariant.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
