import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { Id } from '../../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { RestoreVariantDTO } from './restore-variant.dto';
import { findProductOrThrow } from '../../shared/find-product-or-throw';

@CommandHandler(RestoreVariantDTO)
export class RestoreVariantHandler
  implements ICommandHandler<RestoreVariantDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RestoreVariantDTO): Promise<ProductDTO> {
    // Find the product by ID
    const product = await findProductOrThrow(
      this.productRepository,
      command.tenantId,
      command.productId,
      command.id,
    );

    // Call the domain entity method to restore the variant
    const restoredVariant = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromRestoreVariantDto(product, command.id),
    );

    // Save the updated variant
    await this.productRepository.update(
      Id.create(command.tenantId),
      Id.create(command.productId),
      restoredVariant,
    );

    // Commit events to event bus
    restoredVariant.commit();

    // Return the product as DTO
    return ProductMapper.toDto(restoredVariant) as ProductDTO;
  }
}
