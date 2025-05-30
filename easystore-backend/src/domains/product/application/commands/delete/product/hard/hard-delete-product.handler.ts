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
    const { id } = command;

    // Create ID value object
    const productId = Id.create(id);

    // Find the product by ID
    const productFromRepo = await this.productRepository.findById(productId);
    if (!productFromRepo) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Mapper to delete the domain entity
    const { shouldRemove, product: deletedProduct } =
      ProductMapper.fromHardDeleteDto(productFromRepo);

    const productToProcess =
      this.eventPublisher.mergeObjectContext(deletedProduct);

    if (shouldRemove) {
      // Permanently remove the product from the database
      await this.productRepository.hardDelete(productId);
    }

    // Commit events to event bus
    productToProcess.commit();

    // Return the product as DTO
    return ProductMapper.toDto(productToProcess) as ProductDTO;
  }
}
