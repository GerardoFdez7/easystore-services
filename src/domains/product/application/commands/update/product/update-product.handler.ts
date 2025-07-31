import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateProductDTO } from './update-product.dto';
import { IProductRepository } from '../../../../aggregates/repositories/product.interface';
import { ProductMapper, ProductDTO } from '../../../mappers';
import { Id } from '../../../../aggregates/value-objects';

@CommandHandler(UpdateProductDTO)
export class UpdateProductHandler implements ICommandHandler<UpdateProductDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateProductDTO): Promise<ProductDTO> {
    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(command.tenantId),
      Id.create(command.id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${command.id} not found`);
    }

    // Update the product using the domain method
    const updatedProduct = this.eventPublisher.mergeObjectContext(
      ProductMapper.fromUpdateDto(product, command),
    );

    // Persist through repository
    await this.productRepository.update(
      Id.create(command.tenantId),
      Id.create(command.id),
      updatedProduct,
    );

    // Commit events to event bus
    updatedProduct.commit();

    // Return the product as DTO
    return ProductMapper.toDto(product) as ProductDTO;
  }
}
