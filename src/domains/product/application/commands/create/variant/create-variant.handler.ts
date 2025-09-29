import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { CreateVariantDTO } from './create-variant.dto';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Id, TypeEnum } from '../../../../aggregates/value-objects';

@CommandHandler(CreateVariantDTO)
export class CreateVariantHandler implements ICommandHandler<CreateVariantDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateVariantDTO): Promise<ProductDTO> {
    const { variant } = command;
    const { productId, tenantId } = variant;

    // Find the product by ID
    const productEntity = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(productId),
    );
    if (!productEntity) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get product type and validate variant based on product type
    const productType = productEntity.get('productType').getValue();
    if (productType === TypeEnum.DIGITAL) {
      if (variant.weight !== undefined || variant.dimension !== undefined) {
        throw new BadRequestException(
          'Digital products cannot have weight or dimensions.',
        );
      }
    } else if (productType === TypeEnum.PHYSICAL) {
      // Check if weight and dimension exists for physical products
      if (variant.dimension === null || variant.dimension === undefined) {
        throw new BadRequestException(
          'Dimension property is required for physical products',
        );
      }

      if (variant.weight === null || variant.weight === undefined) {
        throw new BadRequestException(
          'Weight property is required for physical products',
        );
      }

      // Check if weight and dimension are positive values for physical products
      if (variant.weight <= 0) {
        throw new BadRequestException(
          'Weight must be a positive value for physical products.',
        );
      }

      if (variant.dimension) {
        if (
          variant.dimension.height !== undefined &&
          variant.dimension.height <= 0
        ) {
          throw new BadRequestException(
            'Dimension height must be a positive value for physical products.',
          );
        }
        if (
          variant.dimension.width !== undefined &&
          variant.dimension.width <= 0
        ) {
          throw new BadRequestException(
            'Dimension width must be a positive value for physical products.',
          );
        }
        if (
          variant.dimension.length !== undefined &&
          variant.dimension.length <= 0
        ) {
          throw new BadRequestException(
            'Dimension length must be a positive value for physical products.',
          );
        }
      }
    }

    // Use the mapper to add the variant to the product entity
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromAddVariantDto(productEntity, variant),
    );

    // Persist through repository
    await this.productRepository.update(
      Id.create(tenantId),
      Id.create(productId),
      updatedProduct,
    );

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(updatedProduct) as ProductDTO;
  }
}
