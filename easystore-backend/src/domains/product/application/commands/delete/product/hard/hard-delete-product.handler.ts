import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { HardDeleteProductDTO } from './hard-delete-product.dto';

@CommandHandler(HardDeleteProductDTO)
export class HardDeleteProductHandler
  implements ICommandHandler<HardDeleteProductDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: HardDeleteProductDTO): Promise<ProductDTO> {
    const { id, tenantId } = command;

    // Find the product by ID
    const productId = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(id),
    );
    if (!productId) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Mapper to delete the domain entity
    const { shouldRemove, product: deletedProduct } =
      ProductMapper.fromHardDeleteDto(productId);

    const productToProcess =
      this.eventPublisher.mergeObjectContext(deletedProduct);

    if (shouldRemove) {
      // Permanently remove the product from the database
      await this.productRepository.hardDelete(
        Id.create(tenantId),
        Id.create(id),
      );
    }

    // Commit events to event bus
    productToProcess.commit();

    // Return the product as DTO
    return ProductMapper.toDto(productToProcess) as ProductDTO;
  }
}
