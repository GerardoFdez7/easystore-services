import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { RestoreProductDTO } from './restore-product.dto';

@CommandHandler(RestoreProductDTO)
export class RestoreProductHandler
  implements ICommandHandler<RestoreProductDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RestoreProductDTO): Promise<ProductDTO> {
    const { id, tenantId } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if the product is actually deleted
    const isArchived = product.get('isArchived');
    if (isArchived === false) {
      throw new Error(
        `Product with ID ${id} is not in a deleted state and cannot be restored`,
      );
    }

    // Call the domain entity method to restore the product
    const restoredProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromRestoreDto(product),
    );

    // Save the updated product
    await this.productRepository.save(restoredProduct);

    // Commit events to event bus
    restoredProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
