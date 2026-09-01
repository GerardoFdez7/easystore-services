import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Money } from '@shared/value-objects';
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

export async function withTenantCurrency(
  dto: CartDTO,
  tenantId: string,
  tenantCurrencyAdapter: ITenantCurrencyAdapter,
): Promise<CartDTO> {
  const currency = await tenantCurrencyAdapter.getCurrency(tenantId);
  return {
    ...dto,
    totalCart: Money.create(
      typeof dto.totalCart === 'number'
        ? dto.totalCart.toString()
        : dto.totalCart.amount,
      currency,
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
