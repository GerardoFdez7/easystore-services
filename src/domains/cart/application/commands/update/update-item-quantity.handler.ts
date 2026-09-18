import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateItemQuantityDto } from './update-item-quantity.dto';
import { CartDTO } from '../../mappers';
import { Inject } from '@nestjs/common';
import { ICartRepository } from '../../../aggregates/repositories/cart.interface';
import { Id, Qty } from '../../../aggregates/value-objects';
import { Cart } from '../../../aggregates/entities/cart/cart.entity';
import {
  findStoreCartOrThrow,
  persistCartMutation,
} from '../../shared/cart-command-helpers';

@CommandHandler(UpdateItemQuantityDto)
export class UpdateItemQuantityHandler
  implements ICommandHandler<UpdateItemQuantityDto>
{
  constructor(
    @Inject('ICartRepository')
    private readonly cartRepository: ICartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateItemQuantityDto): Promise<CartDTO> {
    const { variantId, quantity } = command.data;
    const cartFound = await findStoreCartOrThrow(
      this.cartRepository,
      command.customerId,
      command.storeId,
    );

    return persistCartMutation(
      cartFound,
      (cart) =>
        Cart.updateItemQuantity(
          cart,
          Id.create(variantId),
          Qty.create(quantity),
        ),
      this.eventPublisher,
      this.cartRepository,
    );
  }
}
