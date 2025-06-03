import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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
    const {
      id: variantId,
      productId,
      tenantId,
      data: variantUpdateData,
    } = command;

    // Find the product by ID
    const productEntity = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(productId),
    );
    if (!productEntity) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Process variant data based on product type
    const productType = productEntity.get('productType').getValue();

    if (productType === TypeEnum.DIGITAL) {
      variantUpdateData.weight = null;
      variantUpdateData.dimension = null;
    } else if (productType === TypeEnum.PHYSICAL) {
      if (
        !variantUpdateData.weight ||
        variantUpdateData.weight === null ||
        variantUpdateData.weight === undefined ||
        variantUpdateData.weight < 0
      ) {
        variantUpdateData.weight = 0;
      }

      // If dimensions are present in the update or not, ensure they are valid
      if (
        !variantUpdateData.dimension ||
        variantUpdateData.dimension === null ||
        variantUpdateData.dimension === undefined
      ) {
        variantUpdateData.dimension = {
          height: 0,
          width: 0,
          length: 0,
        };
      } else {
        // Ensure all dimension components are positive or zero
        variantUpdateData.dimension.height =
          variantUpdateData.dimension.height !== undefined &&
          variantUpdateData.dimension.height !== null &&
          variantUpdateData.dimension.height > 0
            ? variantUpdateData.dimension.height
            : 0;
        variantUpdateData.dimension.width =
          variantUpdateData.dimension.width !== undefined &&
          variantUpdateData.dimension.width !== null &&
          variantUpdateData.dimension.width > 0
            ? variantUpdateData.dimension.width
            : 0;
        variantUpdateData.dimension.length =
          variantUpdateData.dimension.length !== undefined &&
          variantUpdateData.dimension.length !== null &&
          variantUpdateData.dimension.length > 0
            ? variantUpdateData.dimension.length
            : 0;
      }
    }

    const productWithUpdatedVariant = ProductMapper.fromUpdateVariantDto(
      productEntity,
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
