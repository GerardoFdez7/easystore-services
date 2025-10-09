import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddItemToCartDto } from './add-item-to-cart.dto';
import { Inject } from '@nestjs/common';
import { ICartRepository } from 'src/domains/cart/aggregates/repositories/cart.interface';
import { Id } from '@shared/value-objects';
import { CartDTO, CartMapper } from '../../../mappers';
import { Cart } from 'src/domains/cart/aggregates/entities/cart.entity';
import { CartItem } from 'src/domains/cart/aggregates/value-objects';

@CommandHandler(AddItemToCartDto)
export class AddItemToCartHandler implements ICommandHandler<AddItemToCartDto> {
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AddItemToCartDto): Promise<CartDTO> {
    const { cartId, qty, variantId, promotionId } = command.data;

    const cartFound = await this.cartRepository.findCartById(Id.create(cartId));

    if (!cartFound) throw new Error('Cart not found');

    // Cart Item object
    const cartItem = CartItem.create({
      qty,
      variantId,
      promotionId: promotionId || null,
    });

    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.addItemToCart(cartFound, cartItem),
    );

    // Persist the cart to the repository
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    // Commit domain events
    cartUpdated.commit();

    return CartMapper.toDto(cartUpdated);
  }
}
