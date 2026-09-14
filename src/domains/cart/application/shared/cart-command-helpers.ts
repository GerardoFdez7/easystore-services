import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Money } from '@shared/aggregates/value-objects';
import { Cart } from '../../aggregates/entities/cart/cart.entity';
import { Id } from '../../aggregates/value-objects';
import { CartDTO, CartMapper } from '../mappers';
import { ITenantCurrencyAdapter } from '../ports';

export async function findTenantCartOrThrow(
  cartRepository: {
    findCartByCustomerId(customerId: Id, tenantId: Id): Promise<Cart | null>;
  },
  customerId: string,
  tenantId: string,
): Promise<Cart> {
  const cart = await cartRepository.findCartByCustomerId(
    Id.create(customerId),
    Id.create(tenantId),
  );
  if (!cart) throw new NotFoundException('Cart not found');
  return cart;
}

export function assertCartMatchesTenantCurrency(
  cartItems: CartDTO['cartItems'],
  tenantCurrency: string,
): void {
  const itemCurrencies = new Set(
    cartItems
      .filter(
        (item) => item.subTotal && Money.compareAmounts(item.subTotal, '0') > 0,
      )
      .map((item) => item.currency),
  );

  if ([...itemCurrencies].some((currency) => currency !== tenantCurrency)) {
    throw new BadRequestException(
      `Cart currency (${[...itemCurrencies].join(', ')}) does not match tenant currency (${tenantCurrency})`,
    );
  }
}

export async function withTenantCurrency(
  dto: CartDTO,
  tenantId: string,
  tenantCurrencyAdapter: ITenantCurrencyAdapter,
): Promise<CartDTO> {
  const tenantCurrency = await tenantCurrencyAdapter.getCurrency(tenantId);
  assertCartMatchesTenantCurrency(dto.cartItems, tenantCurrency);

  return {
    ...dto,
    totalCart: Money.create(
      typeof dto.totalCart === 'string' ? dto.totalCart : dto.totalCart.amount,
      tenantCurrency,
    ).getValue(),
  } as CartDTO;
}

export function mapCartWithTenantCurrency(
  cart: Cart,
  tenantId: string,
  tenantCurrencyAdapter: ITenantCurrencyAdapter,
): Promise<CartDTO> {
  return withTenantCurrency(
    CartMapper.toDto(cart),
    tenantId,
    tenantCurrencyAdapter,
  );
}

export async function persistCartMutation(
  cart: Cart,
  mutate: (cart: Cart) => Cart,
  eventPublisher: EventPublisher,
  cartRepository: { update(cart: Cart): Promise<Cart> },
  tenantId: string,
  tenantCurrencyAdapter: ITenantCurrencyAdapter,
): Promise<CartDTO> {
  const cartWithEvents = eventPublisher.mergeObjectContext(mutate(cart));
  const cartUpdated = await cartRepository.update(cartWithEvents);
  cartWithEvents.commit();
  return mapCartWithTenantCurrency(
    cartUpdated,
    tenantId,
    tenantCurrencyAdapter,
  );
}
