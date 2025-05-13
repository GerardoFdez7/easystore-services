import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
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
    const { productId, identifier, identifierType, attributeKey } = command.dto;

    // Create ID value object
    const productIdObj = Id.create(productId);

    // Find the product by ID
    const product = await this.productRepository.findById(productIdObj);
    if (!product) {
      this.logger.warn(
        `Product with ID ${productId} not found for variant deletion`,
      );
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Call the domain entity method to remove the variant
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.deleteVariantOfProduct(product, command.dto),
    );

    // Check if the variant was actually removed (product reference changed)
    if (updatedProduct === product) {
      this.logger.warn(
        `There was a problem trying to delete the variant with ${identifierType} ${identifier} and attributeKey ${attributeKey} not found in product ${productId}`,
      );
      throw new NotFoundException(
        `Variant with ${identifierType} ${identifier} and attributeKey ${attributeKey} not found in product ${productId}`,
      );
    }

    // Save the updated product
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
