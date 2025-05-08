import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { LoggerService } from '@shared/winston/winston.service';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper } from '../../../mappers/product.mapper';
import { ProductDTO } from '../../../mappers/product.dto';
import { UpdateVariantDTO } from './update-variant.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { Id } from '../../../../aggregates/value-objects/id.value-object';

@CommandHandler(UpdateVariantDTO)
export class UpdateVariantHandler implements ICommandHandler<UpdateVariantDTO> {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly logger: LoggerService,
  ) {}

  async execute(command: UpdateVariantDTO): Promise<ProductDTO> {
    const { productId, identifier, identifierType, variant, attributeKey } =
      command;

    this.logger.debug(
      'Updating product variant with identifier:',
      identifier,
      'identifierType:',
      identifierType,
      'attributeKey:',
      attributeKey,
    );

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

    // Update the variant in the product using the domain method
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.updateVariantOfProduct(product, command),
    );

    // Persist through repository
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();

    // Return the updated product
    return ProductMapper.toDto(updatedProduct) as ProductDTO;
  }
}
