import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../../../mappers';
import { SoftDeleteProductDTO } from './soft-delete-product.dto';

@CommandHandler(SoftDeleteProductDTO)
export class SoftDeleteProductHandler
  implements ICommandHandler<SoftDeleteProductDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: SoftDeleteProductDTO): Promise<ProductDTO> {
    const { id, tenantId } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if the product is already soft deleted
    const isArchived = product.get('isArchived');
    if (isArchived === true) {
      throw new BadRequestException(
        `Product with ID ${id} is already soft deleted and cannot be soft deleted again`,
      );
    }

    // Call the domain entity method to soft delete the product
    const deletedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromSoftDeleteDto(product),
    );

    // Save the updated product
    await this.productRepository.save(deletedProduct);

    // Commit events to event bus
    deletedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
