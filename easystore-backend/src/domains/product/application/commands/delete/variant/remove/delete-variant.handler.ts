import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { Id } from '../../../../../aggregates/value-objects';
import { DeleteVariantDTO } from './delete-variant.dto';

@CommandHandler(DeleteVariantDTO)
export class DeleteVariantHandler implements ICommandHandler<DeleteVariantDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteVariantDTO): Promise<ProductDTO> {
    const { productId, id, tenantId } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(productId),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Call the domain entity method to remove the variant
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromRemoveVariantDto(product, id),
    );

    // Save the updated product
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
