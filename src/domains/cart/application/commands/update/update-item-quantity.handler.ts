import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateItemQuantityDto } from './update-item-quantity.dto';
import { CartDTO, CartMapper } from '../../mappers';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../../aggregates/repositories/cart.interface';
import { Id, Qty } from '../../../aggregates/value-objects';
import { Cart } from '../../../aggregates/entities/cart.entity';

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
    const cartFound = await this.cartRepository.findCartByCustomerId(
      Id.create(command.customerId),
    );
    if (!cartFound) throw new NotFoundException('Cart not found');

    const cartWithEvents = this.eventPublisher.mergeObjectContext(
      Cart.updateItemQuantity(
        cartFound,
        Id.create(variantId),
        Qty.create(quantity),
      ),
    );

    // Persist the cart to the repository
    const cartUpdated = await this.cartRepository.update(cartWithEvents);

    // Commit domain events
    cartWithEvents.commit();

    return CartMapper.toDto(cartUpdated);
  }
}
