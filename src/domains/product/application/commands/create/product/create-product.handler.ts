import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { CreateProductDTO } from './create-product.dto';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { validateVariantForProductType } from '../validate-variant-for-product-type';

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
          validateVariantForProductType(variant, productType);

          return { ...variant };
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
