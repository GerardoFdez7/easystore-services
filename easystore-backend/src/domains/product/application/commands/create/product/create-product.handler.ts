import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
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
            processedVariant.weight = null;
            processedVariant.dimension = null;
          } else if (productType === TypeEnum.PHYSICAL) {
            // Ensure weight is a positive float
            if (!processedVariant.weight || processedVariant.weight <= 0) {
              processedVariant.weight = 0.01;
            }
            // Ensure dimension is present and all values are positive
            if (!processedVariant.dimension) {
              processedVariant.dimension = {
                height: 0.01,
                width: 0.01,
                length: 0.01,
              };
            } else {
              processedVariant.dimension.height =
                processedVariant.dimension.height > 0
                  ? processedVariant.dimension.height
                  : 0.01;
              processedVariant.dimension.width =
                processedVariant.dimension.width > 0
                  ? processedVariant.dimension.width
                  : 0.01;
              processedVariant.dimension.length =
                processedVariant.dimension.length > 0
                  ? processedVariant.dimension.length
                  : 0.01;
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
    await this.productRepository.save(product);

    // Commit events to event bus
    product.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
