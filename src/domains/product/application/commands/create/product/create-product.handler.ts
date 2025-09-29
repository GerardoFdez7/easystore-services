import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { CreateProductDTO } from './create-product.dto';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { TypeEnum } from '../../../../aggregates/value-objects';

@CommandHandler(CreateProductDTO)
export class CreateProductHandler implements ICommandHandler<CreateProductDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateProductDTO): Promise<ProductDTO> {
    const productData = command.data;
    const { variants = [], productType } = productData;

    // Apply domain logic for variants based on product type
    const processedVariants = Array.isArray(variants)
      ? variants.map((variant) => {
          const processedVariant = { ...variant };
          if (productType === TypeEnum.DIGITAL) {
            if (
              variant.weight !== undefined ||
              variant.dimension !== undefined
            ) {
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

          return processedVariant;
        })
      : [];

    // Create a modified product data with processed variants
    const processedProductData = {
      ...productData,
      variants: processedVariants,
    };

    // Use the mapper to create the domain entity
    const product = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromCreateDto(processedProductData),
    );

    // Persist through repository
    await this.productRepository.create(product);

    // Commit events to event bus
    product.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
