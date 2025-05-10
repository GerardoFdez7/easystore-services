import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { CreateProductDTO } from './create-product.dto';
import { Inject } from '@nestjs/common';
import { ProductMapper } from '../../../mappers/product.mapper';
import { ProductDTO } from '../../../mappers/product.dto';

@CommandHandler(CreateProductDTO)
export class CreateProductHandler implements ICommandHandler<CreateProductDTO> {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateProductDTO): Promise<ProductDTO> {
    const { variants, type } = command;

    // Apply domain logic for variants based on product type
    const processedVariants = variants.map((variant) => {
      // Copy of the variant to avoid mutating the original
      const processedVariant = { ...variant };

      if (type === 'DIGITAL') {
        // For DIGITAL products, set weight and dimensions to null
        processedVariant.weight = null;
        processedVariant.dimensions = null;
      } else if (type === 'PHYSICAL') {
        // For PHYSICAL products, ensure weight and dimensions are positive
        if (!processedVariant.weight || processedVariant.weight <= 0) {
          processedVariant.weight = 0;
        }

        if (!processedVariant.dimensions) {
          processedVariant.dimensions = {
            height: 0,
            width: 0,
            depth: 0,
          };
        } else {
          // Ensure all dimensions are positive
          processedVariant.dimensions.height =
            processedVariant.dimensions.height > 0
              ? processedVariant.dimensions.height
              : 10;
          processedVariant.dimensions.width =
            processedVariant.dimensions.width > 0
              ? processedVariant.dimensions.width
              : 0;
          processedVariant.dimensions.height =
            processedVariant.dimensions.height > 0
              ? processedVariant.dimensions.height
              : 0;
        }
      }

      return processedVariant;
    });

    // Create a modified command with processed variants
    const processedCommand = {
      ...command,
      variants: processedVariants,
    };

    // Use the mapper to create the domain entity
    const product = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromCreateDto(processedCommand as ProductDTO),
    );

    // Persist through repository
    await this.productRepository.save(product);

    // Commit events to event bus
    product.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
