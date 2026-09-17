import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveItemFromCartDto } from './remove-item-from-cart.dto';
import { CartDTO } from '../../../mappers';
import { Inject } from '@nestjs/common';
import { ICartRepository } from '../../../../aggregates/repositories/cart.interface';
import { Id } from '../../../../aggregates/value-objects';
import { Cart } from '../../../../aggregates/entities/cart/cart.entity';
import {
  findStoreCartOrThrow,
  persistCartMutation,
} from '../../../shared/cart-command-helpers';

@CommandHandler(RemoveItemFromCartDto)
export class RemoveItemFromCartHandler
  implements ICommandHandler<RemoveItemFromCartDto>
{
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RemoveItemFromCartDto): Promise<CartDTO> {
    const variantId = Id.create(command.data.variantId);
    const cartFound = await findStoreCartOrThrow(
      this.cartRepository,
      command.customerId,
      command.storeId,
    );

    return persistCartMutation(
      cartFound,
      (cart) => Cart.removeItem(cart, variantId),
      this.eventPublisher,
      this.cartRepository,
    );
  }
}
