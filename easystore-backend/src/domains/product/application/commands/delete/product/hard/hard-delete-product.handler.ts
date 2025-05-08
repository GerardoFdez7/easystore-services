import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../../aggregates/value-objects';
import { Product } from '../../../../../aggregates/entities/product.entity';
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

  async execute(command: HardDeleteProductCommand): Promise<void> {
    const { id } = command.dto;

    // Create ID value object
    const productId = Id.create(id);

    // Find the product by ID
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Call the domain entity method to hard delete the product
    const { shouldRemove } = Product.hardDelete(product);

    if (shouldRemove) {
      // Permanently remove the product from the database
      await this.productRepository.hardDelete(productId);
    }
  }
}
