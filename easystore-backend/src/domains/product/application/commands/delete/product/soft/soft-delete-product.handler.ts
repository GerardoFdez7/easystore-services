import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../../aggregates/value-objects';
import { Product } from '../../../../../aggregates/entities/product.entity';
import { SoftDeleteProductDTO } from './soft-delete-product.dto';

export class SoftDeleteProductCommand {
  constructor(public readonly dto: SoftDeleteProductDTO) {}
}

@CommandHandler(SoftDeleteProductCommand)
export class SoftDeleteProductHandler
  implements ICommandHandler<SoftDeleteProductCommand>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: SoftDeleteProductCommand): Promise<void> {
    const { id } = command.dto;

    // Create ID value object
    const productId = Id.create(id);

    // Find the product by ID
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Call the domain entity method to soft delete the product
    const deletedProduct = Product.softDelete(product);

    // Save the updated product with soft delete metadata
    await this.productRepository.save(deletedProduct);
  }
}
