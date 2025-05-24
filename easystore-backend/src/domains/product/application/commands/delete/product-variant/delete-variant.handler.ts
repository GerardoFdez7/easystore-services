import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';
import { DeleteVariantDTO } from './delete-variant.dto';

export class DeleteVariantCommand {
  constructor(public readonly dto: DeleteVariantDTO) {}
}

@CommandHandler(DeleteVariantCommand)
export class DeleteVariantHandler
  implements ICommandHandler<DeleteVariantCommand>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly logger: LoggerService,
  ) {}

  async execute(command: DeleteVariantCommand): Promise<ProductDTO> {
    const { productId, id, tenantId } = command.dto;

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
      ProductMapper.fromRemoveMediaDto(product, id),
    );

    // Save the updated product
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
