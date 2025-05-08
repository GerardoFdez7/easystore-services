import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id } from '../../../aggregates/value-objects';
import { ProductMapper } from '../../mappers/product.mapper';
import { ProductDTO } from '../../mappers/product.dto';
import { RestoreProductDTO } from './restore-product.dto';

export class RestoreProductCommand {
  constructor(public readonly dto: RestoreProductDTO) {}
}

@CommandHandler(RestoreProductCommand)
export class RestoreProductHandler
  implements ICommandHandler<RestoreProductCommand>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: RestoreProductCommand): Promise<ProductDTO> {
    const { id } = command.dto;

    // Create ID value object
    const productId = Id.create(id);

    // Find the product by ID
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if the product is actually deleted
    const metadata = product.get('metadata');
    if (!metadata.getDeleted()) {
      throw new Error(
        `Product with ID ${id} is not in a deleted state and cannot be restored`,
      );
    }

    // Call the domain entity method to restore the product
    const restoredProduct = ProductMapper.fromRestoreDto(product);

    // Save the updated product with restored metadata
    await this.productRepository.save(restoredProduct);

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
