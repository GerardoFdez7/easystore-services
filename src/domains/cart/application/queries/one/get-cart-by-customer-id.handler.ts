import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartByCustomerIdDTO } from './get-cart-by-customer-id.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../../aggregates/repositories/cart.interface';
import { CartDTO, CartMapper } from '../../mappers';
import { Id, IMoney, Money } from '@shared/value-objects';
import { IProductAdapter, ITenantCurrencyAdapter } from '../../ports';

export interface PaginatedCartDTO {
  cartItems: CartDTO['cartItems'];
  total: number;
  hasMore: boolean;
  totalCart: IMoney;
}

@QueryHandler(GetCartByCustomerIdDTO)
export class GetCartByIdHandler
  implements IQueryHandler<GetCartByCustomerIdDTO>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @Inject('IProductAdapter') private readonly productAdapter: IProductAdapter,
    @Inject('ITenantCurrencyAdapter')
    private readonly tenantCurrencyAdapter: ITenantCurrencyAdapter,
  ) {}

  async execute(query: GetCartByCustomerIdDTO): Promise<PaginatedCartDTO> {
    const customerId = Id.create(query.id);
    const cartFound = await this.cartRepository.findCartByCustomerId(
      customerId,
      query.page,
      query.limit,
    );

    if (!cartFound)
      throw new NotFoundException(
        `Cart of the customer id: ${query.id} not found`,
      );

    // Get variants ids from cart
    const variantIds = Array.from(cartFound.get('cartItems').keys());

    const variantDetails =
      variantIds.length > 0
        ? await this.productAdapter.getVariantsDetails(variantIds)
        : [];

    const dto = CartMapper.toDto(cartFound, variantDetails);
    const currency = await this.tenantCurrencyAdapter.getCurrency(
      query.tenantId,
    );

    // Get total count efficiently using the dedicated method
    const totalItems = await this.cartRepository.getCartItemsCount(customerId);
    const hasMore = query.page * query.limit < totalItems;

    return {
      cartItems: dto.cartItems,
      total: totalItems,
      hasMore,
      totalCart: Money.create(dto.totalCart.toString(), currency).getValue(),
    };
  }
}
