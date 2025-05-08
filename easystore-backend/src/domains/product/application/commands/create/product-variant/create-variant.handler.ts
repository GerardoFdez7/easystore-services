import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { Product } from '../../../../aggregates/entities/product.entity';
import { CreateVariantDTO } from './create-variant.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { Id } from '../../../../aggregates/value-objects/id.value-object';

@CommandHandler(CreateVariantDTO)
export class CreateVariantHandler implements ICommandHandler<CreateVariantDTO> {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateVariantDTO): Promise<void> {
    const { productId, variant } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(Id.create(productId));
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Process variant based on product type
    const processedVariant = { ...variant };
    const productType = product.get('type').getValue();

    if (productType === 'DIGITAL') {
      // For DIGITAL products, set weight and dimensions to null
      processedVariant.weight = null;
      processedVariant.dimensions = null;
    } else if (productType === 'PHYSICAL') {
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
            : 0;
        processedVariant.dimensions.width =
          processedVariant.dimensions.width > 0
            ? processedVariant.dimensions.width
            : 0;
        processedVariant.dimensions.depth =
          processedVariant.dimensions.depth > 0
            ? processedVariant.dimensions.depth
            : 0;
      }
    }

    // Add the variant to the product using the domain method
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      Product.addVariant(product, processedVariant),
    );

    // Persist through repository
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();
  }
}
