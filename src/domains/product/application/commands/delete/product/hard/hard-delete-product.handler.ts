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
    // Find the product by ID
    const product = await this.productRepository.hardDelete(
      Id.create(command.tenantId),
      Id.create(command.id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${command.id} not found`);
    }

    // Call the domain entity method to soft delete the product
    const deletedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromHardDeleteDto(product),
    );

    // Commit events to event bus
    deletedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
