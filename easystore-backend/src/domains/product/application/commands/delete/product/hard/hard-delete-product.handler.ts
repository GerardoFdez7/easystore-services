import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../../aggregates/value-objects';
import { ProductMapper } from '../../../../mappers/product.mapper';
import { ProductDTO } from '../../../../mappers/product.dto';
import { HardDeleteProductDTO } from './hard-delete-product.dto';

export class HardDeleteProductCommand {
  constructor(public readonly dto: HardDeleteProductDTO) {}
}

@CommandHandler(HardDeleteProductCommand)
export class HardDeleteProductHandler
  implements ICommandHandler<HardDeleteProductCommand>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: HardDeleteProductCommand): Promise<ProductDTO> {
    const { id } = command.dto;

    // Create ID value object
    const productId = Id.create(id);

    // Find the product by ID
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Use the mapper to delete the domain entity
    const { shouldRemove, product: deletedProduct } =
      ProductMapper.fromHardDeleteDto(product);

    if (shouldRemove) {
      // Permanently remove the product from the database
      await this.productRepository.hardDelete(productId);
      // return null or the deleted product's DTO
      return ProductMapper.toDto(deletedProduct) as ProductDTO;
    }

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
