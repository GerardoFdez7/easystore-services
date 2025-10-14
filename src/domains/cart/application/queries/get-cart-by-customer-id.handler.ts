import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartByCustomerIdDTO } from './get-cart-by-customer-id.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../mappers';
import { Id } from '@shared/value-objects';
import { IProductAdapter } from '../ports/product.port';

export interface PaginatedCartDTO {
  cartItems: CartDTO['cartItems'];
  total: number;
  hasMore: boolean;
  totalCart: number;
}

@QueryHandler(GetCartByCustomerIdDTO)
export class GetCartByIdHandler
  implements IQueryHandler<GetCartByCustomerIdDTO>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @Inject('IProductAdapter') private readonly productAdapter: IProductAdapter,
  ) {}

  async execute(query: GetCartByCustomerIdDTO): Promise<PaginatedCartDTO> {
    const customerId = Id.create(query.id);
    const cartFound =
      await this.cartRepository.findCartByCustomerId(customerId);

    if (!cartFound)
      throw new NotFoundException(`Cart with ID ${query.id} not found`);

    // Get variants ids from cart
    const variantIds = Array.from(cartFound.get('cartItems').keys());

    const variantDetails =
      variantIds.length > 0
        ? await this.productAdapter.getVariantsDetails(variantIds)
        : [];

    const dto = CartMapper.toDto(cartFound, variantDetails);

    // Apply pagination to cart items
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedItems = dto.cartItems.slice(startIndex, endIndex);

    // Calculate pagination metadata
    const totalItems = dto.cartItems.length;
    const hasMore = endIndex < totalItems;

    return {
      cartItems: paginatedItems,
      total: totalItems,
      hasMore,
      totalCart: dto.totalCart,
    };
  }
}
