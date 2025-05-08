import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDTO } from './update-product.dto';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { Product } from '../../../../aggregates/entities/product.entity';
import { Id } from '../../../../aggregates/value-objects/id.value-object';

@Injectable()
@CommandHandler(UpdateProductDTO)
export class UpdateProductHandler implements ICommandHandler<UpdateProductDTO> {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateProductDTO): Promise<void> {
    const { id, ...updates } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(Id.create(id));
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Process updates based on product type
    const processedUpdates = { ...updates };
    const productType = updates.type || product.get('type').getValue();

    // Handle variants based on product type
    if (processedUpdates.variants) {
      processedUpdates.variants = processedUpdates.variants.map((variant) => {
        const processedVariant = { ...variant };

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

        return processedVariant;
      });
    }

    // Update the product using the domain method
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      Product.update(product, processedUpdates),
    );

    // Persist through repository
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();
  }
}
