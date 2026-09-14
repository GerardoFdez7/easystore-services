import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Cart } from '../../aggregates/entities/cart/cart.entity';
import { Id } from '../../aggregates/value-objects';
import { CartDTO, CartMapper } from '../mappers';

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

export async function persistCartMutation(
  cart: Cart,
  mutate: (cart: Cart) => Cart,
  eventPublisher: EventPublisher,
  cartRepository: { update(cart: Cart): Promise<Cart> },
): Promise<CartDTO> {
  const cartWithEvents = eventPublisher.mergeObjectContext(mutate(cart));
  const cartUpdated = await cartRepository.update(cartWithEvents);
  cartWithEvents.commit();
  return CartMapper.toDto(cartUpdated);
}
