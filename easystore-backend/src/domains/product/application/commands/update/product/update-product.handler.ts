import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateProductDTO } from './update-product.dto';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { Id, TypeEnum } from '../../../../aggregates/value-objects';
import { Variant } from '../../../../aggregates/entities';

@CommandHandler(UpdateProductDTO)
export class UpdateProductHandler implements ICommandHandler<UpdateProductDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateProductDTO): Promise<ProductDTO> {
    const productData = command.data;
    const { productType } = productData;
    const { id, tenantId } = command;

    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(tenantId),
      Id.create(id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Ensure variants is an array
    const variants = Array.isArray(product.variants) ? product.variants : [];

    if (productType === TypeEnum.DIGITAL) {
      variants.forEach((variant: Variant) => {
        variant.update({ weight: null, dimension: null });
      });
    } else if (productType === TypeEnum.PHYSICAL) {
      variants.forEach((variant: Variant) => {
        let weight = variant.get('weight')?.getValue() || null;
        if (weight === undefined || weight <= 0) {
          weight = 0.01;
        }
        let dimension = variant.dimension
          ? variant.get('dimension')?.getValue()
          : null;
        if (!dimension) {
          dimension = { height: 0.01, width: 0.01, length: 0.01 };
        } else {
          dimension = {
            height: dimension.height > 0 ? dimension.height : 0.01,
            width: dimension.width > 0 ? dimension.width : 0.01,
            length: dimension.length > 0 ? dimension.length : 0.01,
          };
        }
        variant.update({ weight, dimension });
      });
    }

    // Update the product using the domain method
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromUpdateDto(product, command),
    );

    // Persist through repository
    await this.productRepository.save(updatedProduct);

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
