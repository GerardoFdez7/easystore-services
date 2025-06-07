import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { UpdateVariantDTO } from './update-variant.dto';
import { Id, TypeEnum } from '../../../../aggregates/value-objects';

@CommandHandler(UpdateVariantDTO)
export class UpdateVariantHandler implements ICommandHandler<UpdateVariantDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateVariantDTO): Promise<ProductDTO> {
    const { id: variantId, productId, tenantId, data } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(productId),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const productType = product.get('productType').getValue();
    if (productType === TypeEnum.DIGITAL) {
      if (data.weight !== undefined || data.dimension !== undefined) {
        throw new BadRequestException(
          'Digital products cannot have weight or dimensions.',
        );
      }
    } else if (productType === TypeEnum.PHYSICAL) {
      // Check if weight and dimension are positive values for physical products if they are being updated
      if (data.weight !== undefined && data.weight <= 0) {
        throw new BadRequestException(
          'Weight must be a positive value for physical products.',
        );
      }
      if (data.dimension) {
        if (data.dimension.height !== undefined && data.dimension.height <= 0) {
          throw new BadRequestException(
            'Dimension height must be a positive value for physical products.',
          );
        }
        if (data.dimension.width !== undefined && data.dimension.width <= 0) {
          throw new BadRequestException(
            'Dimension width must be a positive value for physical products.',
          );
        }
        if (data.dimension.length !== undefined && data.dimension.length <= 0) {
          throw new BadRequestException(
            'Dimension length must be a positive value for physical products.',
          );
        }
      }
    }

    const productWithUpdatedVariant = ProductMapper.fromUpdateVariantDto(
      product,
      variantId,
      command,
    );

    const updatedProductDomainEntity = this.eventPublisher.mergeObjectContext(
      productWithUpdatedVariant,
    );

    // Persist through repository
    await this.productRepository.save(updatedProductDomainEntity);

    // Commit events to event bus
    updatedProductDomainEntity.commit();

    // Return the updated product DTO
    return ProductMapper.toDto(updatedProductDomainEntity) as ProductDTO;
  }
}
