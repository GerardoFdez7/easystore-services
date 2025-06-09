import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { CreateVariantDTO } from './create-variant.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { Id } from '../../../../aggregates/value-objects';

@CommandHandler(CreateVariantDTO)
export class CreateVariantHandler implements ICommandHandler<CreateVariantDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateVariantDTO): Promise<ProductDTO> {
    const { variant } = command;
    const { productId, tenantId } = variant;

    // Find the product by ID
    const productEntity = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(productId),
    );
    if (!productEntity) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Use the mapper to add the variant to the product entity
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromAddVariantDto(productEntity, variant),
    );

    // Persist through repository
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(updatedProduct) as ProductDTO;
  }
}
