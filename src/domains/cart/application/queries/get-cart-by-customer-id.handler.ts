import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartByCustomerIdDTO } from './get-cart-by-customer-id.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../mappers';
import { Id } from '@shared/value-objects';
import { IProductAdapter } from '../ports/product.port';

@QueryHandler(GetCartByCustomerIdDTO)
export class GetCartByIdHandler
  implements IQueryHandler<GetCartByCustomerIdDTO>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @Inject('IProductAdapter') private readonly productAdapter: IProductAdapter,
  ) {}
  async execute(query: GetCartByCustomerIdDTO): Promise<CartDTO> {
    const customerId = Id.create(query.id);
    const cartFound =
      await this.cartRepository.findCartByCustomerId(customerId);

    if (!cartFound)
      throw new NotFoundException(`Cart with ID ${query.id} not found`);

    // Get variants ids from cart
    const variantIds = Array.from(cartFound.get('cartItems').values()).map(
      (item) => item.getVariantId().getValue(),
    );

    const variantDetails =
      variantIds.length > 0
        ? await this.productAdapter.getVariantsDetails(variantIds)
        : [];
    const dto = CartMapper.toDto(cartFound, variantDetails);

    return dto;
  }
}
