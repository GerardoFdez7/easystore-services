import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveItemFromCartDto } from './remove-item-from-cart.dto';
import { CartDTO, CartMapper } from '../../../mappers';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from 'src/domains/cart/aggregates/repositories/cart.interface';
import { Id } from '@shared/value-objects';
import { Cart } from 'src/domains/cart/aggregates/entities/cart.entity';

@CommandHandler(RemoveItemFromCartDto)
export class RemoveItemFromCartHandler
  implements ICommandHandler<RemoveItemFromCartDto>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RemoveItemFromCartDto): Promise<CartDTO> {
    const cartId = Id.create(command.data.cartId);
    const variantId = Id.create(command.data.variantId);

    // Search cart
    const cartFound = await this.cartRepository.findCartById(cartId);

    if (!cartFound) throw new NotFoundException('Cart not found');

    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.removeItem(cartFound, variantId),
    );

    // Persist the cart to the repository
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    // Commit domain events
    cartUpdated.commit();

    return CartMapper.toDto(cartUpdated);
  }
}
